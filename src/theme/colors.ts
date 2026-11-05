/**
 * BrandHub Design Tokens — Color
 * Source: BrandHubDesign.md + globals.css
 * Usage: import { colors } from "@/theme/colors"
 */

export const colors = {
  // Brand & Accent
  brandOrange: "#f05a28",
  brandOrangeSoft: "#fff0eb",

  // Surface
  canvas: "#fafafa",
  inverseCanvas: "#09090b",
  surfaceSoft: "#f4f4f5",
  surfaceMid: "#e4e4e7",
  hairline: "#e4e4e7",
  sidebarBg: "#09090b",
  sidebarFg: "#fafafa",
  sidebarActive: "#f05a28",
  sidebarActiveFg: "#ffffff",

  // Text
  ink: "#0a0a0a",
  inverseInk: "#fafafa",
  mutedFg: "#71717a",

  // Semantic
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",

  // Channel
  instagram: "#ec4899",
  twitter: "#1d9bf0",
  linkedin: "#0a66c2",
  blog: "#6366f1",

  // Overlay
  overlayScrim: "#000000",
} as const;

export type BrandColor = keyof typeof colors;
