/** @type {import("tailwindcss").Config} */
export default {
  darkMode: ['selector', "[class*='app-dark']"],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
