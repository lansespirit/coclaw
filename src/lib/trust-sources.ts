const OPENCLAW_ISSUES_BASE = 'https://github.com/openclaw/openclaw/issues/';
const OPENCLAW_DOCS_BASE = 'https://docs.openclaw.ai';

export interface SourceEntry {
  label: string;
  url: string;
  type?: string;
  notes?: string;
}

interface TroubleshootingRelated {
  docs?: string[];
  githubIssues?: number[];
  external?: Array<{
    label: string;
    url: string;
  }>;
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function toDocsLabel(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.hostname === 'docs.openclaw.ai') {
      const path = url.pathname.replace(/\/+$/, '') || '/';
      return `OpenClaw docs: ${path}`;
    }
    return url.hostname;
  } catch {
    return rawUrl;
  }
}

function toSourceType(rawUrl: string): SourceEntry['type'] {
  try {
    const url = new URL(rawUrl);
    if (url.hostname === 'docs.openclaw.ai') return 'official-doc';
    if (url.hostname === 'github.com') {
      if (/^\/openclaw\/openclaw\/issues\/\d+$/.test(url.pathname)) return 'issue';
      return 'repo';
    }
    return 'other';
  } catch {
    return 'other';
  }
}

function extractAbsoluteUrls(body?: string | null) {
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

function toDocsSource(url: string): SourceEntry {
  return {
    label: toDocsLabel(url),
    url,
    type: toSourceType(url),
  };
}

function toGenericLabel(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.hostname === 'github.com') {
      const path = url.pathname.replace(/\/+$/, '');
      if (/^\/openclaw\/openclaw\/issues\/\d+$/.test(path)) {
        return `OpenClaw GitHub issue ${path.split('/').pop()}`;
      }
      if (/^\/openclaw\/openclaw(\/releases.*)?$/.test(path)) {
        return `OpenClaw GitHub: ${path}`;
      }
      return `GitHub: ${path}`;
    }
    return `${url.hostname}${url.pathname === '/' ? '' : ` ${url.pathname}`}`;
  } catch {
    return rawUrl;
  }
}

function toBodySource(url: string): SourceEntry {
  return {
    label: url.startsWith(OPENCLAW_DOCS_BASE) ? toDocsLabel(url) : toGenericLabel(url),
    url,
    type: toSourceType(url),
  };
}

export function mergeSources(...groups: Array<SourceEntry[] | undefined>) {
  const deduped = new Map<string, SourceEntry>();

  for (const group of groups) {
    for (const source of group ?? []) {
      if (!source?.url || !source?.label) continue;
      if (deduped.has(source.url)) continue;
      deduped.set(source.url, source);
    }
  }

  return Array.from(deduped.values());
}

export function deriveTroubleshootingSources(
  related?: TroubleshootingRelated,
  explicitSources?: SourceEntry[]
) {
  const docSources =
    related?.docs
      ?.filter((value) => typeof value === 'string' && isAbsoluteUrl(value))
      .map((url) => ({
        label: toDocsLabel(url),
        url,
        type: toSourceType(url),
      })) ?? [];

  const issueSources =
    related?.githubIssues
      ?.filter((value) => Number.isInteger(value) && value > 0)
      .map((issueNumber) => ({
        label: `OpenClaw GitHub issue #${issueNumber}`,
        url: `${OPENCLAW_ISSUES_BASE}${issueNumber}`,
        type: 'issue' as const,
      })) ?? [];

  const externalSources =
    related?.external?.map((entry) => ({
      label: entry.label,
      url: entry.url,
      type: toSourceType(entry.url),
    })) ?? [];

  return mergeSources(explicitSources, docSources, issueSources, externalSources);
}

export function deriveGuideSources(body?: string | null, explicitSources?: SourceEntry[]) {
  const docsSources = extractAbsoluteUrls(body)
    .filter((url) => url.startsWith(OPENCLAW_DOCS_BASE))
    .map((url) => toDocsSource(url));

  return mergeSources(explicitSources, docsSources);
}

export function deriveChannelSources(
  slug: string,
  body?: string | null,
  explicitSources?: SourceEntry[]
) {
  const docsSources = extractAbsoluteUrls(body)
    .filter((url) => url.startsWith(OPENCLAW_DOCS_BASE))
    .map((url) => toDocsSource(url));

  const defaultChannelDoc = toDocsSource(`${OPENCLAW_DOCS_BASE}/channels/${slug}`);

  return mergeSources(explicitSources, docsSources, [defaultChannelDoc]);
}

export function deriveArticleSources(body?: string | null, explicitSources?: SourceEntry[]) {
  const sources = extractAbsoluteUrls(body).map((url) => toBodySource(url));
  return mergeSources(explicitSources, sources);
}

export function deriveTrustedArticleSources(
  body: string | null | undefined,
  explicitSources?: SourceEntry[],
  allowedHosts: string[] = []
) {
  const allow = new Set(allowedHosts.map((host) => host.toLowerCase()));
  const sources = extractAbsoluteUrls(body)
    .filter((url) => {
      try {
        return allow.has(new URL(url).hostname.toLowerCase());
      } catch {
        return false;
      }
    })
    .map((url) => toBodySource(url));

  return mergeSources(explicitSources, sources);
}
