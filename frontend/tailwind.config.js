/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102029",
        aqua: "#0f9f9a",
        mint: "#d8f6ef",
        coral: "#f26d5b",
        cloud: "#f6faf9",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(17, 64, 73, 0.12)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
