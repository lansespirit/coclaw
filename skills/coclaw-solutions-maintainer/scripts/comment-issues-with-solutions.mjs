#!/usr/bin/env node
/**
 * Comment on OpenClaw GitHub issues with matching CoClaw troubleshooting solution links.
 *
 * Intended workflow:
 *  - Generate a plan JSON (number + match.url/slug) via triage tooling
 *  - Run this script to post comments via `gh issue comment`
 *
 * Usage:
 *   node skills/coclaw-solutions-maintainer/scripts/comment-issues-with-solutions.mjs
 *   node ... --plan .cache/coclaw-solutions-maintainer/comment-plan.json --limit 10
 *   node ... --dry-run
 *
 * Notes:
 *  - Requires `gh` to be authenticated.
 *  - This script is conservative and does not attempt to dedupe against live GitHub comments.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

function parseArgs(argv) {
  const args = {
    planFile: path.resolve('.cache', 'coclaw-solutions-maintainer', 'comment-plan.json'),
    repo: 'openclaw/openclaw',
    limit: null,
    dryRun: false,
    sleepMs: 1200,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--plan') {
      const v = argv[i + 1];
      i += 1;
      if (!v) throw new Error('Missing value for --plan');
      args.planFile = path.resolve(v);
      continue;
    }
    if (a === '--repo') {
      const v = argv[i + 1];
      i += 1;
      if (!v) throw new Error('Missing value for --repo');
      args.repo = v;
      continue;
    }
    if (a === '--limit') {
      const v = argv[i + 1];
      i += 1;
      const n = Number.parseInt(v ?? '', 10);
      if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid --limit: ${v}`);
      args.limit = n;
      continue;
    }
    if (a === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (a === '--sleep-ms') {
      const v = argv[i + 1];
      i += 1;
      const n = Number.parseInt(v ?? '', 10);
      if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid --sleep-ms: ${v}`);
      args.sleepMs = n;
      continue;
    }
    if (a === '--help' || a === '-h') {
      console.log(`Usage:
  node skills/coclaw-solutions-maintainer/scripts/comment-issues-with-solutions.mjs [options]

Options:
  --plan <path>        Plan JSON path (default: .cache/coclaw-solutions-maintainer/comment-plan.json)
  --repo <owner/repo>  Repo to comment on (default: openclaw/openclaw)
  --limit <n>          Only comment on the first N entries
  --sleep-ms <n>       Delay between comments (default: 1200)
  --dry-run            Print what would be posted, do not post
`);
      process.exit(0);
    }

    throw new Error(`Unknown arg: ${a}`);
  }

  return args;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildBody(url) {
  return [
    `This issue looks covered by a CoClaw Troubleshooting Solution:`,
    ``,
    url,
    ``,
    `If you try the steps and it still fails, please reply with:`,
    `- your OS + OpenClaw version`,
    `- relevant gateway logs (around the failure)`,
    `- a minimal config snippet (redact secrets)`,
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const raw = JSON.parse(await fs.readFile(args.planFile, 'utf8'));
  const items = Array.isArray(raw?.top) ? raw.top : [];

  const limit = args.limit ?? items.length;
  const selected = items.slice(0, limit);

  if (!selected.length) {
    console.log('No items in plan.');
    return;
  }

  /** @type {{number: number, url: string}[]} */
  const posted = [];
  /** @type {{number: number, error: string}[]} */
  const failed = [];

  for (let idx = 0; idx < selected.length; idx += 1) {
    const it = selected[idx];
    const number = Number.parseInt(String(it?.number ?? ''), 10);
    const url = String(it?.match?.url ?? '').trim();
    if (!Number.isFinite(number) || number <= 0 || !url) {
      failed.push({ number: Number.isFinite(number) ? number : -1, error: 'Invalid plan entry' });
      continue;
    }

    const body = buildBody(url);

    if (args.dryRun) {
      console.log(`--- DRY RUN #${number} ---`);
      console.log(body);
      console.log('');
      continue;
    }

    try {
      execFileSync(
        'gh',
        ['issue', 'comment', String(number), '--repo', args.repo, '--body', body],
        { stdio: 'inherit' }
      );
      posted.push({ number, url });
    } catch (e) {
      failed.push({ number, error: e?.message ? String(e.message) : String(e) });
    }

    if (idx < selected.length - 1 && args.sleepMs > 0) {
      await sleep(args.sleepMs);
    }
  }

  if (!args.dryRun) {
    console.log('');
    console.log(`Posted: ${posted.length}`);
    for (const p of posted) console.log(`- #${p.number} -> ${p.url}`);
    if (failed.length) {
      console.log(`Failed: ${failed.length}`);
      for (const f of failed) console.log(`- #${f.number}: ${f.error.split('\n')[0]}`);
    }
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});

