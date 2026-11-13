#!/usr/bin/env bash
# secure-store-check.sh — D59 runnable check: no tokens in AsyncStorage,
# no key-shaped EXPO_PUBLIC_ vars. (hackathon-security skill §6 item 6,
# made executable — the skill's manual grep is a review trigger, this
# script is the pass/fail gate for it.)
# Usage:
#   bash secure-store-check.sh [path]        # default path: .
# Exit 0 = CLEAN. Exit 1 = HIT (a pattern matched — STOP, fix before merge).
#
# What it flags (both are SEVERE per skill §6 item 6):
#   1. A key-shaped EXPO_PUBLIC_ variable: EXPO_PUBLIC_* values are
#      inlined in plain text in the compiled bundle — a SECRET key under
#      that prefix is public by construction. EXCLUDED by name (public
#      by design, per the skill §2 table — RLS is the control there, not
#      the prefix): EXPO_PUBLIC_SUPABASE_ANON_KEY and
#      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. The exclusion is exact-name
#      only: EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY still hits, as it must.
#      (EXPO_PUBLIC_CONVEX_URL never matches — it ends in _URL, not a
#      key/secret/token name.)
#   2. A token-shaped AsyncStorage write: AsyncStorage.setItem /
#      multiSet / mergeItem on a line naming a token, secret, api key,
#      auth credential or password (in the key OR the value argument).
#      Tokens/results must use expo-secure-store; bulk data stays
#      server-side. A bare AsyncStorage import or a non-token write
#      (e.g. setItem('lastResult', json)) is NOT a hit — it is a
#      manual-review trigger, see the skill.
#
# SELF-MATCH (same class as secret-grep.sh): this script and SKILL.md
# document the patterns, so they match them themselves. The script
# excludes its own filename and secret-grep.sh (the other file that
# carries the pattern as code). SKILL.md's documented examples are
# pre-approved known hits: when scanning a tree that contains this
# skill, exclude the skill directory (e.g. --exclude-dir=hackathon-security
# on the caller side, or list the skill's files in CONTRACT.md).
# Do NOT "fix" the self-match by weakening the pattern.
#
# bash 3.2-compatible (no associative arrays, no mapfile). No dependencies
# beyond grep. Smoke-tested 2026-11-14: HIT on a planted tree
# (EXPO_PUBLIC_GEMINI_API_KEY + AsyncStorage.setItem('authToken', …) +
# AsyncStorage.multiSet refreshToken + EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY),
# CLEAN on a clean tree (expo-secure-store token + EXPO_PUBLIC_CONVEX_URL +
# EXPO_PUBLIC_SUPABASE_ANON_KEY + EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY +
# non-token AsyncStorage writes). The first version of check 1 flagged the
# two public-by-design Supabase keys (false positive — the repo-tree run
# hit research/mobile-deep-20261113.md + demo-checklist.md prose); the
# exact-name exclusion above is the fix, re-tested the same day.
# See ai-endpoint-guard.test.mjs for the D58 suite; this script's fixtures
# were /tmp trees, not the real repo.

set -u
TARGET="${1:-.}"

HIT=0

# 1. Key-shaped EXPO_PUBLIC_ variable — minus the two public-by-design
# Supabase key names (exact-name exclusion; see header).
if grep -R -E -i --exclude-dir=node_modules --exclude-dir=.git \
    --exclude=secure-store-check.sh --exclude=secret-grep.sh \
    -- 'EXPO_PUBLIC_[A-Z0-9_]*(KEY|SECRET|TOKEN)' "$TARGET" \
    | grep -v -E 'EXPO_PUBLIC_SUPABASE_(ANON_KEY|PUBLISHABLE_KEY)'; then
  echo "HIT: key-shaped EXPO_PUBLIC_ variable above — it ships in the bundle in plain text. Move the value server-side." >&2
  HIT=1
fi

# 2. Token-shaped AsyncStorage write (key or value names a credential).
if grep -R -E -i --exclude-dir=node_modules --exclude-dir=.git \
    --exclude=secure-store-check.sh --exclude=secret-grep.sh \
    -- 'AsyncStorage\.(setItem|multiSet|mergeItem)[^)]*(token|secret|api[_-]?key|auth|password|credential)' "$TARGET"; then
  echo "HIT: token-shaped AsyncStorage write above — tokens must use expo-secure-store, never AsyncStorage." >&2
  HIT=1
fi

if [ "$HIT" -eq 1 ]; then
  echo "HIT: secure-store violation found — STOP, do not merge / do not ship." >&2
  exit 1
fi

echo "CLEAN: no token in AsyncStorage, no key-shaped EXPO_PUBLIC_ var in $TARGET"
exit 0
