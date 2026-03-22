
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        virel: {
          base: '#0f1117',
          surface: '#161922',
          elevated: '#1c1f2e',
          border: '#1e2230',
          borderHover: '#2a2e3f',
          text: '#e4e5e9',
          textSecondary: '#8b8d98',
          textMuted: '#5c5f6e',
          successBg: '#132a1f',
          successText: '#40916c',
          errorBg: '#3b1212',
          errorText: '#e5383b',
          warningBg: '#3d1c04',
          warningText: '#f59e0b',
          pendingBg: '#1e2230',
          pendingText: '#8b8d98',
          accent: '#ffffff',
          accentHover: '#e4e5e9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
