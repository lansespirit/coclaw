#!/usr/bin/env node
/**
 * Deprecated: automated commenting is intentionally disabled.
 *
 * Rationale:
 * - Avoid low-value/template issue comments
 * - Keep GitHub replies human-reviewed and issue-specific
 *
 * New workflow:
 * - Run triage + classification scripts for queue preparation
 * - Use sub-agents/human review to read each issue in full
 * - Post final comments manually via `gh issue comment`
 */

import process from 'node:process';

const message = [
  'This script is intentionally disabled.',
  '',
  'Use the new workflow instead:',
  '1) node skills/coclaw-solutions-maintainer/scripts/sync-openclaw-ref.mjs',
  '2) OPENCLAW_ISSUES_SINCE_HOURS=72 pnpm sync:issues',
  '3) node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs --json > .cache/coclaw-solutions-maintainer/triage-latest.json',
  '4) node skills/coclaw-solutions-maintainer/scripts/classify-issues.mjs --triage .cache/coclaw-solutions-maintainer/triage-latest.json --output .cache/coclaw-solutions-maintainer/classification-latest.json',
  '5) Read each issue + existing comments in full and comment manually using gh issue comment',
].join('\n');

console.error(message);
process.exit(1);
