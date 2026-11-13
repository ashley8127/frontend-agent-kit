# MIE-1 probe report — real MacBook clone-and-go (STOPPED at Step 4)

- **Runner:** MIE-1 runner (Mie), 2026-11-13, 09:35–09:44 +07 (02:35–02:44Z)
- **Verdict: STOPPED — install.sh exit 1, verify.sh --strict exit 1, NO `RESULT:` line. Brief-1 loop NOT started (STOP conditions 3 + 5).**
- **Tree hash:** `907aeaa3a2ccb4833115773ad2f2650be8f445e8` (clone SHA, `main...origin/main`, clean `git status`)
- **PR #5 merge state:** OPEN, NOT merged. Head `a1b3c90fca81e133e4609a55fcb66cf4510364b4`, mergeable MERGEABLE. CI re-verified independently by the runner at probe time via `gh`: all three jobs SUCCESS — `test (ubuntu-24.04)`, `test (macos-15)`, `test (macos-26)` — run 43346544057, completed 2026-11-13T01:47–01:50Z. Title: "D21: macOS portability for verify.sh — sedi + sha256_file helpers, jr_prep bash-3.2 fix (MIE-2)".

## Machine — NOT a stock MacBook (Expert C, verified)

- Mac15,12 (Apple M3), arm64, 8 CPUs, 16 GiB (17179869184 bytes), macOS 27.2.1 (26B131)
- Tailscale 100.66.105.32; hostname prints `192.168.2.7`; up 21 min at probe start, load 2.66/3.45/6.14 (user active — background only)
- Disk /System/Volumes/Data 228Gi: 29Gi free (86%) before, 27Gi free (87%) after — above the 2Gi abort threshold
- **Non-stock in these ways:** Node v24.22.1 via nvm (`$HOME/.nvm/versions/node/v24.22.1/bin`) AND via /usr/local nodejs.org pkg; Homebrew 7.0.13 present (`/opt/homebrew/bin/brew`); ChatGPT.app with bundled codex-cli; opencode CLI v2.2.5; copilot CLI 1.0.103; `~/.codex/auth.json` exists (NOT read); **`sha256sum` (`/sbin/sha256sum`, "sha256sum (Darwin) 1.0") and `timeout` (`/usr/bin/timeout`) EXIST — neither is stock macOS**
- No prior kit install (`~/.local/share/frontend-agent-kit/` absent before install); `~/.local/bin/` held only `copilot`
- Chrome re-verified by runner: `Google Chrome 157.0.8103.52` (`--version`, profile untouched)
- git 2.54.0 (Apple Git-157), python3 3.14.0 (login) / 3.9.6 (non-interactive, briefed), zsh 5.9
- **Consequences (C):** D21 Defects 1 and 3 CANNOT fail here — the `sha256sum`-absence half is **UNPROVEN by MIE-1, not "verified"**. GAP-15 CANNOT trigger here (`gate.sh:1120-1121` guards bare `sha256sum` with `command -v sha256sum`, which succeeds). **MIE-1 must NOT be presented as a stock-machine test.**

## Method

- Single scratch root `~/mie-1-probe-20261113/` on the MacBook (per C; supersedes A's separate paths). Repo clone, all logs, `.pid`/`.exit` files inside it.
- **Node-on-PATH method (C):** every remote step ran as `zsh -l -c 'export PATH="$HOME/.nvm/versions/node/v24.22.1/bin:$HOME/.opencode/bin:/usr/local/bin:$PATH"; <step>'`. Node v24.22.1 / npm 11.19.1 recorded at every stage. No edits to `~/.zshrc`, `~/.zprofile`, `~/.gitconfig`.
- **Deviation from C's wrapper, recorded:** `setsid` does NOT exist on macOS (`command -v setsid` → ABSENT). Stages ran under plain `nohup ... &` + `disown` instead, each with its own `.log` + `.pid` + `.exit`; no stage was ever restarted while running (PID checked first).
- CLI only; no sudo, no GUI commands, no Homebrew installs, no Chrome-profile access, no commits/pushes from the MacBook, no git operations on the clone beyond the initial clone. No dotfile edits, no npm-prefix changes, no node installs.
- Pre-flight output was captured in the runner transcript (not saved as a file on the MacBook); the same facts were re-captured into `env.json` at 02:44Z.

## Stage results

| Stage | Command | Exit | Evidence |
|---|---|---|---|
| 0 Pre-flight | env/version probe | 0 | node v24.22.1, npm 11.19.1, opencode v2.2.5, codex-cli 0.167.0-alpha.3.2, copilot 1.0.103, sha256sum + timeout present |
| 1 Clone | `git clone https://github.com/phamTuan207/frontend-agent-kit.git repo` | 0 | SHA `907aeaa3a2ccb4833115773ad2f2650be8f445e8`, clean, `main...origin/main` |
| 2 Dry run | `./install.sh --dry-run` | 0 | `dryrun.log` (106 lines). Hosts: `claude codex opencode copilot`. Backup dir (planned): `/Users/mac/.local/share/frontend-agent-kit/backups/20261113T023617Z-6655` |
| 3 Install (PLAIN, incl. warm) | `./install.sh` | **1** | `install.log` (420 lines, 143 OK, 22 `^FAIL` + 3 `GATE FAIL`) |
| 4 Verify (NEW session) | `./verify.sh --strict` | **1** | `verify.log` (281 lines, 138 OK, 22 `^FAIL` + 3 `GATE FAIL`), **no `RESULT:` line** |
| 5 Brief-1 loop | — | **NOT STARTED** | blocked by STOP conditions 3 + 5 |

## What passed

- **Predicted npm `-g` EACCES did NOT occur (STOP condition 4 did NOT trigger).** `npm install -g @playwright/cli@0.1.24` → `OK` (`install.log:111`). Reason: with the nvm node on PATH, npm's prefix resolved to the user-owned nvm tree (`/Users/mac/.nvm/versions/node/v24.22.1/bin/playwright-cli`, canonical `/Users/mac/.nvm/versions/node/v24.22.1/lib/node_modules/@playwright/cli/playwright-cli.js`); the `/usr/local` root:wheel prefix was never used. Playwright CLI 0.1.24 + `playwright-cli install-browser chrome-for-testing` both `OK` (`install.log:111-120`).
- **Engine warm OK:** lockstep 0.1.21 (repo pin / skill expects / engine reports all 0.1.21), binary hash-verified (`install.log:159-160`). Drift warning only: latest tag 0.1.23 vs pinned 0.1.21 (`install.log:102`).
- **Install wrote the skills:** `~/.agents/skills/` holds all 16 skills (`frontend-design frontend-judge frontend-kit gsap-core gsap-frameworks gsap-performance gsap-plugins gsap-react gsap-scrolltrigger gsap-timeline gsap-utils impeccable mobile-kit taste-reference threeui ui-ux-pro-max-reference`); `~/.github/copilot-instructions.md` present; `installed-hosts.txt` = `claude codex opencode copilot`; backup dir `/Users/mac/.local/share/frontend-agent-kit/backups/20261113T023644Z-6765`.
- **Playwright MCP:** opencode `OK` (verified in host config). claude/codex PENDING (binaries not on PATH — `install.log:131-132`). Figma MCP not installed (human OAuth, by design — `install.log:136`).

## What failed (exact errors)

**1. Gate fixture FAILs — root cause: secret scanner invisible to the gate.**
`verify.log:46,68,91` — `FAIL: gate scripts failed on the fixture (repo clone gate.sh on fixture)`, `FAIL: gate scripts failed on the fixture (installed gate.sh on fixture ...)`, `FAIL: installed gate.sh --self-test failed`. Each fixture gate run reports `GATE RESULT: FAIL (1 issue(s))` with `GATE FAIL: security 1.1: secret scan: no secret scanner installed (gitleaks or trufflehog)`. The fixture/gate logs lived in a mktemp dir deleted on exit — re-run `gate.sh --target <dir>` to reproduce.

**2. gitleaks installed but not on PATH (installer says so itself).**
`install.log:134`: `OK: gitleaks 8.30.1 installed to ~/.local/bin/gitleaks, but ~/.local/bin is not on PATH — gate 1.1 still cannot see it.` `install.log:135` (PENDING): `... Add it: export PATH="$HOME/.local/bin:$PATH" (e.g. in ~/.zshrc), then re-run ./verify.sh.` (Proposed GAP-18 below.)

**3. judge-artifact (D15) fixture — 19 FAILs in EACH log.**
Every `run-log` record attempt is REJECTED because the fixture judge report still carries its PENDING skeleton line (unfilled `?` score cells, no `Fix order:` line), e.g. `verify.log:223-227`. Underlying: BSD sed errors — 11× `sed: -e: No such file or directory` and 2× `sed: 1: "/var/folders/43/99hx1_n ...": invalid command code f` (`verify.log:222-275`; same pattern `install.log:358-411`). (Proposed GAP-17 below.)

**4. Fatal — bash-3.2 death signature (C R9), reproduced twice.**
- Standalone verify: `verify.log:279`: `./verify.sh: line 2959: grader_args[@]: unbound variable` — then `VERIFY_EXIT=1`. No `RESULT:` line anywhere in `verify.log` (grep `^RESULT:` → 0 matches).
- Inside install: `install.log:415`: `/Users/mac/mie-1-probe-20261113/repo/verify.sh: line 2959: grader_args[@]: unbound variable`, then `verify.sh reported failures (see above). Files are installed; fix the failures before relying on the loop.` and `INSTALL_EXIT=1`. No `RESULT:` line in `install.log` either.
- Last 30 lines of `verify.log` are captured verbatim in the log file itself (tail from `FAIL: judge-artifact (D15): feedback with a regrade artifact failed` through `VERIFY_EXIT=1`).

**5. Phantom-host detection (confirmed by runner).**
`dryrun.log:2`: `Hosts: claude codex opencode copilot`. Runner re-probe 2026-11-13T02:44Z: `claude` binary ABSENT but `~/.claude` exists; `codex` binary ABSENT from PATH (only inside the ChatGPT.app bundle) but `~/.codex` exists; `opencode` ABSENT from login PATH but `~/.config/opencode` exists; gemini/hermes/cursor ABSENT. `install.sh` claims `claude` by config-dir existence with no binary check. (Proposed GAP-19 below.)

## Proposed GAP candidates (GAP-16+, per C — never re-use 13/14/15)

- `PROPOSED GAP-16 | verify.sh:2959 grader_args[@] unbound variable under bash 3.2 set -u kills verify.sh with no RESULT: line | evidence: verify.log:279, install.log:415`
- `PROPOSED GAP-17 | judge-artifact (D15) fixture fails 19x on macOS: BSD sed errors (sed: -e: No such file or directory; invalid command code f) break judge-report fill-in, so run-log rejects every record | evidence: verify.log:222-275, install.log:358-411`
- `PROPOSED GAP-18 | gitleaks 8.30.1 installed to ~/.local/bin which install.sh does not put on PATH, so gate 1.1 fails closed on a plain install and install.sh exits 1 via its own verify | evidence: install.log:134-135, install.log:190`
- `PROPOSED GAP-19 | install.sh detect_hosts claims claude by config-dir existence with no binary check; claude binary ABSENT while ~/.claude exists, so verify "proves" skills for a phantom host | evidence: dryrun.log:2, runner re-probe 2026-11-13T02:44Z`
- `PROPOSED GAP-20 | non-interactive SSH PATH hides a healthy Node 24 install; no PATH guidance for SSH-driven runs (login shell + explicit nvm PATH required) | evidence: preflight 2026-11-13 09:35 +07`

Not numbered as gaps: OpenCode same-name precedence is CHÜA ĐỌC (AGENTS.md decision (h) — untested, not a new finding); MIE-10/D39 moments constraint was never reached (no loop ran).

## CHƯA ĐỌC / not done

- findChrome launch args / profile handling — not read; no headless-gate leg was reached, so no launch behaviour was observed.
- Host skill-list in a NEW session (AGENTS.md §1 step 4.2 — `/skills` etc. per host) — NOT run; blocked by the STOP at Step 4.
- Fixture gate/judge logs (`gate.log`, `gate-installed.log`, `judge-t*.log`) — lived in mktemp dirs deleted on exit; only the FAIL lines survive in `install.log`/`verify.log`.
- Probe `run-log.jsonl` — no probe run-log file exists (fixture records were in the deleted mktemp dirs). The repo's own `coord/run-log.jsonl` was NOT touched.
- Pre-flight transcript — captured in the runner transcript, facts re-captured in `env.json`; no separate preflight log file on the MacBook.
- No screenshots, no design artifacts, no scores — the Brief-1 loop never started; there is nothing to grade and no grade was faked.

## Evidence pack (committed on this branch under `probe/mie-1/`)

| File | Lines | SHA-256 |
|---|---|---|
| `clone.log` | 4 | `6d40d3bd512229831c651e3d70342fa507d4e376ddf4e20b0c93aec404431d43` |
| `dryrun.log` | 106 | `e50f9510a168ee1b8381528a7701f9f0df7ae8b5193bb96f28259db911a79ef8` |
| `install.log` | 420 | `93e6e4e0931f2ca9b50a9410c7ca75c818df8b59938acc4ee0d1b5be5ad31c43` |
| `verify.log` | 281 | `68fc1064bdfe898205e9d56a84b1a7d81928e3ac02dd2ba260cbdd10eed979e8` |
| `env.json` | — | `d324b1a845509a6f76e906882bf4f1a61d69194358539171ac01fa1edaf38ed7` |
| `clone.exit` / `dryrun.exit` | `0` / `0` | `9a271f2a916b0b6ee6cecb2426f0b3206ef074578be55d9bc94f6f3fe3ab86aa` |
| `install.exit` / `verify.exit` | `1` / `1` | `4355a46b19d348dc2f57c046f8ef63d4538ebb936000f3c9ee954a27460dd865` |
| `clone.pid` / `dryrun.pid` / `install.pid` / `verify.pid` | — | `0540491a…`, `9b80e37f…`, `6892fbd3…`, `cc79ba81…` (see `sha256sum` output in runner transcript) |

MacBook scratch root `~/mie-1-probe-20261113/` (clone at `repo/`, all logs) is RETAINED on the machine, not cleaned up — cleanup is a coordinator decision (further diagnostic runs may need it).

## Questions for the coordinator

1. Re-run `./verify.sh --strict` with `~/.local/bin` on PATH (the installer's own documented remediation, `install.log:135`) to isolate gate 1.1 from the D15/sed/grader_args failures? This changes probe conditions — needs coordinator approval; not done.
2. Award GAP-16/17/18/19/20 (or renumber)? GAP-13 exists (D15), GAP-14 awarded (D35), GAP-15 proposed-only — these are GAP-16+ candidates.
3. Brief-1 loop stays blocked until verify passes — confirm no loop attempt until a fix lands and verify prints `RESULT: OK`.
