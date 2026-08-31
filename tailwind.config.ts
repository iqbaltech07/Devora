import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [require("./piardify.preset.js")],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-ink)",
        card: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-ink)",
        },
        popover: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-ink)",
        },
        primary: {
          DEFAULT: "var(--color-brand)",
          foreground: "#FFFFFF",
          hover: "var(--color-brand-dark)",
        },
        secondary: {
          DEFAULT: "var(--color-surface-strong)",
          foreground: "var(--color-ink)",
        },
        muted: {
          DEFAULT: "var(--color-surface-strong)",
          foreground: "var(--color-muted)",
        },
        accent: {
          DEFAULT: "var(--color-brand-soft)",
          foreground: "var(--color-brand-dark)",
        },
        destructive: {
          DEFAULT: "var(--color-danger)",
          foreground: "#FFFFFF",
        },
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-brand)",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Plus Jakarta Sans",
          "Outfit",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["var(--font-serif)", "Instrument Serif", "Georgia", "serif"],
        mono: [
          "var(--font-mono)",
          "Outfit",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tight: "-0.02em",
        wide: "+0.05em",
      },
      borderRadius: {
        input: "8px",
        button: "8px",
        card: "14px",
        container: "18px",
        modal: "18px",
        pill: "9999px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        micro: "150ms",
        component: "200ms",
        page: "300ms",
      },
      boxShadow: {
        card: "0 10px 30px rgba(20, 24, 23, 0.06)",
        subtle: "0 1px 2px 0 rgba(20, 24, 23, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
