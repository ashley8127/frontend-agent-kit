# Motion × Liquid Glass — cross-synthesis (Milo, 2026-11-14 morning)

Scope: ONLY the join between the two overnight councils — what neither doc
says alone. Everything else stands as written: motion council synthesis
(`motion-council-synthesis-20261114.md`, PR #22) and the liquid glass
council (`research/liquid-glass-council-20261114.md`, PR #21).

## 1. One phone check closes three open items

Both councils left the same two facts open, and they are the same check:

- Motion C1 — has Expo Go 58 reached the store? (marked OPEN, most important)
- Motion C2 / Glass correction #2 (Milo's PR #21 review) — is Skia 2.14.0
  inside Expo Go 58? The glass council's fact list says yes; its own
  implementation report §2.4 says no. Both cannot be true.

Resolution: the pre-09:00 Expo Go 58 check on the real demo phone decides
all three at once. If Expo Go 58 runs the project, its bundled module list
settles Skia's presence empirically — no more doc-versus-doc. Record the
outcome in both council docs; until then, plan as if the preview APK is the
demo vehicle (the glass council's R4 rebuild warning already assumes this).

## 2. Where glass and motion meet on a surface

- A glass surface is a floating control (glass council rule 4), so it takes
  the motion kit's control behaviour: press scale 0.96 + light haptics on
  the meaningful action only (PR #22 demo, Pattern F), spring tokens passed
  explicitly — never a bare .springify() (Milo's PR #22 review note).
- No entrance stagger on glass. Stagger (Pattern B) belongs to content
  lists; a glass control appears WITH its content, not after it — a
  late-arriving glass bar over already-settled content reads as lag.
- Both accessibility switches govern BOTH effects: Reduce Transparency
  kills the glass treatment (glass council), Reduce Motion kills entrance
  and spring motion (motion template). Where a surface has both, either
  switch flattens it to the plain, static form. Neither council stated
  this join rule; today's build should.

## 3. Evidence state (so nobody double-counts)

- Motion patterns B/F are verified off-device only (Mie's MacBook exports,
  PR #22). Glass Route B is verified off-device only (numpy re-render,
  PR #25). The rehearsal slice (fleet2-rehearsal PR #1) shipped skeleton →
  cards under the real contract, but its motion was never independently
  graded on a phone.
- Therefore the motion synthesis §4 phone-test list is the single arbiter
  for both councils today. Nothing in this note upgrades any off-device
  result to a phone result.
