// Motion tokens — single source of truth for the demo.
// Source: research/2026-11-14/skills-motion-template-20261114.md §1
// (Gesture report §2 + §4.5, Reanimated report §3, §5).
// Entrance rise is 24px per the task spec (D16 Pattern 5: stagger fade 0
// + rise 24px), NOT the template's 12px token — the task spec wins.
export const motion = {
  duration: {
    instant: 100, // press
    fast: 200, // micro-interaction
    base: 300, // sheet / modal / toast / entrance
    slow: 400, // hero / large entrance only
  },
  stagger: 60, // ms / item
  staggerCap: 360, // ms total — item 7+ shares the 360ms delay
  spring: {
    default: { damping: 20, stiffness: 300 }, // sheet / card
    snappy: { damping: 26, stiffness: 500 }, // press / toggle
  },
  entrance: { translateY: 24, scaleFrom: 0.96 },
  // Hidden Reanimated default when .springify() is called with no args:
  // damping 120 / mass 4 / stiffness 900 — different from the tokens above.
  // Always pass tokens explicitly; never mix bare presets with tokens.
} as const;
