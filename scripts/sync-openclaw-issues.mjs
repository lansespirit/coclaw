#!/usr/bin/env node
/**
 * Sync OpenClaw GitHub issues into a local JSON "database" for the site.
 *
 * - Uses GitHub REST API: GET /repos/{owner}/{repo}/issues
 * - Filters out pull requests
 * - Writes to: src/data/openclaw/openclaw-issues.json
 *
 * Usage:
 *   node scripts/sync-openclaw-issues.mjs
 *
 * Env:
 *   GITHUB_TOKEN (optional but recommended to avoid low rate limits)
 *   OPENCLAW_ISSUES_MAX (optional, default 500)
 *   OPENCLAW_ISSUES_INCLUDE_COMMENTS (optional, default 1)
 *   OPENCLAW_ISSUES_COMMENTS_CONCURRENCY (optional, default 6)
 *   OPENCLAW_ISSUES_COMMENTS_MAX_PER_ISSUE (optional, default 50; set 0 for all)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OWNER = 'openclaw';
const REPO = 'openclaw';
const OUT_FILE = path.resolve(__dirname, '..', 'src', 'data', 'openclaw', 'openclaw-issues.json');
const OPENCLAW_REF_DIR = path.resolve(__dirname, '..', '.ref', 'openclaw');

const MAX =
  Number.parseInt(process.env.OPENCLAW_ISSUES_MAX ?? '', 10) > 0
    ? Number.parseInt(process.env.OPENCLAW_ISSUES_MAX ?? '', 10)
    : 500;

const INCLUDE_COMMENTS = (process.env.OPENCLAW_ISSUES_INCLUDE_COMMENTS ?? '1').trim() !== '0';

const COMMENTS_CONCURRENCY =
  Number.parseInt(process.env.OPENCLAW_ISSUES_COMMENTS_CONCURRENCY ?? '', 10) > 0
    ? Number.parseInt(process.env.OPENCLAW_ISSUES_COMMENTS_CONCURRENCY ?? '', 10)
    : 6;

const COMMENTS_MAX_PER_ISSUE =
  Number.parseInt(process.env.OPENCLAW_ISSUES_COMMENTS_MAX_PER_ISSUE ?? '', 10) >= 0
    ? Number.parseInt(process.env.OPENCLAW_ISSUES_COMMENTS_MAX_PER_ISSUE ?? '', 10)
    : 50;

function getAuthHeader() {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function withQuery(url, params) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

function parseNextUrl(linkHeader) {
  // Format: <url>; rel="next", <url>; rel="last"
  if (!linkHeader) return null;
  const parts = linkHeader.split(',').map((s) => s.trim());
  for (const part of parts) {
    const m = part.match(/^<([^>]+)>;\s*rel="next"$/);
    if (m) return m[1];
  }
  return null;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'CoClaw-Issue-Sync',
      'X-GitHub-Api-Version': '2022-11-28',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API error ${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
  }

  const link = res.headers.get('link');
  const json = await res.json();
  return { json, nextUrl: parseNextUrl(link) };
}

async function fetchAllPages(url) {
  /** @type {any[]} */
  const out = [];
  let next = url;
  while (next) {
    const { json, nextUrl } = await fetchJson(next);
    if (!Array.isArray(json)) throw new Error('Unexpected GitHub API response shape.');
    out.push(...json);
    next = nextUrl;
  }
  return out;
}

async function runWithConcurrency(items, limit, fn) {
  /** @type {any[]} */
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.max(1, limit) }, async () => {
    while (cursor < items.length) {
      const idx = cursor;
      cursor += 1;
      results[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

async function loadChannelTaxonomyFromRef() {
  const registryFile = path.join(OPENCLAW_REF_DIR, 'src', 'channels', 'registry.ts');
  try {
    const src = await fs.readFile(registryFile, 'utf8');

    // Parse CHAT_CHANNEL_ORDER = [ "telegram", ... ] as const;
    const orderMatch = src.match(
      /CHAT_CHANNEL_ORDER\s*=\s*\[([\s\S]*?)\]\s*as\s*const\s*;/m
    );
    const orderRaw = orderMatch?.[1] ?? '';
    const ids = [...orderRaw.matchAll(/["']([a-z0-9-]+)["']/g)].map((m) => m[1]);

    // Parse CHAT_CHANNEL_ALIASES: Record<string, ChatChannelId> = { imsg: "imessage", ... };
    const aliasesMatch = src.match(/CHAT_CHANNEL_ALIASES[\s\S]*?=\s*\{([\s\S]*?)\};/m);
    const aliasesRaw = aliasesMatch?.[1] ?? '';
    const aliases = {};
    for (const m of aliasesRaw.matchAll(
      /(?:(["'])([a-z0-9-]+)\1|([a-z0-9-]+))\s*:\s*["']([a-z0-9-]+)["']/g
    )) {
      const key = (m[2] ?? m[3] ?? '').trim();
      const val = (m[4] ?? '').trim();
      if (key && val) aliases[key] = val;
    }

    const all = [...new Set([...ids, ...Object.values(aliases)])].filter(Boolean);
    return { ids: all, aliases };
  } catch {
    // Fallback (keeps the site working even if `.ref/openclaw` isn't present)
    return {
      ids: ['telegram', 'whatsapp', 'discord', 'googlechat', 'slack', 'signal', 'imessage'],
      aliases: { imsg: 'imessage', 'google-chat': 'googlechat', gchat: 'googlechat' },
    };
  }
}

function detectPlatforms(text) {
  const t = text.toLowerCase();
  /** @type {string[]} */
  const out = [];
  if (/(macos|osx|mac\b|sequoia|ventura|sonoma)/.test(t)) out.push('macos');
  if (/(windows|win11|win10|wsl)/.test(t)) out.push('windows');
  if (/(linux|ubuntu|debian|fedora|arch|centos|alpine)/.test(t)) out.push('linux');
  if (/(docker|dockerfile|docker-compose|container)/.test(t)) out.push('docker');
  return [...new Set(out)];
}

function detectComponents(text) {
  const t = text.toLowerCase();
  /** @type {string[]} */
  const out = [];
  if (/(gateway|daemon|systemd|launchd|service)/.test(t)) out.push('gateway');
  if (/(webchat|control ui|dashboard|unauthorized|token missing)/.test(t)) out.push('web-ui');
  if (/(tui\b|terminal ui)/.test(t)) out.push('tui');
  if (/(onboard|onboarding|setup wizard)/.test(t)) out.push('onboarding');
  if (/(config|json|yaml|toml|dotenv|env var|api key)/.test(t)) out.push('config');
  if (/(websocket|ws\b)/.test(t)) out.push('websocket');
  return [...new Set(out)];
}

function detectChannels(text, taxonomy) {
  const t = text.toLowerCase();
  /** @type {string[]} */
  const out = [];

  // Direct hits
  for (const id of taxonomy.ids) {
    const re = new RegExp(`(^|[^a-z0-9])${id.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&')}([^a-z0-9]|$)`, 'i');
    if (re.test(t)) out.push(id);
  }

  // Alias hits
  for (const [alias, id] of Object.entries(taxonomy.aliases)) {
    const re = new RegExp(
      `(^|[^a-z0-9])${alias.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&')}([^a-z0-9]|$)`,
      'i'
    );
    if (re.test(t)) out.push(id);
  }

  // Common synonyms
  if (/(gchat|google chat)/.test(t)) out.push('googlechat');
  if (/(i\\s*message|imessage)/.test(t)) out.push('imessage');

  return [...new Set(out)];
}

function normalizeIssue(issue) {
  const labels = Array.isArray(issue.labels)
    ? issue.labels
        .map((l) => (typeof l === 'string' ? l : l?.name))
        .filter(Boolean)
        .map(String)
    : [];

  const title = issue.title ?? '';
  const body = issue.body ?? '';
  const text = `${title}\n${body}`;

  return {
    number: issue.number,
    title,
    body,
    state: issue.state ?? 'open',
    comments: typeof issue.comments === 'number' ? issue.comments : 0,
    htmlUrl: issue.html_url,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    author: issue.user?.login ?? null,
    labels,
    taxonomy: {
      // Filled in by `main()` after loading taxonomy from `.ref/openclaw`
      channels: [],
      platforms: detectPlatforms(text),
      components: detectComponents(text),
    },
  };
}

function normalizeIssueComment(comment) {
  return {
    id: comment.id,
    htmlUrl: comment.html_url,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    author: comment.user?.login ?? null,
    body: comment.body ?? '',
  };
}

async function main() {
  const channelTaxonomy = await loadChannelTaxonomyFromRef();
  const startUrl = `https://api.github.com/repos/${OWNER}/${REPO}/issues?state=all&per_page=100&sort=updated&direction=desc`;

  /** @type {any[]} */
  const out = [];

  let url = startUrl;
  while (url && out.length < MAX) {
    const { json, nextUrl } = await fetchJson(url);
    if (!Array.isArray(json)) throw new Error('Unexpected GitHub API response shape.');

    for (const item of json) {
      if (item?.pull_request) continue;
      const normalized = normalizeIssue(item);
      normalized.taxonomy.channels = detectChannels(`${normalized.title}\n${normalized.body}`, channelTaxonomy);
      normalized._commentsUrl = item.comments_url;
      out.push(normalized);
      if (out.length >= MAX) break;
    }

    url = nextUrl;
  }

  if (INCLUDE_COMMENTS) {
    const issuesWithComments = out.filter((i) => (i.comments || 0) > 0 && i._commentsUrl);
    await runWithConcurrency(issuesWithComments, COMMENTS_CONCURRENCY, async (issue) => {
      const commentUrl = withQuery(issue._commentsUrl, { per_page: 100 });
      const rawComments = await fetchAllPages(commentUrl);
      const normalized = rawComments.map(normalizeIssueComment);
      issue.commentsData =
        COMMENTS_MAX_PER_ISSUE === 0 ? normalized : normalized.slice(-COMMENTS_MAX_PER_ISSUE);
    });
  }

  for (const i of out) {
    delete i._commentsUrl;
  }

  const payload = {
    repo: `${OWNER}/${REPO}`,
    fetchedAt: new Date().toISOString(),
    max: MAX,
    issues: out,
  };

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log(`Wrote ${out.length} issues -> ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
