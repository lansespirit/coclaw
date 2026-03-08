# 任务 07：撰写《OpenClaw 安全架构蓝图》

## 执行状态

- 状态：已完成
- 完成日期：2026-03-08
- 输出位置：`src/content/blog/openclaw-security-architecture-blueprint.mdx`
- 输出集合：`blog`

## 任务使命

基于 Reddit 上持续不断的安全讨论，以及站内已有安全内容，产出一篇更上层的安全架构蓝图文章。

## 目标读者

已接受 OpenClaw 很强但有风险，希望系统设计而不是零碎打补丁的用户。

## 任务类型

内容创作任务。该任务将分配给 sub-agent 执行，目标是产出一篇可以进入 CoClaw 内容体系的高质量英文稿件。

## 你要先理解的站点上下文

在动笔前，先快速阅读并吸收以下内部材料，避免重复写已有内容，并确保新稿件能自然融入 CoClaw 现有结构：

- 站点内容索引：`docs/kb/coclaw-site-pages.md`
- 总体规划：`docs/plans/openclaw-content-plan-community-topics-2026-03-08.md`
- 首页定位：`src/pages/index.astro`
- 资源页定位：`src/pages/resources.astro`
- Guides 栏目定位：`src/pages/guides/index.astro`

如果主题与现有内容高度相邻，请额外阅读该主题对应的已有文章，明确：

- 现有文章已经回答了什么
- 社区新讨论真正新增了什么
- 你的稿件应该补足哪个空白

## 创作目标

- 不是简单复述 Reddit/GitHub 帖子，而是把真实社区讨论提炼为对用户有帮助的结构化内容。
- 优先回答用户在实践中真正要做决策的问题，而不是写泛泛趋势评论。
- 写作时要兼顾：问题定义、方案拆解、适用边界、风险提醒、行动建议。
- 文章要能独立成立，即使读者没看过原帖，也能获得完整认知。

## 研究方法要求

- 必须回到真实讨论源头，至少核对任务里提供的 Reddit / GitHub 链接。
- 如需要补充背景，可继续查找同主题下的更多 Reddit 帖子、GitHub issues、README 或官方文档。
- 不要只看标题；至少理解贴文正文、关键评论或 issue 描述中的真正争议点。
- 如果发现任务中的讨论信号已经变化，保留“截至当前日期”的表述，并在正文中解释变化。

## 写作要求

- 语言：英语（English）。
- 最终交付的标题、description、正文、图注与小结都必须使用英文。
- 语气：专业、克制、面向实践，不做夸张营销。
- 结构：开头先给出核心判断，再进入分节展开。
- 每一节都要有信息密度，避免空泛小标题。
- 尽量使用对比、场景、清单、架构图式描述，帮助读者做决策。
- 必须明确写出“不适合”“不建议”“常见误区”“风险边界”。
- 如果文章涉及配置、部署或安全建议，优先给出原则与判断框架，不必伪造未经验证的具体命令。

## 不要这样写

- 不要写成社区八卦或单纯新闻摘要。
- 不要把 Reddit 评论原样堆砌成正文。
- 不要重复站内已经写透的安装步骤，除非该步骤与主题强相关且存在新的社区变化。
- 不要编造不存在的官方能力、版本行为或产品路线图。
- 不要把文章写成“万能指南”；要明确适用读者和适用前提。

## 结果预期

请产出一份可以直接进入站内内容流程的英文稿件草案，至少应包含：

1. 一个明确、可发布的英文标题
2. 一段可用于 frontmatter 的 description
3. 建议的栏目归属（`guides` 或 `blog`）
4. 建议的 slug
5. 正文完整初稿
6. 文末“相关内容 / 可内链页面”建议
7. 引用的主要外部来源清单

## 建议输出格式

建议直接输出为英文 Markdown / MDX 草稿，结构如下：

```md
---
title: '...'
description: '...'
category: '...'
difficulty: 'beginner|intermediate|advanced'
publishDate: 2026-03-08
lastUpdated: 2026-03-08
---

# Title

## What This Article Answers

...
```

## 质量验收标准

只有同时满足以下条件，才算完成：

- 能清楚说明这个主题为什么会成为社区热点
- 能明确指出现有站内内容没有覆盖、或没有系统覆盖的部分
- 能为读者提供判断框架，而不仅仅是信息汇总
- 能自然链接到 CoClaw 已有内容体系
- 读完后，用户知道下一步该怎么选、怎么做、或至少该避免什么

## 需要重点阅读的内部材料

- `src/content/guides/openclaw-skill-safety-and-prompt-injection.mdx`
- `src/content/guides/new-user-checklist.mdx`
- `src/content/blog/openclaw-security-privacy-nightmare.mdx`

## 必须核对的外部讨论与信号

- https://www.reddit.com/r/selfhosted/comments/1qwn5i9/selfhosting_openclaw_is_a_security_minefield/
- https://www.reddit.com/r/selfhosted/comments/1r9yrw1/if_youre_selfhosting_openclaw_heres_every/
- https://www.reddit.com/r/sysadmin/comments/1rg2kc1/openclaw_is_going_viral_as_a_selfhosted_chatgpt/
- https://www.reddit.com/r/openclaw/comments/1rn6h7n/useless_with_all_the_security_hardening/

## 必须回答的问题

- 把安全讨论从“注意风险”提升到“如何设计一套可用且可控的运行模型”。
- 至少区分个人实验环境、家庭常驻环境、团队/公司环境三种安全模型。
- 讨论最小权限、网络隔离、能力分级、出网控制、确认机制、审计与日志。
- 回答“安全加固会不会让 OpenClaw 失去意义”这个真实疑问。
- 避免和现有安全文章重复，要更强调架构蓝图。

## 建议切入角度

高权重 pillar page。

## 交付预期

一篇 3000-4500 字的深度文。

## 额外提示

- 如果你发现更好的标题，可以微调标题，但不能偏离任务核心。
- 如果你发现现有站内内容已经覆盖了某一部分，请把你的重点放在“新增社区信号”和“更系统的判断框架”上。
- 如果引用外部来源，请控制引用长度，优先用自己的话总结。
- 如果任务更适合写成 `blog` 而不是 `guides`，请在 frontmatter 和正文开头明确说明理由。
