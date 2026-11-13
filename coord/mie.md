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

## Mie handoff — ongoing development (from 2026-11-12)

- 2026-11-13 01:08 UTC — CLAIM MIE-1 | plan: real-MacBook clone-and-go (fresh clone → ./install.sh → ./verify.sh → Brief-1 probe) | files: install.sh, verify.sh, skills/frontend-kit/** (probe only) | board-hash: aa93e75 | at: 2026-11-13 01:08 UTC | status: BLOCKED at claim time (MacBook not opened by owner); UNBLOCKED 2026-11-13 ~02:21 UTC — SSH verified working by the coordinator (Tailscale 100.66.105.32, macOS 27.2.1). Clone-and-go itself NOT yet run.
- 2026-11-13 01:08 UTC — CLAIM MIE-2 | plan: verify the macOS CI failures live, council-decide the fix (D21), implement on fork branch, QC + red team, prove with a CI run on the branch (macOS jobs green), open a PR to upstream main | files: install.sh, verify.sh, skills/frontend-kit/scripts/gate/** | board-hash: aa93e75 | at: 2026-11-13 01:08 UTC | status: PR #5 opened 08:40 13/11 (+07) — CI all green 08:56 (ubuntu + macos-15 + macos-26); coordinator verification running; merge pending its verdict.
- 2026-11-13 01:08 UTC — CLAIM MIE-3 | plan: MacBook TOOLS inventory (BUFFET-MODE.md §2) + MODELS block (FLEET-MODE.md §2) | files: coord/mie.md (inventory section) | board-hash: aa93e75 | at: 2026-11-13 01:08 UTC | status: DONE 2026-11-13 02:40 UTC — inventory below, all versions from commands actually run on the MacBook via SSH. (Was BLOCKED at claim time with MIE-1; unblocked by the same SSH fix.)

## TOOLS — MacBook inventory (MIE-3, BUFFET-MODE.md §2)

`TOOLS 2026-11-13 02:40 UTC — machine: Mac15,12, arm64 Apple Silicon, 8 CPUs, 16 GiB RAM (hw.memsize 17179869184), macOS 27.2.1 (Build 26B131), Tailscale IP 100.66.105.32 — disk: 228Gi volume, 28–29Gi free (df: 29Gi at 02:23 UTC, 28Gi at 02:31 UTC; container 245.1 GB total / 30.5 GB free) — bash: GNU bash, version 3.2.57(1)-release (arm64-apple-darwin26) — zsh: zsh 5.9 (arm64-apple-darwin26.0) — git: git version 2.54.0 (Apple Git-157) — python3: non-interactive PATH → Python 3.9.6 (/usr/bin/python3); login PATH (/usr/local/bin) → Python 3.14.0; pip 25.2 — node: NOT on non-interactive PATH; login shell (zsh -l) → /usr/local/bin/node v24.22.1; npm 11.19.1; npx 11.19.1; corepack 0.36.0; nvm present (~/.nvm, node v24.22.1 at ~/.nvm/versions/node/v24.22.1/bin/node, also v24.22.1); /usr/local/bin/node is a 248 MB real binary, root-owned, NOT a symlink; ~/.fnm absent — brew: Homebrew 7.0.13 at /opt/homebrew/bin/brew (NOT on non-interactive PATH — reachable only via login shell; .zprofile runs `brew shellenv`); Cellar holds ONLY pkgconf — effectively no formulae installed; /opt/homebrew/bin mostly holds LibreOffice tools — Chrome: Google Chrome 157.0.8103.52, /Applications/Google Chrome.app/Contents/MacOS/Google Chrome --version (CLI only, never launched) — gh: NOT installed originally → installed gh version 2.83.0 (2025-11-04) to ~/bin/gh from https://github.com/cli/cli/releases/download/v2.83.0/gh_2.83.0_macOS_arm64.zip (no sudo, no Homebrew; shell rc files NOT modified — ~/bin is NOT on the user's PATH, invoke as ~/bin/gh or add to PATH per session) — gh auth: device flow STARTED 02:24 UTC, code 3150-96C5, https://github.com/login/device — still waiting for the owner to approve at last check 02:37 UTC; `gh auth status` on the MacBook: "You are not logged into any GitHub hosts" — codex: codex-cli 0.167.0-alpha.3.2, bundled in ChatGPT.app at /Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex (NOT on PATH; aarch64-apple-darwin, codex-package.json version 0.167.0-alpha.3.2); ~/.codex/config.toml: model = "gpt-6-luna", model_reasoning_effort = "medium"; has `exec` non-interactive + `agents` command center — opencode: opencode v2.2.5 at ~/.opencode/bin/opencode (NOT on PATH; 226 MB binary; `opencode2` is a 47-byte exec shim to it); OpenCode.app 2.0.18; `opencode models` runs and lists opencode/* free models (beam-free, big-pickle, deepseek-v4.1-flash-free, glm-5.3-flash-free, minimax-m3.1-flash-free, nemotron-3.5-lightning-free, nemotron-3.5-super-vl-free, …); ~/.config/opencode/cli.json: session.permissions = "autoaccept" — claude (Claude Code CLI): binary NOT FOUND anywhere (PATH, /usr/local/bin, ~/.claude, Claude.app bundle) — only ~/.claude state dirs (backups, ide, sessions) from prior use; Claude.app desktop 4.23118.0 — gemini: NOT FOUND; ~/.gemini absent — hermes: NOT FOUND; ~/.hermes absent — agy: NOT FOUND — cmd: NOT FOUND — cursor: NOT FOUND (no Cursor.app) — copilot: GitHub Copilot CLI 1.0.103 at ~/.local/bin/copilot — code (VS Code CLI): NOT FOUND on PATH; VS Code app 1.145.0 — playwright / playwright-cli: NOT FOUND; no ~/.cache/ms-playwright, no ~/Library/Caches/ms-playwright — npm global: only corepack@0.36.0 + npm@11.19.1 — other apps (plist versions): ChatGPT 26.1103.41825, Discord 0.0.421 — subagents: opencode yes (background service + `run` non-interactive + ACP server; in-session subagent delegation NOT verified by a run) — codex yes via `exec` non-interactive + `agents` command center (in-session subagent spawn NOT verified by a run) — copilot CLI: no agent/subagent mentions in `copilot --help` (CHƯA ĐỌC whether it can spawn subagents) — claude/gemini: N/A (not installed) — notes: CORRECTIONS to the 2026-11-13 ~09:21 coordinator note — Homebrew IS installed (7.0.13) and node IS present (v24.22.1, login shell); both were invisible only because the non-interactive SSH PATH lacks /opt/homebrew/bin and /usr/local/bin. Non-interactive PATH has neither; any SSH automation MUST use a login shell (zsh -l -c) or export PATH explicitly. No GUI command was run; no sudo; no system files touched; work confined to ~/bin + ~/tools/mie-3 on the MacBook.`

## MODELS — MacBook (MIE-3, FLEET-MODE.md §2)

`MODELS 2026-11-13 02:40 UTC — codex (codex-cli 0.167.0-alpha.3.2, bundled in ChatGPT.app, config model gpt-6-luna, reasoning medium): usable via full path; strengths: backend + general coding, non-interactive `exec`, auth/state already present (~/.codex); limits: NOT on PATH (full path or PATH export per session), binary lives inside the ChatGPT.app bundle (fragile across app updates); vision: CHƯA ĐỌC (screenshot/vision flow not tested) — opencode (v2.2.5, models incl. opencode/* free tier + deepseek-v4.1-flash-free, glm-5.3-flash-free, minimax-m3.1-flash-free, nemotron-3.5): usable via ~/.opencode/bin/opencode; strengths: frontend + backend, free models listed and reachable, permissions autoaccept in its config; limits: free-tier model quality for the taste-locked loop UNVERIFIED; vision: CHƯA ĐỌC (not tested) — copilot CLI (1.0.103): usable via ~/.local/bin/copilot; strengths: code completion-style backend help; limits: subagent capability CHƯA ĐỌC, model identity not recorded; vision: CHƯA ĐỌC — claude (Claude Code): NOT installed — unavailable on this machine; frontend/vision via Claude Code: CHƯA ĐỌC (binary absent; reinstall needed before build day if B-role needs it) — gemini / agy / hermes: not installed — unavailable — playwright: NOT installed — the eyes/screenshot step of the loop is UNAVAILABLE until Playwright + a browser are installed (MIE-1 install.sh --skip-eyes decision point); gate scripts themselves can run (node v24.22.1 + bash 3.2 + git present) — role fit (provisional, FLEET-MODE.md §1): strongest backend/general = codex (gpt-6-luna, exec-ready); strongest frontend breadth = opencode (free models, but quality unverified); independent QC/review = copilot CLI or a second opencode/codex instance (CHƯA ĐỌC whether either can grade independently with vision); NO machine on this inventory can do the vision grade today (no Claude Code, no Playwright) — that is the gap MIE-1 must close or the coordinator must assign around.`

- 2026-11-13 02:40 UTC — MILESTONE: MIE-3 inventory DONE. Branch mie/mie-3-inventory from origin/main 907aeaa; TOOLS + MODELS blocks above (every version from a command actually run on the MacBook via SSH). gh 2.83.0 installed to ~/bin/gh (no sudo, no Homebrew, rc files untouched); gh auth device flow started 02:24 UTC, code 3150-96C5 — owner approval STILL PENDING at last check; GitHub device codes expire after ~15 min, so the code may already be expired when read — if so, re-run `gh auth login --hostname github.com --git-protocol https --web` on the MacBook for a fresh code. Corrections recorded: Homebrew 7.0.13 IS installed and node v24.22.1 IS present (login shell) — both invisible to non-interactive SSH PATH only.
