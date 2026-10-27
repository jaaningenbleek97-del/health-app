import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: token("--cream-50"),
          100: token("--cream-100"),
          200: token("--cream-200"),
          300: token("--cream-300"),
        },
        surface: {
          DEFAULT: token("--surface"),
        },
        sage: {
          50: token("--sage-50"),
          100: token("--sage-100"),
          200: token("--sage-200"),
          300: token("--sage-300"),
          400: token("--sage-400"),
          500: token("--sage-500"),
          600: token("--sage-600"),
          700: token("--sage-700"),
          800: token("--sage-800"),
          900: token("--sage-900"),
        },
        terracotta: {
          50: token("--terracotta-50"),
          100: token("--terracotta-100"),
          200: token("--terracotta-200"),
          300: token("--terracotta-300"),
          400: token("--terracotta-400"),
          500: token("--terracotta-500"),
          600: token("--terracotta-600"),
          700: token("--terracotta-700"),
          800: token("--terracotta-800"),
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
