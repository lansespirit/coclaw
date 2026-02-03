#!/usr/bin/env node
/**
 * Generate lightweight Troubleshooting MDX stubs from the locally-synced GitHub issues dataset.
 *
 * This converts "real user problems" (issues) into indexable pages that can later be curated
 * into proper problem → cause → fix articles.
 *
 * Usage:
 *   node scripts/generate-troubleshooting-stubs.mjs
 *
 * Env:
 *   TROUBLESHOOTING_STUBS_MAX (default 30)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_FILE = path.resolve(
  __dirname,
  '..',
  'src',
  'data',
  'openclaw',
  'openclaw-issues.json'
);
const OUT_DIR = path.resolve(__dirname, '..', 'src', 'content', 'troubleshooting', 'github');

const MAX =
  Number.parseInt(process.env.TROUBLESHOOTING_STUBS_MAX ?? '', 10) > 0
    ? Number.parseInt(process.env.TROUBLESHOOTING_STUBS_MAX ?? '', 10)
    : 30;

function toDateOnlyIso(d) {
  return d.toISOString().slice(0, 10);
}

function escapeYamlString(s) {
  return String(s).replace(/"/g, '\\"');
}

function safeFilename(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function main() {
  const raw = await fs.readFile(DATASET_FILE, 'utf8');
  const dataset = JSON.parse(raw);
  const issues = Array.isArray(dataset.issues) ? dataset.issues : [];

  const sorted = [...issues].sort((a, b) => {
    const ac = typeof a.comments === 'number' ? a.comments : 0;
    const bc = typeof b.comments === 'number' ? b.comments : 0;
    if (bc !== ac) return bc - ac;
    return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  });

  const chosen = sorted.slice(0, MAX);

  await fs.mkdir(OUT_DIR, { recursive: true });
  // This directory is generated. Clear stale files so outdated stubs don't accidentally ship.
  const existing = await fs.readdir(OUT_DIR).catch(() => []);
  await Promise.all(
    existing
      .filter((name) => name.endsWith('.mdx'))
      .map((name) => fs.unlink(path.join(OUT_DIR, name)).catch(() => null))
  );

  const today = toDateOnlyIso(new Date());

  for (const issue of chosen) {
    const number = issue.number;
    const title = issue.title ?? `Issue #${number}`;
    const slug = `github-issue-${number}-${safeFilename(title)}`;

    const labels = Array.isArray(issue.labels)
      ? issue.labels.map(String).map((l) => l.trim()).filter(Boolean)
      : [];

    const channels = Array.isArray(issue.taxonomy?.channels) ? issue.taxonomy.channels : [];
    const os = Array.isArray(issue.taxonomy?.platforms) ? issue.taxonomy.platforms : [];
    const components = Array.isArray(issue.taxonomy?.components) ? issue.taxonomy.components : [];

    const bodyPreview = String(issue.body ?? '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 1200);

    const description = `Real user-reported issue (#${number}) from GitHub: ${title}`.slice(0, 180);

    const frontmatter = `---\n` +
      `title: "${escapeYamlString(title)}"\n` +
      `description: "${escapeYamlString(description)}"\n` +
      `kind: "case"\n` +
      `draft: true\n` +
      (components.length ? `component: "${escapeYamlString(components[0])}"\n` : '') +
      `related:\n` +
      `  githubIssues:\n` +
      `    - ${number}\n` +
      (os.length ? `os:\n${os.map((o) => `  - "${escapeYamlString(o)}"`).join('\n')}\n` : '') +
      (channels.length
        ? `channel:\n${channels.map((c) => `  - "${escapeYamlString(c)}"`).join('\n')}\n`
        : '') +
      `publishDate: ${today}\n` +
      `lastUpdated: ${today}\n` +
      `author: "CoClaw Team"\n` +
      (labels.length
        ? `keywords:\n${labels.map((l) => `  - "${escapeYamlString(l)}"`).join('\n')}\n`
        : '') +
      `layout: ../../../layouts/TroubleshootingLayout.astro\n` +
      `---\n`;

    const mdx =
      frontmatter +
      `\n` +
      `This page is an **auto-generated troubleshooting stub** created from a real GitHub issue.\n` +
      `It is meant to be curated into a proper problem → cause → fix article.\n` +
      `\n` +
      `## Source\n` +
      `- GitHub issue: [#${number}](${issue.htmlUrl})\n` +
      `- State: \`${issue.state}\`\n` +
      `- Comments: \`${issue.comments}\`\n` +
      `\n` +
      `## What users report\n` +
      `\n` +
      (bodyPreview ? `\`\`\`\n${bodyPreview}\n\`\`\`\n` : `_No description provided._\n`) +
      `\n` +
      `## Next diagnostic steps (recommended)\n` +
      `1. Confirm your OpenClaw version and Node.js version.\n` +
      `2. Capture gateway logs around the failure.\n` +
      `3. Check network/DNS reachability for any external APIs involved.\n` +
      `4. Compare your config with known-good examples in our Guides.\n`;

    const outFile = path.join(OUT_DIR, `${slug}.mdx`);
    await fs.writeFile(outFile, mdx, 'utf8');
  }

  console.log(`Generated ${chosen.length} stubs in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
