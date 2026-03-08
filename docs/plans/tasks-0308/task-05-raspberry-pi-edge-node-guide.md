# 任务 05：撰写《树莓派跑 OpenClaw》

## 执行状态

- 状态：已完成
- 完成日期：2026-03-08
- 输出位置：`src/content/guides/openclaw-on-raspberry-pi.mdx`
- 输出集合：`guides`

## 任务使命

围绕 Raspberry Pi 与边缘设备部署 OpenClaw 的社区讨论，写一篇偏选型与部署策略的文章。

## 目标读者

想把 OpenClaw 放到低功耗常驻节点上的用户。

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

- `src/content/guides/docker-deployment.mdx`
- `src/content/guides/openclaw-cron-and-heartbeat-24x7.mdx`
- `src/content/guides/openclaw-browser-automation-timeouts.mdx`

## 必须核对的外部讨论与信号

- https://www.reddit.com/r/openclaw/comments/1rj7mon/running_openclaw_on_raspberry_pi_5_with_telegram/
- https://www.reddit.com/r/openclaw/comments/1rede8s/selfhosting_a_secure_openclaw_setup_on_a_pi/
- https://www.reddit.com/r/openclaw/comments/1ri40vo/my_openclaw_setup_on_a_raspberry_pi_is_basically/

## 必须回答的问题

- 回答“树莓派到底够不够用”这个核心问题。
- 区分适合放在 Pi 上的能力和不适合的能力。
- 比较 Pi、NAS、Mac mini、小主机的使用边界。
- 加入安全隔离、可维护性、浏览器自动化负担等现实问题。
- 避免写成单纯硬件吹捧文。

## 建议切入角度

选型 + 运行模式判断。

## 交付预期

一篇 2200-3500 字的 guide / comparison 文。

## 额外提示

- 如果你发现更好的标题，可以微调标题，但不能偏离任务核心。
- 如果你发现现有站内内容已经覆盖了某一部分，请把你的重点放在“新增社区信号”和“更系统的判断框架”上。
- 如果引用外部来源，请控制引用长度，优先用自己的话总结。
- 如果任务更适合写成 `blog` 而不是 `guides`，请在 frontmatter 和正文开头明确说明理由。
