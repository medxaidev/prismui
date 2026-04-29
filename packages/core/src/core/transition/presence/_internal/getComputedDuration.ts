/**
 * Stage-12 · Presence · `getComputedStyle` self-check fallback (TR-PRES-3 layer 1)
 *
 * OQ-PR-2 Decision C — read transition / animation duration off the live
 * computed style; "0s" / "" / "none" → skip to terminal state with no
 * listener installation, otherwise install transitionend + animationend.
 *
 * jsdom boundary (Insight 5 verification):
 *   · `getComputedStyle` does NOT parse CSS shorthand — `transition: opacity 0.3s`
 *     returns "" on jsdom. Tests must set longhand properties directly.
 *   · `transitionDuration` and `animationDuration` are returned verbatim when
 *     set explicitly (single value or comma-separated list).
 *
 * The implementation reads BOTH transition and animation durations and takes
 * the maximum — covering CSS that uses either (or both) animation systems.
 */

/**
 * Parse a CSS time value list (`"0.3s, 0.5s, 100ms"`) and return the max
 * duration in milliseconds. Returns 0 for `""`, `"0s"`, `"none"`, or any
 * unparseable token.
 */
export function parseDurationListMax(value: string | undefined | null): number {
  if (!value) return 0;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === 'none' || trimmed === '0s') return 0;

  let max = 0;
  for (const raw of trimmed.split(',')) {
    const token = raw.trim();
    if (!token) continue;
    const parsed = parseSingleDuration(token);
    if (parsed > max) max = parsed;
  }
  return max;
}

function parseSingleDuration(token: string): number {
  // `300ms` · `0.3s` · `0s` · numeric prefix is the source of truth.
  // Accept either `ms` or `s` suffix; reject anything else (returns 0).
  const msMatch = /^([\d.]+)ms$/.exec(token);
  if (msMatch) {
    const n = Number(msMatch[1]);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }
  const sMatch = /^([\d.]+)s$/.exec(token);
  if (sMatch) {
    const n = Number(sMatch[1]);
    return Number.isFinite(n) && n > 0 ? n * 1000 : 0;
  }
  return 0;
}

/**
 * Read both transition and animation durations off the element and return the
 * max. Used as the layer-1 self-check before installing event listeners
 * (TR-PRES-3 / OQ-PR-2 Decision C).
 *
 * `null` element ⇒ 0 (treat as "no animation" — skip to terminal).
 */
export function readMaxAnimationDuration(el: Element | null): number {
  if (el == null || typeof window === 'undefined') return 0;

  // SSR / non-browser env guard (jsdom or React server bundle).
  // `getComputedStyle` is only available in browser-like environments.
  if (typeof window.getComputedStyle !== 'function') return 0;

  const style = window.getComputedStyle(el);
  const t = parseDurationListMax(style.transitionDuration);
  const a = parseDurationListMax(style.animationDuration);
  return t > a ? t : a;
}
