#!/usr/bin/env node
/**
 * Sync local OpenClaw reference repo (.ref/openclaw) to latest.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

function parseArgs(argv) {
  const args = {
    refDir: path.resolve('.ref', 'openclaw'),
    repoUrl: 'https://github.com/openclaw/openclaw.git',
    branch: 'main',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--ref-dir') {
      const value = argv[i + 1];
      i += 1;
      if (!value) throw new Error('Missing value for --ref-dir');
      args.refDir = path.resolve(value);
      continue;
    }

    if (arg === '--repo-url') {
      const value = argv[i + 1];
      i += 1;
      if (!value) throw new Error('Missing value for --repo-url');
      args.repoUrl = value;
      continue;
    }

    if (arg === '--branch') {
      const value = argv[i + 1];
      i += 1;
      if (!value) throw new Error('Missing value for --branch');
      args.branch = value;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node skills/coclaw-solutions-maintainer/scripts/sync-openclaw-ref.mjs [options]

Options:
  --ref-dir <path>   Local ref repo path (default: .ref/openclaw)
  --repo-url <url>   Git URL (default: https://github.com/openclaw/openclaw.git)
  --branch <name>    Branch to track (default: main)
`);
      process.exit(0);
    }

    throw new Error(`Unknown arg: ${arg}`);
  }

  return args;
}

function runGit(args, cwd = null) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: cwd ?? undefined,
  }).trim();
}

async function exists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const gitDir = path.join(args.refDir, '.git');

  if (!(await exists(gitDir))) {
    await fs.mkdir(path.dirname(args.refDir), { recursive: true });
    console.log(`Cloning ${args.repoUrl} -> ${args.refDir}`);
    runGit(['clone', '--depth', '1', '--branch', args.branch, args.repoUrl, args.refDir]);
  } else {
    console.log(`Updating existing ref repo: ${args.refDir}`);
    runGit(['-C', args.refDir, 'fetch', 'origin', '--prune']);
    runGit(['-C', args.refDir, 'checkout', args.branch]);
    runGit(['-C', args.refDir, 'pull', '--ff-only', 'origin', args.branch]);
  }

  const commit = runGit(['-C', args.refDir, 'rev-parse', '--short', 'HEAD']);
  const subject = runGit(['-C', args.refDir, 'log', '-1', '--pretty=%s']);

  console.log(`Ref ready @ ${commit}`);
  console.log(subject);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
