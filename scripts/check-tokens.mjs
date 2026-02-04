import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');

const IGNORED_DIRS = new Set([path.join(SRC_DIR, 'content'), path.join(SRC_DIR, 'data')]);

const INCLUDED_EXTS = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.css']);

// Disallow Tailwind palette classes in app/UI code.
// Enforce semantic tokens: primary/secondary/accent/success/warning/danger/default/background/foreground/content*/divider.
const PALETTES =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const CLASS_RE = new RegExp(
  String.raw`(^|[\s"'` + '`' + String.raw`])(text|bg|border|from|to)-(${PALETTES})-\d+`,
  'g'
);

async function* walk(dir) {
  if (IGNORED_DIRS.has(dir)) return;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist') continue;
      yield* walk(full);
      continue;
    }
    if (!INCLUDED_EXTS.has(path.extname(ent.name))) continue;
    yield full;
  }
}

function toRel(p) {
  return path.relative(ROOT, p);
}

async function main() {
  const violations = [];

  for await (const file of walk(SRC_DIR)) {
    const text = await fs.readFile(file, 'utf8');
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      CLASS_RE.lastIndex = 0;
      const match = CLASS_RE.exec(line);
      if (!match) continue;
      violations.push({
        file,
        lineNo: i + 1,
        snippet: line.trim(),
      });
    }
  }

  if (!violations.length) {
    process.stdout.write('tokens:check OK (no Tailwind palette classes found in src/ UI code)\\n');
    return;
  }

  process.stderr.write('tokens:check FAILED\\n\\n');
  for (const v of violations.slice(0, 200)) {
    process.stderr.write(`${toRel(v.file)}:${v.lineNo}\\n  ${v.snippet}\\n\\n`);
  }
  process.stderr.write(`Found ${violations.length} violation(s).\\n`);
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`tokens:check ERROR: ${err?.stack || String(err)}\\n`);
  process.exit(1);
});
