import type { Config } from 'tailwindcss';

/**
 * Design system « Édition Lagon » — éditorial tropical médical.
 *
 * ink    : encre océan (vert-noir profond) — chrome, héros, nav
 * lagoon : lagon (vert-turquoise) — couleur d'action primaire
 * sand   : sable chaud — fonds de page et surfaces (jamais de blanc clinique)
 * coral  : corail hibiscus — urgences et accents vitaux
 * mango  : mangue — avertissements doux, highlights
 * mist   : gris-vert brumeux — textes secondaires
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts}',          // ← avatar.ts, utils.ts — classes couleur spécialités
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          500: '#2A7A64',
          600: '#1E6553',
          700: '#175043',
          800: '#103A32',
          900: '#0A2B25',
          950: '#071E1A',
        },
        lagoon: {
          50:  '#EFFBF7',
          100: '#D7F7EE',
          200: '#A8EEDC',
          300: '#6FE0C6',
          400: '#2BC4A4',
          500: '#14A88B',
          600: '#0E8E76',
          700: '#0B7A66',
        },
        sand: {
          50:  '#FBF7F0',
          100: '#F4ECDF',
          200: '#E9DCC8',
          300: '#D8C6A8',
          400: '#C3A97F',
        },
        coral: {
          50:  '#FFF1EE',
          100: '#FFE4DD',
          400: '#FF7E66',
          500: '#F0604A',
          600: '#D8472F',
          700: '#B5371F',
        },
        mango: {
          50:  '#FDF6E9',
          100: '#FBEAD0',
          400: '#F2B14E',
          500: '#E89B2D',
          600: '#C77F1A',
        },
        mist: {
          400: '#8FA29A',
          500: '#71857D',
          600: '#5A6E66',
          700: '#46584F',
        },
        paper: '#FFFDF9',
        // Alias rétro-compatibles (ancien système)
        primary: {
          50:  '#EFFBF7',
          100: '#D7F7EE',
          200: '#A8EEDC',
          400: '#2BC4A4',
          500: '#14A88B',
          600: '#0E8E76',
          700: '#0B7A66',
        },
        surface: '#FBF7F0',
      },
      fontFamily: {
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card:        '0 1px 2px rgba(7,30,26,0.05), 0 6px 20px -6px rgba(7,30,26,0.10)',
        'card-hover':'0 2px 4px rgba(7,30,26,0.06), 0 12px 28px -8px rgba(7,30,26,0.16)',
        lift:        '0 1px 2px rgba(7,30,26,0.06), 0 8px 24px -8px rgba(7,30,26,0.14)',
        float:       '0 12px 32px -8px rgba(7,30,26,0.30)',
        sheet:       '0 -16px 48px rgba(7,30,26,0.18)',
        glow:        '0 0 0 1px rgba(43,196,164,0.30), 0 8px 28px -6px rgba(20,168,139,0.50)',
        'glow-coral':'0 0 0 1px rgba(240,96,74,0.30), 0 8px 28px -6px rgba(216,71,47,0.50)',
        medallion:   'inset 0 1px 0 rgba(255,255,255,0.25), 0 10px 30px -8px rgba(7,30,26,0.45)',
      },
      borderRadius: {
        xl:   '14px',
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        rise: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
      },
      animation: {
        shimmer:      'shimmer 1.8s linear infinite',
        rise:         'rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
