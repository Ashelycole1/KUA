import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1215',
        card: '#111A1F',
        border: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(0, 255, 163, 0.3)',
        primary: '#00FFA3', // Electric Emerald
        primaryHover: '#00E693',
        secondary: '#FF6B00', // Sunset Orange
        textPrimary: '#FFFFFF',
        textSecondary: '#8B9A9F',
        textMuted: '#4F5E63',
      },
      fontFamily: {
        sans: ['var(--font-pj)', 'sans-serif'],
      },
      borderRadius: {
        kua: '16px',
        kuasm: '10px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(0, 255, 163, 0)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 20px 2px rgba(0, 255, 163, 0.2)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-card': 'linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
    },
  },
  plugins: [],
}

export default config
