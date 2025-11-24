import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          dark: '#5D4037',
          medium: '#8D6E63',
          light: '#A1887F',
        },
        accent: {
          orange: '#FF6B6B',
          mint: '#4ECDC4',
          yellow: '#FFD93D',
        },
        ivory: '#FFFEF7',
        beige: '#F5F0E8',
      },
    },
  },
  plugins: [],
}
export default config
