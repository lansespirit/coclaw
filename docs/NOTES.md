# 注意事项（开发与集成）

本文用于集中记录项目搭建/集成过程中的“坑”和约束，避免后续重复踩雷。

## HeroUI + Astro

- **Astro + React 集成必须启用**：确保 `@astrojs/react` 已安装且在 `astro.config.mjs` 中启用。
- **HeroUI 依赖**：`@heroui/react` 需要配套 `framer-motion`（已在 `package.json` 中依赖）。
- **.astro 中使用 HeroUI 组件要加客户端指令**：例如 `<Button client:visible />`，否则部分交互/功能可能不正常。

## pnpm（HeroUI hoist）

- **必须配置 hoist**：使用 pnpm 时，按 HeroUI 文档在 `/.npmrc` 添加：
  - `public-hoist-pattern[]=*@heroui/*`
    否则可能出现模块解析/运行期异常（HeroUI 相关包未被提升到根 `node_modules`）。
- **改完 .npmrc 需要重装**：修改后需重新执行 `pnpm install`，确保依赖安装位置正确。

## Tailwind CSS（HeroUI 插件）

- **Tailwind v4**：HeroUI 基于 Tailwind（本项目使用 Tailwind v4 + `@tailwindcss/vite`）。
- **必须启用 heroui() 插件**：在 `/tailwind.config.cjs` 中通过 `const { heroui } = require("@heroui/react")` 并在 `plugins` 加入 `heroui()`。
- **content 需要包含 HeroUI theme dist**：`content` 里需要包含：
  - `./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}`
    用于让 Tailwind 扫描到 HeroUI 的 class（否则样式可能缺失）。

## 深色模式（Tailwind class 模式）

- Tailwind 配置使用 `darkMode: "class"`。
- 当前实现会根据系统偏好（或 `localStorage.theme`）在 `<html>` 上切换 `dark` class（见 `src/layouts/BaseLayout.astro`）。

## CI / 无 TTY 环境

- 在无 TTY 环境下运行 `pnpm install` 可能因重建 `node_modules` 触发交互式确认而失败。
- CI 中建议设置 `CI=true`（例如 `CI=true pnpm install`）以避免该类中断。
