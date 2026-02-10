/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0B1215',
        chalk: '#FAFAF8',
        sage: '#E8EDE6',
        gold: '#C8A24E',
        'gold-light': '#F5EDD4',
        accent: '#6B5FCF',
        'accent-deep': '#5a4fbf',
        'accent-light': '#E8E5FF',
        'warm-gray': '#6B6560',
        'light-gray': '#F0EFEC',
        border: '#E0DDD8',
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        body: ['Plus Jakarta Sans', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
