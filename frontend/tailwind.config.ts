import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kGreen: '#1D9E75',
        kGreenLight: '#E1F5EE',
        kGreenDark: '#085041',
        kGreenMid: '#0F6E56',
        kAmber: '#EF9F27',
        kAmberLight: '#FAEEDA',
        kAmberDark: '#633806',
        kPurple: '#534AB7',
        kPurpleLight: '#EEEDFE',
        kPurpleDark: '#3C3489',
        kCoral: '#D85A30',
        kCoralLight: '#FAECE7',
        kCoralDark: '#993C1D',
        tx: '#111827',
        mu: '#6B7280',
        su: '#F3F4F6',
        ca: '#FFFFFF',
        br: '#E5E7EB',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        syne: ['var(--font-syne)', 'sans-serif'],
      },
      borderRadius: {
        kua: '8px',
        kuasm: '6px',
        kualg: '12px',
      },
    },
  },
  plugins: [],
}

export default config
