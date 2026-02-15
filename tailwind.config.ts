import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#0A0A0A',
        surface: {
          1: '#141414',
          2: '#1E1E1E',
          3: '#2A2A2A',
        },
        border: {
          DEFAULT: '#333333',
          hover: '#404040',
        },
        text: {
          primary: '#EAEAEA',
          secondary: '#808080',
          tertiary: '#666666',
        },
        accent: {
          cyan: '#00D9FF',
          green: '#10B981',
          blue: '#3B82F6',
          yellow: '#F59E0B',
          red: '#EF4444',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 217, 255, 0.4)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
