/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        data: ['"VT323"', 'monospace'],
        ui: ['"DotGothic16"', 'sans-serif'],
      },
      colors: {
        accent: '#7fffaa',
      },
    },
  },
  plugins: [],
}

