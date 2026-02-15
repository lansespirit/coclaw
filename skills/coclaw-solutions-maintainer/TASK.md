# CoClaw Solutions Maintainer — Task Definition

本文件定义“每轮维护任务是什么”和验收标准（Definition of Done）。

执行顺序（强制）：

1. 先读本文件（TASK：目标/边界/验收）
2. 再读 `SKILL.md`（能力与强约束：脚本职责拆分、禁止自动评论）
3. 再读 `USAGE.md`（Runbook：具体命令怎么跑、输出路径在哪）

相关文件：

- Task（本文件）：`skills/coclaw-solutions-maintainer/TASK.md`
- Skill：`skills/coclaw-solutions-maintainer/SKILL.md`
- Usage：`skills/coclaw-solutions-maintainer/USAGE.md`
- 写作规范：`docs/TROUBLESHOOTING-SOLUTIONS-MAINTENANCE.md`

---

## 1) 目标（Goal）

每轮从 OpenClaw 最近增量 issues 中，找出“使用问题”（以及“已知 bug 但存在稳定 workaround”）并在 GitHub issue 下提供**高价值、可立即执行**的回复。

Solutions / Guides / Config generator 等站内内容是“复用与沉淀”，不是回复的前置条件。

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
- 每轮新增 Solutions：**可选**，数量按覆盖情况灵活判断，**上限 0–3 篇**。

---

## 3) 决策规则（Comment vs Link vs Create）

对每条“可回帖”的 issue（usage\_\* / known_bug_with_workaround），先完整阅读：

- issue title/body
- 全部现有评论
- 必要时参考 `.ref/openclaw` 相关实现/配置

然后做三选一决策：

1. 仅评论（最常见）
   - 问题较具体/零散，但可以给出明确可执行步骤。
2. 评论 + 链接站内内容（可选）
   - 若站内已有相关内容，链接可以是：
     - `/troubleshooting/solutions/.../`（solution）
     - `/guides/.../`（guides）
     - `/troubleshooting/...` 其他页面
     - config generator 页面等
   - **不要求必须链接 solution**；链接是补充，不是回复主体。
3. 新增（或更新）站内内容 + 评论
   - 仅当问题**通用、可复用、且可长期维护**时才写（0–3/轮）。
   - 新内容上线顺序（强制）：
     1. 写/改内容
     2. `pnpm build` 通过
     3. **commit 并 push 到 `main`**（等 Cloudflare 部署后用户可访问）
     4. 再去 issue 下评论并附链接

---

## 4) 回帖质量标准（必须满足）

每条评论必须同时满足：

1. 贴合当前 issue
   - 引用该 issue 的具体症状/报错/环境（不是泛化建议）。
2. 可执行
   - 给出 1–2 条立刻能执行的步骤（命令/配置位点），尽量是 `openclaw ...` 级别操作。
3. 有因果
   - 简短说明“为什么这一步对这个问题有效”。
4. 链接是补充（可选）
   - 若附链接，放在末尾；不能只有链接。
5. 明确下一步
   - 若仍未解决，提出最小化的补充信息请求（例如：版本、OS、关键配置字段、相关日志片段）。

禁止：

- 固定模板复制
- 批量自动评论（脚本已禁止）
- 对 code bug/feature 强行引流站内内容

---

## 5) Definition of Done（本轮验收）

满足以下任意组合即可视为完成一轮：

- 在本轮识别出的“使用问题”队列中，选择优先级最高/信息最完整的 issues，**最多评论 10 条**，且每条符合质量标准。
- 若本轮新增/更新了站内内容：
  - `pnpm build` 通过
  - 已 commit 并 push 到 `main`
  - 评论中附的站内链接在部署后可访问
