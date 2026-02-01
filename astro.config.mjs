// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://coclaw.com',
  integrations: [
    react(),
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
