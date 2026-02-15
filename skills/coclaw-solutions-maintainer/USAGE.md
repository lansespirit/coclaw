# CoClaw Solutions Maintainer 使用手册

本文是 `skills/coclaw-solutions-maintainer` 的实操手册，面向日常维护执行。

目标（任务定义见 `TASK.md`；本文件仅为 runbook）：

- 以 **高价值、低噪音** 的方式维护 troubleshooting solutions 与站内相关内容
- 对 OpenClaw 最近 issues 做增量处理（默认 72h）
- 只对“使用问题 / 已知 bug 且有稳定 workaround”回帖；每轮最多评论 10 条（见 `TASK.md`）
- 新增 solutions：按覆盖情况灵活判断（0–3/轮；见 `TASK.md`）

---

## 1. 角色与职责边界

### 1.1 脚本职责（强制分离）

- `skills/coclaw-solutions-maintainer/scripts/sync-openclaw-issues.mjs`
  - 负责同步 issues 数据
- `skills/coclaw-solutions-maintainer/scripts/sync-openclaw-ref.mjs`
  - 负责同步 `.ref/openclaw` 参考源码
- `skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs`
  - 仅做“增量检出 + state 管理”
  - **不做**分类、匹配、评论
- `skills/coclaw-solutions-maintainer/scripts/classify-issues.mjs`
  - 仅做“分类建议”
  - **不做**最终决策、评论
- `skills/coclaw-solutions-maintainer/scripts/analyze-openclaw-issues.mjs`
  - 可选：生成 patterns 分析报告
  - **不做**评论与最终决策
- `skills/coclaw-solutions-maintainer/scripts/comment-issues-with-solutions.mjs`
  - 已停用（防止程序化评论）

### 1.2 人工/AI sub-agent职责

- 必须逐条完整阅读 issue 主贴 + 所有评论
- 必须判断问题类型，再决定是否回帖
- 回帖必须有实操价值；如需附链接，站内链接仅作为补充（不要求必须链接 solution）

---

## 2. 每轮标准流程（Runbook）

> 每次任务开始都必须先同步 `.ref/openclaw`。

开始前（强制）：先读 `skills/coclaw-solutions-maintainer/TASK.md`，确保本轮目标/范围/上限明确。

### Step 0：同步参考源码

```bash
node skills/coclaw-solutions-maintainer/scripts/sync-openclaw-ref.mjs
```

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

- 机器报告输出到 `skills/coclaw-solutions-maintainer/data/issue-analysis.json`
- 人类报告输出到 `docs/TROUBLESHOOTING-ISSUE-ANALYSIS.md`

### Step 4：逐条深读并决策

从 `classification-latest.json` 逐条处理，但最终决策与质量标准以 `TASK.md` 为准（本文件不重复规范）。

强制要求：

- 每条 issue 必须完整阅读主贴 + 全部评论再决定是否回帖
- 每轮最多评论 10 条 openclaw 使用相关问题（超出留到下一轮）

### Step 5：手工评论（禁止模板批量）

```bash
gh issue comment <ISSUE_NUMBER> \
  --repo openclaw/openclaw \
  --body-file /tmp/issue-<ISSUE_NUMBER>-reply.md
```

评论时机建议：

- 如果引用的是**已有**站内页面：可直接评论（链接应已可访问）。
- 如果引用的是**本轮新写**站内页面：先按“提交与推送”把 `main` 推上去，再评论（避免用户点开 404）。

### Step 6：质量校验

```bash
pnpm build
```

并确认：

- 页面可渲染
- 搜索可命中（用 `errorSignatures` token 验证）

---

## 6. 常用命令速查

说明：

- 任务范围、每轮上限、决策规则与回帖质量标准以 `skills/coclaw-solutions-maintainer/TASK.md` 为准。
- 分工/强约束以 `skills/coclaw-solutions-maintainer/SKILL.md` 为准。

### 6.1 首轮/每日执行

```bash
node skills/coclaw-solutions-maintainer/scripts/sync-openclaw-ref.mjs
OPENCLAW_ISSUES_SINCE_HOURS=72 pnpm sync:issues
node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs --json > .cache/coclaw-solutions-maintainer/triage-latest.json
node skills/coclaw-solutions-maintainer/scripts/classify-issues.mjs --triage .cache/coclaw-solutions-maintainer/triage-latest.json --output .cache/coclaw-solutions-maintainer/classification-latest.json
pnpm analyze:issues
```

### 6.2 triage 参数

```bash
node skills/coclaw-solutions-maintainer/scripts/triage-recent-issues.mjs --include-updated --json
```

### 6.3 classify 参数

```bash
node skills/coclaw-solutions-maintainer/scripts/classify-issues.mjs --limit 50 --json
```

---

## 7. 提交与推送

如果本轮新增/更新了对外内容（solutions/guides 等，或其他会影响站点渲染/搜索的内容），必须：

```bash
git add -A
git commit -m "docs(troubleshooting): maintain solutions from incremental issues"
git push origin main
```

重要：不要为 solutions 维护单独开分支。

- 站点（Cloudflare）通常从 `main` 部署；不 push 到 `main`，新 solution 链接对用户不可用。
- 只有当你本轮**确实没有改动站点内容**（只同步了 `.cache/` 或本地数据集）时，才可以不 commit/push。

---

## 8. 本手册适用范围

- 适用于本仓库当前 skill 架构
- 若脚本职责发生变更，请同步更新：
  - `skills/coclaw-solutions-maintainer/SKILL.md`
  - `skills/coclaw-solutions-maintainer/USAGE.md`
