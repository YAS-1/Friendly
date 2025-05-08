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
        primary: {
          light: '#4F46E5',
          dark: '#6366F1'
        },
        secondary: {
          light: '#9CA3AF',
          dark: '#6B7280'
        },
        background: {
          light: '#F9FAFB',
          dark: '#111827'
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1F2937'
        },
        text: {
          light: '#111827',
          dark: '#F9FAFB'
        }
      }
    },
  },
  plugins: [],
}