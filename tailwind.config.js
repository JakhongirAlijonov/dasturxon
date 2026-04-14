export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Uzbek palette — we'll use these throughout
        lapis: { DEFAULT: "#1A5276", light: "#2E86C1" },
        gold: { DEFAULT: "#D4AC0D", light: "#F1C40F" },
        cream: { DEFAULT: "#FDF6E3" },
      },
    },
  },
  plugins: [],
};
