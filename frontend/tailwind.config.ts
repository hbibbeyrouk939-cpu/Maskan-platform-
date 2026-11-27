import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        sunken: 'var(--bg-sunken)',
        ink: {
          DEFAULT: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          subtle: 'var(--text-tertiary)',
        },
        emeraldArch: {
          DEFAULT: 'var(--accent-emerald)',
          soft: 'var(--accent-emerald-soft)',
        },
        brass: {
          DEFAULT: 'var(--accent-brass)',
          soft: 'var(--accent-brass-soft)',
        },
        terracotta: {
          DEFAULT: 'var(--accent-terracotta)',
          soft: 'var(--accent-terracotta-soft)',
        },
        hairline: 'var(--border-hairline)',
      },
      fontFamily: {
        displayAr: ['"Readex Pro"', 'sans-serif'],
        bodyAr: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        displayFr: ['"Instrument Serif"', 'Georgia', 'serif'],
        bodyFr: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
