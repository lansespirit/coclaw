// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';

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
