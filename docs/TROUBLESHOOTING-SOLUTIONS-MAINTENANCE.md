# Troubleshooting Solutions 维护规范

本文定义 CoClaw 的 Troubleshooting **Solutions** 如何持续更新：保证内容可维护、可搜索、且避免与 GitHub 页面重复（SEO 友好）。

## 0) 名词解释（哪些发布、哪些只做输入）

- **Solution（发布）：** 我们整理后的“可落地解决方案”页面（Symptoms → Cause → Fix → Verify → Related）。存放在 `src/content/troubleshooting/solutions/*.mdx`。
- **Case（内部草稿/研究）：** 从 issue 抽取的草稿记录，用于聚类与选题，不对外发布（`kind: case`, `draft: true`）。
- **GitHub issues/discussions（仅输入）：** 只作为研究素材，不对外镜像，不在站点主流程里推广（避免重复内容与 SEO 内耗）。

## 1) 数据刷新（GitHub -> 本地数据集）

### 1.1 拉取内容范围

我们从 `openclaw/openclaw` 通过 GitHub REST API 同步：

- issue 列表（排除 PR）
- issue body + labels + 元数据
- issue **comments**（评论正文 + 元数据），用于更准确理解根因与聚类

输出文件：

- `src/data/openclaw/openclaw-issues.json`

### 1.2 执行方式

```bash
pnpm sync:issues
```

推荐环境变量：

- `GITHUB_TOKEN`（强烈建议；避免未登录的低 rate limit）

可选参数：

- `OPENCLAW_ISSUES_MAX`（默认 500）
- `OPENCLAW_ISSUES_INCLUDE_COMMENTS`（默认 `1`；设为 `0` 可跳过 comments 以加速）
- `OPENCLAW_ISSUES_COMMENTS_CONCURRENCY`（默认 6）
- `OPENCLAW_ISSUES_COMMENTS_MAX_PER_ISSUE`（默认 50；设为 `0` 表示保存全部评论）

注意：

- comments 同步是 API 密集操作；如果触发 rate limit，降低并发和/或减小 `OPENCLAW_ISSUES_MAX`。
- 该数据集为**内部研究用途**，不等于对外内容。

## 2) 分析（从原始 issues 得到选题与写作 backlog）

执行：

```bash
pnpm analyze:issues
```

输出：

- `docs/TROUBLESHOOTING-ISSUE-ANALYSIS.md`（人类可读：Top patterns + 示例）
- `src/data/openclaw/issue-analysis.json`（机器可读：用于后续工具/脚本）

分析规则：

- 统计口径覆盖 **title + body + comments**（如 comments 可用）。
- 示例优先选择评论更多的 issues（通常更代表真实问题与可复现路径）。

## 3) 草稿生成（可选，内部用）

用于快速产出“case 草稿”以便人工整理：

```bash
pnpm generate:troubleshooting-stubs
```

约束：

- 生成内容必须为 `kind: case` 且 `draft: true`
- Case 不发布（构建路由只包含 `kind: solution`）

## 4) 写作规范（Solution 页面）

### 4.1 路径与路由

- 每条 solution 一个文件：
  - `src/content/troubleshooting/solutions/<slug>.mdx`
- 对外路由：
  - `/troubleshooting/solutions/<slug>/`

### 4.2 Frontmatter 规范（必填/推荐）

必填：

- `title`（面向用户，问题优先）
- `description`（一句话说明“解决什么”）
- `kind: "solution"`
- `component`（主归类；尽量稳定）
- `severity`（`low|medium|high|critical`）
- `publishDate`（首次发布时间）
- `lastUpdated`（每次实质更新都要改）
- `layout: ../../../layouts/TroubleshootingLayout.astro`

强烈推荐：

- `os: []`（确实 OS 相关才填）
- `channel: []`（确实渠道相关才填：telegram/whatsapp/discord/slack/signal/...）
- `errorSignatures: []`（用户可复制粘贴的报错片段，用于搜索命中）
- `keywords: []`（SEO；不要堆词）
- `related.githubIssues: []`（仅写 issue number；作为来源，不做镜像）
- `related.docs: []`（OpenClaw 官方文档链接）

### 4.3 正文结构（强制标题顺序）

每篇 solution 必须包含以下标题，且顺序固定：

1. `## Symptoms`
2. `## Cause`
3. `## Fix`
4. `## Verify`
5. `## Related`（可选但建议）

### 4.4 errorSignatures 规则（避免重复与误命中）

`errorSignatures` 只放“决定性文本”（用户贴日志时能强命中）。

规则：

- 优先放稳定 token/短语：
  - 例如：`EACCES`、`spawn git ENOENT`、`setMyCommands failed`
- 避免放含义过宽的码：
  - 例如单独 `1008` 会同时命中 pairing/unauthorized/device identity；应写完整原因字符串（如 `pairing required`）。
- 控制长度：3–8 个为宜；只在能提升搜索召回时才添加。

### 4.5 内容质量规则（长期可维护）

- 不能把 GitHub issue 讨论直接搬进来当 solution（最多引用事实/症状，不能镜像线程）。
- 页面必须可独立解决问题：不跳转也能修复（Related 只是补充）。
- 面向普通用户：优先给 `openclaw ...` 级别命令与清晰解释。
  - 除非确实是 Docker build 场景，否则避免在正文中出现构建/开发命令（如 `pnpm ...`）。
- 配置示例要“最小可用”，并明确“要改哪一行/哪一个字段”。
- 必须给出可验证步骤（Verify：什么表现代表修好了）。

## 5) 可见性与 SEO 策略

- Solutions 对外可索引。
- Issues Explorer / 原始 issues 页面仅内部使用，不在站内主流程推广：
  - Solutions 或 Troubleshooting 主流程中不要链接 `/troubleshooting/issues`
  - 保持 `noindex` + sitemap 排除（当前已做）

## 6) 发布流程（合并前 checklist）

新增/更新 solution 合并前必须检查：

1. `kind: "solution"` 且 `draft: false`（或不填，默认 false）
2. 标题结构完整（Symptoms/Cause/Fix/Verify）
3. `errorSignatures` 不要过宽、不要引入明显歧义
4. 更新 `lastUpdated`（新文章才设置 `publishDate`）
5. 本地执行：
   - `pnpm build`
6. 自测：
   - 页面能正常渲染（`/troubleshooting/solutions/<slug>/`）
   - Pagefind 能搜到（用某个 `errorSignatures` 的 token 搜索验证）

## 7) 推荐维护节奏

- 每周（或每次 OpenClaw 大版本更新后）：
  - `pnpm sync:issues`
  - `pnpm analyze:issues`
  - 从 Top patterns 里挑 3–5 个高频问题：新增/更新 solutions

- 当 solution 过期：
  - 更新 Fix 步骤
  - 必要时补 `affectedVersions` 并更新 `lastUpdated`
  - 在 Cause 中简短说明“为什么旧办法失效”（版本/默认值变化等）
