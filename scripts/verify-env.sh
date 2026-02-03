#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

need_cmd node
need_cmd pnpm

if [[ ! -f "package.json" ]]; then
  fail "Run this script from the repo root (missing package.json)."
fi

node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [[ "$node_major" -lt 22 ]]; then
  fail "Node.js 22+ is required (detected: $(node -v))."
fi

echo "Node: $(node -v)"
echo "pnpm: $(pnpm -v)"

for f in astro.config.mjs tsconfig.json eslint.config.js; do
  [[ -f "$f" ]] || fail "Missing required file: $f"
done

if [[ ! -d "node_modules" ]]; then
  fail "Dependencies not installed (missing node_modules). Run: pnpm install"
fi

echo "Running: pnpm lint"
pnpm -s lint

echo "Running: pnpm format:check"
pnpm -s format:check

echo "Running: pnpm build"
pnpm -s build

echo "OK: environment + project checks passed."
