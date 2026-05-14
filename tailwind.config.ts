import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: { 50: "#FCFEF7", 100: "#F5F8EE", 200: "#EDF2E0", 300: "#E1E8CF" },
        lime: {
          50:  "#F2FFE0",
          100: "#E0FFB8",
          200: "#C8FA84",
          300: "#A8F04A",
          400: "#86D920",
          500: "#65B70F",
          600: "#4E930A",
          700: "#3B7008"
        },
        mint:    "#B7F0CF",
        lemon:   "#F6FFB1",
        peach:   "#FFD7B5",
        sky:     "#CFE9FF",
        lilac:   "#E2D6FF",
        rose:    "#FFD1DC",
        ink: {
          900: "#1A2118",
          800: "#26301F",
          700: "#3A4632",
          600: "#5A6650",
          500: "#7C8773",
          400: "#A6AE9C",
          300: "#C7CDBE",
          200: "#E2E6D9"
        }
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        sans:    ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "ui-monospace", "monospace"]
      },
      boxShadow: {
        soft: "0 4px 16px -4px rgba(60, 90, 30, 0.10), 0 2px 4px -2px rgba(60, 90, 30, 0.06)",
        card: "0 8px 28px -8px rgba(60, 90, 30, 0.18), 0 2px 6px -2px rgba(60, 90, 30, 0.08)",
        glow: "0 6px 22px -4px rgba(134, 217, 32, 0.45)",
        ring: "0 0 0 4px rgba(168, 240, 74, 0.25)"
      },
      keyframes: {
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(134,217,32,0.55)" },
          "50%":     { boxShadow: "0 0 0 12px rgba(134,217,32,0)" }
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-3px)" }
        },
        sparkle: {
          "0%,100%": { opacity: "0.35", transform: "scale(0.9)" },
          "50%":     { opacity: "1",    transform: "scale(1.15)" }
        },
        slideUp: {
          from: { transform: "translateY(8px)", opacity: "0" },
          to:   { transform: "translateY(0)",   opacity: "1" }
        }
      },
      animation: {
        pulseGlow: "pulseGlow 2.2s ease-out infinite",
        floaty:    "floaty 4s ease-in-out infinite",
        sparkle:   "sparkle 2.8s ease-in-out infinite",
        slideUp:   "slideUp 0.3s ease-out"
      }
    }
  },
  plugins: []
};
export default config;
