import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Vestaply identity: deep green primary, ivory background
        ivory: {
          50: "#fdfcf7",
          100: "#f9f6ee",
          200: "#f1ebd9",
        },
        green: {
          // Deep institutional green
          900: "#0e3d2e",
          800: "#15563f",
          700: "#1e6e51",
          600: "#2a8764",
          500: "#3aa078",
          400: "#6fbf99",
          200: "#bfe5d2",
          100: "#dff2e6",
        },
        mint: {
          200: "#cfeede",
          100: "#e6f7ee",
        },
        amber: {
          500: "#f5a623",
          100: "#fef3d6",
        },
        red: {
          600: "#c0392b",
          100: "#fadcd6",
        },
        charcoal: {
          900: "#1f2421",
          700: "#3a4140",
          500: "#6b7472",
          400: "#8a928f",
          300: "#b4bab7",
          200: "#d8dcd9",
        },
      },
      fontFamily: {
        // Editorial for landing page, sans for app
        editorial: ["var(--font-editorial)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;