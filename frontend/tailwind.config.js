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
        workspace: {
          bg: '#F8F8F6',
          surface: '#FFFFFF',
          subtle: '#F4F4F2',
          border: '#E4E4E7',
          borderHover: '#D4D4D8',
          text: '#18181B',
          secondary: '#52525B',
          muted: '#71717A',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#315CFF', // Primary accent
          600: '#254EDB',
          700: '#1D3FA8',
          800: '#173180',
          900: '#11225C',
        },
        accent: {
          blue: '#315CFF',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
          violet: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
