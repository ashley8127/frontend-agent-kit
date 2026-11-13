# Gap review — muse-fleet / frontend-agent-kit — 2026-11-14 01:30 ICT

Author: Mie. Base: upstream main `be54f57` (PR #10 merged 2026-11-13 17:47 ICT).
Scope: repo state + coord records + GitHub API, read 01:21–01:35 ICT 2026-11-14.
Order: Tuấn, Optimus group 2026-11-14 01:18:47, mục 3 — cả team tự tìm thêm việc.
Rule applied: only gaps with concrete evidence (file / line / PR / commit) are listed.
Nothing in this file is a claim without a citation. No message was sent to the group.

## Verified state (the baseline this review measures against)

- Upstream: `phamTuan207/muse-fleet`, main `be54f57`. Fork main `aa93e75` is
  **162 commits behind** upstream (`gh api .../compare/aa93e75...be54f57`:
  ahead_by 162, behind_by 0).
- Open PRs (upstream): **#17** Milo D73 Phase 1, **#19** Milo M3 D16–D19.
  Both `mergeable: false`, `mergeable_state: dirty` (API, 2026-11-13 15:44 / 16:24 ICT).
- Merged: #2 (M1), #3 (M2), #4 (MIG-2), #5 (MIE-2), #6/#7 (MIG-3),
  #8 (Backend D49–D52), #9 (RAG proposal), #10 (FLEET-2 rehearsal prep),
  #11 (MIE-6), #12 (MIE-9), #13 (MIE-7), #14 (MIE-4), #15 (MIE-5), #16 (MIE-8).
  Merge SHAs: #12 `1e3aaa6`, #13 `a5a61d2`, #14 `97ee0e5`, #15 `e2a62cc`, #16 `9b08c50`.
- Last CI runs on main: success (`43476264060`, 2026-11-13 17:47 ICT).
- FLEET-2 rehearsal practice repo: `Nezine/fleet2-rehearsal`, default branch
  `buffet/main` at `581aa93`, last push 2026-11-13 17:06 ICT; 0 PRs.
- `coord/run-log.jsonl` last entry: 2026-11-13 11:40 ICT (clone probes).
  `coord/muse.md` has zero log entries. BOARD.md FLEET-2 row: `submitted`.

## P0 — blocks build day 14/11 09:00 if not closed

### G1 — PR #17 and #19 both CONFLICTING, untouched ~9h (owner: Milo; coordinator: Muse)
- Evidence: API `mergeable: false` for both. Local `git merge-tree --write-tree
  be54f57 <head>` reproduces it: #17 conflicts on `coord/milo.md` only;
  #19 conflicts on `coord/milo.md` + `skills/frontend-kit/references/decisions.md`.
- #17 head `87d9e9d` (`milo/backend-d73-phase1`), #19 head `70a8308`
  (`milo/m3-decisions`). Last updates 15:44 / 16:24 ICT 2026-11-13.
- CI status of both heads is UNVERIFIED (check-runs API returned no runs for
  either head SHA) — do not assume green.
- Why it matters: #17 is the D73 Phase 1 retrieval leg (citations envelope,
  §4.5); #19 is M3 D16–D19 (the deferred gate decisions S1/H3/H5/moment-none).
  Both sit on the build-day critical path (backend retrieval + gate behaviour).
- Steps: (1) Milo rebases each branch onto `be54f57` and pushes — coordinator
  must NOT rebase another agent's branch (FLEET-MODE.md §7 / BUFFET-MODE.md §5).
  (2) #17: keep both sides' `coord/milo.md` append-only entries, never delete
  the other side's lines. (3) #19: `decisions.md` needs care — D16–D19 must
  land alongside D36–D41 without renumbering either set. (4) Coordinator
  trial-merges against current main and merges; re-run CI after the rebase.

### G2 — FLEET-2 rehearsal has NO recorded verdict (owner: coordinator Muse)
- Evidence: BOARD.md FLEET-2 row still `submitted`, no verdict line.
  `coord/run-log.jsonl` last entry 11:40 ICT 2026-11-13 (before the rehearsal).
  `coord/muse.md` Log section: one 2026-11-10 seed line only.
  Practice repo: no `CONTRACT.md` on `buffet/main` nor on
  `migga/fleet2-rehearsal` (API 404 on both); 0 PRs; last push 17:06 ICT.
  Last rehearsal commit `e743595` is timestamped 00:06 ICT 2026-11-14 — past
  the 22:00 end. Last status line anywhere is `coord/migga.md` 20:55 ICT:
  Calm slice built STUBBED (LOOP PASS, AI leg deferred, no endpoint URL).
- Why it matters: FLEET-MODE.md §10 — PASS requires every step (inventory +
  census, slice dispatch, branch + merge, gate + grade, phone smoke test,
  red-team pass, handover); "a referenced file is missing" = FAIL; "Build day
  does not start on an unrehearsed workflow." CONTRACT.md was due at T+0:05
  (~20:35) and never landed; the phone smoke test never ran (see G3).
- Steps: coordinator writes the verdict (PASS / FAIL / CONDITIONAL, one line
  per §10 step with evidence) into BOARD.md + `coord/run-log.jsonl` before
  09:00. Every FAIL step becomes a GAP item with a council decision — not a
  silent workaround.

### G3 — Build-day phone leg still unproven (owner: human + Migga)
- Evidence (`coord/migga.md`, last update 20:55 ICT 2026-11-13): Expo Go
  version on the OPPO A60 UNKNOWN (`:648`, `:657`, `:669`); phone presence
  unconfirmed — adb not installed, no USB path (`:657`); Expo login NOT logged
  in, tunnel needs a human `expo login`, Metro LAN fallback untested (`:647`,
  `:662`); no preview APK built — human `eas login` outstanding (`:662`,
  `:669`); backend STUBBED unless Milo/human confirm live (`:662`).
- The two sources on Expo Go 58 still conflict and only the phone resolves it:
  `skills/maestro-smoke/SKILL.md` §0 warns store Expo Go for SDK 58 "will be
  released within a few weeks"; `skills/mobile-58-kit/SKILL.md` §5 says stores
  already serve Expo Go 58.0.5 and gives a decision tree.
- Why it matters: FLEET-MODE.md §0/§11 — a browser, emulator, photo or video
  scores 0 on the demo criterion; a human must hold a real phone and run the
  main AI flow live. This is the 40-point real-phone demo.
- Steps (all before 09:00): (1) human reads Expo Go version on the phone
  (Settings → Apps → Expo Go) and records it in `coord/migga.md`;
  (2) confirm the phone is present at Biblio; (3) `expo login` for tunnel OR
  verify the Metro LAN path end-to-end; (4) decide the vehicle (Expo Go vs
  preview APK) per `mobile-58-kit` §5 and record the decision; (5) do not
  claim any phone-side proof without evidence.

## P1 — real work, close before 09:00 if possible

### G4 — MIE-1 re-probe evidence + MIE-3 inventory exist only on stale fork branches, never PR'd (owner: Mie; merger: coordinator)
- Evidence: fork `mie/mie-1-reprobe` `baaaabb` (2026-11-13 16:23 UTC): "MIE-1
  re-probe on macOS 27 — green after PATH fix (314 OK, 0 FAIL)", macOS 27.2.1
  Apple M3, `verify.sh --strict` exit 0 post-fix, logs in
  `mie-1-reprobe/install.log`. No PR (search: 0). Fork `mie/mie-3-inventory`
  `f1bc820`: "MacBook TOOLS inventory + MODELS block, gh 2.83.0 installed".
  No MIE-3 PR merged; upstream main `coord/mie.md` still shows only the
  BLOCKED claims (`:133`, `:135`), no inventory section.
- Both branches sit on old mains (`e2a62cc` / `0d92f91`) — rebase onto
  `be54f57` first; the raw diffs vs current main are polluted by base staleness.
- Why it matters: BOARD.md calls MIE-1 "THE remaining real-world check before
  the build-day run". The proof exists but is not on main, so the board still
  reads as if the MacBook was never verified.
- Steps: rebase both branches onto `be54f57`, open PRs, coordinator merges.
  (MIE-1's first probe `d34f1b7` stopped at Step 4 pre-PR-#5 — superseded by
  the `baaaabb` re-probe; do not cite the old failure as current.)

### G5 — MIE-10 full-loop probe (D41) never started (owner: Mie; decider: coordinator)
- Evidence: no `mie-10` branch on fork or upstream (upstream branches:
  `buffet/main`, `macos-compat`, `main`, `p10-held`, `v1`); no MIE-10 entry in
  `coord/mie.md` (only a D39 constraint mention at `:169`); BOARD.md row still
  `assigned`. Its dependency (MIE-4–MIE-8 landed) is now met.
- Why it matters: no end-to-end Brief 1 loop has ever been proven on Mie's own
  machine through gate green, and the D13 refusal half has never been exercised
  in a real loop there.
- Steps: claim + run Brief 1 verbatim + the two r2 harness rules, fresh scratch
  HOME, fresh install, record + evidence pack via PR. Expected 480 min — almost
  certainly too big before 09:00. Coordinator decision needed tonight: run a
  scoped version, or carry it explicitly as a build-day risk.

### G6 — BOARD.md stale against merged reality (owner: coordinator Muse)
- Evidence: MIE-4–MIE-10 rows still `assigned` though PRs #12–16 merged
  (SHAs in the state section above); MIE-2 `submitted` though PR #5 merged;
  MIG-2 `in review` though PR #4 merged (`a93c5b8`); MIG-3 `submitted` though
  PRs #6/#7 closed; FLEET-2 `submitted` with no verdict (see G2).
  BOARD.md is Muse-owned — "no other agent edits it — ever" (BOARD.md
  handoff headers). `coord/run-log.jsonl` untranscribed since 11:40 ICT.
- Why it matters: the board is the coordination channel; agents claim and the
  coordinator awards off it. A stale board produces stale claims and duplicate
  work the night before build day.
- Steps: one coordinator reconciliation pass — flip rows to done with merge
  SHAs, transcribe the run log (merges #12–16, #10, rehearsal), update the
  FLEET-2 row with the G2 verdict.

### G7 — D67 Saturday-morning AI Studio free-tier check: no owner, no checklist, no record (owner: coordinator to award)
- Evidence: `skills/frontend-kit/references/decisions.md:711–715` (D73) makes
  Phase 2 conditional on "the Saturday-morning AI Studio free-tier check,
  D67". Grep for `D67` anywhere else in the repo: zero hits. No D67 decision
  entry, no checklist file, no owner. File Search + `gemini-embedding-2`
  free-tier eligibility is marked CHƯA KIỂM CHỨNG in
  `research/rag-agent-pattern-from-production-mvp-20261113.md`.
- Steps: award D67 tonight with a checklist file (questions: File Search free
  eligibility, embedding-2 quota, pgvector fallback viability inside the
  existing Supabase project); run it in the morning; record the verdict. If
  neither retrieval path is free, ship Phase 1 only — that is already the D73
  decision, it just needs the check to fire.

### G8 — D75 (6-point ML Kit proof, due 22:00 2026-11-13): no award, no record, no evidence (owner: coordinator to award/record)
- Evidence: `D75` appears only in `coord/migga.md:662` and `:669` ("D75 6-point
  ML Kit proof due by 22:00 — phone-side proof needs the human + a preview APK
  build (human `eas login` still outstanding); NOT claimed here"). Zero hits in
  `decisions.md`, BOARD.md, FLEET-MODE.md. Debate recommendation (Tuấn,
  Optimus group 2026-11-13 20:15): ML Kit 7/10 strongest.
- Steps: coordinator records the D75 award (or drops it with a reason) in
  `decisions.md` + BOARD.md; the owner proves the 6 points on the real phone
  or records them honestly as unproven before 09:00. Never claim phone-side
  proof without evidence.

## P2 — close tonight if cheap, else carry over explicitly

### G9 — Four Mie research/design branches on the fork, un-PR'd, two on stale bases (owner: Mie; triage: coordinator)
- Evidence (fork branches): `mie/liquid-glass-20261114` `648e6d4` — Liquid Glass
  research, CONDITIONAL verdict, base `be54f57` (current); `mie/motion-20261114`
  `5d4fe85` — motion council synthesis + skill/template for demo day;
  `mie/security-design` `e07d3c2` — Security track D57–D59 first draft, pending
  council review, base `d44db23` (stale); `mie/secret-matrix` `0e42c85` —
  secret matrix v1 (metadata only, no values), base `aa93e75` (stale).
- Steps: coordinator triages each (land / council-review / drop); rebase the
  stale two onto `be54f57`; PR + merge the keepers before 09:00. D57–D59 still
  needs its council — schedule it or carry it.

### G10 — GAP-15 + GAP-16 proposed, never awarded (owner: coordinator)
- Evidence: GAP-15 — `gate.sh:1120–1121` bare `sha256sum` with no `shasum`
  fallback, `coord/mie.md:147`, "awaiting coordinator award — do not implement
  before award". GAP-16 — moments/effects data missing, `momentFits()` always
  false with both reads ENOENT so a correctly-dealt moment FAILs the `moment`
  check, `coord/mie.md:172–178`, "proposed for the coordinator to award — NOT
  implemented"; interim position (c) adopted in D39: accept silent-empty as
  designed until GAP-16 is decided.
- Steps: award or drop each with a decision record. GAP-16 is verdict-affecting
  on any taste direction using moments — decide before build day, or carry the
  silent-empty caveat explicitly into the demo.

### G11 — D38 MEDIUM-2 open item: no-op re-pick resets the per-direction budget (owner: council)
- Evidence: `decisions.md` D38 entry — "a no-op re-pick (re-locking the same
  direction) resets the per-direction budget; the red team flags it as a budget
  evasion, but the D38 council wording counts by taste-lock epoch, so changing
  it silently would contradict the council record — it needs a council
  amendment, not a code change."
- Steps: council amendment, or accept + document the escape. Small, but it is
  a known hole in the loop's stop rules on build day.

### G12 — Build-day run-start prep has no owner-named deputy, no protection check, no Maestro confirmation (owner: coordinator + humans)
- Evidence: FLEET-MODE.md §11 — "Deputy succession matters most on this day:
  if the coordinator goes stale >60 min mid-day … the named deputy takes over".
  No deputy is named anywhere (`coord/muse.md` deputy section is blank template
  text). Branch protection on the practice repo returned 404 via API
  (UNVERIFIED — the task file asserts PR-required + coordinator bypass, the flow
  is fork + PR regardless). `skills/maestro-smoke/SKILL.md` §1: "Install —
  before 11:00, or not at all" — 01:30 Saturday, the window is open but no
  install is confirmed on any machine. CONTRACT.md for build day is unwritten
  (written at run start, T+0:05) — and the rehearsal showed exactly this step
  slipping (G2: it never landed).
- Steps: name deputy + backup before 09:00; verify the branch-protection plan
  for the product repo; confirm Maestro installed on the demo machine or drop it
  explicitly; agree who writes CONTRACT.md at T+0:05 and what happens if it slips.

### G13 — Fork main 162 commits behind upstream (owner: Mie)
- Evidence: compare API `aa93e75...be54f57` — ahead_by 162, behind_by 0.
  Every open Mie branch was cut from an old main (see G4, G9).
- Steps: fast-forward fork main to `be54f57` (no force-push needed); rebase open
  Mie branches. Cheap, unblocks G4/G9.

### G14 — Backend live verification still owed (owner: Milo; blocker: human-held keys/projects)
- Evidence: `coord/milo.md` 2026-11-13 08:36Z (Backend D49–D52): "NOT verified
  live (needs human-held keys/projects, per the 15:18 split): an actual deployed
  Edge Function call, a real Convex deployment, the Gemini/Groq quotas." D49
  requires the Supabase project created close to build day + verified live
  (7-day idle pause) and per-agent Convex deployments verified before the
  rehearsal. The rehearsal backend was STUBBED (`coord/migga.md:662`).
- Steps: human hands keys/projects; Milo verifies a live Edge Function call +
  quotas before 09:00. If that cannot happen, record stub-mode as the explicit
  build-day plan — do not let the demo discover it live.

### G15 — Figma for Education status UNCONFIRMED; `get_variable_defs` live test NOT RUN (owner: user / coordinator)
- Evidence: BOARD.md "Open items (human decisions — NOT assumed)": "Figma for
  Education status (gates runbook path C): UNCONFIRMED — path C stays
  conditional." / "`get_variable_defs` remote live test (gates any README
  promise about MCP token-pull): NOT RUN."
- Steps: confirm the Figma seat type before build day or keep path C conditional;
  run the `get_variable_defs` live test or drop the README promise about MCP
  token-pull.

### G16 — F3 still open: no two named distinct humans for the judge/human gate (owner: humans / coordinator)
- Evidence: BOARD.md coordinator review of PR #4 (2026-11-13 04:57 ICT): "F3
  stays open (needs named distinct humans)." MIE-10 DoD (BOARD.md:138): "do NOT
  fabricate the two named humans; F3 is carried, not hers to close".
- Steps: humans name the two people before 09:00, or record that build-day
  judging falls back to "gate green, vision not available" — the honest grade
  MIE-10 already anticipates.

## Not gaps (checked, no action)
- MIE-4–MIE-9: all merged (#11–#16). MIE-2 merged (#5). MIG-1/MIG-2/MIG-3:
  merged (#4, #6, #7). Backend D49–D52 kit-side: merged (#8).
- D73 Phase 1 code exists (PR #17) — the gap is only the conflict + landing.
- `skills/mobile-58-kit` §5 already documents the Expo Go 58 decision tree;
  the gap is the phone-side check (G3), not the docs.
- P33-2 HELD + the 18 blocked clone-probe records (`coord/run-log.jsonl`,
  `cb3b89b`): probe-swarm records, not build-day blockers — not listed as gaps.
- `coord/muse.md` "Mie never posts there" line is superseded by the user's
  2026-11-13 instruction (Mie posts in the group and answers when called);
  noted here only so nobody re-applies the stale line.

## Suggested order for the remaining night (coordinator's call)
1. G2 verdict + G6 board reconciliation (Muse) — unblocks all claiming.
2. G1 rebase (Milo) + G13 fork sync (Mie) — unblocks landings.
3. G3 phone checks (human + Migga) + G14 live backend (human + Milo) — the two
   human-gated items; they cannot be done by agents alone.
4. G4 PRs (Mie) + G7 D67 award + G8 D75 record (coordinator).
5. G9 triage, G10 award/drop, G12 deputy + Maestro, G15/G16 human decisions.
6. G5 MIE-10: explicit scope-or-carry decision, not silent drift.
