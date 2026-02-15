// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import autolinkInternal from './src/lib/remark/autolink-internal.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://coclaw.com',
  integrations: [
    react(),
    mdx({
      remarkPlugins: [autolinkInternal],
    }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      filter: (page) => {
        const pathname = page.startsWith('http') ? new URL(page).pathname : page;
        return (
          !pathname.startsWith('/styleguide') &&
          !pathname.startsWith('/troubleshooting/issues') &&
          !pathname.startsWith('/troubleshooting/github')
        );
      },
    }),
  ],
  markdown: {
    remarkPlugins: [autolinkInternal],
  },

  vite: {
    // Build-time Iconify icons for both `.astro` and React `.tsx` files.
    // We compile icons as React components so Astro pages can use the same imports too.
    plugins: [
      tailwindcss(),
      Icons({
        compiler: 'jsx',
        jsx: 'react',
        autoInstall: false, // keep "pure build-time" with explicitly installed icon sets
      }),
    ],
  },
});
