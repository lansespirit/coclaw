// HeroUI + Tailwind CSS v4 setup for Astro.
// Ref: https://www.heroui.com/docs/frameworks/astro
const { heroui } = require('@heroui/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}',
    // Make sure it's pointing to the ROOT node_modules.
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [heroui()],
};
