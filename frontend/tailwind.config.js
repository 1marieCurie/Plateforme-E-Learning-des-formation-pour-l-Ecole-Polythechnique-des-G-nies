// tailwind.config.js
const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ← Ajoute tous tes composants/pages
    "./node_modules/@heroui/theme/dist/components/navbar.js",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class", // ← active le mode sombre via class="dark"
  plugins: [heroui()],
};
