import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)', backgroundColor: 'rgb(229 231 235)' },
          '100%': { transform: 'rotateY(180deg)', backgroundColor: 'rgb(0 0 0)' }
        },
        flipDark: {
          '0%': { transform: 'rotateY(0deg)', backgroundColor: 'rgb(55 65 81)' },
          '100%': { transform: 'rotateY(180deg)', backgroundColor: 'rgb(255 255 255)' }
        }
      },
      animation: {
        'flip': 'flip 0.5s ease-in forwards',
        'flipDark': 'flipDark 0.5s ease-in forwards'
      }
    },
  },
  plugins: [],
} satisfies Config;
