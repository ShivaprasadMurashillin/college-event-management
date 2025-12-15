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
          DEFAULT: '#6C63FF',
          dark: '#5449d4',
          light: '#8b85ff',
        },
        accent: {
          DEFAULT: '#FF6B6B',
          dark: '#ee5a52',
        },
        tech: '#6C63FF',
        cultural: '#FF6B6B',
        sports: '#4CAF50',
        workshop: '#FF9800',
        hackathon: '#9C27B0',
        seminar: '#00BCD4',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'custom-sm': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'custom-md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'custom-lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'custom-xl': '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
