# OpenClaw AI API 兼容性内容更新与新增计划

更新时间：2026-03-09

## 目标

基于 GitHub、Reddit 与 OpenClaw 社区近期反复出现的真实问题，制定一套面向 CoClaw 的内容更新与新增计划，系统覆盖以下高频场景：

- OpenAI-compatible API
- 自定义 provider
- 本地 Ollama / llama.cpp / vLLM
- LiteLLM / NewAPI / OneAPI / AnyRouter 等代理层
- “`curl` 能通但 OpenClaw 不能跑”
- “`models status --probe` 通过但真实 agent 失败”
- tools / streaming / reasoning / store 等字段级兼容性问题

这份计划的目的不是立即产出正文，而是先把 **P0–P3 的内容动作、页面边界、优先级、内部链接与执行顺序** 固化到仓库中，避免遗漏与重复选题。

---

## 核心判断

过去很多“AI API 接不通”的站内内容，主要解决的是：

- `baseUrl` 配错
- `api` 模式选错
- API key 不在 gateway 主机上
- 模型 ref 写错
- 代理路径多了/少了 `/v1`

这些问题仍然存在，但从 2026-03 这轮社区信号看，用户更频繁撞上的已经是下一层问题：

> **后端号称 OpenAI-compatible，但只兼容基础 chat/completions，不兼容 OpenClaw 运行态附带的 payload。**

更具体地说，用户踩坑越来越集中在这些字段/行为上：

- `tools`
- `tool_choice`
- `parallel_tool_calls`
- `reasoning_effort`
- `store`
- `stream: true`
- tool result / tool role / tool call id 的兼容性
- 本地模型 chat template 与工具消息角色不兼容

这类问题的典型用户感知不是“配置文件无效”，而是：

- `curl` 成功，但 OpenClaw 失败
- `openclaw models status --probe` 成功，但 `openclaw agent` / TUI 失败
- 普通对话能跑，一旦启用工具或 reasoning 就报错
- 同一个模型在 OpenWebUI / Playground 里正常，在 OpenClaw 里 400 / 422 / 空回复

这说明站内现在最需要补的，不是又一篇泛化安装教程，而是 **“兼容性分层认知 + 字段级排障”**。

---

## 调研范围

### 外部信号来源

#### GitHub（OpenClaw 自身）

- `openclaw/openclaw#38902`：本地 Qwen / OpenAI-compatible `/v1/chat/completions`，`curl` 成功但实际 agent 422
- `openclaw/openclaw#33272`：`reasoning_effort` 注入到不支持的自定义端点
- `openclaw/openclaw#24815`：`openai-completions` 路径无法关闭 `stream: true`
- `openclaw/openclaw#25100`：tool result 后续请求在 `openai-completions` 兼容路径失败
- `openclaw/openclaw#22704`：Google OpenAI-compatible 端点不支持 `store`
- `openclaw/openclaw#16151`：自定义 `openai-completions` provider 空回复 / 没有发出预期请求
- `openclaw/openclaw#27406`：llama.cpp 对 tool-use 相关消息角色不兼容
- `openclaw/openclaw#34134`：配置切成 `openai-completions` 后实际契约/行为不符合预期

#### GitHub（更广泛生态）

- `ollama/ollama#12159`：`parallel_tool_calls` / OpenAI 兼容工具调用边缘兼容问题
- `ollama/ollama#9802`：OpenAI-compatible tool calling 与本地行为差异
- `vllm-project/vllm#7912`：tool calling / OpenAI-compatible 兼容问题
- `vllm-project/vllm#16340`：并行工具调用 / 流式工具调用等兼容边缘
- `BerriAI/litellm#14654`：代理层透传模型参数/能力时的行为差异
- `BerriAI/litellm#15233`：OpenAI-compatible 语义与下游模型能力不完全一致

#### Reddit（用户表述层）

- `r/ollama`：Qwen / tool calling / OpenAI-compatible 路径不稳定
- `r/LocalLLaMA`：本地 function calling / tool calling 成功率与协议兼容性问题
- `r/OpenWebUI`：Ollama / OpenAI-compatible 模式下 agent 工具调用异常
- `r/LangChain`：本地 agent + tools 不是“提示词问题”，而是模型/协议/模板三重兼容问题

### 站内对照范围

- `src/content/guides/openclaw-relay-and-api-proxy-troubleshooting.mdx`
- `src/content/guides/openclaw-configuration.mdx`
- `src/content/guides/openclaw-no-response-and-rate-limit-troubleshooting.mdx`
- `src/content/troubleshooting/solutions/ollama-configured-but-falls-back-to-anthropic.mdx`
- `src/content/troubleshooting/solutions/tui-no-output-after-send.mdx`
- `src/content/troubleshooting/solutions/models-all-models-failed.mdx`
- `src/content/troubleshooting/solutions/moonshot-kimi-china-endpoint.mdx`
- `src/content/troubleshooting/solutions/venice-models-empty-or-no-api-calls.mdx`

---

## 现有站内覆盖总结

### 已有覆盖较强的部分

#### 1) 基础接入与配置路径

已覆盖：

- `api` 模式怎么选
- `baseUrl` 如何避免 `/v1/v1`
- config precedence / gateway 实际读的是哪份配置
- API key 是否真的存在于 gateway runtime
- 模型 ref / provider prefix 怎么写

对应页面：

- `src/content/guides/openclaw-relay-and-api-proxy-troubleshooting.mdx`
- `src/content/guides/openclaw-configuration.mdx`

#### 2) 泛化 no output / models failed / auth 失败

已覆盖：

- 探活命令
- auth 缺失
- fallback 设置
- TUI 空白回复的基础排查

对应页面：

- `src/content/troubleshooting/solutions/tui-no-output-after-send.mdx`
- `src/content/troubleshooting/solutions/models-all-models-failed.mdx`

#### 3) 若干 provider-specific 案例

已覆盖：

- Ollama 被 Anthropic fallback 覆盖
- Moonshot 端点区域问题
- Venice 鉴权 / 网络 / catalog 问题

对应页面：

- `src/content/troubleshooting/solutions/ollama-configured-but-falls-back-to-anthropic.mdx`
- `src/content/troubleshooting/solutions/moonshot-kimi-china-endpoint.mdx`
- `src/content/troubleshooting/solutions/venice-models-empty-or-no-api-calls.mdx`

### 明显缺口

当前站内内容缺少以下层次：

#### A. “连通”与“兼容”之间的分层解释

站内已有内容大量停留在：

- 能不能连上 endpoint
- key 对不对
- model ref 对不对

但没有系统讲清：

- **连通成功 ≠ 运行时 payload 兼容**
- `curl` 成功 ≠ OpenClaw agent 成功
- `models status --probe` 成功 ≠ 工具/多轮/推理都能成功

#### B. 字段级兼容性 cookbook

缺少一套面向真实兼容后端的判断框架：

- 如果后端拒绝 `tools`，该怎么降级
- 如果后端拒绝 `reasoning_effort`，该怎么处理
- 如果后端拒绝 `store`，用户该看哪里
- 如果后端不能流式，为什么 probe 过了但 agent 挂了
- 如果 tool result role / tool ids / chat template 不兼容，该如何识别

#### C. 本地 API 形态的横向比较

缺少一篇把这些路径放在一起解释的 evergreen 页面：

- Ollama native API
- Ollama `/v1` OpenAI-compatible
- llama.cpp OpenAI-compatible server
- vLLM OpenAI-compatible
- LiteLLM 作为代理

当前用户很容易把它们都归类为“OpenAI-compatible”，但它们在 tools / streaming / reasoning / tool-role 处理上完全不是一回事。

#### D. 针对高频新报错的精确 solution 页面

当前缺少明确命中以下搜索意图的页面：

- `curl works but OpenClaw fails`
- `probe works but agent fails`
- `custom openai-compatible endpoint rejects tools`
- `unsupported reasoning_effort / store / stream`
- `llama.cpp unexpected message role`

---

## 内容动作总览

本计划按 P0–P3 执行。

### P0：更新已有高相关页面

目标：在不新增大量页面之前，先把最容易承接现有搜索流量的高相关内容补强。

### P1：新增问题导向的 solution 页面

目标：承接长尾搜索词与具体报错场景，解决“用户有强症状，但现有页面太泛”的问题。

### P2：新增 evergreen 枢纽页面

目标：形成长期可引用的判断框架，减少后续新增 solution 时的解释成本。

### P3：信息架构与互链优化

目标：让用户能从任一入口跳到正确的兼容性排障路径，而不是在多篇相近文章间迷路。

---

## P0：已有页面更新计划

### P0-1 更新 `openclaw-relay-and-api-proxy-troubleshooting`

文件：

- `src/content/guides/openclaw-relay-and-api-proxy-troubleshooting.mdx`

更新目标：

- 从“接入 relay / proxy 的通用排障”升级为“接入成功后如何判断兼容层级”

新增小节建议：

1. **Why curl success does not prove agent compatibility**
2. **Why `models status --probe` can pass while real runs fail**
3. **Common unsupported payload fields on OpenAI-compatible endpoints**
4. **A quick downgrade path for flaky custom providers**

必须补入的知识点：

- probe 默认更像“最小请求”，真实 agent 会附带更多运行态 payload
- 自定义兼容后端最常见失败字段：`tools`、`tool_choice`、`parallel_tool_calls`、`reasoning_effort`、`store`、`stream`
- 应当明确告诉用户：**兼容性不是单一开关，而是分层的**

建议加入的配置示例：

- `compat: { supportsTools: false }`
- “先把 provider 当纯聊天端点处理”的保守降级思路

主要承接搜索意图：

- openclaw openai compatible proxy issues
- curl works but openclaw fails
- openclaw relay tools unsupported

### P0-2 更新 `openclaw-configuration`

文件：

- `src/content/guides/openclaw-configuration.mdx`

更新目标：

- 新增一节 **Custom OpenAI-compatible provider compatibility cookbook**

新增内容建议：

1. 自定义 provider 最小可用模板
2. 什么情况下应该把它视为“纯聊天兼容端点”
3. 如何理解 `reasoning`、`compat.*` 与真实后端支持之间的关系
4. 如何判断是“配置问题”还是“payload 问题”

应补入的关键词：

- OpenAI-compatible
- custom provider
- supportsTools
- reasoning
- stream

### P0-3 更新 `tui-no-output-after-send`

文件：

- `src/content/troubleshooting/solutions/tui-no-output-after-send.mdx`

更新目标：

- 把泛化 TUI 问题拆出一个明确分支：**probe 过了但真实对话失败**

新增内容建议：

1. 如果 `models status --probe` 成功，但 TUI 发送消息仍然空白或报错
2. 先判断是否是 provider runtime payload mismatch
3. 给出最小行动顺序：看 logs → 换新 session → 用更保守 provider 配置重试

### P0-4 更新 `ollama-configured-but-falls-back-to-anthropic`

文件：

- `src/content/troubleshooting/solutions/ollama-configured-but-falls-back-to-anthropic.mdx`

更新目标：

- 明确区分以下两件事：
  - OpenClaw 是否真的选中了 Ollama
  - 选中后是否真的兼容 agent / tools / 多轮工具调用

新增内容建议：

1. 明确写出：Ollama native API 与 `/v1` OpenAI-compatible 不等价
2. 明确写出：即便 `/v1` 能聊天，tool calling 也可能不稳定
3. 加强与总览页的互链

---

## P1：新增 solution 页面计划

### P1-1 `API works in curl, but OpenClaw still fails`

建议位置：

- `src/content/troubleshooting/solutions/api-works-in-curl-but-openclaw-fails.mdx`

定位：

- 这是本轮最值得优先新增的页面

核心要回答的问题：

- 为什么 `curl` 的最小请求成功，但 OpenClaw 真实运行失败？
- 为什么 `probe` 成功仍不能证明 tools / reasoning / streaming 兼容？

建议覆盖：

- `curl`、probe、真实 agent 三种请求层级
- endpoint 连通 vs payload 兼容
- 常见失败字段速查
- 如何采集有价值的服务端日志

目标关键词：

- curl works but openclaw fails
- probe works agent fails
- openclaw custom provider 422

### P1-2 `Custom OpenAI-compatible endpoint rejects tools or tool_choice`

建议位置：

- `src/content/troubleshooting/solutions/custom-openai-compatible-endpoint-rejects-tools.mdx`

核心要回答的问题：

- 为什么普通聊天能跑，但一开 tools 就失败？
- 为什么后端会拒绝 `tool_choice` / `parallel_tool_calls` / tool result？

建议覆盖：

- `tools`
- `tool_choice`
- `parallel_tool_calls`
- tool result 多轮兼容性
- 先降级成纯聊天 provider 的实操思路

### P1-3 `Custom provider fails only when reasoning is enabled`

建议位置：

- `src/content/troubleshooting/solutions/custom-provider-reasoning-breaks-openai-compatible.mdx`

核心要回答的问题：

- 为什么 reasoning 关闭时正常，开启后就报错？
- 为什么 `reasoning: true` 与“这个 endpoint 接受 `reasoning_effort`”不是同一件事？

建议覆盖：

- `reasoning_effort`
- thinking / reasoning 的协议差异
- 某些代理把 reasoning 映射到其他底层模型协议后的副作用

### P1-4 `OpenAI-compatible endpoint rejects stream or store`

建议位置：

- `src/content/troubleshooting/solutions/openai-compatible-endpoint-rejects-stream-or-store.mdx`

核心要回答的问题：

- 为什么后端报 `unknown field store`
- 为什么有些兼容端点不接受 `stream: true`
- 为什么错误信息常常表现为“no body”或“empty reply”

建议覆盖：

- `store`
- `stream`
- 压缩返回体 / 错误体不易解码时的现象

### P1-5 `Local llama.cpp, Ollama, and vLLM tool-calling compatibility`

建议位置：

- `src/content/troubleshooting/solutions/local-openai-compatible-tool-calling-compatibility.mdx`

核心要回答的问题：

- 为什么本地模型聊天正常，但 agent / tools 不稳定？
- 为什么同一个模型在 OpenWebUI 能跑，在 OpenClaw 里会报 tool role / template 错误？

建议覆盖：

- llama.cpp chat template
- Ollama native vs `/v1`
- vLLM 的 OpenAI-compatible 支持边界
- “模型支持工具调用”与“服务端协议完整支持工具调用”之间的差异

---

## P2：新增 evergreen 枢纽页面计划

### P2-1 `Self-hosted AI API compatibility matrix for OpenClaw`

建议位置：

- `src/content/guides/self-hosted-ai-api-compatibility-matrix.mdx`

定位：

- 这是整组内容的长期中枢页

建议结构：

1. What “OpenAI-compatible” really means
2. Compatibility layers
3. Matrix by backend type
4. Matrix by feature
5. Safe defaults and downgrade strategy

建议矩阵维度：

- backend 类型：Ollama native / Ollama `/v1` / llama.cpp / vLLM / LiteLLM / NewAPI / OneAPI / AnyRouter
- feature 维度：basic chat / images / tools / tool results / parallel tools / reasoning params / stream / usage / strict schema

目标作用：

- 成为多个 solution 页的统一引用目标
- 降低后续每篇文章重复解释协议差异的成本

### P2-2 `How to choose between native Ollama, OpenAI-compatible /v1, vLLM, and LiteLLM`

建议位置：

- `src/content/guides/choose-local-ai-api-path-for-openclaw.mdx`

定位：

- 面向“我该选哪条本地/自托管 API 路径”的决策型文章

要回答的问题：

- 什么时候优先用 Ollama native
- 什么时候必须用 `/v1`
- 什么时候适合引入 LiteLLM 作为治理层
- 什么时候 vLLM 更适合而不是 Ollama

这篇文章的重点不是安装，而是：

- 功能边界
- 风险边界
- 与 OpenClaw 的适配成本

---

## P3：信息架构与互链优化计划

### P3-1 建立专题级互链

建议动作：

- 在所有相关 solution / guide 页统一加一个“AI API Compatibility”相关区块
- 让用户能在以下入口间跳转：
  - 接入总览
  - compatibility matrix
  - 问题导向 solution
  - 本地 API 选型页

### P3-2 在 troubleshooting 聚合页强化主题入口

建议动作：

- 新增一个面向 AI API 兼容性问题的聚类入口

建议文案方向：

- Custom / local AI API compatibility
- OpenAI-compatible endpoints
- Tools / reasoning / streaming mismatches

### P3-3 统一术语与关键词

建议统一补充到相关页面 frontmatter / 正文中的词汇：

- OpenAI-compatible
- custom provider
- local model
- Ollama `/v1`
- vLLM
- LiteLLM
- tools
- tool calling
- reasoning
- streaming
- probe

### P3-4 统一“排障动作顺序”

所有相关页面尽量统一采用以下顺序：

1. 验证 endpoint / auth / model ref
2. 验证 `curl`
3. 验证 `openclaw models status --probe`
4. 验证真实 `openclaw agent` / TUI
5. 判断是否为 tools / reasoning / stream payload mismatch
6. 采集服务端最终请求体字段或更完整日志

---

## 建议执行顺序

### 第一阶段：先做 P0

优先原因：

- 现有页面已经有权重与内链
- 更新成本低
- 最快能改善“已有流量却答不到新问题”的情况

建议顺序：

1. `openclaw-relay-and-api-proxy-troubleshooting`
2. `openclaw-configuration`
3. `tui-no-output-after-send`
4. `ollama-configured-but-falls-back-to-anthropic`

### 第二阶段：做 P1 中最强症状页

建议顺序：

1. `api-works-in-curl-but-openclaw-fails`
2. `custom-openai-compatible-endpoint-rejects-tools`
3. `custom-provider-reasoning-breaks-openai-compatible`
4. `openai-compatible-endpoint-rejects-stream-or-store`
5. `local-openai-compatible-tool-calling-compatibility`

### 第三阶段：补 P2 中枢页

建议顺序：

1. `self-hosted-ai-api-compatibility-matrix`
2. `choose-local-ai-api-path-for-openclaw`

### 第四阶段：完成 P3 架构整理

---

## 每篇页面的成功标准

只有满足以下条件，才算这组计划执行到位：

### 内容层面

- 不再把“OpenAI-compatible”当成单一能力标签
- 明确解释“连通成功”与“兼容成功”的区别
- 给出用户能执行的降级路径与判断顺序
- 不把所有问题都归因到 `baseUrl` / key / 版本太旧

### SEO / 搜索承接层面

- 能覆盖 `curl works but ...` / `probe works but ...` / `tool calling fails` / `reasoning fails` / `stream true` / `store unsupported` 一类自然搜索表达
- 新旧页面互链清晰，不会各自孤立

### 产品认知层面

- 用户读完后知道该把问题归类为：
  - 配置错误
  - 网络/鉴权问题
  - payload 兼容问题
  - 本地服务 / chat template / tools 协议边界问题

---

## 本计划对应的执行任务拆分建议

如果后续继续在 `docs/plans/tasks-*` 中拆成子任务，建议拆法如下：

1. **任务 A：P0 页面补强**
2. **任务 B：P1 症状型 solution 页面组**
3. **任务 C：P2 compatibility matrix 与决策指南**
4. **任务 D：P3 互链、关键词与 troubleshooting 入口整理**

---

## 备注

这份计划的重点不是“继续写更多 provider 指南”，而是：

- 把 **AI API 接入问题** 从“配置题”升级为“兼容性题”来组织内容
- 把 **字段级兼容问题** 从 issue 评论里提炼成可检索、可复用的站内资产
- 让 CoClaw 在这类问题上形成比官方文档更实用的内容优势

后续正式落地时，建议优先采用真实 issue / Reddit 场景作为文章开头的症状钩子，但正文必须回到结构化判断框架，而不是简单拼贴社区案例。
