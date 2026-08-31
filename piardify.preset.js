/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        devora: {
          ink: {
            DEFAULT: "#141817",
            soft: "#2A302D",
          },
          background: "#FCFBF8",
          surface: {
            DEFAULT: "#F5F2EA",
            strong: "#EBE7DD",
          },
          brand: {
            DEFAULT: "#E85D3F",
            dark: "#C94A30",
            soft: "#F7D8D0",
          },
          border: {
            DEFAULT: "#D9D5CB",
            strong: "#BDB8AC",
          },
          muted: {
            DEFAULT: "#77766F",
            strong: "#555650",
          },
          status: {
            success: "#3E7A5A",
            warning: "#B87824",
            danger: "#B94A43",
          },
        },
        piardify: {
          dark: "#141817",
          surface: "#F5F2EA",
          elevated: "#EBE7DD",
          border: "#D9D5CB",
          accent: "#E85D3F",
          text: {
            primary: "#141817",
            muted: "#77766F",
            dim: "#555650",
          },
          status: {
            success: "#3E7A5A",
            warning: "#B87824",
            error: "#B94A43",
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
        input: "8px",
        button: "8px",
        card: "14px",
        container: "18px",
        modal: "18px",
        pill: "9999px",
        sharp: "2px",
        subtle: "6px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(20, 24, 23, 0.06)",
        subtle: "0 1px 2px 0 rgba(20, 24, 23, 0.04)",
      },
    },
  },
};
