# CoClaw Solutions Maintainer 使用手册

本文是 `skills/coclaw-solutions-maintainer` 的实操手册，面向日常维护执行。

目标：

- 以 **高价值、低噪音** 的方式维护 troubleshooting solutions
- 对 OpenClaw 最新 issues 做增量处理
- 只对“使用问题 / 已知 bug 且有稳定 workaround”回帖
- 纯代码 bug、feature request、元讨论不回帖
- 每轮最多新增 `1-3` 篇 solution

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
- 回帖必须有实操价值，solution 链接仅作为补充

---

## 2. 每轮标准流程（Runbook）

> 每次任务开始都必须先同步 `.ref/openclaw`。

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

从 `classification-latest.json` 逐条处理，动作只有三类：

1. `skip`
   - 代码 bug / feature request / 其他不适合 solution 的问题
2. `link existing solution`
   - 站内已有覆盖，写高价值评论并附链接
3. `create solution + comment`
   - 站内未覆盖，先调研并新增 solution（每轮最多 1-3 篇），再评论

### Step 5：手工评论（禁止模板批量）

```bash
gh issue comment <ISSUE_NUMBER> \
  --repo openclaw/openclaw \
  --body-file /tmp/issue-<ISSUE_NUMBER>-reply.md
```

### Step 6：质量校验

```bash
pnpm build
```

并确认：

- 页面可渲染
- 搜索可命中（用 `errorSignatures` token 验证）

---

## 3. 问题类型与处理策略

### 3.1 允许处理（可回帖）

- `usage_config`
  - 认证、token、配置字段、模型选择、provider 路径
- `usage_deploy`
  - 安装、WSL、Docker、systemd/daemon、网络路径
- `usage_channel`
  - Telegram/WhatsApp/Discord/Signal 等渠道接入与消息链路
- `known_bug_with_workaround`
  - 虽是 bug，但存在稳定可执行 workaround

### 3.2 跳过（不回帖）

- `code_bug`
  - 需要改源码才能解决
- `feature_request`
  - 功能需求与 roadmap
- `other_meta`
  - 讨论帖、展示帖、信息不足

---

## 4. 高价值回帖标准

每条评论必须同时满足：

1. 贴合当前 issue
   - 引用该帖中的症状/报错/环境（不是泛化描述）
2. 可执行
   - 给出 `1-2` 条可立刻执行的步骤（命令/配置位点）
3. 有因果
   - 简要说明“为什么这一步对这个问题有效”
4. 链接作为补充
   - solution 链接放在后面，不可只有链接
5. 明确下一步
   - 若未解决，指明需要补充的关键信息（精简且有针对性）

禁止：

- 固定模板复制
- 只贴链接
- 对 code bug/feature 强行引流 solution

---

## 5. sub-agent 推荐分工

- Agent A：RefSync
  - 同步 `.ref/openclaw`
- Agent B：DataSync+Triage
  - 同步 issues + 增量 triage
- Agent C：Classifier
  - 输出建议分类与优先级
- Agent D：Resolver
  - 完整阅读每条 issue，给最终动作
- Agent E：Author
  - 编写/更新 1-3 篇 solution
- Agent F：Commenter
  - 撰写高价值回帖并执行 `gh issue comment`
- Agent G：QA
  - build + 搜索验证

---

## 6. 常用命令速查

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

完成一轮后：

```bash
git add -A
git commit -m "docs(troubleshooting): maintain solutions from incremental issues"
git push -u origin HEAD
```

若当前分支是 `main/master` 且你希望独立维护分支，建议先创建：

```bash
git switch -c codex/solutions-maintenance-<yyyymmdd>
```

---

## 8. 本手册适用范围

- 适用于本仓库当前 skill 架构
- 若脚本职责发生变更，请同步更新：
  - `skills/coclaw-solutions-maintainer/SKILL.md`
  - `skills/coclaw-solutions-maintainer/USAGE.md`
