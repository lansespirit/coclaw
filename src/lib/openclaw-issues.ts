import fs from 'node:fs';
import path from 'node:path';

export type OpenClawIssueComment = {
  id: number;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  author: string | null;
  body: string;
};

export type OpenClawIssue = {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | string;
  comments: number;
  commentsData?: OpenClawIssueComment[];
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  author: string | null;
  labels: string[];
  taxonomy?: {
    channels: string[];
    platforms: string[];
    components: string[];
  };
};

export type OpenClawIssuesDataset = {
  repo: string;
  fetchedAt: string;
  max: number;
  issues: OpenClawIssue[];
};

const DATASET_CANDIDATES = [
  path.resolve(
    process.cwd(),
    'skills',
    'coclaw-solutions-maintainer',
    'data',
    'openclaw-issues.json'
  ),
];

let cachedDataset: OpenClawIssuesDataset | null = null;
let warnedMissingDataset = false;

function emptyDataset(): OpenClawIssuesDataset {
  return {
    repo: 'openclaw/openclaw',
    fetchedAt: 'not-synced',
    max: 0,
    issues: [],
  };
}

function normalizeDataset(raw: unknown): OpenClawIssuesDataset {
  const fallback = emptyDataset();
  if (!raw || typeof raw !== 'object') return fallback;

  const parsed = raw as {
    repo?: unknown;
    fetchedAt?: unknown;
    max?: unknown;
    issues?: unknown;
  };

  return {
    repo: typeof parsed.repo === 'string' && parsed.repo ? parsed.repo : fallback.repo,
    fetchedAt:
      typeof parsed.fetchedAt === 'string' && parsed.fetchedAt
        ? parsed.fetchedAt
        : fallback.fetchedAt,
    max: typeof parsed.max === 'number' && Number.isFinite(parsed.max) ? parsed.max : fallback.max,
    issues: Array.isArray(parsed.issues) ? (parsed.issues as OpenClawIssue[]) : fallback.issues,
  };
}

function loadDatasetFromDisk(): OpenClawIssuesDataset {
  for (const file of DATASET_CANDIDATES) {
    if (!fs.existsSync(file)) continue;

    try {
      const raw = fs.readFileSync(file, 'utf8');
      return normalizeDataset(JSON.parse(raw));
    } catch (error) {
      console.warn(`[openclaw-issues] Failed to read dataset at ${file}:`, error);
    }
  }

  if (!warnedMissingDataset) {
    warnedMissingDataset = true;
    console.warn(
      '[openclaw-issues] No synced dataset found. Run `pnpm sync:issues` to populate skill data.'
    );
  }

  return emptyDataset();
}

export function getOpenClawIssuesDataset(): OpenClawIssuesDataset {
  if (cachedDataset) return cachedDataset;
  cachedDataset = loadDatasetFromDisk();
  return cachedDataset;
}

export function findIssueByNumber(number: number): OpenClawIssue | undefined {
  const { issues } = getOpenClawIssuesDataset();
  return issues.find((issue) => issue.number === number);
}
