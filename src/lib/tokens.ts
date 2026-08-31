/**
 * Devora Design Tokens Ground Truth
 * Derived strictly from design.md and .piardify/context.md
 */

export const COLOR_TOKENS = {
  // Devora Core Palette (Section 04)
  ink: "#141817",
  inkSoft: "#2A302D",
  background: "#FCFBF8",
  surface: "#F5F2EA",
  surfaceStrong: "#EBE7DD",
  brand: "#E85D3F",
  brandDark: "#C94A30",
  brandSoft: "#F7D8D0",
  border: "#D9D5CB",
  borderStrong: "#BDB8AC",
  muted: "#77766F",
  mutedStrong: "#555650",
  success: "#3E7A5A",
  warning: "#B87824",
  danger: "#B94A43",

  // Dark / Obsidian Alternative
  dark: {
    base: "#090A0C",
    surface1: "#121318",
    surface2: "#181A22",
    border: "#222634",
    textPrimary: "#F3F4F6",
    textMuted: "#9CA3AF",
    textDim: "#6B7280",
  },
} as const;

export const TYPOGRAPHY_TOKENS = {
  fonts: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    serif: '"Instrument Serif", Georgia, serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  hierarchy: {
    display: { size: "56px-72px", weight: "500-600" },
    h1: { size: "44px-56px", weight: "600" },
    h2: { size: "32px-40px", weight: "600" },
    h3: { size: "22px-28px", weight: "600" },
    bodyLarge: { size: "18px-20px" },
    body: { size: "15px-17px" },
    meta: { size: "12px-14px" },
  },
  tracking: {
    tight: "-0.02em",
    wide: "+0.05em",
  },
  maxProseChars: 75,
} as const;

export const SHAPE_TOKENS = {
  radius: {
    input: "8px",
    button: "8px",
    card: "14px",
    container: "18px",
    modal: "18px",
    pill: "9999px",
  },
} as const;

export const ELEVATION_TOKENS = {
  cardDefault: "border: 1px solid var(--color-border); background: var(--color-surface);",
  cardElevated: "box-shadow: 0 10px 30px rgba(20, 24, 23, 0.06);",
} as const;

export const MOTION_TOKENS = {
  micro: "120ms-180ms",
  component: "180ms-260ms",
  page: "250ms-350ms",
  ease: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;
