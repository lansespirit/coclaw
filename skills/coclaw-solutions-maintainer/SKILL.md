---
name: coclaw-solutions-maintainer
description: 'Maintain CoClaw troubleshooting Solutions from recent OpenClaw issues with strict role separation: sync reference/data, incremental triage, standalone classification, manual high-value issue replies, and optional 1-3 new Solutions per run.'
---

# CoClaw Solutions Maintainer

目标：基于 `docs/TROUBLESHOOTING-SOLUTIONS-MAINTENANCE.md`，建立“高价值、低噪音”的 issues 维护闭环：

- 每轮先同步 `.ref/openclaw` 到最新
- 仅对最近 72h 且增量 issues 进入队列
- 脚本只做“数据同步 + 初步分类建议”，不自动发评论
- 每条 GitHub 回帖必须人工（或 AI sub-agent 人工化）完整阅读 issue 主贴 + 现有评论后撰写
- 仅对“使用问题”与“已知 bug 但有稳定 workaround”给出 solution；纯代码 bug / feature / 其他报告跳过
- 每轮最多新建 1-3 篇 solution

## 强约束（必须遵守）

1. `comment-issues-with-solutions.mjs` 已停用，禁止程序化批量评论。
2. `triage-recent-issues.mjs` 只做增量检出，不做分析与匹配。
3. issue 分类由独立脚本执行（建议），最终决策由人工/AI sub-agent 完整阅读后做出。
4. 回帖必须“先提供可执行价值，再附 coclaw solution 链接”。

## 脚本职责拆分

- 数据同步（本 skill）
  - `node skills/coclaw-solutions-maintainer/scripts/sync-openclaw-issues.mjs`
- 参考源码同步（本 skill）
  - `node skills/coclaw-solutions-maintainer/scripts/sync-openclaw-ref.mjs`
- 增量 triage（本 skill）
  - `node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs`
- 分类建议（本 skill）
  - `node skills/coclaw-solutions-maintainer/scripts/classify-issues.mjs`
- 趋势分析（可选，本 skill）
  - `node skills/coclaw-solutions-maintainer/scripts/analyze-openclaw-issues.mjs`
- 自动评论（本 skill）
  - `comment-issues-with-solutions.mjs` 已停用，仅输出迁移提示并退出

## 推荐执行流程（每轮）

### 0) 同步 `.ref/openclaw`（必须先跑）

```bash
node skills/coclaw-solutions-maintainer/scripts/sync-openclaw-ref.mjs
```

### 1) 同步最近 72h issues 数据集

```bash
OPENCLAW_ISSUES_SINCE_HOURS=72 pnpm sync:issues
```

默认输出到 `skills/coclaw-solutions-maintainer/data/openclaw-issues.json`（仅供本 skill 使用）。

### 2) 生成“增量 issues”

```bash
node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs \
  --json > .cache/coclaw-solutions-maintainer/triage-latest.json
```

### 3) 生成“分类建议队列”（仅建议）

```bash
node skills/coclaw-solutions-maintainer/scripts/classify-issues.mjs \
  --triage .cache/coclaw-solutions-maintainer/triage-latest.json \
  --output .cache/coclaw-solutions-maintainer/classification-latest.json
```

### 3.5) 可选：更新 issue 分析报告

```bash
pnpm analyze:issues
```

默认输出机器结果到 `skills/coclaw-solutions-maintainer/data/issue-analysis.json`。

### 4) 人工 / sub-agent 逐条处理

从 `classification-latest.json` 中逐条处理，每条 issue 必须完整阅读：

- issue title/body
- 现有所有评论
- 必要时 `.ref/openclaw` 相关源码或配置实现

决策：

- `usage_config` / `usage_deploy` / `usage_channel` / `known_bug_with_workaround`
  - 目标是：**在该 issue 下产出“可立即执行”的高价值回复**（solution 链接只作为补充；不是每次回复的前置条件）
  - 先查站内是否已有 solution 覆盖
  - 有覆盖：直接回帖（先给步骤与原因），末尾附 solution 链接
  - 无覆盖：
    - 若问题足够通用/可复用：调研后新建 solution（每轮总量 1-3 篇），**先 commit & push 到 `main`（确保 Cloudflare 部署后可访问）**，再回帖并附链接
    - 若问题较零散但仍是使用问题：只回帖（不强求写 solution）
- `code_bug` / `feature_request` / `other_meta`
  - 跳过，不回帖

### 5) 手工评论（非模板）

推荐命令（每条 issue 单独写内容）：

```bash
gh issue comment <ISSUE_NUMBER> \
  --repo openclaw/openclaw \
  --body-file /tmp/issue-<ISSUE_NUMBER>-reply.md
```

回帖质量要求：

- 必须引用该 issue 的具体症状 / 报错 / 环境信息
- 给出 1-2 条可立即执行的步骤，并说明为何适用
- 若附 solution 链接，链接是补充而不是唯一内容

### 6) 合并前校验

```bash
pnpm build
```

并手动验证：

- 新增/更新 solution 页面可渲染
- Pagefind 可通过 `errorSignatures` 关键 token 检索命中

## Sub-agent 分工建议（防止主任务跑偏）

- Agent A（Ref Sync）
  - 仅负责 `.ref/openclaw` 同步
- Agent B（Data + Triage）
  - 仅负责 issues 同步与增量 triage
- Agent C（Classifier）
  - 仅负责分类建议输出
- Agent D（Resolver）
  - 逐条 issue 深读，给出最终动作：`link existing` / `create solution` / `skip`
- Agent E（Author）
  - 撰写 1-3 篇 solution（若需要）
- Agent F（Commenter）
  - 根据 Resolver 结论，逐条写“高价值非模板回帖”，并执行 `gh issue comment`
- Agent G（QA）
  - 构建与检索验证

## Git 操作

若本轮新增/更新了对外内容（例如 `src/content/troubleshooting/solutions/*.mdx`），完成一轮维护后：

```bash
git add -A
git commit -m "docs(troubleshooting): maintain solutions from incremental issues"
git push origin main
```

重要：不要为 solutions 维护单独开分支。

- 站点（Cloudflare）通常从 `main` 部署；不 push 到 `main`，新 solution 链接对用户不可用（评论里贴出去会 404/未更新）。
- 只有当你本轮**确实没有改动站点内容**（只更新 `.cache/` 或本地数据集）时，才可以不 commit/push。
