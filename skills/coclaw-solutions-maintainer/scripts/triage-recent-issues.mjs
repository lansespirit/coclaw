#!/usr/bin/env node
/**
 * Incremental triage for OpenClaw issues (no issue analysis).
 *
 * Responsibilities:
 * - Read synced dataset: skills/coclaw-solutions-maintainer/data/openclaw-issues.json
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

const DEFAULT_ISSUES_FILE = path.resolve(
  'skills',
  'coclaw-solutions-maintainer',
  'data',
  'openclaw-issues.json'
);

function parseArgs(argv) {
  const args = {
    sinceHours: 72,
    issuesFile: DEFAULT_ISSUES_FILE,
    stateFile: path.resolve('.cache', 'coclaw-solutions-maintainer', 'state.json'),
    dryRun: false,
    includeUpdated: false,
    stateFilter: 'open',
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--issues') {
      const value = argv[i + 1];
      i += 1;
      if (!value) throw new Error('Missing value for --issues');
      args.issuesFile = path.resolve(value);
      continue;
    }

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

    if (arg === '--state-filter') {
      const value = String(argv[i + 1] ?? '')
        .trim()
        .toLowerCase();
      i += 1;
      if (!['open', 'closed', 'all'].includes(value)) {
        throw new Error(`Invalid --state-filter: ${value}`);
      }
      args.stateFilter = value;
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
  --issues <path>        Override issues dataset path (default: skills/coclaw-solutions-maintainer/data/openclaw-issues.json)
  --include-updated      Include already-processed issues if updatedAt advanced since last run
  --state-filter <mode>  Issue state filter: open|closed|all (default: open)
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
      processed: normalizeProcessedMap(json?.processed),
    };
  } catch {
    return { lastRunAt: null, processed: {} };
  }
}

function normalizeProcessedMap(processed) {
  if (typeof processed !== 'object' || !processed) return {};

  return Object.fromEntries(
    Object.entries(processed).map(([issueNumber, value]) => [
      issueNumber,
      normalizeProcessedEntry(value),
    ])
  );
}

function normalizeProcessedEntry(value) {
  if (typeof value === 'string') {
    return {
      updatedAt: value,
      state: null,
      commentsCount: null,
      lastCommentedAt: null,
      lastSeenAt: null,
      lastTriagedAt: null,
    };
  }

  if (typeof value === 'object' && value) {
    const commentsCount = Number.parseInt(String(value.commentsCount ?? ''), 10);
    return {
      updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
      state: typeof value.state === 'string' ? value.state : null,
      commentsCount: Number.isFinite(commentsCount) && commentsCount >= 0 ? commentsCount : null,
      lastCommentedAt: typeof value.lastCommentedAt === 'string' ? value.lastCommentedAt : null,
      lastSeenAt: typeof value.lastSeenAt === 'string' ? value.lastSeenAt : null,
      lastTriagedAt: typeof value.lastTriagedAt === 'string' ? value.lastTriagedAt : null,
    };
  }

  return {
    updatedAt: null,
    state: null,
    commentsCount: null,
    lastCommentedAt: null,
    lastSeenAt: null,
    lastTriagedAt: null,
  };
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

function issueState(issue) {
  const state = String(issue?.state ?? '')
    .trim()
    .toLowerCase();
  return state === 'closed' ? 'closed' : 'open';
}

function lastCommentedAt(issue) {
  if (!Array.isArray(issue?.commentsData) || issue.commentsData.length === 0) return null;
  return issue.commentsData.reduce((latest, comment) => {
    const current =
      typeof comment?.updatedAt === 'string' ? comment.updatedAt : (comment?.createdAt ?? null);
    if (!current) return latest;
    if (!latest || current > latest) return current;
    return latest;
  }, null);
}

function snapshotIssue(issue) {
  return {
    updatedAt: typeof issue?.updatedAt === 'string' ? issue.updatedAt : null,
    state: issueState(issue),
    commentsCount: commentsCount(issue),
    lastCommentedAt: lastCommentedAt(issue),
  };
}

function matchesStateFilter(state, stateFilter) {
  if (stateFilter === 'all') return true;
  return state === stateFilter;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const issuesFile = args.issuesFile;
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
      const previous = normalizeProcessedEntry(state.processed?.[numberKey] ?? null);
      const snapshot = snapshotIssue(issue);

      if (!matchesStateFilter(snapshot.state, args.stateFilter)) {
        return null;
      }

      if (!previous.updatedAt) {
        return { issue, triageState: 'new', snapshot };
      }

      if (previous.state === 'closed' && snapshot.state === 'open') {
        return { issue, triageState: 'reopened', snapshot };
      }

      const materiallyUpdated =
        (snapshot.updatedAt && previous.updatedAt && snapshot.updatedAt > previous.updatedAt) ||
        snapshot.commentsCount > (previous.commentsCount ?? -1) ||
        (snapshot.lastCommentedAt &&
          (!previous.lastCommentedAt || snapshot.lastCommentedAt > previous.lastCommentedAt)) ||
        (previous.state && snapshot.state !== previous.state);

      if (args.includeUpdated && materiallyUpdated) {
        return { issue, triageState: 'updated', snapshot };
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
    state: issueState(issue),
    labels: normalizeLabels(issue.labels),
    commentsCount: commentsCount(issue),
    lastCommentedAt: lastCommentedAt(issue),
    triageState,
  }));

  const countByTriageState = out.reduce((acc, issue) => {
    acc[issue.triageState] = (acc[issue.triageState] ?? 0) + 1;
    return acc;
  }, {});

  const payload = {
    cutoffIso,
    count: out.length,
    countByTriageState,
    lastRunAt: state.lastRunAt,
    stateFilter: args.stateFilter,
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
      console.log(`- state: ${issue.state}`);
      if (issue.labels.length) console.log(`- labels: ${issue.labels.join(', ')}`);
      console.log(`- comments: ${issue.commentsCount}`);
      if (issue.lastCommentedAt) console.log(`- lastCommentedAt: ${issue.lastCommentedAt}`);
      console.log('');
    }
  }

  if (!args.dryRun) {
    const nextState = {
      lastRunAt: new Date().toISOString(),
      processed: { ...(state.processed ?? {}) },
    };

    for (const issue of recentIssues) {
      const snapshot = snapshotIssue(issue);
      nextState.processed[String(issue.number)] = {
        updatedAt: snapshot.updatedAt ?? new Date().toISOString(),
        state: snapshot.state,
        commentsCount: snapshot.commentsCount,
        lastCommentedAt: snapshot.lastCommentedAt,
        lastSeenAt: new Date().toISOString(),
        lastTriagedAt: selectedIssues.some((item) => item.issue.number === issue.number)
          ? new Date().toISOString()
          : normalizeProcessedEntry(nextState.processed[String(issue.number)]).lastTriagedAt,
      };
    }

    await saveState(args.stateFile, nextState);
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
