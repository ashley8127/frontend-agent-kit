# Secret matrix — v2 (2026-11-14 ~11:40 ICT)

Metadata only. **No secret value appears in this file, in any commit, or in any group message.** Raw keys NEVER transit Messenger, Discord, the repo, PRs, commits, or transcripts. A key's creation is confirmed with the words "tao xong" only. Secret scan (gitleaks + manual `.env`/key grep, D57) runs before any machine receives a key and again before 16:00 on build day. Leak procedure for every row: rotate immediately, then report in the group WHAT leaked and WHAT was rotated — never the value.

| Secret | Purpose | Holder | Where stored | Who may read / use | Rotation on leak | Status |
|---|---|---|---|---|---|---|
| Gemini API key (`gemini-3.5-flash-lite`; `gemini-3.8-flash` only if the morning AI Studio check confirms it free-tier-eligible) | AI endpoint (Supabase Edge Function) | Thinh — created it on his own account, free tier | AI Studio (his account) + backend secrets only (Supabase secrets / deploy env) | Thinh + the AI endpoint runtime | Revoke in AI Studio, re-create, update backend secret | CREATED + VERIFIED LIVE 2026-11-14 11:38 (Milo live test from his machine: `gemini-3.5-flash-lite` answered, HTTP 200, ~1.1s, usage metadata full) — D50 API side verified. RPM/TPM/RPD still PENDING: API key cannot read them; the AI Studio account holder must open the limits page and read the 3 numbers |
| Groq API key (fallback, `openai/gpt-oss-120b`) | AI endpoint fallback if Gemini fails | Hoang Anh — created it himself, verified 2026-11-14 08:11 (11 models; `llama-3.3-70b` deprecated by Groq, do not use as fallback) | Backend secrets only (when created) | AI endpoint runtime | Revoke in Groq console, re-create, update backend secret | CREATED + VERIFIED, value NOT stored (verified once, not saved) — still needs to land in backend env `GROQ_API_KEY` before build; re-fetch from Hoang Anh at build time |
| Convex deploy keys / Supabase project keys (H6) | Deploy Convex + Supabase | Thinh (H6 check at 20:00) | Convex dashboard / Supabase dashboard + deploy env | Thinh + deploy runtime | Regenerate in dashboard, update env | PENDING H6 at 20:00 |
| GitHub tokens | Repo access | gh OAuth token on Mie's VM (ashley8127 — `workflow` scope added 2026-11-13 21:13 via device-flow refresh; earlier 19:35 rejection was pre-refresh); Nezine token (cannot merge upstream) | gh auth store / token store on each agent's machine | That agent only | Re-auth via gh device flow | Known limits recorded |
| Muse's SSH key for the MacBook | Remote work on the user's MacBook | Mie | Public key in MacBook `authorized_keys`; private key on Mie's VM only (`~/.ssh/id_ed25519`) | Mie only | Replace `authorized_keys` entry + rotate keypair | Active, verified working |
| App runtime tokens (demo phone) | AI calls from the app | The app runtime on the demo phone | `expo-secure-store` ONLY (D59) — never AsyncStorage, never `EXPO_PUBLIC_` vars | The app only | Clear secure store, re-issue | Rule defined; enforced in code review |

## Notes

- Source of truth for the rules: Security track, D42–D71 (departments draft) — D57 secrets audit, D58 endpoint abuse guards, D59 secure-store-only rule; Backend D50 (free-only model APIs, $0 spend rule, no billing account linked).
- Two cells are OPEN (Groq holder; H6 keys pending). They are marked OPEN here, not filled with guesses.
- Demo phone (OPPO A60): wipe / separate profile NOT done as of 19:35; holder and final physical checker to be named at the 20:30 human session (Tuan, 19:32). That is a phone-hygiene item, not a key — tracked separately.
