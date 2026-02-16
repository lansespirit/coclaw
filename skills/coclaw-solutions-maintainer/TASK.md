# CoClaw Solutions Maintainer — Task Definition

本文件定义“每轮维护任务是什么”、默认动作与验收标准（Definition of Done）。

执行顺序（强制）：

1. 先读本文件（TASK：目标/边界/流程/验收）
2. 再读 `SKILL.md`（能力与强约束：脚本职责拆分、禁止自动评论）
3. 再读 `USAGE.md`（Runbook：具体命令怎么跑、输出路径在哪）

相关文件：

- Task（本文件）：`skills/coclaw-solutions-maintainer/TASK.md`
- Skill：`skills/coclaw-solutions-maintainer/SKILL.md`
- Usage：`skills/coclaw-solutions-maintainer/USAGE.md`
- 写作规范：`docs/TROUBLESHOOTING-SOLUTIONS-MAINTENANCE.md`

---

## 1) 目标与交付物（Goal & Deliverables）

每轮从 OpenClaw 最近增量 issues 中，识别“使用问题”（以及“已知 bug 且存在稳定 workaround”），并在 GitHub issue 下提供**高价值、可立即执行**的回复。

对每条被处理的 issue（最多 10 条/轮），回复必须包含：

1. 可立即执行的步骤（1–2 条为主）+ 简短因果解释
2. 在回复末尾**推荐 1–2 个 `coclaw.com` 相关页面链接（默认需要）**，用于延伸阅读/更完整步骤：
   - 允许链接任何站内页面（solutions / guides / config generator / 其他相关页面）
   - 不要求必须是 solution 链接
   - 例外：确实找不到合适页面时，允许不贴链接，但需要在回复中说明“暂无合适站内页面可推荐”

---

## 2) 范围与上限（Scope & Limits）

- 数据范围：默认最近 72h 更新的 issues（由 runbook 决定具体参数）。
- 仅处理 OpenClaw 的“使用问题”相关 issue：
  - `usage_config` / `usage_deploy` / `usage_channel`
  - `known_bug_with_workaround`（仅当 workaround 稳定可执行）
- 跳过：
  - `code_bug`（需要改源码才能解决）
  - `feature_request`
  - `other_meta`
- **每轮最多评论 10 条** openclaw 使用相关 issues（超过上限留到下一轮）。
- 每轮新增/更新站内内容（solutions/guides 等）：**可选**，数量按覆盖情况灵活判断，**上限 0–3 篇**。

---

## 3) 任务流程（Task Workflow）

本任务按“先筛选再深读再回复”的节奏执行（命令细节见 `USAGE.md`）：

1. 生成候选队列（sync/ref/triage/classify）→ 得到 `classification-latest.json`
2. 从队列中识别“使用问题”issues（usage\_\* / known_bug_with_workaround）
3. 为本轮选择**最多 10 条**要处理的 issues（优先信息完整、影响面大、可给出确定步骤的）
4. 对每条 issue 完整阅读（主贴 + 全部评论；必要时查 `.ref/openclaw`）
5. 草拟高价值回复（步骤 + 因果 + 需要补充的信息）
6. 匹配并选择 1–2 个 `coclaw.com` 站内页面作为“推荐链接”（默认需要）
7. 若需要新增/更新站内内容：
   - 先写/改内容并 `pnpm build` 通过
   - **commit 并 push 到 `main`**
   - 再发布 GitHub 回复并附上新页面链接（避免用户点开不可用）

---

## 4) 决策规则（默认动作）

对每条“可回帖”的 issue（usage\_\* / known_bug_with_workaround），先完整阅读：

- issue title/body
- 全部现有评论
- 必要时参考 `.ref/openclaw` 相关实现/配置

然后按以下规则决定“是否写/改站内内容”，并形成最终回复：

默认动作（对每条被处理 issue）：

- **评论 + 推荐 1–2 个 `coclaw.com` 站内链接**（solutions/guides/config generator 等均可）

仅在以下情况才允许“评论不贴链接”：

- 站内确实没有合适页面可推荐，且硬贴会误导（此时在回复中说明原因）

仅在以下情况才新增/更新站内内容：

- 该问题足够通用、可复用、且可长期维护（值得沉淀）
- 或已有页面明显不完整/过期，无法作为推荐链接支撑本轮回复

新增/更新站内内容的发布顺序（强制）：

1. 写/改内容
2. `pnpm build` 通过
3. commit 并 push 到 `main`
4. 再发布 GitHub 回复并附链接（避免用户点开不可用）

---

## 5) 回帖质量标准（必须满足）

每条评论必须同时满足：

1. 贴合当前 issue
   - 引用该 issue 的具体症状/报错/环境（不是泛化建议）。
2. 可执行
   - 给出 1–2 条立刻能执行的步骤（命令/配置位点），尽量是 `openclaw ...` 级别操作。
3. 有因果
   - 简短说明“为什么这一步对这个问题有效”。
4. 推荐链接（默认需要）
   - 末尾推荐 1–2 个 `coclaw.com` 站内页面；链接用于延伸阅读/更完整步骤，但回复正文必须自洽，用户不点链接也能执行关键步骤。
5. 明确下一步
   - 若仍未解决，提出最小化的补充信息请求（例如：版本、OS、关键配置字段、相关日志片段）。

禁止：

- 固定模板复制
- 批量自动评论（脚本已禁止）
- 对 code bug/feature 强行引流站内内容

---

## 6) Definition of Done（本轮验收）

满足以下任意组合即可视为完成一轮：

- 在本轮识别出的“使用问题”队列中，选择优先级最高/信息最完整的 issues，**最多评论 10 条**，且每条符合质量标准（默认包含站内推荐链接）。
- 若本轮新增/更新了站内内容（solutions/guides 等）：
  - `pnpm build` 通过
  - 已 commit 并 push 到 `main`
  - GitHub 回复里引用新页面链接时，已确保先 push `main`（避免用户点开不可用）
