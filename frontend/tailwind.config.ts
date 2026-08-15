import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        sky: {
          50: "#EFF8FF",
          100: "#DCEEFE",
          200: "#B7DDFC",
          300: "#83C6F8",
          400: "#49A7EF",
          500: "#2389DE", // couleur principale e-sekooly
          600: "#166CBB",
          700: "#125597",
          800: "#12477C",
          900: "#123C67",
          950: "#0B2646",
        },
        ink: {
          900: "#0A1120", // fond mode sombre
          800: "#101A2E",
          700: "#182642",
        },
        cloud: {
          50: "#FAFCFF",
          100: "#F2F6FB",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgba(18, 71, 124, 0.08), 0 8px 24px -8px rgba(18, 71, 124, 0.10)",
        "soft-dark": "0 2px 10px -2px rgba(0,0,0,0.35), 0 8px 24px -8px rgba(0,0,0,0.45)",
        glow: "0 0 0 1px rgba(35,137,222,0.15), 0 8px 30px -8px rgba(35,137,222,0.35)",
      },
      backgroundImage: {
        "sky-horizon": "linear-gradient(135deg, #49A7EF 0%, #2389DE 45%, #125597 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
