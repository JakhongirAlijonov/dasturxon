export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        lapis: { DEFAULT: "#1A3A5C", light: "#2E6DA4", dark: "#0F2236" },
        gold: { DEFAULT: "#C9A84C", light: "#E8C96A", dark: "#9A7A2E" },
        cream: { DEFAULT: "#FDF6E3", dark: "#F5E6C8" },
        rust: { DEFAULT: "#8B3A2A" },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
