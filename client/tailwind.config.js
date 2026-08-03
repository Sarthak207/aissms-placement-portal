/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#16213E',
          50: '#EEF0F6',
          100: '#D3D8E8',
          200: '#A7B0D1',
          400: '#4A5786',
          600: '#232F52',
          800: '#16213E',
          900: '#0D1428',
        },
        parchment: {
          DEFAULT: '#FAF9F6',
          100: '#FFFFFF',
          200: '#F2F0E9',
        },
        seal: {
          DEFAULT: '#C9A227',
          light: '#E4C766',
          dark: '#9C7D1B',
        },
        verified: '#2F855A',
        rejected: '#B33A3A',
        slate: {
          DEFAULT: '#4A5468',
          light: '#7C8598',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(22, 33, 62, 0.08), 0 1px 2px rgba(22, 33, 62, 0.06)',
        seal: '0 0 0 3px rgba(201, 162, 39, 0.15)',
      },
    },
  },
  plugins: [],
};
