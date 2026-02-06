import type { PrismuiStyleRegistry } from './style-registry';

// ---------------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------------

const STYLE_ENGINE_ATTR = 'data-prismui-style-engine';
const THEME_VARS_ATTR = 'data-prismui-theme-vars';

function canUseDOM(): boolean {
  return typeof document !== 'undefined' && !!document.head;
}

// ---------------------------------------------------------------------------
// <style> element management
// ---------------------------------------------------------------------------

/**
 * Returns (or creates) the `<style data-prismui-style-engine>` element
 * used for component / system-prop atomic rules.
 */
function getStyleEngineElement(): HTMLStyleElement | null {
  if (!canUseDOM()) return null;

  let el = document.head.querySelector(
    `style[${STYLE_ENGINE_ATTR}]`,
  ) as HTMLStyleElement | null;

  if (!el) {
    el = document.createElement('style');
    el.setAttribute(STYLE_ENGINE_ATTR, 'true');
    document.head.appendChild(el);
  }

  return el;
}

/**
 * Returns (or creates) the `<style data-prismui-theme-vars>` element
 * used exclusively for theme CSS variable declarations.
 *
 * Separated from the style-engine element so that theme variables can be
 * **replaced** on theme change without affecting component rules.
 */
function getThemeVarsElement(): HTMLStyleElement | null {
  if (!canUseDOM()) return null;

  let el = document.head.querySelector(
    `style[${THEME_VARS_ATTR}]`,
  ) as HTMLStyleElement | null;

  if (!el) {
    el = document.createElement('style');
    el.setAttribute(THEME_VARS_ATTR, 'true');
    document.head.appendChild(el);
  }

  return el;
}

function getSheet(): CSSStyleSheet | null {
  return getStyleEngineElement()?.sheet ?? null;
}

// ---------------------------------------------------------------------------
// Hash utility
// ---------------------------------------------------------------------------

/**
 * DJB2 hash → base-36 string.
 * Used to detect whether the CSS content for a given `id` has changed.
 */
export function hashString(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

// ---------------------------------------------------------------------------
// Deduplication map (module-level singleton)
// ---------------------------------------------------------------------------

const inserted = new Map<string, string>();

/**
 * Clears the internal deduplication cache.
 * **Test-only** — do not call in production code.
 */
export function __resetInsertedCacheForTesting(): void {
  inserted.clear();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Insert a CSS snippet once per `id`.
 *
 * **Browser behaviour:**
 * - Theme variable blocks (`id === 'prismui-theme-vars'`) are written to a
 *   dedicated `<style data-prismui-theme-vars>` element. The content is
 *   **replaced** on every call so that runtime theme switches work correctly.
 * - All other rules are injected into `<style data-prismui-style-engine>`
 *   via CSSOM `insertRule` (fast, no reflow). Falls back to `textContent`
 *   append if `insertRule` throws.
 * - Duplicate calls with the same `id` **and** identical CSS are no-ops.
 *
 * **Server behaviour:**
 * - Delegates to `registry.insert(id, cssText)` so that CSS can be collected
 *   and flushed into the HTML response.
 */
export function insertCssOnce(
  id: string,
  cssText: string,
  registry?: PrismuiStyleRegistry | null,
): void {
  // ---- SSR path ----
  if (!canUseDOM()) {
    registry?.insert(id, cssText);
    return;
  }

  // ---- Dedup check ----
  const nextHash = hashString(cssText);
  if (inserted.get(id) === nextHash) return;

  // ---- Theme variables (dedicated <style>, full replace) ----
  if (id === 'prismui-theme-vars') {
    const el = getThemeVarsElement();
    if (!el) return;
    el.textContent = cssText;
    inserted.set(id, nextHash);
    return;
  }

  // ---- Component / atomic rules (CSSOM insertRule) ----
  const sheet = getSheet();

  if (sheet) {
    try {
      // NOTE: split('\n') assumes each line is a complete CSS rule.
      // This works for atomic classes (e.g., `.prismui-p-md { padding: ... }`)
      // but will fail for multi-line rules like @media queries or nested selectors.
      // If such rules are needed in the future, consider:
      // - Regex split by '}' boundary: cssText.match(/[^}]+}/g)
      // - Or skip insertRule entirely and use textNode append
      // For now, insertRule failures safely fall through to the textNode fallback.
      const rules = cssText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      for (const rule of rules) {
        sheet.insertRule(rule, sheet.cssRules.length);
      }
      inserted.set(id, nextHash);
      return;
    } catch {
      // insertRule can throw for malformed rules — fall through to textNode
    }
  }

  // ---- Fallback: append text node ----
  const styleEl = getStyleEngineElement();
  if (!styleEl) return;
  styleEl.appendChild(document.createTextNode(cssText + '\n'));
  inserted.set(id, nextHash);
}
