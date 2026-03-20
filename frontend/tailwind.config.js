/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#4f6ef7',
          600: '#3b52d8',
          700: '#2d3db0',
          900: '#1a2260',
        },
        ink: {
          DEFAULT: '#0f1117',
          light: '#374151',
          muted: '#6b7280',
        },
        paper: {
          DEFAULT: '#ffffff',
          soft: '#f9fafb',
          warm: '#fefce8',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#0f1117',
            a: { color: '#4f6ef7', '&:hover': { color: '#2d3db0' } },
            'h1, h2, h3, h4': { fontFamily: 'var(--font-playfair)' },
          },
        },
      },
    },
  },
  plugins: [],
};
