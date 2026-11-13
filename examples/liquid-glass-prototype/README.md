# Liquid Glass prototype — Skia shader simulation (Android fallback)

Minimal Expo SDK 58 demo of a **simulated** Liquid Glass lens, built per the
research verdict in `research/2026-11-14/liquid-glass-research-20261114.md`
(CONDITIONAL — branch `mie/liquid-glass-20261114`).

## What it is

One static screen: a colourful background, a "liquid" lens card, and a
plain-tint pill for comparison.

- The lens is a Skia `RuntimeEffect` (SkSL) displacement shader
  (`components/GlassLens.tsx`): background pixels bend toward the lens rim
  (0 at the centre, max 20px at the edge), with per-channel offsets for
  chromatic aberration, edge darkening, a rim stroke and a top sheen.
- Labels are React Native `Text` drawn **above** the canvas, never distorted.
- If the OS has Reduce Transparency on, the displacement is switched off
  and the lens falls back to a plain tint (research §6.5).

## What it is NOT

- **Not real Liquid Glass.** Real Liquid Glass is `expo-glass-effect`,
  iOS 26+ only. On the Android demo phone it falls back to a plain `View`
  — invisible. This prototype is the Route B fallback: a shader that *looks
  like* refraction on Android. It is deliberately **not** using
  `expo-glass-effect` (hard constraint from the runbook).
- **Static content only.** Skia cannot see the live React Native view tree,
  so only the bundled background image bends. Scrolling/live content inside
  the lens would need snapshotting first (the `expo-glass-carousel`
  approach) — out of scope for this prototype.
- **Not run on a real phone / dev build yet.** Runs in Expo Go
  (`@shopify/react-native-skia` 2.14.0 is Included in Expo Go). The visual
  "is it convincing?" check was done by simulating the exact shader math
  off-device (see below); on-device visual confirmation is still open.

## Tuning

`design/glass.ts` holds the numbers. Tuned off-device in two iterations by
re-implementing the shader math in numpy and viewing the result at 390×844:

- v1: strength 14, rim band 26px — bend barely visible, reads as plain frosted glass.
- v2 (kept): strength 20, aberration 0.40, rim band 34px — the rim bend and
  chromatic fringe are unmistakable where the white stripe / cyan circle
  cross the lens edge, centre stays clean and readable. No further tuning:
  the 1-hour time-box is spent.

## Stack

Same scaffold as `examples/motion-demo/` (PR #22): Expo `~58.0.25`, RN
0.88.1, React 19.3.0, `expo-router ~58.0.31`, Reanimated 4.7.1 (Skia peer
dep), plus `@shopify/react-native-skia` **2.14.0**. Do NOT upgrade Skia to
v3 (`react-native-skia`) — v3 needs a dev build and is not in Expo Go.

## Commands

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run export:web
npm run export:android
npx expo start      # Expo Go (SDK 58)
```

## Test results

<!-- filled in after the MacBook run; see the PR body for the table -->

## Honest limits

1. Simulation, not optics: no real refraction, reflection, or light transport.
2. Static background only — no live/scrolling content inside the lens.
3. Not yet seen on a real phone; off-device simulation is not a device render.
4. Skia adds native binary weight to the APK (not measured here).
5. Web export bundles CanvasKit; web is not the demo target and was only
   checked for export success, not visual parity.
