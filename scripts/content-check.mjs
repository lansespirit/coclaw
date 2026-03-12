#!/usr/bin/env node
/**
 * Content pre-publish checks.
 *
 * Today this focuses on Troubleshooting Solutions (src/content/troubleshooting/solutions),
 * because those pages have hard structural requirements that are easy to regress.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();

function splitFrontmatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const fmRaw = text.slice(3, end).replace(/^\s*\n/, '');
  const body = text.slice(end + '\n---'.length);
  return { frontmatter: fmRaw, body };
}

function stripQuotes(v) {
  const s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseYamlishFrontmatter(yamlText) {
  // Minimal YAML subset parser: scalars + top-level lists.
  // Nested objects are intentionally ignored.
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

      data[key] = stripQuotes(rest.trim());
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

function isISODate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? '').trim());
}

function sectionSlice(body, heading, nextHeadings) {
  const start = body.indexOf(heading);
  if (start === -1) return null;
  const after = start + heading.length;
  const tail = body.slice(after);

  let end = body.length;
  for (const h of nextHeadings) {
    const idx = tail.indexOf(h);
    if (idx !== -1) {
      end = after + idx;
      break;
    }
  }

  return body.slice(after, end);
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (!ent.name.endsWith('.mdx')) continue;
    files.push(path.join(dir, ent.name));
  }
  files.sort((a, b) => a.localeCompare(b));
  return files;
}

async function checkTroubleshootingSolutions() {
  const dir = path.join(ROOT, 'src', 'content', 'troubleshooting', 'solutions');
  const files = await listFiles(dir);

  const errors = [];
  const warnings = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const text = await fs.readFile(file, 'utf8');
    const parts = splitFrontmatter(text);
    if (!parts) {
      errors.push(`${rel}: missing or malformed frontmatter (expected leading ---)`);
      continue;
    }

    const fm = parseYamlishFrontmatter(parts.frontmatter);

    const requiredKeys = [
      'title',
      'description',
      'kind',
      'component',
      'severity',
      'publishDate',
      'lastUpdated',
      'layout',
    ];
    for (const key of requiredKeys) {
      if (!(key in fm) || String(fm[key]).trim() === '') {
        errors.push(`${rel}: missing required frontmatter field "${key}"`);
      }
    }

    if (fm.kind && stripQuotes(fm.kind) !== 'solution') {
      errors.push(`${rel}: kind must be "solution" (got ${JSON.stringify(fm.kind)})`);
    }

    for (const key of ['publishDate', 'lastUpdated']) {
      if (key in fm && !isISODate(fm[key])) {
        warnings.push(`${rel}: ${key} should be YYYY-MM-DD (got ${JSON.stringify(fm[key])})`);
      }
    }

    const body = parts.body;
    const requiredHeadings = ['## Symptoms', '## Cause', '## Fix', '## Verify'];
    const positions = requiredHeadings.map((h) => body.indexOf(h));
    if (positions.some((p) => p === -1)) {
      for (let i = 0; i < requiredHeadings.length; i++) {
        if (positions[i] === -1) errors.push(`${rel}: missing heading ${requiredHeadings[i]}`);
      }
    } else {
      for (let i = 1; i < positions.length; i++) {
        if (positions[i] <= positions[i - 1]) {
          errors.push(`${rel}: headings must be ordered Symptoms -> Cause -> Fix -> Verify`);
          break;
        }
      }
    }

    const relatedPos = body.indexOf('## Related');
    if (relatedPos !== -1) {
      const verifyPos = body.indexOf('## Verify');
      if (verifyPos !== -1 && relatedPos < verifyPos) {
        errors.push(`${rel}: "## Related" must come after "## Verify"`);
      }
    }

    const nonEmpty = (s) => (s ?? '').replace(/\s+/g, '').length > 0;
    for (const heading of requiredHeadings) {
      const next = ['## Symptoms', '## Cause', '## Fix', '## Verify', '## Related'].filter(
        (h) => h !== heading
      );
      const slice = sectionSlice(body, heading, next);
      if (slice == null) continue;
      if (!nonEmpty(slice)) errors.push(`${rel}: section ${heading} is empty`);
    }
  }

  return { errors, warnings, checked: files.length };
}

async function main() {
  const results = [];

  results.push({ name: 'Troubleshooting Solutions', ...(await checkTroubleshootingSolutions()) });

  let totalErrors = 0;
  let totalWarnings = 0;
  for (const r of results) {
    totalErrors += r.errors.length;
    totalWarnings += r.warnings.length;
  }

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`content-check: OK (${results.map((r) => `${r.name}=${r.checked}`).join(', ')})`);
    return;
  }

  for (const r of results) {
    if (!r.errors.length && !r.warnings.length) continue;
    console.log(`\n== ${r.name} ==`);
    for (const w of r.warnings) console.log(`WARN  ${w}`);
    for (const e of r.errors) console.log(`ERROR ${e}`);
  }

  if (totalErrors > 0) {
    console.error(`\ncontent-check: FAILED (errors=${totalErrors}, warnings=${totalWarnings})`);
    process.exitCode = 1;
    return;
  }

  console.log(`\ncontent-check: PASSED WITH WARNINGS (warnings=${totalWarnings})`);
}

main().catch((err) => {
  console.error('content-check: fatal error');
  console.error(err);
  process.exitCode = 1;
});
