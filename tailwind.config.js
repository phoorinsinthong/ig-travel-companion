/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ig: {
          purple: '#833AB4',
          red: '#FD1D1D',
          orange: '#FCB045',
          pink: '#E1306C',
          dark: '#121212',
          card: '#1e1e24',
          border: '#2e2e38'
        }
      },
      height: {
        'screen-dvh': '100dvh'
      }
    },
  },
  plugins: [],
}

