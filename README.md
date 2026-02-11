# CoClaw.com

[![Website](https://img.shields.io/badge/coclaw.com-live-0ea5e9)](https://coclaw.com)
[![CI](https://github.com/lansespirit/coclaw/actions/workflows/ci.yml/badge.svg)](https://github.com/lansespirit/coclaw/actions/workflows/ci.yml)

CoClaw is a community-driven support platform for **OpenClaw** (formerly **ClawDBot**) — guides, troubleshooting, and tools.

Live site: https://coclaw.com

If you want to help maintain CoClaw, please jump in with issues/PRs. Feature ideas and content improvements are especially welcome.

## Tech Stack

- **Framework**: Astro 5.x (Static Site Generator)
- **UI Components**: HeroUI (NextUI) + React
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm
- **Language**: TypeScript (strict mode)
- **Search**: Pagefind (client-side search)
- **Content**: MDX with Content Collections

## What’s In This Repo

- **Guides & docs**: `src/content/**` (MDX)
- **Troubleshooting KB**: `src/content/troubleshooting/**`
- **Tools**: interactive pages in `src/pages/tools/**` (and related components in `src/components/**`)
- **OpenClaw issue sync (skill workflow)**: `pnpm sync:issues` writes to `skills/coclaw-solutions-maintainer/data/openclaw-issues.json`

## Contributing

- **Feature requests / bugs**: open a GitHub Issue (include screenshots, URLs, repro steps)
- **Docs/content**: edit or add MDX in `src/content/**`
- **UI/UX**: Astro pages in `src/pages/**`, components in `src/components/**`
- **Small PRs welcome**: typo fixes, clarity improvements, new screenshots, better examples
- More details: see `CONTRIBUTING.md`

Development notes:

- Keep changes focused and easy to review
- Run `pnpm lint` and `pnpm format:check` before opening a PR
- If you’re adding content, keep URLs stable and titles/descriptions SEO-friendly

## Prerequisites

- Node.js 22 or higher
- pnpm (installed globally)

## Local Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development Server

```bash
pnpm dev
```

The site will be available at `http://localhost:4321/`

### 3. Build for Production

```bash
pnpm build
```

This will build the Astro site to `dist/` and generate the Pagefind search index.

### 4. Preview Production Build

```bash
pnpm preview
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production (includes Pagefind indexing)
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm tokens:check` - Validate required design tokens
- `pnpm sync:issues` - (Optional) sync OpenClaw issues for the coclaw-solutions-maintainer skill

## Project Structure

```
CoClaw/
├── src/
│   ├── content/              # Content Collections (MDX files)
│   │   ├── getting-started/  # Installation guides
│   │   ├── channels/         # Channel setup guides
│   │   ├── troubleshooting/  # Error solutions
│   │   ├── guides/           # Advanced guides
│   │   ├── blog/             # Blog posts
│   │   └── templates/        # Config templates
│   ├── components/           # React/Astro components
│   │   ├── SEO/              # SEO components
│   │   └── ConfigGenerator/  # Config generator tool
│   ├── layouts/              # Page layouts
│   │   ├── BaseLayout.astro
│   │   ├── DocsLayout.astro
│   │   └── BlogLayout.astro
│   ├── pages/                # Routes
│   │   ├── index.astro       # Homepage
│   │   └── [...slug].astro   # Dynamic routes
│   └── styles/               # Global styles
│       └── global.css
├── public/                   # Static assets
├── docs/                     # Project documentation
│   └── PRD-CoClaw-Website.md
├── astro.config.mjs          # Astro configuration
├── tsconfig.json             # TypeScript configuration
├── wrangler.toml             # Cloudflare Pages config
└── package.json
```

## Content Management

### Creating New Content

1. Create a new `.mdx` file in the appropriate `src/content/` subdirectory
2. Add frontmatter with required metadata (see example below)
3. Write content in Markdown/MDX
4. The page will be automatically generated

### Example Frontmatter

```yaml
---
title: 'Your Page Title'
description: 'Brief description for SEO'
category: 'getting-started'
difficulty: 'beginner'
estimatedTime: '10 minutes'
publishDate: 2026-01-30
lastUpdated: 2026-01-30
author: 'CoClaw Team'
keywords:
  - 'keyword1'
  - 'keyword2'
---
```

## URL Structure

Content is organized with flat URLs (no `/docs/` prefix):

- `/installation/macos` - Installation guide for macOS
- `/channels/telegram` - Telegram setup guide
- `/troubleshooting/install-errors` - Troubleshooting page
- `/guides/security` - Security guide

## Deployment

### Cloudflare Pages (Recommended)

1. Connect your GitHub repository to Cloudflare Pages
2. Cloudflare will automatically detect Astro and configure build settings
3. Every push to `main` triggers automatic deployment
4. Preview deployments for every pull request

**Build Configuration:**

- Build command: `pnpm build`
- Build output directory: `dist`
- Node version: 22
- Package manager: pnpm

## Development Guidelines

### Code Quality

- Pre-commit hooks automatically run linting and formatting
- TypeScript strict mode is enabled
- Follow the existing code style

### Adding Components

1. Create component in `src/components/`
2. Use TypeScript for type safety
3. Follow Astro's component conventions
4. Use HeroUI components for UI elements

### Styling

- Use Tailwind CSS utility classes
- Follow the design system from PRD
- Support dark mode with `dark:` variants
- Keep styles consistent across pages

## Search Functionality

Pagefind automatically indexes all content during build:

```bash
pnpm build  # Builds site and generates search index
```

The search index is generated in `dist/pagefind/` and works client-side.

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear cache: `rm -rf .astro node_modules`
2. Reinstall: `pnpm install`
3. Rebuild: `pnpm build`

### Content Collection Warnings

If you see warnings about empty collections, it's normal during initial setup. Add content files to suppress these warnings.

### Port Already in Use

If port 4321 is in use:

```bash
pnpm dev -- --port 3000
```

## Roadmap / Help Wanted

- Improve the OpenClaw config generator UX and add more presets/templates
- Expand troubleshooting coverage with real-world fixes (logs + solutions)
- Add more multilingual content (Chinese/English), and polish existing pages

If you’re not sure where to start, open an issue with what you want to work on and we’ll help scope it.

## Resources

- [Astro Documentation](https://docs.astro.build/)
- [HeroUI Documentation](https://heroui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Pagefind Documentation](https://pagefind.app/)
- [PRD Document](docs/PRD-CoClaw-Website.md)

## License

MIT
