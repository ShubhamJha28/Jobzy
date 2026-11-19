/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jobzy: {
          black: '#000000',
          charcoal: '#111111',
          card: '#141414',
          cardHover: '#1c1c1c',
          border: '#2a2a2a',
          borderLight: '#383838',
          lime: '#C4F167',
          softLime: '#E0FE9E',
          offwhite: '#F4F5F0',
          white: '#FFFFFF',
          muted: '#A3A3A3',
          darkMuted: '#666666',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'lime-glow': '0 0 25px -5px rgba(196, 241, 103, 0.25)',
        'lime-sm': '0 0 12px -2px rgba(196, 241, 103, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
