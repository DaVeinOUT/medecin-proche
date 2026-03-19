import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts}',          // ← avatar.ts, utils.ts — classes couleur spécialités
  ],
  theme: {
    extend: {
      colors: {
        // Palette tropicale — turquoise des Caraïbes
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        // Corail chaud — accentue les actions importantes
        coral: {
          50:  '#fff7ed',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        surface: '#f8fffe',   // blanc légèrement teinté teal
      },
      boxShadow: {
        card:        '0 2px 16px rgba(13,148,136,0.08)',
        'card-hover':'0 6px 24px rgba(13,148,136,0.16)',
        float:       '0 4px 20px rgba(0,0,0,0.12)',
        sheet:       '0 -4px 32px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
