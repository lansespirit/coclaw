# CoClaw Token Governance

CoClaw uses **HeroUI theme tokens** as the single source of truth for color across light/dark themes.
To keep the UI consistent and prevent "color drift", app/UI code should use **semantic tokens** instead
of Tailwind's raw palette classes (e.g. `text-blue-500`, `bg-zinc-900`, `from-purple-500`).

## Rules (UI Code)

- Prefer semantic tokens:
  - `primary`, `secondary`, `accent`
  - `success`, `warning`, `danger`
  - `default` (neutral scale)
  - `background`, `foreground`
  - `content1..content4`, `divider`, `focus`, `overlay`
- Avoid Tailwind palette classes in `src/` UI code:
  - `text-{blue|gray|purple|...}-*`, `bg-*`, `border-*`, `from-*`, `to-*`
- If you truly need a new brand color:
  - Add it as a **token** in `tailwind.config.cjs` under `heroui({ themes: { ...colors } })`
  - Then use `bg-{token}` / `text-{token}` in markup (no raw palette).

## Content (Markdown/MDX)

- Markdown-rendered HTML is styled via `src/styles/content.css`.
- The baseline container is `class="c-content prose ..."`.
- Content styling uses the same semantic tokens so it remains theme-safe.

## Enforcing

Run:

```bash
pnpm tokens:check
```

This scans `src/` UI code (excluding `src/content` and `src/data`) and fails if Tailwind palette
classes are found.
