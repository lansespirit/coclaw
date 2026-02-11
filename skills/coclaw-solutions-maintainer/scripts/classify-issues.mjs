#!/usr/bin/env node
/**
 * Classify incremental issues into coarse buckets (suggestion only).
 *
 * Responsibilities:
 * - Read triage output and full issues dataset
 * - Produce suggested issue type + suggested action
 * - Output queue for manual/sub-agent deep review
 *
 * Non-responsibilities:
 * - No GitHub comments
 * - No solution writing
 * - No final decision authority
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ISSUE_TYPES = [
  'usage_config',
  'usage_deploy',
  'usage_channel',
  'known_bug_with_workaround',
  'code_bug',
  'feature_request',
  'other_meta',
];

function parseArgs(argv) {
  const args = {
    triageFile: path.resolve('.cache', 'coclaw-solutions-maintainer', 'triage-latest.json'),
    issuesFile: path.resolve('src', 'data', 'openclaw', 'openclaw-issues.json'),
    outputFile: null,
    limit: null,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--triage') {
      const value = argv[i + 1];
      i += 1;
      if (!value) throw new Error('Missing value for --triage');
      args.triageFile = path.resolve(value);
      continue;
    }

    if (arg === '--issues') {
      const value = argv[i + 1];
      i += 1;
      if (!value) throw new Error('Missing value for --issues');
      args.issuesFile = path.resolve(value);
      continue;
    }

    if (arg === '--output') {
      const value = argv[i + 1];
      i += 1;
      if (!value) throw new Error('Missing value for --output');
      args.outputFile = path.resolve(value);
      continue;
    }

    if (arg === '--limit') {
      const value = argv[i + 1];
      i += 1;
      const parsed = Number.parseInt(value ?? '', 10);
      if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`Invalid --limit: ${value}`);
      args.limit = parsed;
      continue;
    }

    if (arg === '--json') {
      args.json = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node skills/coclaw-solutions-maintainer/scripts/classify-issues.mjs [options]

Options:
  --triage <path>       Triage JSON path (default: .cache/coclaw-solutions-maintainer/triage-latest.json)
  --issues <path>       Full issues dataset path (default: src/data/openclaw/openclaw-issues.json)
  --output <path>       Also write result JSON to this path
  --limit <n>           Only include first N triage items
  --json                Print machine-readable JSON
`);
      process.exit(0);
    }

    throw new Error(`Unknown arg: ${arg}`);
  }

  return args;
}

function lowerText(value) {
  return String(value ?? '').toLowerCase();
}

function issueBodyText(issue) {
  const comments = Array.isArray(issue?.commentsData)
    ? issue.commentsData.map((comment) => String(comment?.body ?? '')).join('\n')
    : '';
  return `${issue?.title ?? ''}\n${issue?.body ?? ''}\n${comments}`;
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function classifyIssue(issue, triageItem) {
  const labels = Array.isArray(issue?.labels)
    ? issue.labels.map((x) => String(x).toLowerCase())
    : [];
  const text = lowerText(issueBodyText(issue));
  const title = lowerText(issue?.title);

  const reasons = [];

  if (labels.some((label) => /enhancement|feature/.test(label)) || /^\[?feature\]?/i.test(title)) {
    reasons.push('feature label/title hint');
    return {
      suggestedType: 'feature_request',
      confidence: 0.95,
      suggestedAction: 'skip',
      reasons,
    };
  }

  if (hasAny(text, [/\bcve\b/, /\bvulnerability\b/, /\bsecurity\b/, /\bxss\b/, /\binjection\b/])) {
    reasons.push('security keyword detected');
    return {
      suggestedType: 'code_bug',
      confidence: 0.8,
      suggestedAction: 'skip',
      reasons,
    };
  }

  if (
    hasAny(text, [
      /\broot cause\b/,
      /\bsrc\//,
      /\bregression\b/,
      /\bstack trace\b/,
      /\bpanic\b/,
      /\bnull pointer\b/,
      /\brace condition\b/,
    ])
  ) {
    reasons.push('engineering/debugging markers detected');
    return {
      suggestedType: 'code_bug',
      confidence: 0.8,
      suggestedAction: 'skip',
      reasons,
    };
  }

  if (
    hasAny(text, [
      /\bworkaround\b/,
      /\btemporary fix\b/,
      /\bmitigation\b/,
      /\bstill broken but\b/,
      /\bknown issue\b/,
    ])
  ) {
    reasons.push('workaround/known-issue signal detected');
    return {
      suggestedType: 'known_bug_with_workaround',
      confidence: 0.72,
      suggestedAction: 'link_or_create_solution',
      reasons,
    };
  }

  if (
    hasAny(text, [
      /telegram/,
      /whatsapp/,
      /discord/,
      /slack/,
      /signal/,
      /imessage/,
      /feishu/,
      /google chat/,
      /webchat/,
      /channel/,
    ])
  ) {
    reasons.push('channel keyword detected');
    return {
      suggestedType: 'usage_channel',
      confidence: 0.78,
      suggestedAction: 'link_or_create_solution',
      reasons,
    };
  }

  if (
    hasAny(text, [
      /systemd/,
      /wsl/,
      /docker/,
      /install/,
      /gateway install/,
      /service/,
      /launchd/,
      /daemon/,
      /permission denied/,
      /eacces/,
    ])
  ) {
    reasons.push('deploy/install/service keyword detected');
    return {
      suggestedType: 'usage_deploy',
      confidence: 0.76,
      suggestedAction: 'link_or_create_solution',
      reasons,
    };
  }

  if (
    hasAny(text, [
      /401/,
      /403/,
      /unauthorized/,
      /token/,
      /api key/,
      /config/,
      /openclaw\.json/,
      /models status/,
      /model not allowed/,
      /rate limit/,
    ])
  ) {
    reasons.push('config/auth/model keyword detected');
    return {
      suggestedType: 'usage_config',
      confidence: 0.74,
      suggestedAction: 'link_or_create_solution',
      reasons,
    };
  }

  if (triageItem?.commentsCount === 0 && !triageItem?.labels?.length) {
    reasons.push('low-information issue');
    return {
      suggestedType: 'other_meta',
      confidence: 0.6,
      suggestedAction: 'skip',
      reasons,
    };
  }

  reasons.push('fallback classification');
  return {
    suggestedType: 'other_meta',
    confidence: 0.45,
    suggestedAction: 'manual_review_required',
    reasons,
  };
}

function pickPriority(issue, triageItem, classification) {
  const labelText = (triageItem?.labels ?? []).map((x) => String(x).toLowerCase()).join(',');
  if (/critical|p0|high/.test(labelText)) return 'high';
  if (
    classification.suggestedAction === 'link_or_create_solution' &&
    (triageItem?.commentsCount ?? 0) >= 5
  )
    return 'high';
  if (classification.suggestedAction === 'link_or_create_solution') return 'medium';
  return 'low';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const triageRaw = JSON.parse(await fs.readFile(args.triageFile, 'utf8'));
  const triageItems = Array.isArray(triageRaw?.issues) ? triageRaw.issues : [];

  const issuesRaw = JSON.parse(await fs.readFile(args.issuesFile, 'utf8'));
  const issues = Array.isArray(issuesRaw?.issues) ? issuesRaw.issues : [];
  const issuesByNumber = new Map(issues.map((issue) => [String(issue.number), issue]));

  const limitedItems = args.limit ? triageItems.slice(0, args.limit) : triageItems;

  const queue = limitedItems.map((triageItem) => {
    const numberKey = String(triageItem.number);
    const fullIssue = issuesByNumber.get(numberKey);

    const classification = classifyIssue(fullIssue ?? triageItem, triageItem);
    const priority = pickPriority(fullIssue ?? triageItem, triageItem, classification);

    return {
      number: triageItem.number,
      title: triageItem.title,
      htmlUrl: triageItem.htmlUrl,
      updatedAt: triageItem.updatedAt,
      triageState: triageItem.triageState,
      commentsCount: triageItem.commentsCount,
      labels: triageItem.labels,
      suggestedType: classification.suggestedType,
      confidence: classification.confidence,
      suggestedAction: classification.suggestedAction,
      priority,
      reasons: classification.reasons,
      requiresManualDecision: true,
    };
  });

  const unknownTypes = queue.filter((item) => !ISSUE_TYPES.includes(item.suggestedType));
  if (unknownTypes.length) {
    throw new Error(`Unexpected suggestedType count: ${unknownTypes.length}`);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      triageFile: args.triageFile,
      issuesFile: args.issuesFile,
      triageCutoffIso: triageRaw?.cutoffIso ?? null,
      triageCount: triageRaw?.count ?? triageItems.length,
      classifiedCount: queue.length,
    },
    queue,
  };

  if (args.outputFile) {
    await fs.mkdir(path.dirname(args.outputFile), { recursive: true });
    await fs.writeFile(args.outputFile, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  }

  if (args.json) {
    process.stdout.write(JSON.stringify(payload, null, 2));
    process.stdout.write('\n');
    return;
  }

  console.log(`Classified issues: ${queue.length}`);
  console.log('');
  for (const item of queue) {
    console.log(`#${item.number} [${item.priority}] ${item.title}`);
    console.log(`- suggestedType: ${item.suggestedType} (confidence=${item.confidence})`);
    console.log(`- suggestedAction: ${item.suggestedAction}`);
    console.log(`- reasons: ${item.reasons.join('; ')}`);
    if (item.htmlUrl) console.log(`- issue: ${item.htmlUrl}`);
    console.log('');
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
