#!/usr/bin/env node
/**
 * Incremental triage for OpenClaw issues (no issue analysis).
 *
 * Responsibilities:
 * - Read synced dataset: src/data/openclaw/openclaw-issues.json
 * - Select issues updated within N hours
 * - Emit only newly-seen issues (or updated issues with --include-updated)
 * - Persist state: .cache/coclaw-solutions-maintainer/state.json
 *
 * Non-responsibilities:
 * - No solution matching
 * - No issue type classification
 * - No GitHub commenting
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const args = {
    sinceHours: 72,
    stateFile: path.resolve('.cache', 'coclaw-solutions-maintainer', 'state.json'),
    dryRun: false,
    includeUpdated: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--since-hours') {
      const value = argv[i + 1];
      i += 1;
      const parsed = Number.parseInt(value ?? '', 10);
      if (!Number.isFinite(parsed) || parsed <= 0)
        throw new Error(`Invalid --since-hours: ${value}`);
      args.sinceHours = parsed;
      continue;
    }

    if (arg === '--state') {
      const value = argv[i + 1];
      i += 1;
      if (!value) throw new Error('Missing value for --state');
      args.stateFile = path.resolve(value);
      continue;
    }

    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (arg === '--include-updated') {
      args.includeUpdated = true;
      continue;
    }

    if (arg === '--json') {
      args.json = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs [options]

Options:
  --since-hours <n>      Only include issues updated within the last N hours (default: 72)
  --include-updated      Include already-processed issues if updatedAt advanced since last run
  --state <path>         Override state file path (default: .cache/coclaw-solutions-maintainer/state.json)
  --dry-run              Do not write state
  --json                 Emit machine-readable JSON only
`);
      process.exit(0);
    }

    throw new Error(`Unknown arg: ${arg}`);
  }

  return args;
}

async function fileExists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadState(stateFile) {
  try {
    const raw = await fs.readFile(stateFile, 'utf8');
    const json = JSON.parse(raw);
    return {
      lastRunAt: typeof json?.lastRunAt === 'string' ? json.lastRunAt : null,
      processed: typeof json?.processed === 'object' && json?.processed ? json.processed : {},
    };
  } catch {
    return { lastRunAt: null, processed: {} };
  }
}

async function saveState(stateFile, state) {
  await fs.mkdir(path.dirname(stateFile), { recursive: true });
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function normalizeLabels(labels) {
  if (!Array.isArray(labels)) return [];
  return labels.map((label) => String(label)).filter(Boolean);
}

function commentsCount(issue) {
  if (Array.isArray(issue?.commentsData)) return issue.commentsData.length;
  const raw = Number.parseInt(String(issue?.comments ?? ''), 10);
  return Number.isFinite(raw) && raw >= 0 ? raw : 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();

  const issuesFile = path.join(repoRoot, 'src', 'data', 'openclaw', 'openclaw-issues.json');
  if (!(await fileExists(issuesFile))) {
    throw new Error(
      `Missing issues dataset: ${issuesFile}\nRun: OPENCLAW_ISSUES_SINCE_HOURS=72 pnpm sync:issues`
    );
  }

  const state = await loadState(args.stateFile);
  const rawIssues = JSON.parse(await fs.readFile(issuesFile, 'utf8'));
  const issues = Array.isArray(rawIssues?.issues) ? rawIssues.issues : [];

  const cutoff = new Date(Date.now() - args.sinceHours * 60 * 60 * 1000);
  const cutoffIso = cutoff.toISOString();

  const recentIssues = issues.filter((issue) => {
    const updatedAt = typeof issue?.updatedAt === 'string' ? issue.updatedAt : null;
    if (!updatedAt) return false;
    return updatedAt >= cutoffIso;
  });

  const selectedIssues = recentIssues
    .map((issue) => {
      const numberKey = String(issue.number);
      const previousUpdatedAt = state.processed?.[numberKey] ?? null;
      const updatedAt = typeof issue.updatedAt === 'string' ? issue.updatedAt : '';

      if (!previousUpdatedAt) {
        return { issue, triageState: 'new' };
      }

      if (args.includeUpdated && updatedAt > String(previousUpdatedAt)) {
        return { issue, triageState: 'updated' };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => String(b.issue.updatedAt ?? '').localeCompare(String(a.issue.updatedAt ?? '')));

  const out = selectedIssues.map(({ issue, triageState }) => ({
    number: issue.number,
    title: issue.title ?? '',
    htmlUrl: issue.htmlUrl ?? null,
    createdAt: issue.createdAt ?? null,
    updatedAt: issue.updatedAt ?? null,
    labels: normalizeLabels(issue.labels),
    commentsCount: commentsCount(issue),
    triageState,
  }));

  const payload = {
    cutoffIso,
    count: out.length,
    lastRunAt: state.lastRunAt,
    issues: out,
  };

  if (args.json) {
    process.stdout.write(JSON.stringify(payload, null, 2));
    process.stdout.write('\n');
  } else {
    console.log(`Cutoff (updatedAt) >= ${cutoffIso}`);
    console.log(`Incremental issues: ${out.length}`);
    console.log('');

    for (const issue of out) {
      console.log(`#${issue.number} [${issue.triageState}] ${issue.title}`);
      if (issue.htmlUrl) console.log(`- issue: ${issue.htmlUrl}`);
      if (issue.updatedAt) console.log(`- updatedAt: ${issue.updatedAt}`);
      if (issue.labels.length) console.log(`- labels: ${issue.labels.join(', ')}`);
      console.log(`- comments: ${issue.commentsCount}`);
      console.log('');
    }
  }

  if (!args.dryRun) {
    const nextState = {
      lastRunAt: new Date().toISOString(),
      processed: { ...(state.processed ?? {}) },
    };

    for (const { issue } of selectedIssues) {
      nextState.processed[String(issue.number)] = issue.updatedAt ?? new Date().toISOString();
    }

    await saveState(args.stateFile, nextState);
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
