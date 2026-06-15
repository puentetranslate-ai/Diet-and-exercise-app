/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0b1120',
          soft: '#131c31',
          card: '#161f38',
          line: '#243049',
        },
        // nutrition accent (fresh green/teal)
        leaf: {
          50: '#ecfdf5',
          100: '#d1fae5',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // exercise accent (energetic violet/indigo)
        flux: {
          50: '#eef2ff',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        // macro colors
        protein: '#f472b6',
        carbs: '#fbbf24',
        fat: '#60a5fa',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.04), 0 20px 50px -20px rgba(16,185,129,0.35)',
        soft: '0 10px 40px -15px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
