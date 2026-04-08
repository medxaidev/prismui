import type {
  PrismUITheme,
  PrismUIPalette,
  ColorRef,
  DefaultColorFamily,
  ColorShade,
} from "../types";

/**
 * resolveColorRef
 *
 * Resolve a ColorRef string to an actual CSS color value.
 * Pure lookup — no computation.
 *
 * Failure behavior:
 * - DEV: console.warn with the invalid ref
 * - Returns 'transparent' (NOT the original string)
 *   Reason: feeding "colors.blue.500" into CSS is an invalid color → silent failure
 *   'transparent' makes the error visually obvious and debuggable
 *
 * @example
 * resolveColorRef("colors.blue.500", theme) → "#0C68E9"
 * resolveColorRef("colors.invalid.999", theme) → "transparent" + console.warn
 */
export function resolveColorRef(ref: ColorRef, theme: PrismUITheme): string {
  const parts = ref.split(".");
  // format: "colors.{family}.{shade}"
  const family = parts[1] as DefaultColorFamily;
  const shade = Number(parts[2]) as ColorShade;
  const value = theme.colors[family]?.[shade];

  if (!value) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[PrismUI] Invalid ColorRef: "${ref}" — ` +
          `family "${family}" or shade "${shade}" not found in theme.colors`,
      );
    }
    return "transparent"; // visible failure, not silent
  }

  return value;
}

/**
 * generateCSSVariables
 *
 * Generate CSS Variables Map from PrismUITheme.
 * Pure function — input: theme → output: Record<string, string>
 *
 * Called on Provider mount and whenever theme/colorScheme changes.
 * Zero runtime derivation — all values are direct lookups.
 *
 * Naming convention:
 * - --prismui-color-{name}          semantic palette base
 * - --prismui-color-{name}-hover    semantic palette hover
 * - --prismui-color-{name}-active   semantic palette active
 * - --prismui-spacing-{scale}
 * - --prismui-radius-{scale}
 * - --prismui-shadow-{scale}
 * - --prismui-font-size-{scale}
 * - --prismui-font-weight-{scale}
 * - --prismui-line-height-{scale}
 * Reserved (Stage 4): --prismui-component-{name}-{property}
 */
export function generateCSSVariables(
  theme: PrismUITheme,
  colorScheme: "light" | "dark" = "light",
): Record<string, string> {
  const vars: Record<string, string> = {};
  const palette: PrismUIPalette = theme.palette[colorScheme];

  // ── Semantic Palette ─────────────────────────────────────────────────────
  const semanticNames = [
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "neutral",
  ] as const;

  for (const name of semanticNames) {
    const token = palette[name];
    vars[`--prismui-color-${name}`] = resolveColorRef(token.base, theme);
    vars[`--prismui-color-${name}-hover`] = resolveColorRef(token.hover, theme);
    vars[`--prismui-color-${name}-active`] = resolveColorRef(
      token.active,
      theme,
    );
  }

  // ── Spacing ───────────────────────────────────────────────────────────────
  for (const [scale, value] of Object.entries(theme.spacing)) {
    vars[`--prismui-spacing-${scale}`] = String(value);
  }

  // ── Radius ────────────────────────────────────────────────────────────────
  for (const [scale, value] of Object.entries(theme.radius)) {
    vars[`--prismui-radius-${scale}`] = String(value);
  }

  // ── Shadows ───────────────────────────────────────────────────────────────
  for (const [scale, value] of Object.entries(theme.shadows)) {
    vars[`--prismui-shadow-${scale}`] = String(value);
  }

  // ── Typography ────────────────────────────────────────────────────────────
  for (const [scale, value] of Object.entries(theme.typography.fontSize)) {
    vars[`--prismui-font-size-${scale}`] = String(value);
  }
  for (const [scale, value] of Object.entries(theme.typography.fontWeight)) {
    vars[`--prismui-font-weight-${scale}`] = String(value);
  }
  for (const [scale, value] of Object.entries(theme.typography.lineHeight)) {
    vars[`--prismui-line-height-${scale}`] = String(value);
  }

  return vars;
}

/**
 * applyDiffCSSVariables
 *
 * Apply CSS Variables to a DOM element, diffing against previous values.
 * Only calls setProperty for changed variables — avoids full re-apply on every render.
 * Calls removeProperty for variables that no longer exist.
 *
 * Target: document.documentElement (:root) by default — global scope.
 * Reason: CSS Variables are scope-based (DOM inheritance).
 *   Injecting into a wrapper div means Portal children and anything outside
 *   the Provider subtree can't read the variables.
 *
 * @param element  - DOM element to inject into (usually document.documentElement)
 * @param next     - New CSS variables map
 * @param prev     - Previous CSS variables map (for diff, defaults to {})
 */
export function applyDiffCSSVariables(
  element: HTMLElement,
  next: Record<string, string>,
  prev: Record<string, string> = {},
): void {
  for (const key in next) {
    if (prev[key] !== next[key]) {
      element.style.setProperty(key, next[key]);
    }
  }
  // Remove variables that no longer exist in next
  for (const key in prev) {
    if (!(key in next)) {
      element.style.removeProperty(key);
    }
  }
}
