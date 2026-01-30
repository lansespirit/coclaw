# CoClaw Website - Development Environment

This is the CoClaw.com website built with Astro 5, following the technical specifications from the PRD.

## Tech Stack

- **Framework**: Astro 5.x (Static Site Generator)
- **UI Components**: HeroUI (NextUI) + React
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm
- **Language**: TypeScript (strict mode)
- **Search**: Pagefind (client-side search)
- **Content**: MDX with Content Collections

## Prerequisites

- Node.js 22 or higher
- pnpm (installed globally)

## Getting Started

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

This will:

1. Build the Astro site to `dist/`
2. Generate Pagefind search index

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

### Manual Deployment

```bash
# Build the site
pnpm build

# Deploy the dist/ folder to your hosting provider
```

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

## Next Steps

1. **Add Content**: Create documentation pages in `src/content/`
2. **Build Components**: Develop the Configuration Generator in `src/components/ConfigGenerator/`
3. **Customize Design**: Update Tailwind config and global styles
4. **Add Features**: Implement search UI, navigation, and interactive elements
5. **Deploy**: Connect to Cloudflare Pages for automatic deployment

## Resources

- [Astro Documentation](https://docs.astro.build/)
- [HeroUI Documentation](https://heroui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Pagefind Documentation](https://pagefind.app/)
- [PRD Document](docs/PRD-CoClaw-Website.md)

## License

MIT
