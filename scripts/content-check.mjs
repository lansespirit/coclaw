#!/usr/bin/env node
/**
 * Content pre-publish checks.
 *
 * Today this focuses on:
 * - Troubleshooting Solutions structural integrity
 * - SEO metadata contract coverage for strategic content types
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

async function listFilesRecursive(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...(await listFilesRecursive(full)));
      continue;
    }
    if (!ent.isFile()) continue;
    if (!ent.name.endsWith('.mdx')) continue;
    files.push(full);
  }
  files.sort((a, b) => a.localeCompare(b));
  return files;
}

function textLengthWithin(value, min, max) {
  const len = String(value ?? '').trim().length;
  return len >= min && len <= max;
}

function hasTopLevelListField(frontmatterRaw, key) {
  return new RegExp(`^${key}:\\s*$`, 'm').test(frontmatterRaw);
}

function hasTroubleshootingEvidence(frontmatterRaw) {
  if (hasTopLevelListField(frontmatterRaw, 'sources')) return true;
  if (
    /^\s{2}docs:\s*$/m.test(frontmatterRaw) &&
    /^\s{4}-\s*["']?https?:\/\//m.test(frontmatterRaw)
  ) {
    return true;
  }
  if (/^\s{2}githubIssues:\s*$/m.test(frontmatterRaw) && /^\s{4}-\s*\d+/m.test(frontmatterRaw)) {
    return true;
  }
  if (/^\s{2}external:\s*$/m.test(frontmatterRaw)) return true;
  return false;
}

function extractAbsoluteUrls(body) {
  if (!body) return [];
  const matches = body.match(/https?:\/\/[^\s)<>"']+/g) ?? [];
  const cleaned = matches
    .map((url) => url.replace(/[`)\],.;:]+$/g, ''))
    .filter((url) => {
      try {
        const parsed = new URL(url);
        return !['127.0.0.1', 'localhost', 'openclaw'].includes(parsed.hostname);
      } catch {
        return false;
      }
    });
  return Array.from(new Set(cleaned));
}

function hasUrlFromHosts(body, hosts) {
  const allow = new Set(hosts.map((host) => host.toLowerCase()));
  return extractAbsoluteUrls(body).some((url) => {
    try {
      return allow.has(new URL(url).hostname.toLowerCase());
    } catch {
      return false;
    }
  });
}

function hasGuideSourceEvidence(frontmatterRaw, body) {
  return (
    hasTopLevelListField(frontmatterRaw, 'sources') || hasUrlFromHosts(body, ['docs.openclaw.ai'])
  );
}

function hasGettingStartedSourceEvidence(frontmatterRaw, body) {
  return (
    hasTopLevelListField(frontmatterRaw, 'sources') ||
    hasUrlFromHosts(body, ['docs.openclaw.ai', 'github.com', 'nodejs.org'])
  );
}

function hasChannelSourceEvidence(frontmatterRaw, body, filePath) {
  if (hasTopLevelListField(frontmatterRaw, 'sources')) return true;
  if (hasUrlFromHosts(body, ['docs.openclaw.ai'])) return true;
  const slug = path.basename(filePath, path.extname(filePath)).trim();
  return slug.length > 0;
}

function hasBlogSourceEvidence(frontmatterRaw, body) {
  return hasTopLevelListField(frontmatterRaw, 'sources') || extractAbsoluteUrls(body).length > 0;
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

async function checkSeoMetadataCoverage() {
  const targets = [
    {
      name: 'Getting Started',
      dir: path.join(ROOT, 'src', 'content', 'getting-started'),
      requireTrust: true,
    },
    {
      name: 'Guides',
      dir: path.join(ROOT, 'src', 'content', 'guides'),
      requireTrust: true,
    },
    {
      name: 'Channels',
      dir: path.join(ROOT, 'src', 'content', 'channels'),
      requireTrust: true,
    },
    {
      name: 'Troubleshooting',
      dir: path.join(ROOT, 'src', 'content', 'troubleshooting'),
      requireTrust: true,
    },
    {
      name: 'Blog',
      dir: path.join(ROOT, 'src', 'content', 'blog'),
      requireTrust: false,
    },
    {
      name: 'Stories',
      dir: path.join(ROOT, 'src', 'content', 'stories'),
      requireTrust: false,
    },
    {
      name: 'Special Reports',
      dir: path.join(ROOT, 'src', 'content', 'special-reports'),
      requireTrust: false,
    },
  ];

  const errors = [];
  const warnings = [];
  let checked = 0;

  for (const target of targets) {
    const files = await listFilesRecursive(target.dir);
    checked += files.length;

    for (const file of files) {
      const rel = path.relative(ROOT, file);
      const text = await fs.readFile(file, 'utf8');
      const parts = splitFrontmatter(text);
      if (!parts) {
        errors.push(`${rel}: missing or malformed frontmatter (expected leading ---)`);
        continue;
      }

      const fm = parseYamlishFrontmatter(parts.frontmatter);

      if (!('seoTitle' in fm) || !String(fm.seoTitle).trim()) {
        warnings.push(`${rel}: missing seoTitle`);
      } else if (!textLengthWithin(fm.seoTitle, 45, 65)) {
        warnings.push(
          `${rel}: seoTitle length should usually be 45-65 chars (got ${String(fm.seoTitle).trim().length})`
        );
      }

      if (!('seoDescription' in fm) || !String(fm.seoDescription).trim()) {
        warnings.push(`${rel}: missing seoDescription`);
      } else if (!textLengthWithin(fm.seoDescription, 110, 160)) {
        warnings.push(
          `${rel}: seoDescription length should usually be 110-160 chars (got ${String(fm.seoDescription).trim().length})`
        );
      }

      if (target.requireTrust) {
        if (!('reviewedBy' in fm) || !Array.isArray(fm.reviewedBy) || fm.reviewedBy.length === 0) {
          warnings.push(`${rel}: missing reviewedBy for high-stakes content`);
        }
        if (!('testedOn' in fm) || !Array.isArray(fm.testedOn) || fm.testedOn.length === 0) {
          warnings.push(`${rel}: missing testedOn for high-stakes content`);
        }
      }

      if (target.name === 'Stories' && !hasTopLevelListField(parts.frontmatter, 'sources')) {
        warnings.push(`${rel}: missing sources for story content`);
      }

      if (
        target.name === 'Getting Started' &&
        !hasGettingStartedSourceEvidence(parts.frontmatter, parts.body)
      ) {
        warnings.push(`${rel}: missing trusted source evidence (sources or trusted body links)`);
      }

      if (target.name === 'Guides' && !hasGuideSourceEvidence(parts.frontmatter, parts.body)) {
        warnings.push(`${rel}: missing source evidence (sources or OpenClaw docs links)`);
      }

      if (
        target.name === 'Channels' &&
        !hasChannelSourceEvidence(parts.frontmatter, parts.body, file)
      ) {
        warnings.push(
          `${rel}: missing source evidence (sources, docs links, or derived channel doc)`
        );
      }

      if (target.name === 'Troubleshooting' && !hasTroubleshootingEvidence(parts.frontmatter)) {
        warnings.push(`${rel}: missing source evidence (sources or related docs/issues/external)`);
      }

      if (target.name === 'Blog' && !hasBlogSourceEvidence(parts.frontmatter, parts.body)) {
        warnings.push(`${rel}: missing source evidence (sources or cited absolute URLs)`);
      }
    }
  }

  return { errors, warnings, checked };
}

async function checkStaticPageSeo() {
  const targets = [
    'src/pages/index.astro',
    'src/pages/resources.astro',
    'src/pages/blog/index.astro',
    'src/pages/channels/index.astro',
    'src/pages/getting-started.astro',
    'src/pages/guides/index.astro',
    'src/pages/special-reports/index.astro',
    'src/pages/stories/index.astro',
    'src/pages/troubleshooting.astro',
    'src/pages/troubleshooting/solutions.astro',
    'src/pages/faq.astro',
    'src/pages/about.astro',
    'src/pages/contact.astro',
    'src/pages/security.astro',
    'src/pages/privacy.astro',
  ];

  const errors = [];
  const warnings = [];

  for (const rel of targets) {
    const file = path.join(ROOT, rel);
    const text = await fs.readFile(file, 'utf8');

    if (!text.includes('<BaseLayout')) {
      errors.push(`${rel}: missing BaseLayout wrapper`);
      continue;
    }

    if (!/\btitle=/.test(text)) {
      warnings.push(`${rel}: missing BaseLayout title prop`);
    }

    if (!/\bdescription=/.test(text)) {
      warnings.push(`${rel}: missing BaseLayout description prop`);
    }

    if (!(text.includes('application/ld+json') || text.includes('structuredData='))) {
      warnings.push(`${rel}: missing structured data on indexable static page`);
    }
  }

  return { errors, warnings, checked: targets.length };
}

async function main() {
  const results = [];

  results.push({ name: 'Troubleshooting Solutions', ...(await checkTroubleshootingSolutions()) });
  results.push({ name: 'SEO Metadata Coverage', ...(await checkSeoMetadataCoverage()) });
  results.push({ name: 'Static Page SEO', ...(await checkStaticPageSeo()) });

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
