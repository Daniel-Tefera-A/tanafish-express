import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lake: {
          50: "#eef6fb",
          100: "#d6e9f5",
          200: "#aed3ec",
          300: "#7db6de",
          400: "#4a94cb",
          500: "#2a76b3",
          600: "#1d5c91",
          700: "#184a75",
          800: "#143d60",
          900: "#0b2540",
          950: "#071830",
        },
        lime: {
          400: "#a3e635",
          500: "#84cc16",
          600: "#65a30d",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Noto Sans Ethiopic", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Noto Sans Ethiopic", "serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(7, 24, 48, 0.18)",
      },
      keyframes: {
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(132,204,22,.6)" },
          "100%": { boxShadow: "0 0 0 18px rgba(132,204,22,0)" },
        },
      },
      animation: { "pulse-ring": "pulseRing 1.4s ease-out infinite" },
    },
  },
  plugins: [],
};
export default config;
