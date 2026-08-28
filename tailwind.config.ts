import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FBF8F1",
          100: "#F5EFE0",
          200: "#EDE4CE",
          300: "#E0D4B5",
        },
        sage: {
          50: "#F2F5F0",
          100: "#E0E8DB",
          200: "#C5D4BC",
          300: "#A3B8A0",
          400: "#7A9A78",
          500: "#5C7D5A",
          600: "#4A6548",
          700: "#3A5039",
          800: "#2D3E2C",
          900: "#1F2B1E",
        },
        terracotta: {
          50: "#FBF0EB",
          100: "#F5D9CC",
          200: "#E8B8A0",
          300: "#D9946E",
          400: "#C9724A",
          500: "#B55A35",
          600: "#9A4829",
          700: "#7D3920",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
