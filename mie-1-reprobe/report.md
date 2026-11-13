# MIE-1 re-probe — macOS 27 (Apple M3) after PR #5 merged

- **Date:** 2026-11-13 23:04–23:12 +07 (16:04–16:12 UTC)
- **Machine:** MacBook, macOS 27.2.1, Apple M3, lid closed, on charger, SSH reachable throughout (2 transient broken-pipe SSH drops; the MacBook itself never slept — uptime 13:50 → 13:57 across the probe)
- **Clone:** `/tmp/mie-reprobe-20261113`, fresh `git clone` of `phamTuan207/frontend-agent-kit`, **SHA `e2a62ccb0133bb2618599d8a6465aee18367d9dc`** (= main after PR #15 merged; includes PR #5 D21 fix + PR #11 MIE-6 + PR #15 MIE-5)
- **Logs:** `install.log` (810 lines), `verify-strict.log` (526 lines, run 1), `verify-strict-run2.log` (identical, run 2, `EXIT=1` in `verify-strict-run2.exit`)
- **Method:** probe only — observed and reported; no repo changes, no pushes, no MacBook config changes (no `.zshrc` edit, no node install). Node was put on PATH for the probe by sourcing nvm + `nvm use default` (see §6).

## Bottom line

**macOS 27 is NOT green yet, but only ONE thing blocks it: the secret scanner is not on PATH.** `verify.sh --strict` exits 1 with **7 failures, 1 unverified, 2 pending** — and all 7 failures + the 1 unverified trace to the single root cause: `gitleaks` is installed at `~/.local/bin/gitleaks` but `~/.local/bin` is not on `PATH` in non-interactive SSH, so gate §1.1 fails closed. **PR #5's three D21 defects (BSD sed, bash-3.2 unbound variable) are FIXED** — zero occurrences in either verify run. The MIE-5 §5e suite passes **23/23** on macOS 27 and the MIE-6 §5a path-fixture checks pass. The remaining blocker is a one-line PATH fix on the MacBook (add `~/.local/bin` to `PATH`), which `install.sh` itself already diagnoses as PENDING but does not apply.

## Results

| Step | Result |
|---|---|
| `git clone` main | OK, SHA `e2a62cc`, 102 MB |
| `./install.sh` | Completed 23:04–23:06 +07 (ran through its trailing verify + backup line). Trailing verify: 7 FAIL / 1 UNVERIFIED / 2 PENDING, RESULT: FAIL. Exit code not captured (started via nohup; log shows completion). |
| `./verify.sh --strict` (run 1) | **EXIT 1** (implied by RESULT: FAIL; exact code captured on run 2). 307 OK, **7 FAIL, 1 UNVERIFIED, 2 PENDING**. |
| `./verify.sh --strict` (run 2) | **EXIT=1**, identical counts and identical log size (54,467 bytes) — fully reproducible. |

## The 4 original defects — verdicts

### (1) gitleaks installed but not on PATH → secret scan fails closed — STILL PRESENT (same substance, now precisely diagnosed)

- Evidence: `install.log:277` — `OK: gitleaks 8.30.1 installed to ~/.local/bin/gitleaks, but ~/.local/bin is not on PATH — gate 1.1 still cannot see it.` And `install.log:278` (PENDING) — `gitleaks 8.30.1 is installed at ~/.local/bin/gitleaks but ~/.local/bin is not on PATH, so gate 1.1 still fails closed. Add it: export PATH="$HOME/.local/bin:$PATH" (e.g. in ~/.zshrc), then re-run ./verify.sh.`
- `which gitleaks` → not found. `ls ~/.local/bin/` shows `gitleaks` (21 MB, dated Nov 13 23:04 — installed/refreshed by this run's `install.sh`). Non-interactive SSH `PATH` is the bare `/usr/bin:/bin:/usr/sbin:/sbin` — no `~/.local/bin`, no Homebrew, no nvm.
- All 7 FAILs are the same root cause (verify-strict.log:44, 66, 89, 111, 136, 164, 189 — "gate scripts failed on the fixture" in each case, each gate log showing `GATE FAIL: security 1.1: secret scan: no secret scanner installed (gitleaks or trufflehog)`). The 1 UNVERIFIED is the same cause (line 441: judge-artifact D15 case (104) — "gitleaks not installed — the gitleaks half of the §1.1 assertion is not proven here").
- **This is NOT a D21 defect** — PR #5 never touched it. It is a gap in `install.sh` (installs the scanner but does not put its dir on PATH) plus the minimal non-interactive SSH PATH. Fix (not applied — probe only): add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc` (or have install.sh do it), then re-run `./verify.sh`.

### (2) 19 BSD-sed FAILs in the judge-artifact fixture — FIXED

- Evidence: zero `sed:` errors in either verify run (`grep -i "sed:.*illegal|sed:.*invalid|RE error"` → 0 hits). The §5c/D15 judge-artifact cases pass (verify-strict.log:358–359, 441–443: runlog-check passes the §5c run log; genuine judge report passes gate leg 1 §1.1; deadlocked state split OK). Only case (104)'s gitleaks half is UNVERIFIED, for the reason in (1), not sed.

### (3) FATAL `grader_args[@]: unbound variable` (bash-3.2 set -u) — FIXED

- Evidence: zero hits for `unbound variable` or `grader_args` in either verify run. The script runs to completion (526-line log, summary printed, exit 1 only because of the 7 gitleaks FAILs).

### (4) install.sh claims host `claude` with no binary — NOT A KIT DEFECT (by-design detection; machine-state note)

- Evidence: `claude`, `codex`, `opencode`, `gemini` binaries are all absent from the non-interactive `PATH`. BUT `~/.claude/` exists (skills, agents, backups, ide, sessions, settings.json) and `Claude.app` + `OpenCode.app` are in `/Applications`; `~/.opencode/bin/` holds `opencode` + `opencode2` (and `.zshrc` adds that dir to PATH for interactive shells). `install.sh` line 1 reports `Hosts: claude codex opencode copilot` and installed skills into `~/.claude/skills/` etc.
- Per the kit's own contract (AGENTS.md §1 Step 1), host detection is by **binaries OR config dirs** — so detecting `claude` from the `~/.claude` config dir is by design, not a bug. The machine-state fact is: no Claude Code CLI binary exists on this MacBook, so the installed `~/.claude/skills/` cannot actually run under Claude Code until a CLI is installed. That is a machine-state gap, not a kit defect. (The original probe listed this as a failure; the contract says otherwise.)

## What else passed on macOS 27

- **§5e (D36, MIE-5 template-integrity): 23/23 OK** — all 23 cases in verify-strict.log:447–470 (DoD stub-TASTE + 1-byte-diff refusal, whitespace/comment-only refusals, stub-alone, 1-byte-diff-alone, dropped-token refusals incl. unreferenced token, value-only positive, pristine positive, CRLF normalisation, `--allow-dropped-tokens` positive + notes/Amendments assertions, extra/unlisted/Amendments-missing refusals, missing tokens.css, missing PLAN.md + flag, split-layout positive + XOR refusal, primitives value-only + missing-name, symlink refusal, missing-template-dir fail-closed).
- **§5a (D37, MIE-6 bare-relative target): passes** — 14 `OK: path-fixture` lines (demo/v0 clone + installed, no wrong-path taste-lock FAIL; negative controls OK).
- **§5c (D15 judge-artifact): passes** except case (104)'s gitleaks half (UNVERIFIED, cause (1)).
- **§5f (D38, MIE-7 round-budget): not present on main** — correctly absent; PR #13 has not merged yet, so there is nothing to check for it in this probe. (Do not mistake its absence for a failure.)
- **Eyes leg works:** headless 390px screenshot succeeds via Chromium (44,973 bytes); system Chrome present (`/Applications/Google Chrome.app`); Playwright CLI 0.1.24 runs.
- **D34:** secrets planted only inside a nested kit clone fail gate §1.1 via the built-in grep (OK); pristine nested clone clean (OK).

## Environment findings (node, PATH, shims)

- **Node:** nvm installed at `~/.nvm`, node **v24.22.1** (npm 11.19.1), default alias → 24. **NOT on PATH** in non-interactive SSH (`node: command not found`) and NOT auto-loaded anywhere: `.zshrc` (55 bytes) only adds `~/.opencode/bin` to PATH; `.zprofile` only has Homebrew shellenv (duplicated line). Sourcing `nvm.sh` + `nvm use default` puts node on PATH and works. The probe ran install/verify with node on PATH this way; without it, `install.sh`/`verify.sh` would fail for lack of node. (No node was installed by the probe.)
- **Mise shims exist** (`~/.local/share/mise/shims`); verify.sh notes it bypassed the mise shim ("the shim fails from /tmp cwds") and resolved node/Playwright to the real nvm binaries.
- **2 PENDING (not failures):** Playwright MCP not registered for `claude` and `codex` (host config exists but has no playwright entry). OK for `opencode`.
- **Disk:** /tmp on a volume at 91% used, 19 Gi free — enough for the probe (clone 102 MB), but tight.

## What still blocks macOS 27 green

Exactly one thing: **put `~/.local/bin` on PATH** (e.g. `export PATH="$HOME/.local/bin:$PATH"` in `~/.zshrc`), then re-run `./verify.sh --strict`. That should clear all 7 FAILs and the 1 UNVERIFIED (all gitleaks fail-closed). Everything else the probe checked already passes on macOS 27. Whether `install.sh` should do this itself is a kit decision (GAP proposal), not a probe finding.

## Files

- `install.log` — full install.sh output (810 lines)
- `verify-strict.log` — full `./verify.sh --strict` run 1 (526 lines)
- `verify-strict-run2.log` — full run 2 (identical), `verify-strict-run2.exit` contains `EXIT=1`

## PATH fix + re-verify (2026-11-13 ~23:19 +07)

- **Change on the MacBook:** appended to `~/.zshrc` (was 55 bytes, only the opencode PATH line; now 201 bytes):
  ```
  # gitleaks (installed by frontend-agent-kit install.sh) — needed by gate 1.1
  export PATH="$HOME/.local/bin:$PATH"
  ```
  A backup of the original was saved as `~/.zshrc.mie-bak-20261113`. No existing line was removed or altered. (First attempt accidentally wrote the PATH expanded — `export PATH="/Users/mac/.local/bin:/usr/bin:/bin:/usr/sbin:/sbin"` — which would have dropped the opencode dir; caught immediately, corrected to the literal `$HOME/.local/bin:$PATH` form before any verification ran. Sourced PATH after the fix: `/Users/mac/.local/bin:/Users/mac/.opencode/bin:/usr/bin:/bin:/usr/sbin:/sbin` — both dirs present.)
- **Syntax check:** `zsh -n ~/.zshrc` → OK.
- **gitleaks check (fresh non-interactive SSH, `source ~/.zshrc`):** `which gitleaks` → `/Users/mac/.local/bin/gitleaks`, `gitleaks version` → 8.30.1. On PATH.
- **Re-run:** `./verify.sh --strict` in the same clone `/tmp/mie-reprobe-20261113` (main e2a62cc), with `source ~/.zshrc` + nvm sourced (`nvm use default`, node v24.22.1) first. Log: `verify-strict-postfix.log` (380 lines), exit in `verify-strict-postfix.exit`.
- **Result: EXIT 0 — macOS 27 is GREEN.** `RESULT: OK — files, engine lockstep, detect, gate and eyes all pass.` Counts: **314 OK, 0 FAIL, 0 UNVERIFIED, 2 PENDING** (the same 2 Playwright MCP PENDINGs for claude/codex as before — not failures). Pre-fix was 307 OK / 7 FAIL / 1 UNVERIFIED; the 7 FAILs (all "gate scripts failed on the fixture", gitleaks fail-closed) are now OKs, and case (104)'s gitleaks half is now proven. §5e D36 cases pass identically in both runs.
- **Bottom line:** the single blocker is cleared. macOS 27 (27.2.1, Apple M3) now runs `./verify.sh --strict` green on main e2a62cc. Caveat: the fix lives in `~/.zshrc`, which non-interactive SSH does not source on its own — a fresh non-interactive run needs `source ~/.zshrc` (or the PATH set another way) to see gitleaks. Whether `install.sh` should put `~/.local/bin` on PATH itself remains a kit decision (GAP proposal), not a probe finding.
