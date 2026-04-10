/**
 * sprintTheme.ts — Design tokens matching AdCanvas-Max (StaticAds) theme
 *
 * Orange accent, Plus Jakarta Sans, dark sidebar + light content,
 * rounded-xl corners, grain overlay aesthetic.
 */

export const T = {
  // Backgrounds
  bg: "#fafafa",
  bgWhite: "#ffffff",
  card: "#ffffff",
  cardHover: "#f5f5f5",
  sidebar: "#111111",
  sidebarHover: "rgba(255,255,255,0.10)",
  sidebarActive: "#E8541A",

  // Borders
  border: "#d4d4d4",
  borderLight: "#e5e5e5",
  borderSidebar: "rgba(255,255,255,0.05)",

  // Text
  text: "#111111",
  textSub: "#717171",
  textMuted: "#a3a3a3",
  textWhite: "#e0e0e0",
  textSidebarMuted: "rgba(255,255,255,0.4)",

  // Accent
  accent: "#E8541A",
  accentLight: "#FFF3EE",
  accentMid: "#F97440",
  accentText: "#ffffff",

  // Status
  green: "#16a34a",
  greenBg: "rgba(22, 163, 74, 0.08)",
  yellow: "#ca8a04",
  yellowBg: "rgba(202, 138, 4, 0.08)",
  red: "#dc2626",
  redBg: "rgba(220, 38, 38, 0.08)",
  blue: "#2563eb",
  blueBg: "rgba(37, 99, 235, 0.08)",
  purple: "#7c3aed",
  purpleBg: "rgba(124, 58, 237, 0.08)",
  teal: "#0d9488",
  tealBg: "rgba(13, 148, 136, 0.08)",

  // Typography
  font: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontDisplay: "'Plus Jakarta Sans', sans-serif",

  // Radii
  radius: 12,
  radiusLg: 16,
  radiusFull: 9999,
} as const;

/** Category colors for angle badges */
export const CAT_COLORS: Record<string, { color: string; bg: string }> = {
  "Problem-Aware": { color: "#dc2626", bg: "rgba(220, 38, 38, 0.08)" },
  "Benefit-Led": { color: "#16a34a", bg: "rgba(22, 163, 74, 0.08)" },
  "Social Proof": { color: "#2563eb", bg: "rgba(37, 99, 235, 0.08)" },
  "Direct Offer": { color: "#ca8a04", bg: "rgba(202, 138, 4, 0.08)" },
  Curiosity: { color: "#7c3aed", bg: "rgba(124, 58, 237, 0.08)" },
  Comparison: { color: "#0d9488", bg: "rgba(13, 148, 136, 0.08)" },
};

export const CATEGORIES = [
  "All",
  "Problem-Aware",
  "Benefit-Led",
  "Social Proof",
  "Direct Offer",
  "Curiosity",
  "Comparison",
] as const;
