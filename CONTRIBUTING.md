# Contributing to CoClaw

CoClaw 的目标是把 OpenClaw（原 ClawDBot）相关的安装、配置、踩坑与最佳实践做成「可搜索、可复用、可维护」的知识库与工具站。

Thanks for helping! Content improvements and feature suggestions are especially welcome.

## Ways To Contribute

- **Report a bug**: open an issue with repro steps + screenshots
- **Request a feature**: open an issue describing the problem + expected behavior
- **Improve docs**: fix typos, clarify steps, add missing edge cases, add screenshots
- **Add new content**: write a new guide/troubleshooting article in MDX
- **UI/UX improvements**: tweak layouts/components, improve accessibility, improve performance

## Repo Layout (Common Areas)

- Content (MDX): `src/content/**`
- Pages/routes: `src/pages/**`
- Components: `src/components/**`
- Static assets: `public/**`

## Content Authoring (MDX)

- Put new pages in the most relevant folder under `src/content/`
- Keep titles clear and action-oriented (what problem it solves)
- Include real error messages / logs where possible, and the exact fix
- Keep URLs stable: renames should be rare (SEO + backlinks)

Example frontmatter:

```yaml
---
title: 'Your Page Title'
description: 'Brief description for SEO'
category: 'getting-started'
difficulty: 'beginner'
estimatedTime: '10 minutes'
publishDate: 2026-01-30
lastUpdated: 2026-01-30
author: 'CoClaw Team'
keywords:
  - 'keyword1'
  - 'keyword2'
---
```

## Local Dev

```bash
pnpm install
pnpm dev
```

Before opening a PR:

```bash
pnpm lint
pnpm format:check
pnpm build
```

## Optional: Sync OpenClaw Issues (Maintainers)

The site can mirror OpenClaw issues into `src/data/openclaw/openclaw-issues.json`:

```bash
pnpm sync:issues
```

To avoid GitHub API rate limits, set `GITHUB_TOKEN` in your environment.
