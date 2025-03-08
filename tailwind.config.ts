import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Brand color:  Hue -> 180 (Cyan)
        wash: {
          50: '#f5fcfc',
          60: '#eff9f9',
          70: '#eaf6f6',
          80: '#e6f3f3',
          90: '#e1f0f0',
          100: '#dceded',
          110: '#d7e9e9',
          120: '#d2e6e6',
          130: '#cde2e2',
          140: '#c7dede',
          150: '#c2dada',
          200: '#c6d2d2',
          250: '#b7c4c4',
          300: '#a8b6b6',
          350: '#9aa8a8',
          400: '#8c9a9a',
          450: '#7d8c8c',
          500: '#707e7e',
          550: '#627070',
          600: '#556262',
          650: '#485454',
          700: '#324040',
          710: '#303d3d',
          720: '#2e3a3a',
          730: '#2c3737',
          740: '#2a3434',
          750: '#283131',
          760: '#262e2e',
          770: '#232a2a',
          780: '#212727',
          790: '#1e2323',
          800: '#1c2020',
          850: '#181b1b',
          900: '#141616',
          950: '#0f1010'
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 as unknown as string },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 as unknown as string },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hidden': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',

          /* Firefox */
          'scrollbar-width': 'none',

          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }),
    plugin(function ({ addBase, theme }) {
      addBase({
        ':root': Object.fromEntries(
          Object.entries(theme('colors.wash') as Record<string, string>).map(([key, value]) => [`--wash-${key}`, value])
        )
      })
    })
  ],
}
export default config
