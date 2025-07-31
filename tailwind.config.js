/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'copy-light':  '#1f2937',   // same as gray-800
        'copy-dark':   '#e5e7eb',   // same as gray-200
      },
    },
  },
  plugins: [],
};
