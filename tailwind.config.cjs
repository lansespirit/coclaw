// HeroUI + Tailwind CSS v4 setup for Astro.
// Ref: https://www.heroui.com/docs/frameworks/astro
const { heroui } = require('@heroui/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}',
    // Make sure it's pointing to the ROOT node_modules.
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#0072F5',
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#7828C8',
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
            foreground: '#11181C',
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#0072F5',
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#7828C8',
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
            foreground: '#ECEDEE',
          },
        },
      },
    }),
  ],
};
