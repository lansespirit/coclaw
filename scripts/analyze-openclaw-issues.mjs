#!/usr/bin/env node
/**
 * Analyze the locally-synced OpenClaw issues dataset and produce:
 * - a human report: docs/TROUBLESHOOTING-ISSUE-ANALYSIS.md
 * - a machine report: src/data/openclaw/issue-analysis.json
 *
 * This is meant to drive the "curated troubleshooting" backlog (what to write next),
 * not to mirror GitHub.
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

const OUT_MD = path.resolve(__dirname, '..', 'docs', 'TROUBLESHOOTING-ISSUE-ANALYSIS.md');
const OUT_JSON = path.resolve(__dirname, '..', 'src', 'data', 'openclaw', 'issue-analysis.json');

function toDateOnlyIso(d) {
  return d.toISOString().slice(0, 10);
}

function topN(map, n) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function inc(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function pickExamples(issues, predicate, limit = 5) {
  return issues
    .filter(predicate)
    .sort((a, b) => (b.comments || 0) - (a.comments || 0))
    .slice(0, limit)
    .map((i) => ({ number: i.number, title: i.title, comments: i.comments, state: i.state }));
}

function issueFullText(issue) {
  const title = issue.title || '';
  const body = issue.body || '';
  const comments = Array.isArray(issue.commentsData)
    ? issue.commentsData.map((c) => c?.body || '').join('\n')
    : '';
  return `${title}\n${body}\n${comments}`.trim();
}

async function main() {
  const raw = await fs.readFile(DATASET_FILE, 'utf8');
  const dataset = JSON.parse(raw);
  const issues = Array.isArray(dataset.issues) ? dataset.issues : [];

  const channelCounts = new Map();
  const platformCounts = new Map();
  const componentCounts = new Map();
  const labelCounts = new Map();

  for (const i of issues) {
    for (const c of i.taxonomy?.channels || []) inc(channelCounts, c);
    for (const p of i.taxonomy?.platforms || []) inc(platformCounts, p);
    for (const c of i.taxonomy?.components || []) inc(componentCounts, c);
    for (const l of i.labels || []) inc(labelCounts, l);
  }

  const patterns = [
    {
      id: 'unauthorized',
      title: 'Unauthorized / token mismatch (Control UI)',
      re: /(unauthorized|token missing|gateway token missing|tokenized link)/i,
    },
    {
      id: 'pairing_required',
      title: 'Control UI: pairing required (1008)',
      re: /(pairing required|disconnected \\(1008\\): pairing required)/i,
    },
    {
      id: 'device_identity_required',
      title: 'Control UI: device identity required (1008)',
      re: /(device identity required|disconnected \\(1008\\): device identity required)/i,
    },
    {
      id: 'eacces',
      title: 'EACCES / permission denied (npm/global install)',
      re: /(\\bEACCES\\b|permission denied|npm install -g)/i,
    },
    {
      id: 'eaddrinuse',
      title: 'EADDRINUSE / GatewayLockError (port already used)',
      re: /(\\bEADDRINUSE\\b|GatewayLockError|already listening)/i,
    },
    { id: 'setmycommands', title: 'Telegram setMyCommands failed', re: /(setMyCommands failed)/i },
    {
      id: 'enotfound',
      title: 'ENOTFOUND / DNS resolution failures',
      re: /(\\bENOTFOUND\\b|getaddrinfo)/i,
    },
    {
      id: 'oauth',
      title: 'OAuth/Auth flows failing',
      re: /(oauth|refresh token|re-authenticate|login)/i,
    },
    {
      id: 'model',
      title: 'Model resolution / providers / "all models failed"',
      re: /(all models failed|model not allowed|openrouter|anthropic|openai)/i,
    },
    { id: 'windows', title: 'Windows install/runtime issues', re: /(windows|win11|win10|wsl)/i },
    { id: 'docker', title: 'Docker deployment issues', re: /(docker|docker-compose|container)/i },
  ];

  const signatureCounts = new Map();
  const signatureExamples = {};

  for (const p of patterns) {
    const count = issues.filter((i) => p.re.test(issueFullText(i))).length;
    signatureCounts.set(p.id, count);
    signatureExamples[p.id] = pickExamples(issues, (i) => p.re.test(issueFullText(i)));
  }

  const today = toDateOnlyIso(new Date());
  const summary = {
    repo: dataset.repo || 'openclaw/openclaw',
    fetchedAt: dataset.fetchedAt,
    total: issues.length,
    top: {
      channels: topN(channelCounts, 10),
      platforms: topN(platformCounts, 10),
      components: topN(componentCounts, 10),
      labels: topN(labelCounts, 10),
      signatures: topN(signatureCounts, 20),
    },
    signatures: signatureExamples,
  };

  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(summary, null, 2) + '\n', 'utf8');

  const md = [
    `# Troubleshooting Issue Analysis`,
    ``,
    `Generated: ${today}`,
    `Dataset: ${summary.repo}`,
    `Fetched at: ${summary.fetchedAt}`,
    `Total issues analyzed: ${summary.total}`,
    ``,
    `## Top Channels (in issues text)`,
    ...summary.top.channels.map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `## Top Platforms (in issues text)`,
    ...summary.top.platforms.map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `## Top Components (heuristic)`,
    ...summary.top.components.map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `## High-Value Error Signatures (for curated articles)`,
    ...summary.top.signatures.map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `## Recommended Writing Backlog (start here)`,
    ``,
    `These are *solution* pages we should curate (problem → cause → fix → verify) because they appear frequently and have high user impact:`,
    ``,
    `- unauthorized/token mismatch (Control UI)`,
    `- npm EACCES / permission denied (global install)`,
    `- EADDRINUSE / GatewayLockError (port conflict)`,
    `- Telegram setMyCommands failed (DNS/egress/IPv6)`,
    `- Config validation failed / schema errors / JSON5 parse errors`,
    `- openclaw command not found (PATH sanity)`,
    ``,
    `## Example Issues Per Signature (top by comments)`,
    ``,
    ...patterns.flatMap((p) => {
      const ex = summary.signatures[p.id] || [];
      return [
        `### ${p.title} (${signatureCounts.get(p.id) || 0})`,
        ...(ex.length
          ? ex.map((i) => `- #${i.number} (${i.state}, ${i.comments} comments): ${i.title}`)
          : ['- (no examples)']),
        ``,
      ];
    }),
  ].join('\n');

  await fs.mkdir(path.dirname(OUT_MD), { recursive: true });
  await fs.writeFile(OUT_MD, md + '\n', 'utf8');

  console.log(`Wrote analysis -> ${OUT_MD}`);
  console.log(`Wrote analysis -> ${OUT_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
