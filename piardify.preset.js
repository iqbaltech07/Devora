/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        devora: {
          ink: {
            DEFAULT: "#0D1110",
            soft: "#1E2422",
          },
          background: "#FAF8F5",
          surface: {
            DEFAULT: "#FFFFFF",
            soft: "#F3EFEA",
            strong: "#F3EFEA",
          },
          brand: {
            DEFAULT: "#317B67",
            dark: "#245E4E",
            soft: "#E8F7F0",
          },
          border: {
            DEFAULT: "#E8E2D8",
            strong: "#D1C9BC",
          },
          muted: {
            DEFAULT: "#646A66",
            strong: "#525854",
          },
          status: {
            success: "#10B981",
            warning: "#F59E0B",
            danger: "#EF4444",
          },
        },
        piardify: {
          dark: "#0D1110",
          surface: "#FFFFFF",
          elevated: "#F3EFEA",
          border: "#E8E2D8",
          accent: "#317B67",
          text: {
            primary: "#0D1110",
            muted: "#646A66",
            dim: "#525854",
          },
          status: {
            success: "#10B981",
            warning: "#F59E0B",
            error: "#EF4444",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["Instrument Serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        input: "12px",
        button: "12px",
        card: "24px",
        container: "24px",
        modal: "24px",
        pill: "9999px",
        sharp: "4px",
        subtle: "8px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(20, 24, 23, 0.06)",
        subtle: "0 1px 2px 0 rgba(20, 24, 23, 0.04)",
      },
    },
  },
};
