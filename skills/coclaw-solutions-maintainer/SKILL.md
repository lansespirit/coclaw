---
name: coclaw-solutions-maintainer
description: "Maintain CoClaw troubleshooting Solutions from OpenClaw GitHub issues: sync only the latest 72 hours, triage only newly-seen issues since last run, avoid duplicate Solutions by checking existing site content first, and (when already covered) comment on the issue with the coclaw.com Solution link instead of creating duplicates."
---

# CoClaw Solutions Maintainer

目标：按 `docs/TROUBLESHOOTING-SOLUTIONS-MAINTENANCE.md` 的规范持续维护站点 `Solutions`，同时做到：

- 仅拉取最近 72 hours 的 issues（减少 API 成本）
- 仅分析“新增”的 issues（避免重复劳动）
- 新增/更新 solution 前先核对站点（即本仓库 solutions 内容）是否已覆盖；若已覆盖，直接在 GitHub issue 下评论并附 `coclaw.com` 对应页面链接

## Quick start（推荐流程）

1) 同步最近 72h issues 数据集：

```bash
OPENCLAW_ISSUES_SINCE_HOURS=72 pnpm sync:issues
```

说明：GitHub API 需要鉴权以避免低 rate limit。优先用 `GITHUB_TOKEN`，否则确保本机已 `gh auth login`（脚本会自动尝试读取 `gh auth token`）。

2) 仅输出“新增 issues”（带可能匹配的现有 solution）并更新本地 state：

```bash
node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs
```

脚本会维护本地 state（默认路径：`.cache/coclaw-solutions-maintainer/state.json`），用于“只分析新增”。

## 每个新增 issue 的处理规则

1) **先查重（必须）**
   - 先看 triage 输出的 `matches`（现有 solutions 的候选）
   - 必要时再在本仓库里全文搜索：`src/content/troubleshooting/solutions/*.mdx`

2) **若已被现有 solution 覆盖**
   - 不新增 solution（避免 SEO 重复）
   - 直接在 issue 下评论，附 `coclaw.com` solution 链接

GitHub 评论（用 `gh` CLI）模板：

```bash
gh issue comment <ISSUE_NUMBER> \
  --repo openclaw/openclaw \
  --body $'This issue is already covered by our Troubleshooting Solution:\n\nhttps://coclaw.com/troubleshooting/solutions/<slug>/\n\nIf you try the steps and it still fails, please reply with logs + your OS/channel/version.'
```

3) **若未覆盖**
   - 新建或更新对应的 solution 文件：
     - `src/content/troubleshooting/solutions/<slug>.mdx`
     - 路由：`/troubleshooting/solutions/<slug>/`
   - 严格遵守写作规范（Frontmatter + 标题顺序 + `errorSignatures` 规则），详见：
     - `docs/TROUBLESHOOTING-SOLUTIONS-MAINTENANCE.md`
   - 在 frontmatter 里补来源（不要镜像 issue 内容）：
     - `related.githubIssues: [<ISSUE_NUMBER>]`

4) **合并前自检**
   - `pnpm build`
   - 自测 solution 页面渲染 + Pagefind 搜索（用 `errorSignatures` 的 token 搜索验证）

## 状态与“只分析新增”

- triage 脚本以 issue `number` 去重：同一个 issue 昨天已经处理过，今天再次拉取不会重复出现在“新增列表”里。
- 若确实希望“已处理 issue 但今天有新信息（新评论/新根因）也要重新进入分析”，运行：

```bash
node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs --include-updated
```
