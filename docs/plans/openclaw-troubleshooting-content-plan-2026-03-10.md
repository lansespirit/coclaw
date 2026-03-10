# OpenClaw Troubleshooting 内容沉淀计划（2026-03-10）

本计划基于最近一轮对 `openclaw/openclaw` issues 的维护回帖（共 22 条），将“重复出现、且存在稳定可执行 workaround/恢复路径”的信息沉淀到 `coclaw.com` 站点内容中。

## 目标（Goals）

- 把高频事故的 **可操作恢复路径**（Runbook）固化到站点，减少 issue 回复里反复解释。
- 让用户遇到典型错误时能 **1 分钟定位页面 + 2 步恢复**。
- 站内内容与 GitHub issue 分工明确：issue 回帖指向站内页，站内页承载可维护的长期知识。

## 数据来源（Issues）

覆盖主题来自以下 issues（按主题聚合；括号内为主要信号）：

- macOS LaunchAgent / launchctl 恢复：#40659 #40737 #40776 #40195（`Bootstrap failed: 5`、restart 后 not loaded、node 路径）
- npm 全局安装损坏：#28146 #28206（missing `dist/*chunk*.js`、`tool-loop-detection` 缺失）
- Compaction 死锁应急恢复：#40295（`/new` `/reset` 排队在 compaction 后面、只能杀进程+改 session 文件）
- 自定义 provider / DashScope：#40617（`auth.profiles` 误用、SecretRef/`${ENV_VAR}` 写法、工具调用找不到 key）
- Telegram preview streaming 副作用：#40746 #40750（`partial` 下 duplicate / stale preview）
- Cron announce 输出问题：#40480（thinking/reasoning 泄露；announce 构造 summary）
- Kimi 工具调用回归（用户侧恢复）：#39907 #40069 #40396（字面 `exec({...})`、无限循环；回退到 2026.3.2）
- Control UI 身份/刷新回环：#40696（refresh 后 `device identity required`）
- Config 失误导致 crash loop / log spam：#40265 #40404（`config.patch` 写入非法 key、doctor 循环刷警告）
- Billing 错误状态缓存：#40226（充值后仍失败，restart 恢复）
- Nodes 探测导致 restart 变慢：#28143（paired node bin probe timeouts；`gateway.nodes.denyCommands`）

## 现状盘点（What already exists）

已存在并建议“补强”而非新建的页面：

- Telegram preview streaming：`/Users/sean/Programs/CoClaw/src/content/troubleshooting/solutions/telegram-preview-streaming-duplicate-or-flash.mdx`
- Cron announce summary：`/Users/sean/Programs/CoClaw/src/content/troubleshooting/solutions/cron-announce-sends-summary-instead-of-full-output.mdx`
- Config validation failed：`/Users/sean/Programs/CoClaw/src/content/troubleshooting/solutions/config-validation-failed.mdx`
- Control UI device identity required：`/Users/sean/Programs/CoClaw/src/content/troubleshooting/solutions/control-ui-device-identity-required.mdx`
- No response / rate limit：`/Users/sean/Programs/CoClaw/src/content/guides/openclaw-no-response-and-rate-limit-troubleshooting.mdx`
- OpenClaw only chats / no tools after update：`/Users/sean/Programs/CoClaw/src/content/troubleshooting/solutions/openclaw-only-chats-no-tools-after-update.mdx`
- Model 输出 tool-call 文本：`/Users/sean/Programs/CoClaw/src/content/troubleshooting/solutions/model-outputs-historical-context-tool-call-text.mdx`

## 内容 Backlog（Prioritized）

> 标注：`NEW`=新建页面；`UPDATE`=更新现有页面。每项都包含建议 slug、写作骨架、以及验收要点（Definition of Done）。

### P1（最高优先级：高频 + 强恢复路径）

1. `NEW` macOS LaunchAgent 恢复 Runbook

- 建议 slug：`/troubleshooting/solutions/macos-launchagent-restart-bootstrap-failed-5/`
- 覆盖 issues：#40659 #40737 #40776 #40195
- 核心内容骨架：
  - Symptoms：`Bootstrap failed: 5`、restart 后 not loaded、gateway 不自恢复
  - Cause：launchctl bootstrap/kickstart 行为、服务定义陈旧、Node 路径与 launchd PATH
  - Fix（按决策树）：
    - 服务已 loaded：优先 `launchctl kickstart -k gui/$(id -u)/ai.openclaw.gateway`
    - bootstrap 失败：`openclaw doctor` → `openclaw gateway install --force`
    - bare `node`：`command -v node` → 修 plist `ProgramArguments[0]`（或重装）
  - Verify：`openclaw gateway status` + 日志路径
  - Notes：SSH/headless GUI domain 限制提醒
- DoD：
  - 给出 2 条“最短恢复命令链”
  - 明确区分 “kickstart” vs “install --force” 的适用场景

2. `NEW` npm 版本切换导致安装损坏（missing dist chunks）

- 建议 slug：`/troubleshooting/solutions/npm-version-swap-missing-dist-chunks/`
- 覆盖 issues：#28146 #28206
- 核心内容骨架：
  - Symptoms：`Cannot find module ... dist/...chunk...js`；工具全部失效
  - Fix：`npm uninstall -g` → `npm install -g ... --force` → `openclaw gateway install --force` → restart
  - Verify：`openclaw doctor`、`openclaw health`
  - Notes：不要“仅覆盖安装”；不要先删 `~/.openclaw/`
- DoD：
  - 1 个最短恢复路径（latest）+ 1 个 pin 版本路径

3. `NEW` Compaction deadlock 应急恢复（out-of-band）

- 建议 slug：`/troubleshooting/solutions/compaction-deadlock-session-reset-manual-jsonl/`
- 覆盖 issues：#40295
- 核心内容骨架：
  - Symptoms：compaction timeout 后 `/new` `/reset` 也卡死；所有恢复命令排队
  - Why：session lane 单线程 + compaction 占用；in-band reset 不可用
  - Fix（应急）：
    - 停进程（强调“先备份”）
    - 重命名 session `.jsonl`
    - 重启 gateway；验证 channel 恢复
  - Prevention：避免巨型 toolResult；定期固化记忆；避免把 cron 输出写进主会话
- DoD：
  - 明确“何时必须 out-of-band”
  - 提供“备份优先”的命令示例（不暴露用户路径细节）

4. `UPDATE` Telegram preview streaming 页面补充 stale preview / duplicate 家族

- 目标文件：`/Users/sean/Programs/CoClaw/src/content/troubleshooting/solutions/telegram-preview-streaming-duplicate-or-flash.mdx`
- 覆盖 issues：#40746 #40750
- 重点补充：
  - `partial` 下 edit 失败后 duplicate 的解释
  - final reply 后 stale preview banner 重现的解释
  - Workaround：`streaming: "off"` / `"block"` + restart + fresh session
- DoD：
  - 页面里能直接匹配用户搜索词：`duplicate`、`stale preview`、`partial`

5. `UPDATE` Cron announce：从“摘要”扩展到“泄露 thinking”

- 目标文件：`/Users/sean/Programs/CoClaw/src/content/troubleshooting/solutions/cron-announce-sends-summary-instead-of-full-output.mdx`
- 覆盖 issues：#40480
- 重点补充：
  - announce pipeline 的风险：可能 summary + 可能泄露 reasoning
  - Workaround：`--no-deliver` + 任务内显式发送最终消息（message tool / webhook）
- DoD：
  - 给出 1 个“最稳交付策略”：禁用 announce + 显式发送

### P2（中优先级：常见但可挂靠现有指南）

6. `UPDATE` Custom provider / DashScope API Key 指南段落增强

- 候选位置：
  - `openclaw-configuration`（模型/自定义 provider 心智模型）
  - 或单独 `solution`：`dashscope-openai-compatible-api-key/`
- 覆盖 issues：#40617
- 重点补充：
  - `auth.profiles` vs `models.providers.*.apiKey` 的职责边界
  - `${ENV_VAR}` 写法 vs SecretRef 对象写法的兼容提示
  - “普通对话能用但工具调用报 No API key” 的环境/配置链路解释

7. `UPDATE` “Only chats / no tools after update” 增加“回退是更稳 workaround”的分支

- 目标文件：`/Users/sean/Programs/CoClaw/src/content/troubleshooting/solutions/openclaw-only-chats-no-tools-after-update.mdx`
- 覆盖 issues：#39907 #40069 #40396
- 重点补充：
  - 区分：policy（tools.profile）vs model/runtime regression（kimi）
  - 给出回退与替换模型的操作路径

8. `UPDATE` No response / rate limit：加入 billing 恢复“需要 restart”提示

- 目标文件：`/Users/sean/Programs/CoClaw/src/content/guides/openclaw-no-response-and-rate-limit-troubleshooting.mdx`
- 覆盖 issues：#40226
- 重点补充：
  - credits 恢复 != session 恢复；遇到 billing 错误后建议做一次 `gateway restart`

9. `UPDATE` Config validation failed：加入 `config.patch` crash loop 恢复与预防

- 目标文件：`/Users/sean/Programs/CoClaw/src/content/troubleshooting/solutions/config-validation-failed.mdx`
- 覆盖 issues：#40265 #40404
- 重点补充：
  - 非法 key 导致 crash loop：如何回退/修复 + `doctor --fix`
  - 为什么会 log spam：建议立刻修 key 而不是忽略

10. `UPDATE` Control UI pairing/auth：刷新后 `device identity required` 的排查顺序

- 目标文件：`/Users/sean/Programs/CoClaw/src/content/guides/control-ui-auth-and-pairing.mdx`
- 覆盖 issues：#40696
- 重点补充：
  - “本地 URL/HTTPS/隧道”优先级
  - `devices approve` 的最短路径

11. `NEW` Nodes 探测导致 restart 慢（可选）

- 建议 slug：`/troubleshooting/solutions/macos-paired-node-probe-slows-restart/`
- 覆盖 issues：#28143
- 核心内容：
  - 现象：restart/shutdown 被 remote bin probe 卡住
  - Workaround：`gateway.nodes.denyCommands`（列出最小 deny list）

### P3（低优先级：偏产品/研发，站点不一定要承载）

以下更像 feature 或需要源码修复，站点可仅在“相关页面”里做轻量提示，不建议单开 solution：

- #40471（auth-profiles.json 并发写入损坏）——需要上游原子写修复
- #40475（Feishu 线程 reply 视为 implicit mention 的开关）——更像功能需求
- #28142（降级后 warning spam）——低严重，可能只需 release notes

## 交付顺序建议（Execution Order）

1. 先做 2 篇新 `solution`（macOS LaunchAgent + npm 安装损坏）→ 能立刻降低大量 issue 回帖成本
2. 再做 1 篇新 `solution`（compaction deadlock 应急恢复）→ 强“事故手册”价值
3. 补强 Telegram preview streaming + Cron announce 两篇既有页
4. 最后补配置/控制台/模型回退等“指南增强”

## 验收清单（DoD Checklist）

- 每个新增/更新页面都包含：
  - Symptoms / Cause / Fix / Verify / Related（或等价结构）
  - 至少 1 条“最短恢复路径”（1–2 步为主）
  - 1–2 个站内 related links（guide/solution）
  - `errorSignatures` / `keywords` 覆盖常用搜索词
- 站点构建通过：`pnpm build`
- 搜索可命中：用页面 `errorSignatures` 里的 token 在 pagefind 搜索可找到
