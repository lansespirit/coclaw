# CoClaw Solutions Maintainer 使用手册

## 每轮标准流程

### Step 0：同步参考源码

```bash
node skills/coclaw-solutions-maintainer/scripts/sync-openclaw-ref.mjs
```

### Step 0.5：生成 KB 索引文档（推荐）

用于让 sub-agent 在回帖/写作前快速获取“站内页面链接 + OpenClaw 溯源入口”的上下文。

```bash
pnpm kb:build
```

脚本入口：`scripts/build-kb-index.mjs`

### Step 1：同步最近 issues 数据

```bash
OPENCLAW_ISSUES_SINCE_HOURS=72 pnpm sync:issues
```

说明：

- 同步数据默认落盘到 `skills/coclaw-solutions-maintainer/data/openclaw-issues.json`
- 该目录已在 `.gitignore` 中忽略，不进入版本控制

### Step 2：生成增量 issue 队列

```bash
node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs --json \
  > .cache/coclaw-solutions-maintainer/triage-latest.json
```

说明：

- 默认只输出“新出现”issues
- 若要把“已处理但有新更新”的 issue 也纳入，可加 `--include-updated`

### Step 3：生成分类建议队列

```bash
node skills/coclaw-solutions-maintainer/scripts/classify-issues.mjs \
  --triage .cache/coclaw-solutions-maintainer/triage-latest.json \
  --output .cache/coclaw-solutions-maintainer/classification-latest.json
```

说明：

- 这是“建议”，不是最终结论
- 最终动作必须基于完整阅读后决策

### Step 3.5：可选生成分析报告

```bash
pnpm analyze:issues
```

说明：

- 机器报告输出到 `skills/coclaw-solutions-maintainer/data/issue-analysis.json`。
- 人类报告输出到 `docs/TROUBLESHOOTING-ISSUE-ANALYSIS.md`。

## 逐条发布评论（推荐：每条写好就立刻提交）

```bash
gh issue comment <ISSUE_NUMBER> \
  --repo openclaw/openclaw \
  --body-file /tmp/issue-<ISSUE_NUMBER>-reply.md
```

## 质量校验

```bash
pnpm build
```

并确认：

- 页面可渲染
- 搜索可命中（用 `errorSignatures` token 验证）

---

## 常用命令速查

### 首轮/每日执行

```bash
node skills/coclaw-solutions-maintainer/scripts/sync-openclaw-ref.mjs
OPENCLAW_ISSUES_SINCE_HOURS=72 pnpm sync:issues
node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs --json > .cache/coclaw-solutions-maintainer/triage-latest.json
node skills/coclaw-solutions-maintainer/scripts/classify-issues.mjs --triage .cache/coclaw-solutions-maintainer/triage-latest.json --output .cache/coclaw-solutions-maintainer/classification-latest.json
pnpm analyze:issues
```

### triage 参数

```bash
node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs --include-updated --json
```

### classify 参数

```bash
node skills/coclaw-solutions-maintainer/scripts/classify-issues.mjs --limit 50 --json
```
