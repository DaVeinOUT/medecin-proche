import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#1A6FE8',
          700: '#1558C0',
        },
        success: '#00C853',
        warning: '#FF6D00',
        surface: '#F8FAFC',
      },
      boxShadow: {
        card:       '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover':'0 6px 24px rgba(0,0,0,0.14)',
        float:      '0 4px 20px rgba(0,0,0,0.15)',
        sheet:      '0 -4px 32px rgba(0,0,0,0.10)',
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
