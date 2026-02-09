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
 *  - This script dedupes by checking existing GitHub comments for CoClaw solution links.
 *  - Comments are generated per-issue (issue body + existing comments + matched solution),
 *    to avoid repetitive "template spam".
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const SOLUTIONS_DIR = path.resolve('src', 'content', 'troubleshooting', 'solutions');

function parseArgs(argv) {
  const args = {
    planFile: path.resolve('.cache', 'coclaw-solutions-maintainer', 'comment-plan.json'),
    repo: 'openclaw/openclaw',
    limit: null,
    dryRun: false,
    sleepMs: 1200,
    useEnvToken: false,
    allowSecurityIssues: false,
    allowDevIssues: false,
    minScore: 24,
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
    if (a === '--use-env-token') {
      args.useEnvToken = true;
      continue;
    }
    if (a === '--allow-security') {
      args.allowSecurityIssues = true;
      continue;
    }
    if (a === '--allow-dev') {
      args.allowDevIssues = true;
      continue;
    }
    if (a === '--min-score') {
      const v = argv[i + 1];
      i += 1;
      const n = Number.parseInt(v ?? '', 10);
      if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid --min-score: ${v}`);
      args.minScore = n;
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
  --limit <n>          Post N comments successfully (skips already-commented issues)
  --sleep-ms <n>       Delay between comments (default: 1200)
  --dry-run            Print what would be posted, do not post
  --use-env-token      Use GITHUB_TOKEN/GH_TOKEN env vars if set (default: ignore them and use gh keyring auth)
  --allow-security     Allow commenting on security issues (default: skip)
  --allow-dev          Allow commenting on dev-focused issues (default: skip)
  --min-score <n>      Minimum match score (default: 24). If best match is below, skip commenting.
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

function cleanedGhEnv(useEnvToken) {
  if (useEnvToken) return process.env;
  // In many local setups, GITHUB_TOKEN points at a token scoped to *your* repo (e.g. CI),
  // which can cause confusing "resource not accessible" errors when commenting on upstream repos.
  const env = { ...process.env };
  delete env.GITHUB_TOKEN;
  delete env.GH_TOKEN;
  return env;
}

function ghJson(endpoint, { env, args = [] }) {
  const out = execFileSync('gh', ['api', endpoint, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
  });
  return JSON.parse(out);
}

function extractFrontmatterBlock(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/m);
  return m?.[1] ?? '';
}

function extractScalar(yaml, key) {
  const re = new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm');
  const m = yaml.match(re);
  if (!m) return null;
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
    v = v.slice(1, -1);
  return v;
}

function extractList(yaml, key) {
  const lines = yaml.split('\n');
  const idx = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (idx === -1) return [];

  const first = lines[idx].slice(`${key}:`.length).trim();
  if (first.startsWith('[')) {
    const inside = first.replace(/^\[/, '').replace(/\]\s*$/, '');
    return inside
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^["']/, '').replace(/["']$/, ''))
      .filter(Boolean);
  }

  /** @type {string[]} */
  const out = [];
  for (let i = idx + 1; i < lines.length; i += 1) {
    const l = lines[i];
    if (!l.startsWith(' ') && /^[a-zA-Z0-9_-]+:/.test(l)) break;
    const m = l.match(/^\s*-\s*(.+?)\s*$/);
    if (!m) continue;
    out.push(m[1].trim().replace(/^["']/, '').replace(/["']$/, ''));
  }
  return out.filter(Boolean);
}

function tokenize(s) {
  const STOP = new Set([
    'error',
    'errors',
    'fail',
    'fails',
    'failed',
    'failure',
    'issue',
    'issues',
    'bug',
    'fix',
    'fixed',
    'cannot',
    'unable',
    'when',
    'after',
    'before',
    'during',
    'with',
    'without',
    'from',
    'into',
    'this',
    'that',
    'does',
    'doesnt',
    'dont',
    'wont',
    'your',
    'their',
    'then',
    'than',
    'been',
  ]);

  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 4 && !STOP.has(t))
    .slice(0, 12);
}

function findSection(src, heading) {
  const start = src.indexOf(heading);
  if (start === -1) return '';
  const after = src.slice(start + heading.length);
  const next = after.search(/\n##\s+/);
  if (next === -1) return after.trim();
  return after.slice(0, next).trim();
}

function extractCommandsFromFix(fixSection) {
  /** @type {string[]} */
  const cmds = [];
  if (!fixSection) return cmds;

  for (const m of fixSection.matchAll(/```(?:bash|sh|powershell|ps1)?\n([\s\S]*?)\n```/g)) {
    const block = (m[1] ?? '').trim();
    for (const line of block.split('\n')) {
      const l = line.trim();
      if (!l) continue;
      if (l.startsWith('#')) continue;
      // Keep single-line commands (avoid multi-line heredocs in comments).
      if (l.length > 140) continue;
      if (/<<'EOF'|<<EOF|>\/dev\/null/.test(l)) continue;
      cmds.push(l);
      if (cmds.length >= 3) return [...new Set(cmds)];
    }
  }

  return [...new Set(cmds)];
}

async function loadSolution(slug) {
  const filePath = path.resolve(SOLUTIONS_DIR, `${slug}.mdx`);
  const src = await fs.readFile(filePath, 'utf8');
  const fm = extractFrontmatterBlock(src);
  const title = extractScalar(fm, 'title') ?? slug;
  const errorSignatures = extractList(fm, 'errorSignatures');
  const fixSection = findSection(src, '## Fix');
  const commands = extractCommandsFromFix(fixSection);
  return { slug, filePath, title, errorSignatures, commands, src };
}

async function loadSolutionsIndex() {
  /** @type {{slug: string, filePath: string, title: string, errorSignatures: string[], titleTokens: string[], slugTokens: string[]}[]} */
  const out = [];
  const entries = await fs.readdir(SOLUTIONS_DIR, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (!ent.name.endsWith('.mdx')) continue;
    const slug = ent.name.replace(/\.mdx$/, '');
    const filePath = path.resolve(SOLUTIONS_DIR, ent.name);
    const src = await fs.readFile(filePath, 'utf8');
    const fm = extractFrontmatterBlock(src);
    const title = extractScalar(fm, 'title') ?? slug;
    const errorSignatures = extractList(fm, 'errorSignatures');
    const slugTokens = slug
      .split('-')
      .map((t) => t.trim())
      .filter((t) => t.length >= 5);
    out.push({
      slug,
      filePath,
      title,
      errorSignatures,
      titleTokens: tokenize(title),
      slugTokens,
    });
  }
  return out;
}

function scoreSolution({ issueTitleBodyLower, issueCommentsLower }, sol) {
  let bodySigHits = 0;
  let bodySlugHits = 0;
  let bodyTitleHits = 0;
  let commentSigHits = 0;
  let commentSlugHits = 0;
  let commentTitleHits = 0;

  for (const sig of sol.errorSignatures) {
    const s = String(sig ?? '').toLowerCase();
    if (!s) continue;
    if (issueTitleBodyLower.includes(s)) bodySigHits += 1;
    if (issueCommentsLower.includes(s)) commentSigHits += 1;
  }

  for (const tok of sol.slugTokens) {
    if (issueTitleBodyLower.includes(tok)) bodySlugHits += 1;
    if (issueCommentsLower.includes(tok)) commentSlugHits += 1;
  }

  for (const tok of sol.titleTokens) {
    if (issueTitleBodyLower.includes(tok)) bodyTitleHits += 1;
    if (issueCommentsLower.includes(tok)) commentTitleHits += 1;
  }

  // Prefer signals in the issue body (more reliable than long threads drifting into other topics).
  const score =
    bodySigHits * 30 +
    bodySlugHits * 6 +
    bodyTitleHits * 1 +
    commentSigHits * 10 +
    commentSlugHits * 2 +
    commentTitleHits * 0;

  return { score, bodySigHits, bodySlugHits, commentSigHits, commentSlugHits };
}

function pickEvidence(issueTitleBodyLower, issueCommentsLower, solution) {
  const sigs = solution.errorSignatures ?? [];
  for (const sig of sigs) {
    const s = String(sig ?? '').trim();
    if (!s) continue;
    const lower = s.toLowerCase();
    if (issueTitleBodyLower.includes(lower)) return s;
  }
  for (const sig of sigs) {
    const s = String(sig ?? '').trim();
    if (!s) continue;
    const lower = s.toLowerCase();
    if (issueCommentsLower.includes(lower)) return s;
  }
  return '';
}

function isSecurityIssue(issue) {
  const t = `${issue.title ?? ''}\n${issue.body ?? ''}`.toLowerCase();
  return (
    /\b(security|cve|xss|csrf|injection|credential|secret)\b/.test(t) || /\bcritical\b/.test(t)
  );
}

function isDevFocusedIssue(issue) {
  const t = `${issue.title ?? ''}\n${issue.body ?? ''}`.toLowerCase();
  // Heuristic: deep code-level debugging writeups are rarely helped by a user-facing troubleshooting page.
  return (
    /\broot cause\b/.test(t) ||
    /\bcompiled\b/.test(t) ||
    /\bdist\/[a-z0-9_-]+\.js\b/.test(t) ||
    /\bsrc\/[a-z0-9_./-]+\b/.test(t) ||
    /\bstack trace\b/.test(t)
  );
}

function hasCoClawLinkInComments(comments) {
  for (const c of comments) {
    const body = String(c?.body ?? '');
    if (body.includes('coclaw.com/troubleshooting/solutions/')) return true;
  }
  return false;
}

function pickQuote(issue) {
  const body = String(issue.body ?? '').replace(/\r/g, '');
  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith('#'));

  const interesting = [
    /close code\s*\d+/i,
    /\b(unauthorized|token missing|model not allowed)\b/i,
    /\b(400|401|403|404|429)\b/i,
    /\b(EACCES|ENOENT|EBADF)\b/i,
    /\b(systemctl|openclaw-gateway\.service|gateway install)\b/i,
    /\b(api\.moonshot\.(ai|cn))\b/i,
    /\b(historical context|do not mimic|proper function calling)\b/i,
  ];
  const cand = lines.find((l) => interesting.some((re) => re.test(l))) ?? lines[0] ?? '';
  const compact = cand.replace(/\s+/g, ' ').trim();
  if (!compact) return '';
  const words = compact.split(' ');
  return words.length > 24 ? `${words.slice(0, 24).join(' ')}...` : compact;
}

function extractThreadSignals(comments) {
  const all = comments.map((c) => String(c?.body ?? '')).join('\n');
  const dup = all.match(/duplicate of\s+#(\d+)/i) ?? all.match(/\bdup(?:licate)?\b.*?#(\d+)/i);
  const upstream = /\bupstream\b/i.test(all);
  const pr = all.match(/\bPR\s*#(\d+)\b/i) ?? all.match(/pull request\s*#(\d+)/i);
  return {
    duplicateOf: dup ? `#${dup[1]}` : null,
    mentionsUpstream: upstream,
    mentionsPR: pr ? `#${pr[1]}` : null,
  };
}

function pickThreadNote(comments) {
  if (!comments.length) return '';
  // Prefer a "signal" comment if present; otherwise use the most recent comment.
  const preferred =
    comments.find((c) =>
      /duplicate of|upstream|fixed|workaround|pr\s*#|pull request/i.test(String(c?.body ?? ''))
    ) ?? comments[comments.length - 1];
  const raw = String(preferred?.body ?? '').replace(/\r/g, '');
  const line =
    raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .find((l) => l.length >= 8 && l.length <= 220) ?? '';
  if (!line) return '';
  const compact = line.replace(/\s+/g, ' ').trim();
  const words = compact.split(' ');
  return words.length > 22 ? `${words.slice(0, 22).join(' ')}...` : compact;
}

function followupBySlug(slug) {
  switch (slug) {
    case 'models-all-models-failed':
      return `If you paste the output of \`openclaw models status --probe\` (redact secrets), it usually shows whether this is auth vs rate limit vs model-id resolution.`;
    case 'moonshot-kimi-china-endpoint':
      return `If this still fails after switching baseUrl, please confirm whether the *gateway host* can reach \`api.moonshot.ai\` vs \`api.moonshot.cn\`, and that \`MOONSHOT_API_KEY\` is set on the gateway host (not only your laptop).`;
    case 'linux-gateway-service-not-installed':
      return `If you can share \`systemctl --user status openclaw-gateway.service\`, it will show whether the unit exists and which binary path it points at.`;
    case 'windows-wsl2-systemd-not-enabled':
      return `If it still fails, please share your WSL distro + whether \`systemctl --user status\` works after \`wsl --shutdown\`.`;
    case 'control-ui-pairing-required':
      return `If you're still seeing 1008/unauthorized after this, the exact URL you opened (redact token) + gateway logs around connect help a lot.`;
    case 'docker-eacces-openclaw-config-dir':
      return `If you share the relevant container volume mounts + the host path owner/permissions, we can usually pinpoint the EACCES cause quickly.`;
    default:
      return `If the steps on that page don't match your setup, reply with your OS + OpenClaw version and the exact error/log line you're seeing.`;
  }
}

function composeComment({ issue, comments, solution, url, evidence }) {
  const quote = pickQuote(issue);
  const threadNote = pickThreadNote(comments);
  const signals = extractThreadSignals(comments);
  const issueHasComments = comments.length > 0;

  /** @type {string[]} */
  const parts = [];

  // Lead-in: make it clearly tied to the issue report (not a generic "looks covered").
  if (quote) {
    parts.push(`From your report: \"${quote}\"`);
  } else {
    parts.push(
      `Thanks for the detailed report - sharing a troubleshooting link that matches the symptoms here.`
    );
  }

  if (evidence) {
    parts.push(`I'm linking this because it specifically covers: \`${evidence}\`.`);
  }

  if (signals.duplicateOf) {
    parts.push(
      `I also saw comments mentioning this might be a duplicate of ${signals.duplicateOf}; leaving the user-facing steps here for anyone landing on this thread.`
    );
  } else if (signals.mentionsUpstream) {
    parts.push(
      `Since the thread mentions an upstream/provider-side angle, the checklist below is mainly useful to confirm/triage and to unblock if it's config-related.`
    );
  } else if (signals.mentionsPR) {
    parts.push(
      `If the PR ${signals.mentionsPR} lands soon, great - in the meantime these steps are a decent workaround/triage path.`
    );
  } else if (!issueHasComments) {
    parts.push(`In case you're blocked right now, here's the closest step-by-step we have.`);
  } else {
    // Use a slightly different second sentence to avoid identical shape.
    parts.push(`This maps pretty closely to our write-up:`);
  }

  if (threadNote && threadNote !== quote) {
    parts.push(`Thread note: \"${threadNote}\"`);
  }

  parts.push('');
  parts.push(`${solution.title}:`);
  parts.push(url);

  // Add 1-2 concrete commands from the solution (if any).
  const cmds = solution.commands.slice(0, 2);
  if (cmds.length) {
    parts.push('');
    parts.push(`Two quick checks from that page:`);
    for (const c of cmds) parts.push(`- \`${c}\``);
  }

  parts.push('');
  parts.push(followupBySlug(solution.slug));

  return parts.join('\n').trim() + '\n';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = cleanedGhEnv(args.useEnvToken);
  const solutionsIndex = await loadSolutionsIndex();

  const raw = JSON.parse(await fs.readFile(args.planFile, 'utf8'));
  const items = Array.isArray(raw?.top) ? raw.top : [];

  const limit = args.limit ?? items.length;

  if (!items.length) {
    console.log('No items in plan.');
    return;
  }

  /** @type {{number: number, url: string}[]} */
  const posted = [];
  /** @type {{number: number, error: string}[]} */
  const failed = [];
  /** @type {{number: number, reason: string}[]} */
  const skipped = [];

  for (let idx = 0; idx < items.length; idx += 1) {
    if (posted.length >= limit) break;

    const it = items[idx];
    const number = Number.parseInt(String(it?.number ?? ''), 10);
    const planUrl = String(it?.match?.url ?? '').trim();
    const planSlug = String(it?.match?.slug ?? '').trim();
    if (!Number.isFinite(number) || number <= 0) {
      failed.push({ number: -1, error: 'Invalid plan entry (missing/invalid number)' });
      continue;
    }

    // Fetch issue first (cheap). Only fetch comments when needed.
    /** @type {any} */
    let issue = null;
    /** @type {any[]} */
    let comments = [];
    try {
      issue = ghJson(`repos/${args.repo}/issues/${number}`, { env });
    } catch (e) {
      failed.push({
        number,
        error: `Failed to fetch issue: ${e?.message ? String(e.message) : String(e)}`,
      });
      continue;
    }

    if (!args.allowSecurityIssues && isSecurityIssue(issue)) {
      skipped.push({ number, reason: 'security-ish issue (skipped by default)' });
      continue;
    }
    if (!args.allowDevIssues && isDevFocusedIssue(issue)) {
      skipped.push({ number, reason: 'dev-focused issue write-up (skipped by default)' });
      continue;
    }

    // Fetch comments for dedupe + personalization (only if the issue actually has comments).
    const commentCount = Number.parseInt(String(issue?.comments ?? ''), 10);
    if (Number.isFinite(commentCount) && commentCount > 0) {
      try {
        // Important: passing -f/-F to `gh api` switches it to POST unless you also pass -X GET.
        // Use query params to keep this a GET.
        comments = ghJson(`repos/${args.repo}/issues/${number}/comments?per_page=100`, { env });
        if (!Array.isArray(comments)) comments = [];
      } catch (e) {
        failed.push({
          number,
          error: `Failed to fetch issue comments: ${e?.message ? String(e.message) : String(e)}`,
        });
        continue;
      }
    }

    if (hasCoClawLinkInComments(comments)) {
      skipped.push({ number, reason: 'already has a CoClaw solution link comment' });
      continue;
    }

    // Choose the best solution match, preferring signals from title/body over thread comments.
    const issueTitleBodyLower = `${issue?.title ?? ''}\n${issue?.body ?? ''}`.toLowerCase();
    const issueCommentsLower = comments
      .map((c) => String(c?.body ?? ''))
      .join('\n')
      .toLowerCase();

    const scored = solutionsIndex
      .map((sol) => ({ sol, ...scoreSolution({ issueTitleBodyLower, issueCommentsLower }, sol) }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (!best || best.score < args.minScore || (best.bodySigHits === 0 && best.bodySlugHits < 2)) {
      skipped.push({
        number,
        reason: `no confident solution match (best score=${best?.score ?? 0})`,
      });
      continue;
    }

    const chosenSlug = best.sol.slug;
    const url = `https://coclaw.com/troubleshooting/solutions/${chosenSlug}/`;
    const evidence = pickEvidence(issueTitleBodyLower, issueCommentsLower, best.sol);

    let solution;
    try {
      solution = await loadSolution(chosenSlug);
    } catch (e) {
      failed.push({
        number,
        error: `Failed to load solution for slug "${chosenSlug}": ${e?.message ? String(e.message) : String(e)}`,
      });
      continue;
    }

    // If the plan match disagrees with our best match, keep going but record it as a skip-note later.
    if (planSlug && planSlug !== chosenSlug && planUrl) {
      skipped.push({
        number,
        reason: `plan suggested "${planSlug}" but matched "${chosenSlug}" (commented with matched)`,
      });
    }

    const body = composeComment({ issue, comments, solution, url, evidence });

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
        { stdio: 'inherit', env }
      );
      posted.push({ number, url });
    } catch (e) {
      failed.push({ number, error: e?.message ? String(e.message) : String(e) });
    }

    if (posted.length < limit && idx < items.length - 1 && args.sleepMs > 0) {
      await sleep(args.sleepMs);
    }
  }

  if (!args.dryRun) {
    console.log('');
    console.log(`Posted: ${posted.length}`);
    for (const p of posted) console.log(`- #${p.number} -> ${p.url}`);
    if (skipped.length) {
      console.log(`Skipped: ${skipped.length}`);
      for (const s of skipped.slice(0, 20)) console.log(`- #${s.number}: ${s.reason}`);
      if (skipped.length > 20) console.log(`- ...and ${skipped.length - 20} more`);
    }
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
