#!/usr/bin/env node
/**
 * Recommend CoClaw site pages for a GitHub issue using local KB index data.
 *
 * Responsibilities:
 * - Read full issues dataset
 * - Read docs/kb/coclaw-site-pages.md
 * - Score existing site pages against an issue's text
 * - Output 1..N candidate links with brief reasons
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

const DEFAULT_SITE_PAGES_FILE = path.resolve('docs', 'kb', 'coclaw-site-pages.md');
const STOP_WORDS = new Set([
  'the',
  'and',
  'that',
  'with',
  'this',
  'from',
  'your',
  'have',
  'when',
  'into',
  'after',
  'before',
  'should',
  'would',
  'there',
  'still',
  'about',
  'just',
  'does',
  'just',
  'then',
  'than',
  'from',
  'into',
  'over',
  'under',
  'have',
  'has',
  'had',
  'were',
  'will',
  'would',
  'could',
  'should',
  'their',
  'there',
  'where',
  'what',
  'which',
  'while',
  'your',
  'they',
  'them',
  'same',
  'using',
  'used',
  'only',
  'also',
  'more',
  'less',
  'very',
  'much',
  'some',
  'such',
  'make',
  'made',
  'need',
  'needs',
  'user',
  'users',
  'show',
  'shows',
  'showing',
  'look',
  'looks',
  'like',
  'help',
  'question',
  'problem',
  'summary',
  'issue',
  'bug',
  'cant',
  'cannot',
  'unable',
  'openclaw',
  'steps',
  'reproduce',
]);

function parseArgs(argv) {
  const args = {
    issueNumber: null,
    issuesFile: DEFAULT_ISSUES_FILE,
    sitePagesFile: DEFAULT_SITE_PAGES_FILE,
    limit: 5,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--issue') {
      const value = Number.parseInt(String(argv[i + 1] ?? ''), 10);
      i += 1;
      if (!Number.isFinite(value) || value <= 0) throw new Error('Invalid --issue value');
      args.issueNumber = value;
      continue;
    }

    if (arg === '--issues') {
      const value = argv[i + 1];
      i += 1;
      if (!value) throw new Error('Missing value for --issues');
      args.issuesFile = path.resolve(value);
      continue;
    }

    if (arg === '--site-pages') {
      const value = argv[i + 1];
      i += 1;
      if (!value) throw new Error('Missing value for --site-pages');
      args.sitePagesFile = path.resolve(value);
      continue;
    }

    if (arg === '--limit') {
      const value = Number.parseInt(String(argv[i + 1] ?? ''), 10);
      i += 1;
      if (!Number.isFinite(value) || value <= 0) throw new Error('Invalid --limit value');
      args.limit = value;
      continue;
    }

    if (arg === '--json') {
      args.json = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node skills/coclaw-solutions-maintainer/scripts/recommend-site-links.mjs --issue <number> [options]

Options:
  --issue <number>      GitHub issue number from the synced dataset
  --issues <path>       Full issues dataset path
  --site-pages <path>   docs/kb/coclaw-site-pages.md path
  --limit <n>           Max candidates to return (default: 5)
  --json                Emit machine-readable JSON
`);
      process.exit(0);
    }

    throw new Error(`Unknown arg: ${arg}`);
  }

  if (!args.issueNumber) throw new Error('Missing required --issue <number>');
  return args;
}

function issueText(issue) {
  const comments = Array.isArray(issue?.commentsData)
    ? issue.commentsData.map((comment) => String(comment?.body ?? '')).join('\n')
    : '';
  return `${issue?.title ?? ''}\n${issue?.body ?? ''}\n${comments}`;
}

function issueTitleText(issue) {
  return `${issue?.title ?? ''}`;
}

function extractPhrases(text) {
  const codeSpans = [...text.matchAll(/`([^`]{4,80})`/g)].map((match) =>
    match[1].trim().toLowerCase()
  );
  const quoted = [...text.matchAll(/["']([^"'\n]{6,80})["']/g)].map((match) =>
    match[1].trim().toLowerCase()
  );
  return [...new Set([...codeSpans, ...quoted])].filter((phrase) => {
    if (phrase.includes(' ')) return true;
    if (/[._/-]/.test(phrase)) return true;
    return false;
  });
}

function tokenize(text) {
  const rawTokens = text
    .toLowerCase()
    .split(/[^a-z0-9._/-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && token.length <= 40);

  const expanded = [];
  for (const token of rawTokens) {
    expanded.push(token);
    for (const slashPart of token.split('/')) {
      if (slashPart.length >= 3) expanded.push(slashPart);
      for (const hyphenPart of slashPart.split('-')) {
        if (hyphenPart.length >= 3) expanded.push(hyphenPart);
      }
    }
  }

  return [...new Set(expanded.filter((token) => !STOP_WORDS.has(token)))];
}

function parseSitePagesTable(markdown) {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('| /'))
    .map((line) =>
      line
        .split('|')
        .map((part) => part.trim())
        .filter(Boolean)
    )
    .map((parts) => {
      const sitePath = parts[0];
      const title = parts[1] ?? '';
      const source = parts.at(-1) ?? '';
      const extraColumns = parts.slice(2, -1);
      return {
        sitePath,
        title,
        searchableText: extraColumns.join(' '),
        source,
        url: `https://coclaw.com${sitePath.endsWith('/') ? sitePath : `${sitePath}/`}`,
      };
    })
    .filter((page) => page.sitePath && page.title);
}

function scorePage(page, issue) {
  const titleText = issueTitleText(issue).toLowerCase();
  const fullText = issueText(issue).toLowerCase();
  const phrases = extractPhrases(fullText);
  const titleTokens = tokenize(titleText);
  const detailTokens = tokenize(fullText).filter((token) => !titleTokens.includes(token));
  const channelTokens = Array.isArray(issue?.taxonomy?.channels) ? issue.taxonomy.channels : [];
  const componentTokens = Array.isArray(issue?.taxonomy?.components)
    ? issue.taxonomy.components
    : [];

  const pageTitle = page.title.toLowerCase();
  const pageBody = String(page.searchableText ?? '').toLowerCase();
  const pageText = `${page.sitePath} ${pageTitle} ${pageBody}`;

  let score = 0;
  const reasons = [];

  if (page.sitePath.startsWith('/troubleshooting/solutions/')) score += 8;
  else if (page.sitePath.startsWith('/guides/')) score += 6;
  else if (page.sitePath.startsWith('/blog/')) score -= 8;

  for (const phrase of phrases) {
    if (!phrase || phrase.length < 4) continue;
    if (pageText.includes(phrase)) {
      score += 12;
      reasons.push(`phrase: ${phrase}`);
    }
  }

  const matchedTitleTokens = [];
  const matchedKeywordTokens = [];
  for (const token of titleTokens) {
    if (pageTitle.includes(token) || page.sitePath.includes(token)) {
      score += 6;
      matchedTitleTokens.push(token);
      continue;
    }
    if (pageBody.includes(token)) {
      score += 3;
      matchedKeywordTokens.push(token);
    }
  }

  for (const token of detailTokens) {
    if (pageTitle.includes(token) || page.sitePath.includes(token)) {
      score += 2;
      matchedTitleTokens.push(token);
      continue;
    }
    if (pageBody.includes(token)) {
      score += 2;
      matchedKeywordTokens.push(token);
    }
  }

  for (const token of channelTokens) {
    if (pageText.includes(token)) {
      score += 6;
      reasons.push(`channel: ${token}`);
    }
  }

  for (const token of componentTokens) {
    const aliases = token === 'web-ui' ? ['web-ui', 'control ui', 'dashboard'] : [token];
    if (aliases.some((alias) => pageText.includes(alias))) {
      score += 5;
      reasons.push(`component: ${token}`);
    }
  }

  if (matchedTitleTokens.length) {
    reasons.push(`title/path tokens: ${matchedTitleTokens.slice(0, 5).join(', ')}`);
  }
  if (matchedKeywordTokens.length) {
    reasons.push(`keywords: ${matchedKeywordTokens.slice(0, 5).join(', ')}`);
  }

  return {
    ...page,
    score,
    reasons: reasons.slice(0, 3),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const dataset = JSON.parse(await fs.readFile(args.issuesFile, 'utf8'));
  const issues = Array.isArray(dataset?.issues) ? dataset.issues : [];
  const issue = issues.find((item) => Number(item?.number) === args.issueNumber);
  if (!issue) {
    throw new Error(`Issue #${args.issueNumber} not found in dataset: ${args.issuesFile}`);
  }

  const sitePagesMarkdown = await fs.readFile(args.sitePagesFile, 'utf8');
  const sitePages = parseSitePagesTable(sitePagesMarkdown);
  const ranked = sitePages
    .map((page) => scorePage(page, issue))
    .filter((page) => page.score >= 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, args.limit);

  const payload = {
    generatedAt: new Date().toISOString(),
    issue: {
      number: issue.number,
      title: issue.title,
      htmlUrl: issue.htmlUrl,
    },
    candidates: ranked,
  };

  if (args.json) {
    process.stdout.write(JSON.stringify(payload, null, 2));
    process.stdout.write('\n');
    return;
  }

  console.log(`#${issue.number} ${issue.title}`);
  console.log(issue.htmlUrl);
  console.log('');
  if (ranked.length === 0) {
    console.log('No strong site-page matches found.');
    return;
  }

  for (const candidate of ranked) {
    console.log(`- [${candidate.title}](${candidate.url}) score=${candidate.score}`);
    if (candidate.reasons.length) {
      console.log(`  reasons: ${candidate.reasons.join('; ')}`);
    }
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
