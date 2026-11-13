// Glass tokens — Skia shader simulation of Liquid Glass (Route B).
// Source: research/2026-11-14/liquid-glass-research-20261114.md §3.
// This is a SIMULATION: a Skia RuntimeEffect displacement shader. It is NOT
// real Liquid Glass (expo-glass-effect, iOS 26+ only, invisible on Android).
// Tune these numbers only; the shader in components/GlassLens.tsx reads them.
export const glass = {
  /** Max pixel shift of the background at the lens rim. */
  strength: 20,
  /** Chromatic split at the rim (fraction of strength, per channel). */
  aberration: 0.4,
  /** Width (px) of the rim band over which the bend ramps 0 -> 1. */
  rimBand: 34,
  /** How much the rim darkens (0-1). */
  edgeDarken: 0.16,
  /** Extra white lift at the rim (0-1). */
  edgeLift: 0.06,
  /** Lens corner radius (px). */
  cornerRadius: 28,
  /** Rim stroke: white at this opacity. */
  rimStrokeOpacity: 0.55,
  /** Top sheen: white gradient from this opacity to transparent. */
  sheenOpacity: 0.22,
  /** Comparison pill (no shader): plain white tint at this opacity. */
  tintOpacity: 0.14,
} as const;
