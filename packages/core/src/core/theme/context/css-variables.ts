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
export function resolveColorRef(ref: ColorRef | string, theme: PrismUITheme<string>): string {
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
 * selectPalette
 *
 * Indirection layer between colorScheme and palette lookup.
 * Currently a direct property access, but this layer enables future extensions:
 * - nested colorScheme override (per-subtree dark mode)
 * - media query auto-switching
 * - per-component colorScheme override (Stage 5)
 *
 * Cost: zero. Benefit: unlocks Stage 5 extensibility without API change.
 */
export function selectPalette(
  theme: PrismUITheme<string, string>,
  colorScheme: string,
): PrismUIPalette<string> {
  const palette = (theme.palette as Record<string, PrismUIPalette<string>>)[colorScheme];
  if (!palette) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[PrismUI] colorScheme "${colorScheme}" not found in theme.palette. ` +
        `Falling back to first available palette.`,
      );
    }
    return Object.values(theme.palette as Record<string, PrismUIPalette<string>>)[0];
  }
  return palette;
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
 *
 * Abstract interaction states (generic, non-variant-specific):
 * - --prismui-color-{name}                  base color
 * - --prismui-color-{name}-hover            hover state
 * - --prismui-color-{name}-active           active/pressed state
 *
 * Color roles (variant-specific, consumed by variant system in Step 4.2):
 * - --prismui-color-{name}-high-bg          high emphasis background
 * - --prismui-color-{name}-high-hover-bg    high emphasis hover background
 * - --prismui-color-{name}-high-fg          high emphasis foreground
 * - --prismui-color-{name}-low-bg           low emphasis background
 * - --prismui-color-{name}-low-hover-bg     low emphasis hover background
 * - --prismui-color-{name}-low-fg           low emphasis foreground
 * - --prismui-color-{name}-bordered-border  bordered border color
 * - --prismui-color-{name}-bordered-fg      bordered foreground
 * - --prismui-color-{name}-bordered-hover-bg bordered hover background
 * - --prismui-color-{name}-minimal-fg       minimal foreground
 * - --prismui-color-{name}-minimal-hover-bg minimal hover background
 *
 * Token scale:
 * - --prismui-spacing-{scale}
 * - --prismui-radius-{scale}
 * - --prismui-shadow-{scale}
 * - --prismui-font-size-{scale}
 * - --prismui-font-weight-{scale}
 * - --prismui-line-height-{scale}
 *
 * Focus ring (Stage 9 / a11y):
 * - --prismui-focus-ring-width   → outline width for :focus-visible
 * - --prismui-focus-ring-offset  → outline offset for :focus-visible
 * - --prismui-focus-ring-color   → outline color (CSS value, not ColorRef)
 *
 * Reserved (Stage 4): --prismui-component-{name}-{property}
 */
export function generateCSSVariables(
  theme: PrismUITheme<string, string>,
  colorScheme: string = "light",
): Record<string, string> {
  const vars: Record<string, string> = {};
  const palette: PrismUIPalette<string> = selectPalette(theme, colorScheme);

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

    // Abstract interaction states (generic, non-variant-specific)
    vars[`--prismui-color-${name}`] = resolveColorRef(token.base, theme);
    vars[`--prismui-color-${name}-hover`] = resolveColorRef(token.hover, theme);
    vars[`--prismui-color-${name}-active`] = resolveColorRef(token.active, theme);

    // Color roles — high emphasis (e.g. 'filled' variant)
    vars[`--prismui-color-${name}-high-bg`] = resolveColorRef(token.high.bg, theme);
    vars[`--prismui-color-${name}-high-hover-bg`] = resolveColorRef(token.high.hoverBg, theme);
    vars[`--prismui-color-${name}-high-fg`] = resolveColorRef(token.high.fg, theme);

    // Color roles — low emphasis (e.g. 'soft' variant)
    vars[`--prismui-color-${name}-low-bg`] = resolveColorRef(token.low.bg, theme);
    vars[`--prismui-color-${name}-low-hover-bg`] = resolveColorRef(token.low.hoverBg, theme);
    vars[`--prismui-color-${name}-low-fg`] = resolveColorRef(token.low.fg, theme);

    // Color roles — bordered (e.g. 'outlined' variant)
    vars[`--prismui-color-${name}-bordered-border`] = resolveColorRef(token.bordered.border, theme);
    vars[`--prismui-color-${name}-bordered-fg`] = resolveColorRef(token.bordered.fg, theme);
    vars[`--prismui-color-${name}-bordered-hover-bg`] = resolveColorRef(token.bordered.hoverBg, theme);

    // Color roles — minimal (e.g. 'plain' variant)
    vars[`--prismui-color-${name}-minimal-fg`] = resolveColorRef(token.minimal.fg, theme);
    vars[`--prismui-color-${name}-minimal-hover-bg`] = resolveColorRef(token.minimal.hoverBg, theme);
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

  // ── Color Family Shades ───────────────────────────────────────────────────
  // Injects all color families as raw shade CSS Variables.
  // Note: naming spaces do NOT collide:
  //   --prismui-color-blue-500         ← color family shade (raw value)
  //   --prismui-color-primary-high-bg  ← semantic palette role (resolved ColorRef)
  for (const [family, shades] of Object.entries(theme.colors)) {
    for (const [shade, value] of Object.entries(shades as Record<string, string>)) {
      vars[`--prismui-color-${family}-${shade}`] = value;
    }
  }

  // ── Focus Ring ────────────────────────────────────────────────────────────
  vars['--prismui-focus-ring-width'] = String(theme.focusRing.width);
  vars['--prismui-focus-ring-offset'] = String(theme.focusRing.offset);
  vars['--prismui-focus-ring-color'] = theme.focusRing.color;

  // ── Custom Tokens ─────────────────────────────────────────────────────────
  // Escape hatch: inject user-defined CSS Variables.
  // DEV warning when key uses --prismui- prefix (system-reserved namespace).
  if (theme.customTokens) {
    for (const [key, value] of Object.entries(theme.customTokens)) {
      if (process.env.NODE_ENV !== "production" && key.startsWith("--prismui-")) {
        console.warn(
          `[PrismUI] customTokens key "${key}" starts with "--prismui-" — ` +
          `this may override system variables. Use a custom prefix (e.g. "--app-").`,
        );
      }
      vars[key] = value;
    }
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
