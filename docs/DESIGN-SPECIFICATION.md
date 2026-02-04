# CoClaw Design Specification

**Version:** 1.1
**Date:** 2026-02-04
**Based on:** HeroUI (NextUI) Design System
**Framework:** Astro 5 + React + Tailwind CSS 4

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design System Foundation](#design-system-foundation)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Guidelines](#component-guidelines)
7. [Interaction Patterns](#interaction-patterns)
8. [Responsive Design](#responsive-design)
9. [Accessibility Standards](#accessibility-standards)
10. [Implementation Guidelines](#implementation-guidelines)

---

## 1. Design Philosophy

### Core Principles

**1.1 Clarity First**

- Information hierarchy must be immediately apparent
- Technical content presented in digestible chunks
- Progressive disclosure for complex topics
- Clear visual separation between content types

**1.2 Accessibility by Default**

- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all interactive elements
- Screen reader optimization
- High contrast ratios (4.5:1 for text, 3:1 for UI)

**1.3 Performance-Driven**

- Zero unnecessary JavaScript on static pages
- React islands only for interactive components
- Optimized images and assets
- Fast Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

**1.4 Consistency & Predictability**

- Uniform component behavior across pages
- Consistent spacing and alignment
- Predictable interaction patterns
- Familiar UI conventions

**1.5 Beautiful & Modern**

- Clean, contemporary aesthetic
- Thoughtful use of color and whitespace
- Smooth animations and transitions
- Professional polish without unnecessary decoration

---

## 2. Design System Foundation

### 2.1 HeroUI Integration

CoClaw uses **HeroUI (NextUI) v2.8.8+** as the component foundation, built on:

- **Tailwind CSS 4.x** for utility-first styling
- **Framer Motion 12.x** for animations
- **React Aria** for accessibility primitives

**Key HeroUI Features Used:**

- Pre-built accessible components
- Built-in dark mode support
- Customizable theme system
- TypeScript-first API
- Zero runtime styles (compiled at build time)

### 2.2 Theme Configuration

```typescript
// tailwind.config.cjs
const { heroui } = require('@heroui/theme');

module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Custom extensions here
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#006FEE',
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#7828C8',
              foreground: '#FFFFFF',
            },
            // Brand accent used for marketing highlights (e.g. pink).
            accent: {
              DEFAULT: '#EC4899',
              foreground: '#FFFFFF',
            },
            success: {
              DEFAULT: '#17C964',
              foreground: '#FFFFFF',
            },
            warning: {
              DEFAULT: '#F5A524',
              foreground: '#FFFFFF',
            },
            danger: {
              DEFAULT: '#F31260',
              foreground: '#FFFFFF',
            },
            background: '#FFFFFF',
            // IMPORTANT: provide a ramp so utilities like `text-foreground-600` exist.
            foreground: {
              DEFAULT: '#000000',
              500: 'rgb(0 0 0 / 0.5)',
              600: 'rgb(0 0 0 / 0.6)',
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#006FEE',
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#7828C8',
              foreground: '#FFFFFF',
            },
            accent: {
              DEFAULT: '#EC4899',
              foreground: '#FFFFFF',
            },
            success: {
              DEFAULT: '#17C964',
              foreground: '#000000',
            },
            warning: {
              DEFAULT: '#F5A524',
              foreground: '#000000',
            },
            danger: {
              DEFAULT: '#F31260',
              foreground: '#FFFFFF',
            },
            background: '#000000',
            foreground: {
              DEFAULT: '#FFFFFF',
              500: 'rgb(255 255 255 / 0.5)',
              600: 'rgb(255 255 255 / 0.6)',
            },
          },
        },
      },
    }),
  ],
};
```

---

## 3. Color System

### 3.1 Semantic Color Palette

**Primary Colors (Blue)**

- Used for: Primary actions, links, focus states
- Light mode: `#006FEE` (Primary 500)
- Dark mode: `#006FEE` (Primary 500)
- Variants: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

**Secondary Colors (Purple)**

- Used for: Secondary actions, highlights, accents
- Light mode: `#7828C8` (Purple 500)
- Dark mode: `#7828C8` (Purple 500)

**Accent Colors (Pink)**

- Used for: Brand highlights, marketing accents, gradient washes
- Light mode: `#EC4899` (Accent 500)
- Dark mode: `#EC4899` (Accent 500)

**Success (Green)**

- Used for: Success messages, confirmations, positive states
- Light mode: `#17C964` (Green 500)
- Dark mode: `#17C964` (Green 500)

**Warning (Orange)**

- Used for: Warnings, cautions, important notices
- Light mode: `#F5A524` (Orange 500)
- Dark mode: `#F5A524` (Orange 500)

**Danger (Red)**

- Used for: Errors, destructive actions, critical alerts
- Light mode: `#F31260` (Red 500)
- Dark mode: `#F31260` (Red 500)

### 3.2 Neutral Colors

**Light Mode**

```
Background: #FFFFFF
Foreground: #11181C
Content1: #FFFFFF (cards, panels)
Content2: #F4F4F5 (subtle backgrounds)
Content3: #E4E4E7 (borders, dividers)
Content4: #D4D4D8 (disabled states)
```

**Dark Mode**

```
Background: #000000
Foreground: #ECEDEE
Content1: #18181B (cards, panels)
Content2: #27272A (subtle backgrounds)
Content3: #3F3F46 (borders, dividers)
Content4: #52525B (disabled states)
```

### 3.3 Color Usage Guidelines

**Do's:**

- Use primary color for main CTAs and navigation
- Use semantic colors consistently (success = green, danger = red)
- Maintain sufficient contrast ratios (4.5:1 for text)
- Test colors in both light and dark modes

**Don'ts:**

- Don't use color as the only indicator (add icons/text)
- Don't use too many colors on one page (max 3-4)
- Don't override semantic meanings (e.g., red for success)
- Don't use pure black (#000) for text in light mode

### 3.4 Gradient Usage

**Hero Sections:**

```css
/* Use semantic tokens, not hard-coded palette colors */
background: linear-gradient(
  to bottom,
  rgb(var(--heroui-primary) / 0.12),
  rgb(var(--heroui-background))
);
```

**Feature Cards:**

```css
/* Accent gradient (token-based) */
background: linear-gradient(135deg, rgb(var(--heroui-primary)), rgb(var(--heroui-secondary)));
```

### 3.5 Token Governance (Required)

To keep the UI consistent across light/dark themes, **UI code must use HeroUI semantic tokens**.

**Allowed (preferred):**

- `primary`, `secondary`, `accent`
- `success`, `warning`, `danger`
- `default` (neutral scale)
- `background`, `foreground`
- `content1..content4`, `divider`, `focus`, `overlay`

**Disallowed in UI code (`src/`, excluding `src/content` and `src/data`):**

- Tailwind palette classes such as `text-blue-500`, `bg-zinc-900`, `from-purple-500`, etc.

**Enforcement**

- See `docs/TOKENS.md`
- Run `pnpm tokens:check` (fails CI/local if palette classes are introduced)

---

## 4. Typography

### 4.1 Font Stack

**Primary Font: Inter + fallbacks**

```css
font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  'Helvetica Neue',
  Arial,
  sans-serif;
```

**Monospace Font: Code & Technical Content**

```css
font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
```

### 4.2 Type Scale

**Headings**

```
H1: 3rem (48px) / 1.2 line-height / 700 weight
H2: 2.25rem (36px) / 1.3 line-height / 700 weight
H3: 1.875rem (30px) / 1.3 line-height / 600 weight
H4: 1.5rem (24px) / 1.4 line-height / 600 weight
H5: 1.25rem (20px) / 1.5 line-height / 600 weight
H6: 1rem (16px) / 1.5 line-height / 600 weight
```

**Body Text**

```
Large: 1.125rem (18px) / 1.7 line-height / 400 weight
Base: 1rem (16px) / 1.6 line-height / 400 weight
Small: 0.875rem (14px) / 1.5 line-height / 400 weight
Tiny: 0.75rem (12px) / 1.4 line-height / 400 weight
```

**Code Text**

```
Inline code: 0.875rem (14px) / monospace / 400 weight
Code block: 0.875rem (14px) / 1.6 line-height / monospace
```

### 4.3 Typography Guidelines

**Headings:**

- Use semantic HTML (h1-h6) for proper hierarchy
- Only one h1 per page
- Don't skip heading levels
- Keep headings concise (max 60 characters)

**Body Text:**

- Optimal line length: 60-80 characters
- Use 1.6-1.7 line-height for readability
- Paragraph spacing: 1.5em between paragraphs
- Left-align text (never justify)

**Code:**

- Use syntax highlighting for code blocks
- Inline code with subtle background
- Monospace font for all code
- Line numbers for long code blocks

---

## 5. Spacing & Layout

### 5.1 Spacing Scale

Based on Tailwind's 4px base unit:

```
0: 0px
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
8: 32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
32: 128px
```

### 5.2 Layout Grid

**Container Widths:**

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

**Content Max-Width:**

- Documentation: 768px (readable line length)
- Homepage: 1280px (full-width sections)
- Blog posts: 720px (optimal reading)

### 5.3 Component Spacing

**Card Padding:**

```
Small: p-4 (16px)
Medium: p-6 (24px)
Large: p-8 (32px)
```

**Section Spacing:**

```
Between sections: py-16 (64px) or py-20 (80px)
Between components: space-y-8 (32px) or space-y-12 (48px)
```

**Grid Gaps:**

```
Tight: gap-4 (16px)
Normal: gap-6 (24px)
Loose: gap-8 (32px)
```

---

## 6. Component Guidelines

### 6.1 Buttons

**Primary Button**

```tsx
<Button color="primary" size="lg" radius="md">
  Get Started
</Button>
```

**Variants:**

- `solid` (default): Filled background
- `bordered`: Outline style
- `light`: Subtle background
- `flat`: No border, subtle background
- `ghost`: Transparent until hover

**Sizes:**

- `sm`: 32px height
- `md`: 40px height (default)
- `lg`: 48px height

**Usage:**

- Primary actions: `color="primary"` + `variant="solid"`
- Secondary actions: `color="default"` + `variant="bordered"`
- Tertiary actions: `color="default"` + `variant="light"`
- Destructive: `color="danger"` + `variant="solid"`

### 6.2 Cards

**Standard Card**

```tsx
<Card className="p-6">
  <CardHeader>
    <h3 className="text-xl font-semibold">Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Variants:**

- `shadow="sm"`: Subtle elevation
- `shadow="md"`: Medium elevation (default)
- `shadow="lg"`: High elevation
- `isHoverable`: Lift on hover

### 6.3 Navigation

**Navbar**

```tsx
<Navbar isBordered maxWidth="xl">
  <NavbarBrand>
    <Logo />
  </NavbarBrand>
  <NavbarContent className="hidden sm:flex gap-4" justify="center">
    <NavbarItem>
      <Link href="/docs">Documentation</Link>
    </NavbarItem>
  </NavbarContent>
  <NavbarContent justify="end">
    <ThemeSwitch />
  </NavbarContent>
</Navbar>
```

**Sidebar Navigation**

```tsx
<Listbox variant="flat" aria-label="Navigation">
  <ListboxItem key="getting-started" href="/getting-started">
    Getting Started
  </ListboxItem>
  <ListboxItem key="channels" href="/channels">
    Channels
  </ListboxItem>
</Listbox>
```

### 6.4 Forms

**Input Fields**

```tsx
<Input
  type="text"
  label="API Token"
  placeholder="Enter your token"
  description="Your token is stored locally"
  isRequired
/>
```

**Select Dropdown**

```tsx
<Select label="Platform" placeholder="Select a platform">
  <SelectItem key="telegram">Telegram</SelectItem>
  <SelectItem key="slack">Slack</SelectItem>
</Select>
```

**Checkbox**

```tsx
<Checkbox defaultSelected>Enable safe mode (recommended)</Checkbox>
```

### 6.5 Feedback Components

**Alert/Callout**

```tsx
<Card className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary">
  <CardBody>
    <div className="flex gap-3">
      <InfoIcon />
      <div>
        <p className="font-semibold">Important Note</p>
        <p className="text-sm">This is an informational message.</p>
      </div>
    </div>
  </CardBody>
</Card>
```

**Toast Notifications**

```tsx
// Use HeroUI's built-in toast system
import { toast } from '@heroui/react';

toast.success('Configuration saved successfully!');
toast.error('Failed to generate config');
toast.warning('This action requires confirmation');
```

### 6.6 Code Display

**Inline Code**

```tsx
<code className="px-1.5 py-0.5 rounded bg-default-100 text-sm font-mono">npm install</code>
```

**Code Block**

```tsx
<Card className="bg-default-50 dark:bg-default-100/10">
  <CardBody>
    <pre className="overflow-x-auto">
      <code className="text-sm font-mono">{codeContent}</code>
    </pre>
  </CardBody>
</Card>
```

**With Copy Button**

```tsx
<div className="relative">
  <pre>...</pre>
  <Button size="sm" variant="flat" className="absolute top-2 right-2" onPress={handleCopy}>
    Copy
  </Button>
</div>
```

---

## 7. Interaction Patterns

### 7.1 Hover States

**Links**

```css
/* Default state */
color: hsl(var(--heroui-primary));

/* Hover state */
color: hsl(var(--heroui-primary-600));
text-decoration: underline;
```

**Cards**

```tsx
<Card isHoverable isPressable>
  {/* Card lifts and shows shadow on hover */}
</Card>
```

**Buttons**

- Subtle scale transform: `scale(1.02)`
- Brightness increase: `brightness(1.1)`
- Smooth transition: `transition-all duration-200`

### 7.2 Focus States

**Keyboard Focus**

```css
/* All interactive elements */
outline: 2px solid hsl(var(--heroui-primary));
outline-offset: 2px;
border-radius: 4px;
```

**Focus Visible (keyboard only)**

```tsx
<Button className="focus-visible:ring-2 ring-primary ring-offset-2">Click me</Button>
```

### 7.3 Loading States

**Button Loading**

```tsx
<Button isLoading>Generating...</Button>
```

**Skeleton Loader**

```tsx
<Skeleton className="rounded-lg">
  <div className="h-24 rounded-lg bg-default-300"></div>
</Skeleton>
```

**Spinner**

```tsx
<Spinner size="lg" color="primary" />
```

### 7.4 Animations

**Page Transitions**

```tsx
// Use Astro's View Transitions
<ViewTransitions />
```

**Component Animations (Framer Motion)**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

**Micro-interactions**

- Button press: Scale down to 0.98
- Card hover: Lift with shadow
- Link hover: Underline slide-in
- Icon hover: Subtle rotation or bounce

---

## 8. Responsive Design

### 8.1 Breakpoints

```typescript
const breakpoints = {
  sm: '640px', // Mobile landscape
  md: '768px', // Tablet
  lg: '1024px', // Desktop
  xl: '1280px', // Large desktop
  '2xl': '1536px', // Extra large
};
```

### 8.2 Mobile-First Approach

**Base styles for mobile, enhance for larger screens:**

```tsx
<div
  className="
  grid grid-cols-1        // Mobile: 1 column
  md:grid-cols-2          // Tablet: 2 columns
  lg:grid-cols-3          // Desktop: 3 columns
  gap-4 md:gap-6 lg:gap-8 // Progressive spacing
"
>
  {/* Content */}
</div>
```

### 8.3 Responsive Typography

```tsx
<h1
  className="
  text-3xl md:text-4xl lg:text-5xl  // Progressive size
  leading-tight                      // Consistent line-height
"
>
  Heading
</h1>
```

### 8.4 Navigation Patterns

**Desktop: Horizontal navbar**

```tsx
<NavbarContent className="hidden md:flex gap-4">{/* Desktop navigation */}</NavbarContent>
```

**Mobile: Hamburger menu**

```tsx
<NavbarMenuToggle className="md:hidden" />
<NavbarMenu>
  {/* Mobile menu items */}
</NavbarMenu>
```

### 8.5 Touch Targets

**Minimum touch target size: 44x44px**

```tsx
<Button
  size="lg" // Ensures adequate touch target
  className="min-h-[44px] min-w-[44px]"
>
  Tap me
</Button>
```

---

## 9. Accessibility Standards

### 9.1 Semantic HTML

**Use proper HTML elements:**

```html
<!-- Good -->
<nav>
  <ul>
    <li><a href="/docs">Docs</a></li>
  </ul>
</nav>

<!-- Bad -->
<div class="nav">
  <div class="link" onclick="...">Docs</div>
</div>
```

### 9.2 ARIA Labels

**Descriptive labels for screen readers:**

```tsx
<Button
  aria-label="Close dialog"
  isIconOnly
>
  <CloseIcon />
</Button>

<Input
  label="Email"
  aria-describedby="email-description"
/>
<span id="email-description" className="text-sm text-default-500">
  We'll never share your email
</span>
```

### 9.3 Keyboard Navigation

**All interactive elements must be keyboard accessible:**

- Tab order follows visual order
- Enter/Space activates buttons
- Escape closes modals/dropdowns
- Arrow keys navigate lists/menus

**Skip to content link:**

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
>
  Skip to main content
</a>
```

### 9.4 Color Contrast

**Minimum contrast ratios:**

- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

**Test with tools:**

- Chrome DevTools Lighthouse
- WAVE browser extension
- Contrast Checker

### 9.5 Alternative Text

**Images:**

```tsx
<Image src="/screenshot.png" alt="OpenClaw configuration interface showing platform selection" />
```

**Decorative images:**

```tsx
<Image
  src="/decoration.svg"
  alt="" // Empty alt for decorative images
  aria-hidden="true"
/>
```

---

## 10. Implementation Guidelines

### 10.1 Component Structure

**Astro Component Example:**

```astro
---
// Component logic
import { Button, Card } from '@heroui/react';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<Card className="p-6">
  <h3 class="text-xl font-semibold mb-2">{title}</h3>
  <p class="text-default-600">{description}</p>
  <Button color="primary" className="mt-4"> Learn More </Button>
</Card>
```

**React Island Example:**

```tsx
// src/components/ConfigGenerator.tsx
import { useState } from 'react';
import { Button, Input, Select, SelectItem } from '@heroui/react';

export function ConfigGenerator() {
  const [platform, setPlatform] = useState('');

  return (
    <div className="space-y-6">
      <Select label="Platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>
        <SelectItem key="telegram">Telegram</SelectItem>
        <SelectItem key="slack">Slack</SelectItem>
      </Select>

      <Button color="primary" size="lg" fullWidth>
        Generate Configuration
      </Button>
    </div>
  );
}
```

### 10.2 Dark Mode Implementation

**Theme Toggle Component:**

```tsx
import { useTheme } from 'next-themes';
import { Switch } from '@heroui/react';

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <Switch
      isSelected={theme === 'dark'}
      onValueChange={(checked) => setTheme(checked ? 'dark' : 'light')}
    >
      Dark Mode
    </Switch>
  );
}
```

**CSS Variables:**

```css
/* Automatically handled by HeroUI */
:root {
  --heroui-primary: 212 100% 48%;
  --heroui-background: 0 0% 100%;
}

.dark {
  --heroui-primary: 212 100% 48%;
  --heroui-background: 0 0% 0%;
}
```

### 10.3 Performance Optimization

**Image Optimization:**

```astro
---
import { Image } from 'astro:assets';
import screenshot from '../assets/screenshot.png';
---

<Image
  src={screenshot}
  alt="Configuration interface"
  width={800}
  height={600}
  loading="lazy"
  format="webp"
/>
```

**Code Splitting:**

```tsx
// Only load heavy components when needed
const ConfigGenerator = lazy(() => import('./ConfigGenerator'));

<Suspense fallback={<Spinner />}>
  <ConfigGenerator />
</Suspense>;
```

### 10.4 CSS Best Practices

**Use Tailwind utilities:**

```tsx
// Good
<div className="flex items-center gap-4 p-6 rounded-lg bg-default-50">

// Avoid custom CSS when possible
<div style={{ display: 'flex', padding: '24px' }}>
```

**Custom styles when needed (content system):**

```css
/* src/styles/content.css */
.c-content :where(code):not(pre code) {
  @apply bg-default-100 px-2 py-1 rounded-small text-small font-mono text-foreground-600;
}
```

### 10.6 Content Rendering (Markdown/MDX)

Markdown content is rendered as plain HTML and must look correct without author-provided classes.

- Content styling lives in `src/styles/content.css`
- The baseline container class is `c-content` (usually combined with `prose`)
- A visual regression page exists at `/styleguide/content` (not in sitemap, `noindex`)

### 10.7 Token Governance Check

Run:

```bash
pnpm tokens:check
```

This scans `src/` UI code and fails if Tailwind palette classes are found.

### 10.5 Testing Checklist

**Before deploying:**

- [ ] Test in Chrome, Firefox, Safari
- [ ] Test on mobile devices (iOS, Android)
- [ ] Verify dark mode appearance
- [ ] Check keyboard navigation
- [ ] Run Lighthouse audit (score > 90)
- [ ] Validate HTML semantics
- [ ] Test with screen reader
- [ ] Verify color contrast ratios
- [ ] Check responsive breakpoints
- [ ] Test all interactive components

---

## Appendix A: Component Library Reference

### Quick Reference Table

| Component     | Use Case             | HeroUI Component             |
| ------------- | -------------------- | ---------------------------- |
| Primary CTA   | Main actions         | `<Button color="primary">`   |
| Navigation    | Site navigation      | `<Navbar>`                   |
| Content cards | Feature display      | `<Card>`                     |
| Form inputs   | User input           | `<Input>`, `<Select>`        |
| Alerts        | Important messages   | `<Card>` with custom styling |
| Code display  | Code snippets        | `<Code>` or custom `<pre>`   |
| Loading       | Async operations     | `<Spinner>`, `<Skeleton>`    |
| Modals        | Dialogs              | `<Modal>`                    |
| Tooltips      | Contextual help      | `<Tooltip>`                  |
| Tabs          | Content organization | `<Tabs>`                     |

---

## Appendix B: Design Tokens

### Color Tokens

```typescript
const colors = {
  primary: {
    50: '#e6f1fe',
    100: '#cce3fd',
    200: '#99c7fb',
    300: '#66aaf9',
    400: '#338ef7',
    500: '#0072f5', // Default
    600: '#005bc4',
    700: '#004493',
    800: '#002e62',
    900: '#001731',
  },
  // ... other color scales
};
```

### Spacing Tokens

```typescript
const spacing = {
  unit: 4, // Base unit in pixels
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};
```

### Border Radius Tokens

```typescript
const radius = {
  none: '0px',
  sm: '8px',
  md: '12px',
  lg: '14px',
  xl: '18px',
  '2xl': '24px',
  full: '9999px',
};
```

---

## Appendix C: Resources

### Official Documentation

- [HeroUI Documentation](https://www.heroui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Astro Documentation](https://docs.astro.build/)
- [Framer Motion Documentation](https://www.framer.com/motion/)

### Design Tools

- [Figma](https://www.figma.com/) - Design mockups
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Accessibility
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance audit

### Inspiration

- [HeroUI Examples](https://www.heroui.com/examples)
- [Tailwind UI](https://tailwindui.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Document Maintenance:**

- Review quarterly for HeroUI updates
- Update when new components are added
- Revise based on user feedback and analytics
- Keep aligned with Astro and Tailwind CSS versions

**Version History:**

- v1.0 (2026-01-30): Initial design specification based on HeroUI 2.8.8
