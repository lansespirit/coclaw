#!/usr/bin/env node
/**
 * Build human-readable KB index docs for CoClaw site content + OpenClaw ref entrypoints.
 *
 * Canonical location: scripts/build-kb-index.mjs
 *
 * Consumer: sub-agents (read-only). Producer: this script (rebuild after content/ref updates).
 *
 * Outputs:
 * - docs/kb/INDEX.md
 * - docs/kb/coclaw-site-pages.md
 * - docs/kb/openclaw-ref-entrypoints.md
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

function runGit(args, cwd) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd,
  }).trim();
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function walkFiles(dir, { exts } = {}) {
  const out = [];
  const queue = [dir];
  while (queue.length) {
    const current = queue.pop();
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        queue.push(full);
        continue;
      }
      if (!ent.isFile()) continue;
      if (exts && exts.length) {
        const ext = path.extname(ent.name).toLowerCase();
        if (!exts.includes(ext)) continue;
      }
      out.push(full);
    }
  }
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

function stripQuotes(v) {
  const s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseYamlishFrontmatter(yamlText) {
  // Minimal YAML subset parser (scalars + top-level lists).
  // Intentionally ignores nested objects.
  const data = {};
  let currentListKey = null;

  const lines = yamlText.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, '  ');
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)\s*$/);
    if (kv) {
      const [, key, rest] = kv;
      currentListKey = null;

      if (!rest) {
        data[key] = [];
        currentListKey = key;
        continue;
      }

      const value = rest.trim();
      if (
        (value.startsWith('[') && value.endsWith(']')) ||
        (value.startsWith('{') && value.endsWith('}'))
      ) {
        try {
          data[key] = JSON.parse(value);
          continue;
        } catch {
          // fall through to scalar
        }
      }

      data[key] = stripQuotes(value);
      continue;
    }

    const li = line.match(/^\s*-\s*(.*)\s*$/);
    if (li && currentListKey && Array.isArray(data[currentListKey])) {
      const item = stripQuotes(li[1]);
      if (item) data[currentListKey].push(item);
    }
  }

  return data;
}

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: text };
  const fmRaw = text.slice(3, end).replace(/^\s*\n/, '');
  const body = text.slice(end + '\n---'.length);
  return { data: parseYamlishFrontmatter(fmRaw), body };
}

function toPosixPath(p) {
  return p.split(path.sep).join('/');
}

function relFromRoot(absPath) {
  return toPosixPath(path.relative(ROOT, absPath));
}

function mdEscape(text) {
  return String(text ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
}

function isDynamicAstroRoute(fileName) {
  return fileName.includes('[') && fileName.includes(']');
}

function astroFileToRoute(relPagesPath) {
  // relPagesPath: e.g. "src/pages/getting-started/windows.astro"
  const rel = relPagesPath.replace(/^src\/pages\//, '').replace(/\.astro$/, '');
  const parts = rel.split('/');
  const out = [];
  for (const part of parts) {
    if (part === 'index') continue;
    out.push(part);
  }
  const route = '/' + out.join('/');
  return route === '/' ? '/' : route;
}

function contentFileToRoute(collection, entrySlug) {
  if (collection === 'guides') return `/guides/${entrySlug}`;
  if (collection === 'blog') return `/blog/${entrySlug}`;
  if (collection === 'stories') return `/stories/${entrySlug}`;
  if (collection === 'troubleshooting') return `/troubleshooting/${entrySlug}`;
  if (collection === 'getting-started') return `/getting-started/${entrySlug}`;
  if (collection === 'channels') return `/channels/${entrySlug}`;
  if (collection === 'templates') return `/templates/${entrySlug}`;
  return `/${collection}/${entrySlug}`;
}

function guessContentCollection(relPath) {
  // relPath: "src/content/<collection>/..."
  const parts = relPath.split('/');
  const idx = parts.indexOf('content');
  if (idx === -1 || idx + 1 >= parts.length) return null;
  return parts[idx + 1];
}

function contentSlugFromRelPath(relPath) {
  // Astro content slug includes nested path segments (without extension).
  // Example: src/content/getting-started/installation/macos.mdx => "installation/macos"
  const parts = relPath.split('/');
  const idx = parts.indexOf('content');
  if (idx === -1) return null;
  const rest = parts.slice(idx + 2); // after collection
  if (!rest.length) return null;
  const last = rest[rest.length - 1].replace(/\.(md|mdx)$/i, '');
  const segs = [...rest.slice(0, -1), last].filter(Boolean);
  return segs.join('/');
}

function pickTitleForContent(collection, fm, slug) {
  if (collection === 'stories') return fm.name || slug;
  return fm.title || slug;
}

async function buildCoclawSiteIndex({ outDir, openclawRef }) {
  const contentRoot = path.join(ROOT, 'src', 'content');
  const pagesRoot = path.join(ROOT, 'src', 'pages');

  const contentFiles = await walkFiles(contentRoot, { exts: ['.md', '.mdx'] });
  const pageFiles = (await walkFiles(pagesRoot, { exts: ['.astro'] })).filter(
    (f) => !isDynamicAstroRoute(path.basename(f))
  );

  const contentEntries = [];
  for (const abs of contentFiles) {
    const rel = relFromRoot(abs);
    const collection = guessContentCollection(rel);
    if (!collection) continue;
    const slug = contentSlugFromRelPath(rel);
    if (!slug) continue;

    const raw = await fs.readFile(abs, 'utf8');
    const { data: fm } = parseFrontmatter(raw);

    // Respect draft flag when present.
    const draft = String(fm.draft ?? '')
      .trim()
      .toLowerCase();
    if (draft === 'true') continue;

    const url = contentFileToRoute(collection, slug);
    contentEntries.push({
      collection,
      url,
      slug,
      title: pickTitleForContent(collection, fm, slug),
      description: fm.description || '',
      keywords: Array.isArray(fm.keywords) ? fm.keywords : [],
      component: fm.component || '',
      severity: fm.severity || '',
      os: Array.isArray(fm.os) ? fm.os : [],
      channel: Array.isArray(fm.channel) ? fm.channel : [],
      errorSignatures: Array.isArray(fm.errorSignatures) ? fm.errorSignatures : [],
      file: rel,
    });
  }

  const pageEntries = [];
  for (const abs of pageFiles) {
    const rel = relFromRoot(abs);
    const url = astroFileToRoute(rel);
    const raw = await fs.readFile(abs, 'utf8');
    const title =
      raw.match(/\btitle\s*=\s*"([^"]+)"/)?.[1] ??
      raw.match(/\btitle\s*=\s*{`([^`]+)`}/)?.[1] ??
      '';
    const description =
      raw.match(/\bdescription\s*=\s*"([^"]+)"/)?.[1] ??
      raw.match(/\bdescription\s*=\s*{`([^`]+)`}/)?.[1] ??
      '';
    pageEntries.push({ url, title, description, file: rel });
  }

  contentEntries.sort((a, b) => a.url.localeCompare(b.url));
  pageEntries.sort((a, b) => a.url.localeCompare(b.url));

  const header = [
    `> Generated: ${new Date().toISOString()}`,
    openclawRef?.commit
      ? `> OpenClaw ref: ${openclawRef.commit} — ${openclawRef.subject}`
      : `> OpenClaw ref: (unknown; .ref/openclaw not a git repo?)`,
    '',
  ].join('\n');

  const lines = [];
  lines.push('# CoClaw Site Content Index');
  lines.push('');
  lines.push(header);

  lines.push('## Static pages (src/pages)');
  lines.push('');
  lines.push('| URL | Title | Description | Source |');
  lines.push('| --- | ----- | ----------- | ------ |');
  for (const p of pageEntries) {
    lines.push(
      `| ${mdEscape(p.url)} | ${mdEscape(p.title)} | ${mdEscape(p.description)} | \`${mdEscape(
        p.file
      )}\` |`
    );
  }
  lines.push('');

  const collections = Array.from(new Set(contentEntries.map((e) => e.collection))).sort((a, b) =>
    a.localeCompare(b)
  );

  for (const c of collections) {
    const entries = contentEntries.filter((e) => e.collection === c);
    lines.push(`## Content: ${c} (src/content/${c})`);
    lines.push('');
    if (c === 'troubleshooting') {
      lines.push('| URL | Title | Component | Channel | Error signatures | Source |');
      lines.push('| --- | ----- | --------- | ------- | --------------- | ------ |');
      for (const e of entries) {
        const ch = (e.channel ?? []).join(', ');
        const sig = (e.errorSignatures ?? []).slice(0, 6).join('; ');
        lines.push(
          `| ${mdEscape(e.url)} | ${mdEscape(e.title)} | ${mdEscape(e.component)} | ${mdEscape(
            ch
          )} | ${mdEscape(sig)} | \`${mdEscape(e.file)}\` |`
        );
      }
    } else if (c === 'guides') {
      lines.push('| URL | Title | Description | Keywords | Source |');
      lines.push('| --- | ----- | ----------- | -------- | ------ |');
      for (const e of entries) {
        const kw = (e.keywords ?? []).slice(0, 8).join(', ');
        lines.push(
          `| ${mdEscape(e.url)} | ${mdEscape(e.title)} | ${mdEscape(
            e.description
          )} | ${mdEscape(kw)} | \`${mdEscape(e.file)}\` |`
        );
      }
    } else {
      lines.push('| URL | Title | Description | Source |');
      lines.push('| --- | ----- | ----------- | ------ |');
      for (const e of entries) {
        lines.push(
          `| ${mdEscape(e.url)} | ${mdEscape(e.title)} | ${mdEscape(
            e.description
          )} | \`${mdEscape(e.file)}\` |`
        );
      }
    }
    lines.push('');
  }

  const outPath = path.join(outDir, 'coclaw-site-pages.md');
  await fs.writeFile(outPath, lines.join('\n'), 'utf8');
  return {
    outPath,
    contentEntriesCount: contentEntries.length,
    pageEntriesCount: pageEntries.length,
  };
}

async function buildOpenclawEntrypoints({ outDir, openclawRef }) {
  const lines = [];
  lines.push('# OpenClaw Ref Entrypoints (for troubleshooting)');
  lines.push('');
  lines.push(`> Generated: ${new Date().toISOString()}`);
  if (openclawRef?.commit) {
    lines.push(`> OpenClaw ref: ${openclawRef.commit} — ${openclawRef.subject}`);
  } else {
    lines.push(`> OpenClaw ref: (unknown; .ref/openclaw not a git repo?)`);
  }
  lines.push('');

  const entries = [
    {
      section: 'Config (docs)',
      label: 'Gateway configuration reference (field-by-field)',
      file: '.ref/openclaw/docs/gateway/configuration-reference.md',
    },
    {
      section: 'Config (docs)',
      label: 'Gateway configuration overview + examples',
      file: '.ref/openclaw/docs/gateway/configuration.md',
    },
    {
      section: 'Config (code)',
      label: 'Schema builder (JSON Schema + uiHints merge: plugins + channels)',
      file: '.ref/openclaw/src/config/schema.ts',
    },
    {
      section: 'Config (code)',
      label: 'Top-level Zod schema entrypoint',
      file: '.ref/openclaw/src/config/zod-schema.ts',
    },
    {
      section: 'Config (code)',
      label: 'Channels config schema (Zod)',
      file: '.ref/openclaw/src/config/zod-schema.channels.ts',
    },
    {
      section: 'Config (code)',
      label: 'Providers config schema (Zod)',
      file: '.ref/openclaw/src/config/zod-schema.providers.ts',
    },
    {
      section: 'Config (code)',
      label: 'Config load/merge helpers',
      file: '.ref/openclaw/src/config/merge-config.ts',
    },
    {
      section: 'CLI (docs)',
      label: 'CLI: config',
      file: '.ref/openclaw/docs/cli/config.md',
    },
    {
      section: 'CLI (docs)',
      label: 'CLI: configure',
      file: '.ref/openclaw/docs/cli/configure.md',
    },
    {
      section: 'CLI (docs)',
      label: 'CLI: channels',
      file: '.ref/openclaw/docs/cli/channels.md',
    },
    {
      section: 'Skills/Plugins (docs)',
      label: 'Skills config schema + examples',
      file: '.ref/openclaw/docs/tools/skills-config.md',
    },
    {
      section: 'Skills/Plugins (docs)',
      label: 'Plugin manifest + config schema',
      file: '.ref/openclaw/docs/plugins/manifest.md',
    },
    {
      section: 'Channels (docs)',
      label: 'Channel routing',
      file: '.ref/openclaw/docs/channels/channel-routing.md',
    },
    {
      section: 'Control UI (docs)',
      label: 'Control UI (config schema + Raw JSON editor)',
      file: '.ref/openclaw/docs/web/control-ui.md',
    },
    {
      section: 'Control UI (code)',
      label: 'UI config controller (form coercion etc)',
      file: '.ref/openclaw/ui/src/ui/controllers/config.ts',
    },
  ];

  const bySection = new Map();
  for (const e of entries) {
    if (!bySection.has(e.section)) bySection.set(e.section, []);
    bySection.get(e.section).push(e);
  }

  const sections = Array.from(bySection.keys()).sort((a, b) => a.localeCompare(b));
  for (const section of sections) {
    lines.push(`## ${section}`);
    lines.push('');
    lines.push('| Label | Source | Exists |');
    lines.push('| ----- | ------ | ------ |');
    for (const e of bySection.get(section)) {
      const abs = path.join(ROOT, e.file);
      let exists = false;
      try {
        await fs.stat(abs);
        exists = true;
      } catch {
        exists = false;
      }
      lines.push(`| ${mdEscape(e.label)} | \`${mdEscape(e.file)}\` | ${exists ? 'yes' : 'NO'} |`);
    }
    lines.push('');
  }

  lines.push('## Channels (code) — directory entrypoints');
  lines.push('');
  lines.push('Use these when you need to trace behavior beyond docs/schema:');
  lines.push('');
  const dirs = [
    '.ref/openclaw/src/discord',
    '.ref/openclaw/src/channels',
    '.ref/openclaw/extensions',
    '.ref/openclaw/src/memory',
  ];
  for (const d of dirs) {
    lines.push(`- \`${d}\``);
  }
  lines.push('');

  const outPath = path.join(outDir, 'openclaw-ref-entrypoints.md');
  await fs.writeFile(outPath, lines.join('\n'), 'utf8');
  return { outPath };
}

async function buildIndexEntrypoint({ outDir, openclawRef, coclawIndex, openclawIndex }) {
  const lines = [];
  lines.push('# KB Index (CoClaw × OpenClaw)');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  if (openclawRef?.commit) {
    lines.push(`OpenClaw ref: ${openclawRef.commit} — ${openclawRef.subject}`);
  } else {
    lines.push('OpenClaw ref: (unknown; .ref/openclaw not a git repo?)');
  }
  lines.push('');
  lines.push('## What to read');
  lines.push('');
  lines.push(
    `- CoClaw site pages/content index: \`docs/kb/coclaw-site-pages.md\` (entries: pages=${coclawIndex.pageEntriesCount}, content=${coclawIndex.contentEntriesCount})`
  );
  lines.push(`- OpenClaw ref entrypoints: \`docs/kb/openclaw-ref-entrypoints.md\``);
  lines.push('');
  lines.push('## When to rebuild');
  lines.push('');
  lines.push('- After editing CoClaw content (src/content, src/pages)');
  lines.push('- After syncing OpenClaw ref (.ref/openclaw)');
  lines.push('');
  lines.push('## Command');
  lines.push('');
  lines.push('```bash');
  lines.push('pnpm kb:build');
  lines.push('```');
  lines.push('');

  const outPath = path.join(outDir, 'INDEX.md');
  await fs.writeFile(outPath, lines.join('\n'), 'utf8');
  return { outPath };
}

async function main() {
  const kbDir = path.join(ROOT, 'docs', 'kb');
  await ensureDir(kbDir);

  let openclawRef = null;
  try {
    const commit = runGit([
      '-C',
      path.join(ROOT, '.ref', 'openclaw'),
      'rev-parse',
      '--short',
      'HEAD',
    ]);
    const subject = runGit(['-C', path.join(ROOT, '.ref', 'openclaw'), 'log', '-1', '--pretty=%s']);
    openclawRef = { commit, subject };
  } catch {
    openclawRef = { commit: '', subject: '' };
  }

  const coclawIndex = await buildCoclawSiteIndex({ outDir: kbDir, openclawRef });
  const openclawIndex = await buildOpenclawEntrypoints({ outDir: kbDir, openclawRef });
  const entry = await buildIndexEntrypoint({
    outDir: kbDir,
    openclawRef,
    coclawIndex,
    openclawIndex,
  });

  console.log('KB docs written:');
  console.log(`- ${relFromRoot(entry.outPath)}`);
  console.log(`- ${relFromRoot(coclawIndex.outPath)}`);
  console.log(`- ${relFromRoot(openclawIndex.outPath)}`);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
