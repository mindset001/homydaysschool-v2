/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        Poppins: ['Poppins', 'sans-serif'],
        Lora: ['Lora', 'serif'],
      },
      colors: {
        clr1: '#05878F',
        clr2: '#ECFEFF',
        gradient: {
          from: 'rgba(5, 135, 143, 1)',
          to: 'rgba(5, 135, 143, 1)',
        },
      },
      boxShadow:{
        shadow1: '0px 8px 26px 0px #046A7E2B',
        shadow3: '0px 1px 25px 0px #389FA61A',
      },
      backgroundImage: {
        'profile-pattern': "url('/src/assets/images/profile/profile-rect.svg')",
      },
      screens: {
        ml: '425px',
        "2xl": "1440px",
        '3xl': '1580px',
      },
    },
  },
  plugins: [],
};
