---
name: coclaw-solutions-maintainer
description: 'Maintain CoClaw troubleshooting content from recent OpenClaw issues with strict role separation: sync reference/data, incremental triage, standalone classification, and manual issue replies.'
---

# CoClaw Solutions Maintainer

目标：基于 `docs/TROUBLESHOOTING-SOLUTIONS-MAINTENANCE.md`，建立“高价值、低噪音”的 issues 维护闭环：

- 每轮先同步 `.ref/openclaw` 到最新
- 脚本只做“数据同步 + 初步分类建议”，不自动发评论
- 增量 triage 与分类仅输出“建议队列”，不做最终决策

## 强约束（必须遵守）

1. 禁止程序化批量评论（GitHub 回帖必须手工/人工化执行）。
2. `triage-recent-issues.mjs` 只做增量检出，不做分析与匹配。
3. issue 分类由独立脚本执行（建议），最终决策由人工/AI sub-agent 完整阅读后做出。

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

## 用法

命令与输出路径见 `skills/coclaw-solutions-maintainer/USAGE.md`。

## Sub-agent 分工建议（防止主任务跑偏）

- Agent A（Ref Sync）
  - 仅负责 `.ref/openclaw` 同步
- Agent B（Data + Triage）
  - 仅负责 issues 同步与增量 triage
- Agent C（Classifier）
  - 仅负责分类建议输出
- Agent D（Resolver）
  - 逐条 issue 深读，给出最终动作建议
- Agent E（Author）
  - 撰写/更新站内页面（若需要）
- Agent F（Commenter）
  - 根据 Resolver 结论，逐条写“高价值非模板回帖”，并执行 `gh issue comment`
- Agent G（QA）
  - 构建与检索验证
