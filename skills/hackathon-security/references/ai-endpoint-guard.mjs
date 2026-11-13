// ai-endpoint-guard.mjs — TEMPLATE: pure AI-endpoint abuse-guard logic (D58).
//
// Copy the functions you need into the product repo's server code (Convex
// action or Supabase Edge Function). This file is deliberately dependency-
// free and platform-free: it contains ONLY the deterministic, testable
// parts of the guard. It does NOT wire the rate limiter, the kill-switch
// flag read, the shareToken lookup, or the abuse-log write — those live in
// the product repo's server code, in the canonical order (skill §B4):
//   1. shareToken/shareId validation → 2. kill-switch flag →
//   3. rate-limit check → 4. input-length check (validateInput) →
//   5. LLM call (input sent via escapeDelimitedInput) →
//   6. output validation (validateOutput). Max 1 retry (RetryBudget).
//
// Status: TEMPLATE, executed + tested by ai-endpoint-guard.test.mjs
// (node ai-endpoint-guard.test.mjs). NOT verified against a live Convex
// or Supabase project — there is no live project yet. Adapt the schema
// (allowedKeys / field rules) and the URL allowlist to the feature before
// use; an empty URL allowlist rejects every URL, which is the safe
// default. Numbers below are the skill's TEAM CHOICE values (skill §4 C2):
// input 2,000 chars max, output 8,000 chars max, max_tokens 800 at the
// provider (not enforced here — enforce it in the LLM call).

export const MAX_INPUT_CHARS = 2000;
export const MAX_OUTPUT_CHARS = 8000;
export const MAX_RETRIES = 1;

// C1#5 deterministic input screen (tripwire, not a wall): catches the
// judge's obvious test; will NOT catch a novel paraphrase. Matching is
// case-insensitive on the raw input. The base64-blob rule is applied
// separately in validateInput (a >200-char run with no spaces).
export const TRIPWIRE_PHRASES = [
  "ignore previous instructions",
  // The draft's own pre-demo test string is "Ignore ALL previous
  // instructions…" — the bare phrase above does not substring-match it
  // ("all" intervenes), so both forms are listed. (Caught by the test
  // suite 2026-11-14: the bare phrase alone let the draft's test string
  // through.)
  "ignore all previous instructions",
  "disregard the above",
  "you are now",
  "repeat your system prompt",
  "system prompt",
  "api key",
];

// C3#4 blocklist scan (deterministic regex, server-side). Tripwire, not a
// PII detector. Applied to every string field of a validated output, and
// to the raw output string.
export const OUTPUT_BLOCKLIST = [
  /sk-(proj-)?[A-Za-z0-9]{20,}/, // provider keys (sk-…, sk-proj-…)
  /sk-ant-[A-Za-z0-9_-]{10,}/,
  /Bearer\s+[A-Za-z0-9._-]{10,}/,
  /api[_-]?key\s*[:=]/i,
  /<script/i,
  /javascript:/i,
  /\bonerror\s*=/i,
  /\bonclick\s*=/i,
  /data:text\/html/i,
  /file:\/\//i,
  /169\.254\.169\.254/,
];

function isBase64Blob(input) {
  // A >200-char run with no spaces that looks like base64. Deliberately
  // narrow: ordinary prose always has spaces well before 200 chars.
  return /(?:[A-Za-z0-9+/=_-]{200,})/.test(input);
}

// Validate one user input BEFORE any LLM call (canonical step 4).
// Returns { ok: true } or { ok: false, error, detail }.
// error is one of: NOT_STRING | EMPTY | TOO_LONG | TRIPWIRE.
// Rejects over-long input instead of truncating it: truncation can cut a
// delimiter (skill §4 C2). Tripwire hits are rejected with the generic
// REFUSED error at the call site — never echo the attack.
export function validateInput(input) {
  if (typeof input !== "string") return { ok: false, error: "NOT_STRING" };
  const trimmed = input.trim();
  if (trimmed.length === 0) return { ok: false, error: "EMPTY" };
  if (input.length > MAX_INPUT_CHARS) {
    return { ok: false, error: "TOO_LONG", detail: `length ${input.length} > ${MAX_INPUT_CHARS}` };
  }
  const lowered = input.toLowerCase();
  for (const phrase of TRIPWIRE_PHRASES) {
    if (lowered.includes(phrase)) {
      return { ok: false, error: "TRIPWIRE", detail: `phrase "${phrase}"` };
    }
  }
  if (isBase64Blob(input)) return { ok: false, error: "TRIPWIRE", detail: "base64-looking blob >200 chars" };
  return { ok: true };
}

// C1#2 — delimit the untrusted input, and escape the delimiter.
// JSON.stringify does NOT escape < or >: a user typing </user_input>
// closes the tag verbatim inside the JSON string. Escape after
// stringifying, so the wrapped payload can never break out of its tag.
// The result is the user-message content to send to the provider.
export function escapeDelimitedInput(input) {
  const safe = JSON.stringify(input).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
  return `<user_input>${safe}</user_input>`;
}

// Strip indirect-injection carriers (C1#6) before delimiting pasted or
// shared content: HTML comments, <script>/<style> blocks, zero-width and
// invisible Unicode. Server-side only; the result still goes through
// escapeDelimitedInput afterwards.
export function stripIndirectInjection(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, "");
}

// Validate one model output BEFORE render (canonical step 6, skill §4 C3).
// Checks run in this order: finish_reason (refusal/truncation) BEFORE
// parsing → raw length cap → JSON parse → key allowlist + per-field
// rules → blocklist scan → URL allowlist.
//   schema: { key: { type: "string"|"number"|"boolean"|"enum"|"array",
//                     maxLength?, values?, items?, minLength?, maxLength? } }
//   options: { finishReason?, urlAllowlist?: string[] (default: [] = reject all URLs) }
// Returns { ok: true, value } or { ok: false, stepFailed, detail }.
// stepFailed names the C3 step: "finish" | "length" | "parse" | "schema" |
// "blocklist" | "url". On failure the caller returns the generic error
// and logs { shareId, stepFailed, at } only — never the raw output.
export function validateOutput(raw, schema, options = {}) {
  const { finishReason = null, urlAllowlist = [] } = options;
  // C3#2 — refusal / truncation check BEFORE parsing. A "length" finish
  // means partial JSON: never parse it. A refusal object means generic
  // refusal to the client.
  if (finishReason === "length") {
    return { ok: false, stepFailed: "finish", detail: 'finish_reason "length": truncated output' };
  }
  if (finishReason === "refusal" || finishReason === "refused") {
    return { ok: false, stepFailed: "finish", detail: "model refused" };
  }
  if (typeof raw !== "string" || raw.length === 0) {
    return { ok: false, stepFailed: "parse", detail: "empty output" };
  }
  // C3#3 — raw length cap.
  if (raw.length > MAX_OUTPUT_CHARS) {
    return { ok: false, stepFailed: "length", detail: `raw length ${raw.length} > ${MAX_OUTPUT_CHARS}` };
  }
  // C3#1 — parse + schema (allowlist). Unknown key / wrong type rejects
  // the whole object.
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, stepFailed: "parse", detail: "not valid JSON" };
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, stepFailed: "schema", detail: "top level is not a JSON object" };
  }
  for (const key of Object.keys(value)) {
    if (!Object.prototype.hasOwnProperty.call(schema, key)) {
      return { ok: false, stepFailed: "schema", detail: `unknown key "${key}"` };
    }
  }
  for (const [key, rule] of Object.entries(schema)) {
    if (!(key in value)) continue; // missing keys are the feature's business, not a security reject
    const v = value[key];
    if (rule.type === "string") {
      if (typeof v !== "string") return { ok: false, stepFailed: "schema", detail: `"${key}" is not a string` };
      if (rule.maxLength !== undefined && v.length > rule.maxLength) {
        return { ok: false, stepFailed: "schema", detail: `"${key}" longer than ${rule.maxLength}` };
      }
    } else if (rule.type === "number") {
      if (typeof v !== "number" || Number.isNaN(v)) {
        return { ok: false, stepFailed: "schema", detail: `"${key}" is not a number` };
      }
      if (rule.min !== undefined && v < rule.min) return { ok: false, stepFailed: "schema", detail: `"${key}" below min ${rule.min}` };
      if (rule.max !== undefined && v > rule.max) return { ok: false, stepFailed: "schema", detail: `"${key}" above max ${rule.max}` };
    } else if (rule.type === "boolean") {
      if (typeof v !== "boolean") return { ok: false, stepFailed: "schema", detail: `"${key}" is not a boolean` };
    } else if (rule.type === "enum") {
      if (!rule.values.includes(v)) {
        return { ok: false, stepFailed: "schema", detail: `"${key}" value not in enum` };
      }
    } else if (rule.type === "array") {
      if (!Array.isArray(v)) return { ok: false, stepFailed: "schema", detail: `"${key}" is not an array` };
      if (rule.minLength !== undefined && v.length < rule.minLength) {
        return { ok: false, stepFailed: "schema", detail: `"${key}" shorter than minLength ${rule.minLength}` };
      }
      if (rule.maxLength !== undefined && v.length > rule.maxLength) {
        return { ok: false, stepFailed: "schema", detail: `"${key}" longer than maxLength ${rule.maxLength}` };
      }
      if (rule.items === "string" && !v.every((x) => typeof x === "string")) {
        return { ok: false, stepFailed: "schema", detail: `"${key}" has a non-string item` };
      }
    }
  }
  // C3#4 — blocklist scan over the raw string (covers every field at once).
  for (const re of OUTPUT_BLOCKLIST) {
    if (re.test(raw)) {
      return { ok: false, stepFailed: "blocklist", detail: `matched ${re}` };
    }
  }
  // C3#5 — URL allowlist. Only https:// URLs whose host is listed.
  // Empty allowlist rejects all URLs.
  const urls = raw.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  for (const url of urls) {
    let host;
    try {
      host = new URL(url).host;
    } catch {
      return { ok: false, stepFailed: "url", detail: `unparseable URL ${url}` };
    }
    if (!url.toLowerCase().startsWith("https://") || !urlAllowlist.includes(host)) {
      return { ok: false, stepFailed: "url", detail: `URL not allowlisted: ${url}` };
    }
  }
  return { ok: true, value };
}

// Max 1 retry (D58 / skill §4 C3: "max 1 retry"). One budget per AI call:
// the first failure may be retried once; a second failure is terminal
// and the caller returns the generic error.
export class RetryBudget {
  constructor() {
    this.retriesUsed = 0;
  }
  canRetry() {
    return this.retriesUsed < MAX_RETRIES;
  }
  recordRetry() {
    if (!this.canRetry()) return false;
    this.retriesUsed += 1;
    return true;
  }
}

// C1#7 — generic errors only. Never a stack trace, provider error body,
// or raw model output.
export function genericError(code = "AI_UNAVAILABLE") {
  return { error: code === "REFUSED" ? "REFUSED" : "AI_UNAVAILABLE" };
}
