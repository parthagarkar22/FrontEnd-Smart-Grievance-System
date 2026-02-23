/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F2A44",
        secondary: "#1ABC9C",
        accent: "#F4B400",
        bg: "#F5F7FA",
        textMain: "#2C3E50",
        success: "#2ECC71",
        warning: "#E67E22",
        error: "#E74C3C",
      },
    },
  },
  plugins: [],
};
