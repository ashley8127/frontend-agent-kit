# motion-demo — minimal Expo demo for the motion template

Minimal Expo SDK 58 app proving the motion template recipe actually runs.
Source of the recipe: `research/2026-11-14/skills-motion-template-20261114.md`
(council verdict: GO Reanimated 4.7.1 + Gesture Handler 3.3.0 +
`expo-animation` / `animate-expo` skills; CONDITIONAL Skia v2.14.0 and
Lottie 7.5.0 with a dev build only; NO-GO Moti, R3F, Skia v3).

## What this demo applies

| Piece | Template section | Implementation |
| --- | --- | --- |
| Motion tokens | §1 | `design/motion.ts` — one token set, locked |
| Screen transition | §3, Pattern A | `app/_layout.tsx` — native stack, no white flash |
| Entrance / stagger list | §4, Pattern B | `components/StaggerList.tsx` — FadeInDown, fade 0 + rise **24px**, 300ms, 60ms stagger, 360ms cap |
| Press feedback | §8, Pattern F | `components/PressableScale.tsx` — scale 0.96 spring + light haptics |

Golden rule kept throughout: only `transform` + `opacity` animate per
frame; all motion runs on the UI thread via Reanimated worklets.

## Run

```bash
npm install
npx expo start        # Expo Go, or a dev build
```

## Verify (must all pass, 0 errors)

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # eslint .
npm run export:web    # expo export --platform web
npm run export:android # expo export --platform android
```

## Test results

Verified on the MacBook (macOS 27.2.1, Node v24.22.1, npm 11.19.1),
2026-11-14 ~01:40 +07 — all pass, 0 errors:

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | exit 0 |
| Lint | `npm run lint` (`eslint .`) | exit 0 |
| Export web | `npm run export:web` | exit 0 |
| Export android | `npm run export:android` | exit 0 |
| Doctor | `npx expo-doctor@latest` (1.21.8) | 20/20 checks passed |

Pins verified in `package.json`: `expo ~58.0.25`, `react-native 0.88.1`,
`react 19.3.0`, `expo-router ~58.0.31`, `react-native-reanimated 4.7.1`,
`react-native-worklets 0.13.0`, `react-native-gesture-handler ~3.3.0`,
`expo-haptics ~58.0.8`.

Notes: (1) first run failed tsc/eslint only because the tabs template's
`+not-found.tsx` referenced a deleted `Themed` component — deleted the
file; (2) eslint's `react-hooks/immutability` flags Reanimated
`SharedValue` assignments by design, so it is disabled with a comment in
`components/PressableScale.tsx`. Not yet run on a real phone / dev build —
that is the next step before demo day.
