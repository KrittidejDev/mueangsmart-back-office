import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#210e79",
          primary: "#210e79",
          hover: "#190961",
          light: "#ece9fa",
          cyan: "#1dd5df",
        },
        ms: {
          50: "#ece9fa",
          100: "#dcd6f5",
          500: "#361db5",
          600: "#210e79",
          700: "#190961",
          900: "#0f0545",
        },
      },
      fontFamily: {
        sans: ["var(--font-prompt)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
