# coord/mie.md — handoff file (Mie)

> **This file belongs to Mie.** Only Mie edits it. Never edit another agent's
> file, never edit `coord/BOARD.md` (coordinator-owned), never rewrite history
> in `coord/run-log.jsonl` (coordinator-only, append-only — log in this file;
> the coordinator transcribes).
> Protocol: `BUFFET-MODE.md` §5. Board: `coord/BOARD.md` (read-only for Mie).
> Runbook: `BUFFET-MODE.md` — your role is in §1.

## Role

Mie is one of the four agents in this run (Muse, Mie, Migga, Milo). Role per
run: builder (one instance per direction), independent expert, or independent
judge — as assigned on the board. A builder never grades its own work; an
expert judges ONLY its own domain, from the artifacts, never from the builder's
reasoning; a judge grades 1–5 on Type / Layout / Colour / Space with one
evidence line per score.

**Mie cannot speak in the Optimus group at all.** Coordination is through this
file + the repo only. If a milestone needs to reach the humans, the coordinator
(Muse) posts it.

**Mie is never deputy and never backup deputy** — a Mie coordinator would
either stop milestone posting for the rest of the run or post in violation
of the rule above. If the board ever names Mie as deputy, that is an error:
write it in this file and keep working as a worker; do not take over.

## How to claim work

- Read `coord/BOARD.md` for open slices (one row per slice: Slice, Owner,
  Status, Expected-min, Files, Notes — Notes links to the filled task file at
  `coord/tasks/<slice-id>.md`). No row is claimable until all six task fields
  are filled; if you find an unfilled row, write `BLOCKED — template
  incomplete` in this file and do not start.
- Claim a slice by writing in THIS file — never by editing the board:
  `CLAIM <slice-id> | plan: <2–3 lines> | files: <glob(s)> | board-hash: <hash> | at: <UTC>` —
  claim-with-a-plan. A claim without file globs is incomplete. `board-hash`
  is the `buffet/main` commit hash you read the board at
  (`git rev-parse origin/buffet/main` after fetching the board — see Poll
  cadence below). A claim with no `board-hash` is incomplete.
- **A claim is a request until the coordinator awards it.** The coordinator's
  next merge pass records the award (board row becomes `working` with your
  name). Work done before the award is at your risk. The arbiter is the
  coordinator's first-seen order; tie-break is the lexicographically smaller
  claim-commit hash (in the fork case, the earlier PR creation time). Your own
  `at: <UTC>` timestamp is a note, never the arbiter.
- **WIP = 1:** one active claim at a time. A transient second claim is allowed
  only in the same commit as posting DONE on the current slice.
- To refuse a slice: `DECLINED <slice-id> | reason: <one line>` in this file.
  A declined slice is terminal for you, not for the slice.
- If you disagree with an assignment, write the objection in this file and keep
  working on the last agreed slice — do not stall the run waiting for an answer.

## Poll cadence (binding)

- During an active buffet run, run `git pull --ff-only` **every 15 minutes**
  and read `coord/BOARD.md` + this file. On the same poll, fetch the
  mainline explicitly — `git fetch origin buffet/main`, then read the board
  at `origin/buffet/main`: a pull on your own branch never sees the board,
  which lives on `buffet/main`.
- Between polls, work from your local copy and write only to this file.
- **Term check:** on every fetch, compare the board's `coordinator-term`
  against the highest term you have seen — record it in this file as
  `Highest board term seen: <N>` (under Last seen). A board whose term is
  lower than the highest seen is superseded — ignore it.
- **Adaptive backoff when idle:** empty queue → double the pull interval per
  empty cycle, max 2 h, reset to 15 min the moment a slice appears.
- **Immediate re-poll after completion:** after pushing a completed slice,
  re-pull immediately instead of waiting for the next 15-min tick.
- **Lease:** a claim lapses after **60 min without a push** or **2× the slice's
  `expected-min`**, whichever is shorter. Renewal is by push only — any push
  (a branch commit or an own-file update) resets both clocks. The merge pass
  is the decision point: a push after the lapse but before the pass revives
  the claim. On lapse the coordinator marks the slice `failed` (reassignable)
  and logs the lapse. "Stale with recent commits = slow, leave alone" stays.
- **Liveness = pushes, full stop:** the coordinator's only observation channel
  is pushes — a last-seen line that is never pushed is invisible to the
  coordinator and renews nothing.

## Last seen (heartbeat — BUFFET-MODE.md §5, P24)

Last seen: — (no run yet) — task: — — last commit: —

One line in the Last seen section of this file, updated on your normal 15-minute pull,
carried by a push — never a commit of its own. For research / no-commit
slices this is the renewal path: push your own-file update (last-seen line +
progress note) and that push renews the lease.

## Inventory + census (at run start, on demand)

- **TOOLS block** (verified by running the command, never assumed):
  `TOOLS <UTC> — <cli> <version-output> — subagents: <yes/no/how> — notes: <...>`.
  Report the exact failure instead of improvising if a tool is missing.
- **Census report** (live sub-agents only; finished ones are not counted):
  `CENSUS <UTC> — live: <n> — <sub-1>: <task> (<working|stalled|dead>, last
  active <UTC>) — ... — stalled/dead: <names>`. Stalled = no progress for
  >30 min. Dead = you cannot reach it, or it exited without reporting.
  The coordinator posts `CENSUS REQUEST <UTC>` on the board; report in this
  file and push.

## Merge rules (binding)

- Work on your own branch `buffet/mie` and push that branch. Only the
  coordinator merges branches into the buffet mainline — never push to the
  mainline directly, **never force-push** (forbidden for all agents including
  the coordinator).
- If push access is not yet granted, work on a fork and open a pull request —
  the coordinator merges the PR (see the §9 section on the board).
- A merge conflict on your own file: routine pulls are `--ff-only`; rebase
  only your own unpushed commits — verify first with
  `git log --oneline origin/buffet/mie..HEAD` (those are the unpushed
  commits; if the list is empty there is nothing to rebase); never rebase
  commits already on origin (the next push would need a force-push, which is
  forbidden); never rebase another agent's branch. If a pull fails on
  `--ff-only` and the branch has already-pushed commits, stop and let the
  coordinator see it — do not rebase. Keep both entries on a conflict, never
  delete the other side's lines, and note it in this file for the coordinator
  to transcribe.

## The Optimus group

- **Mie never speaks in the Optimus group at all.** The group is for
  HUMAN-FACING MILESTONES ONLY, posted by the coordinator (Muse). Do NOT
  propose adding Mie to it.

## Log

- (no entries yet — append `CLAIM <slice-id>` + plan + files + timestamp and progress here; the coordinator transcribes into `coord/run-log.jsonl`.)

## Mie debate entry — 2026-11-13 ~19:35 ICT (late; deadline was 19:15)

Honest note first: this entry is late. The MIE coordinator subagent has produced no pushable output since 11:32, and my last three group messages promised "push ngay" with nothing landing. I am writing this directly now. No fake-pass: MIE-5–MIE-9 code is still unpushed; pushing those slices is next, in parallel with the rehearsal. (First attempt: branch from upstream main 4fba0b6, commit 1d7db76 — push rejected by GitHub, OAuth token lacks workflow scope, same block Milo/Migga hit. This branch is based on fork/main instead, so no workflow file is touched.)

### Proposal — taste-token crawler (new crawling direction)

Crawl real, live websites, extract their design tokens (palette, type scale, spacing rhythm) into tokens.css candidates, screenshot them at 1440/768/390 with shoot.mjs, and grade them with the deterministic gate (gate.mjs). The crawler deals tokens from the real web instead of inventing them — the taste skill's own rule is "Deal, don't invent."

Evidence it is buildable from parts that already exist: shoot.mjs (Playwright screenshots), photos.mjs (real CC0/CC BY photos only, never renders), gate.mjs (deterministic PASS/FAIL, blocks the round on FAIL), and the taste skill's deal mechanism (palettes.json + type.json, 27 diagram presets in assets/diagrams/presets.json). The only missing piece is a token extractor (computed styles → tokens.css). No new model, no new dependency, no key, $0.

Why it matters for tomorrow: the build-day product needs a real UI fast. Grounded tokens from real sites beat invented palettes, and the gate can grade them deterministically before any human looks. Limits: computed styles are facts, not copied assets — but only CC0/CC BY imagery via photos.mjs, and the extractor must not lift copyrighted images or fonts.

### Counterpoint — D73 Phase 1 (Triage → Orchestrator)

D73 Phase 1 was approved with citations required. Two gaps remain, both from my own track:

1. Corpus provenance. Citations prove an answer came from a document; they do not prove the document is trustworthy. The corpus is untrusted content reaching the orchestrator, and the Security brief (D42–D71) requires untrusted content to be treated as data with provenance and an allowlist. Without a corpus allowlist, an injected document becomes an answer with a citation attached. Phase 1 should ship only with the allowlist.
2. Call doubling against an unpublished cap. Triage adds a second LLM call per request. Hoang Anh already showed the 200/day cap was guessed before the real limits were read (A6), and the real RPD for gemini-3.5-flash-lite is unpublished. Doubling calls per request halves the number of real user queries the night can serve — on the exact night the 80% milestone needs live AI twice on a real phone. Phase 1 needs a measured RPD budget showing the doubled call count fits tonight, or it should ship as a flag, not the default path.

### Attack — Migga Idea 2, Gemma 3 270M offline (self-scored 2/5)

1. No on-device inference runtime exists anywhere in the Mobile track. skills/mobile-kit contains zero references to llama, ExecuTorch, ONNX, Gemma, or on-device inference (verified by grep), and swarm/free-tier-ai-path.md defines only cloud paths (Gemini + Groq fallback). D53–D55 is an Expo SDK 58 shell/transport. Gemma 270M is not a config change; it is a brand-new native runtime that nobody has wired, built, or run.
2. The native-module block Milo proved for ML Kit OCR applies identically. Expo Go cannot run it; a first native build is forced; fleet rules ban new native modules after 13:20 and EAS free queues 90+ minutes. It cannot land before the 20:00 rehearsal — before the idea is even locked.
3. Vietnamese quality is unmeasured. No accuracy number on the demo phone, on pitch documents, has been shown. The burden of proof is on the proposer; until then the offline claim is a promise, not a capability. Conclusion: keep as a post-hackathon experiment, not a platform commitment for tonight.

### Answer to Milo's 2 questions (via Tuan, 19:28)

1. Secret matrix + demo phone: (a) Raw keys NEVER transit this group — Thinh creates the Gemini key at 20:00 and replies only "tao xong" (Tuan's rule, restated 19:28). The matrix (which key, whose account, where stored, rotation) is defined in the Security design (D42–D71); no raw key has been posted. (b) Demo phone wipe / separate profile: NOT done as far as I can verify — no wipe or separate profile has been arranged in any record I can see. The build-day demo phone is sep's personal iPhone (she brings it tomorrow, fully charged). For tonight's rehearsal the phone owner is not assigned. This is OPEN, not passed — I am not marking it done.
2. Final physical check before 20:00: unassigned. Needs Tuan to name the checker. My proposal: the owner of tonight's rehearsal phone does it and confirms in the group with "phone checked" (no key material in the message).
