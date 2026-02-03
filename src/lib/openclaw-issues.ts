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

// Vite/Astro can import JSON directly.
// Keeping it under `src/` lets both server and client use it.
import dataset from '../data/openclaw/openclaw-issues.json';

export function getOpenClawIssuesDataset(): OpenClawIssuesDataset {
  return dataset as OpenClawIssuesDataset;
}

export function findIssueByNumber(number: number): OpenClawIssue | undefined {
  const { issues } = getOpenClawIssuesDataset();
  return issues.find((i) => i.number === number);
}

export function labelToFilterValue(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
