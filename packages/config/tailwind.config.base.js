/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../../packages/ui/src/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        primary: "var(--primary-text)",
        secondary: "var(--secondary-text)",
        border: "var(--border)",
        brand: {
          DEFAULT: "var(--brand)",
          dark: "var(--brand-dark)"
        }
      }
    }
  },
  plugins: [],
};
