import type {
  PrismUITheme,
  PrismUIPalette,
  ColorRef,
  DefaultColorFamily,
  ColorShade,
  ColorExpression,
  ShadowExpression,
  TextRoleName,
  TextRoleRef,
} from "../types";
import { resolveShadowExpression } from "./effect-resolver";

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
 * resolveColorExpression
 *
 * Resolve a ColorExpression to an actual CSS color value.
 * ADR-001: alpha type internally uses color-mix(), no channel CSS vars needed.
 *
 * @param expr   - The ColorExpression to resolve
 * @param family - Color family name ("blue", "red", etc.)
 * @param theme  - PrismUITheme for color lookup
 *
 * @example
 * resolveColorExpression({ type: 'shade', shade: 500 }, 'blue', theme)
 *   → "#0C68E9"
 * resolveColorExpression({ type: 'alpha', shade: 500, alpha: 0.08 }, 'blue', theme)
 *   → "color-mix(in srgb, #0C68E9 8%, transparent)"
 * resolveColorExpression({ type: 'raw', value: 'currentcolor' }, 'blue', theme)
 *   → "currentcolor"
 */
export function resolveColorExpression(
  expr: ColorExpression,
  family: string,
  theme: PrismUITheme<string>,
): string {
  switch (expr.type) {
    case 'shade': {
      const value = (theme.colors as Record<string, Record<number, string>>)[family]?.[expr.shade];
      if (!value) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[PrismUI] resolveColorExpression: shade ${expr.shade} not found in family "${family}"`,
          );
        }
        return "transparent";
      }
      return value;
    }

    case 'alpha': {
      const hex = (theme.colors as Record<string, Record<number, string>>)[family]?.[expr.shade];
      if (!hex) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[PrismUI] resolveColorExpression: shade ${expr.shade} not found in family "${family}"`,
          );
        }
        return "transparent";
      }
      return `color-mix(in srgb, ${hex} ${Math.round(expr.alpha * 100)}%, transparent)`;
    }

    case 'raw':
      return expr.value;

    default:
      return expr satisfies never;
  }
}

/**
 * isShadowExpression — type guard for Effect System dispatch.
 *
 * Used in generateCSSVariables to route hoverShadow fields
 * to resolveShadowExpression (Effect) vs resolveColorExpression (Color).
 */
function isShadowExpression(
  expr: ColorExpression | ShadowExpression,
): expr is ShadowExpression {
  return expr.type === 'shadow';
}

/**
 * resolveTextRole (Step 3.8)
 *
 * Resolve a TextRoleRef to an actual CSS color value by traversing:
 *   TextRoleRef → palette[semantic][role][field] → resolveColorExpression
 *
 * This is a pure lookup against the active palette — no runtime derivation.
 *
 * Failure behavior:
 * - DEV: console.warn with the invalid ref
 * - Returns 'transparent' (consistent with resolveColorRef)
 *
 * @example
 * resolveTextRole({ semantic: 'error', role: 'high', field: 'bg' }, palette, theme)
 *   → "#D32F2F"
 */
export function resolveTextRole(
  ref: TextRoleRef,
  palette: PrismUIPalette<string>,
  theme: PrismUITheme<string>,
): string {
  const semanticToken = palette[ref.semantic];
  if (!semanticToken) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[PrismUI] resolveTextRole: semantic "${ref.semantic}" not found in palette`,
      );
    }
    return "transparent";
  }

  const roleBlock = semanticToken[ref.role] as
    | Record<string, ColorExpression>
    | undefined;
  if (!roleBlock) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[PrismUI] resolveTextRole: role "${ref.role}" not found in semantic "${ref.semantic}"`,
      );
    }
    return "transparent";
  }

  const expr = roleBlock[ref.field];
  if (!expr) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[PrismUI] resolveTextRole: field "${ref.field}" not found in ` +
        `"${ref.semantic}.${ref.role}". Text Roles only support fields that exist ` +
        `on the selected role (e.g. minimal has no 'bg').`,
      );
    }
    return "transparent";
  }

  return resolveColorExpression(expr, semanticToken.family, theme);
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
 * Stage-14 SZ-TYPE-2 Family Layer (3 × 3 × 3 = 27 vars):
 * - --prismui-typography-{body|title|label}-{sm|md|lg}-font-size
 * - --prismui-typography-{body|title|label}-{sm|md|lg}-line-height
 * - --prismui-typography-{body|title|label}-{sm|md|lg}-font-weight
 *
 * Stage-14 Phase 4 Section Layout (12 vars · SZ-SEC-1/2 · v1.1 schema):
 * - --prismui-section-padding-x / -gap                       (spacing CSSLength)
 * - --prismui-section-header-padding-y                       (spacing CSSLength · v1.1)
 * - --prismui-section-content-padding-y                      (spacing CSSLength · v1.1)
 * - --prismui-section-footer-padding-y                       (spacing CSSLength · v1.1)
 * - --prismui-section-title-font-size / -line-height / -font-weight (resolved triplet)
 * - --prismui-section-header-align / -header-justify         (Flexbox literal)
 * - --prismui-section-footer-justify                         (Flexbox literal)
 * - --prismui-section-content-scroll                         (overflow-y literal)
 *
 * Focus ring (Stage 9 / a11y):
 * - --prismui-focus-ring-width   → outline width for :focus-visible
 * - --prismui-focus-ring-offset  → outline offset for :focus-visible
 * - --prismui-focus-ring-color   → outline color (CSS value, not ColorRef)
 *
 * Focus pointer-halo (Switch v1.0 OQ-S-7 · focus-behavior.md §4.3):
 * - --prismui-focus-pointer-halo-width  → box-shadow spread for :focus:not(:focus-visible)
 * - --prismui-focus-pointer-halo-color  → halo color (CSS value)
 *
 * Text roles (Step 3.8 — Text Role Layer):
 * - --prismui-text-{role}        → resolved from theme.textRoles[role]
 *   Roles: primary | secondary | disabled | danger | warning | success | info
 *   Usage: CSS `color` property ONLY. Non-text styling must use
 *   --prismui-color-{semantic}-* instead (System Invariant Rule 3).
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
    const family = token.family;
    const re = (expr: import("../types").ColorExpression) =>
      resolveColorExpression(expr, family, theme);

    // Abstract interaction states (generic, non-variant-specific)
    vars[`--prismui-color-${name}`] = resolveColorRef(token.base, theme);
    vars[`--prismui-color-${name}-hover`] = resolveColorRef(token.hover, theme);
    vars[`--prismui-color-${name}-active`] = resolveColorRef(token.active, theme);

    // Color roles — high emphasis (e.g. 'filled' variant)
    vars[`--prismui-color-${name}-high-bg`] = re(token.high.bg);
    vars[`--prismui-color-${name}-high-hover-bg`] = re(token.high.hoverBg);
    vars[`--prismui-color-${name}-high-active-bg`] = re(token.high.activeBg);
    vars[`--prismui-color-${name}-high-fg`] = re(token.high.fg);
    const highShadow = token.high.hoverShadow;
    vars[`--prismui-color-${name}-high-hover-shadow`] = isShadowExpression(highShadow)
      ? resolveShadowExpression(highShadow, family)
      : re(highShadow);

    // Color roles — low emphasis (e.g. 'soft' variant)
    vars[`--prismui-color-${name}-low-bg`] = re(token.low.bg);
    vars[`--prismui-color-${name}-low-hover-bg`] = re(token.low.hoverBg);
    vars[`--prismui-color-${name}-low-active-bg`] = re(token.low.activeBg);
    vars[`--prismui-color-${name}-low-fg`] = re(token.low.fg);

    // Color roles — bordered (e.g. 'outlined' variant)
    vars[`--prismui-color-${name}-bordered-bg`] = re(token.bordered.bg);
    vars[`--prismui-color-${name}-bordered-fg`] = re(token.bordered.fg);
    vars[`--prismui-color-${name}-bordered-border`] = re(token.bordered.border);
    vars[`--prismui-color-${name}-bordered-hover-bg`] = re(token.bordered.hoverBg);
    vars[`--prismui-color-${name}-bordered-active-bg`] = re(token.bordered.activeBg);
    vars[`--prismui-color-${name}-bordered-hover-border`] = re(token.bordered.hoverBorder);
    const borderedShadow = token.bordered.hoverShadow;
    vars[`--prismui-color-${name}-bordered-hover-shadow`] = isShadowExpression(borderedShadow)
      ? resolveShadowExpression(borderedShadow, family)
      : re(borderedShadow);

    // Color roles — minimal (e.g. 'plain' variant)
    vars[`--prismui-color-${name}-minimal-fg`] = re(token.minimal.fg);
    vars[`--prismui-color-${name}-minimal-hover-bg`] = re(token.minimal.hoverBg);
    vars[`--prismui-color-${name}-minimal-active-bg`] = re(token.minimal.activeBg);
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

  // ── Transition Duration ──────────────────────────────────────────────────
  for (const [scale, value] of Object.entries(theme.transition.duration)) {
    vars[`--prismui-duration-${scale}`] = String(value);
  }

  // ── Transition Easing ────────────────────────────────────────────────────
  for (const [scale, value] of Object.entries(theme.transition.easing)) {
    vars[`--prismui-ease-${scale}`] = String(value);
  }

  // ── Transition Shorthand (CSS var composition) ──────────────────────────
  for (const scale of Object.keys(theme.transition.duration)) {
    vars[`--prismui-transition-${scale}`] =
      `var(--prismui-duration-${scale}) var(--prismui-ease-standard)`;
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

  // ── Stage-14 SZ-TYPE-2 Family Layer ───────────────────────────────────────
  // Emits 27 vars (3 families × 3 sizes × 3 fields) for the body/title/label
  // semantic typography layer. Naming convention:
  //   --prismui-typography-{family}-{size}-font-size
  //   --prismui-typography-{family}-{size}-line-height   (px integer · SZ-TYPE-1)
  //   --prismui-typography-{family}-{size}-font-weight
  //
  // Consumers MAY use the primitive `--prismui-font-size-*` / `--prismui-line-
  // height-*` vars (Stage-3 layer · still emitted above for back-compat) OR
  // these family vars. New components SHOULD prefer the family layer.
  for (const family of ['body', 'title', 'label'] as const) {
    const familyTokens = theme.typography[family];
    for (const [size, token] of Object.entries(familyTokens)) {
      vars[`--prismui-typography-${family}-${size}-font-size`] = String(token.fontSize);
      vars[`--prismui-typography-${family}-${size}-line-height`] = `${token.lineHeight}px`;
      vars[`--prismui-typography-${family}-${size}-font-weight`] = String(token.fontWeight);
    }
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

  // ── Stage-14 Phase 4 · Section Layout (SZ-SEC-1 / SZ-SEC-2 · v1.1 schema) ──
  // Authority: STAGE-14-OVERVIEW.md §3.7.1 (10 fields v1.1 = 2 spacing + 1
  // typography + 7 alignment-and-paddingY · was 8 in v1.0). The 1 typography
  // field (`titleSize`) is a size-KEY config knob — the CSS layer needs the
  // *resolved* fontSize / lineHeight / fontWeight triplet, so the emitter
  // expands titleSize into those three vars. Net CSS-var count = 2 (spacing)
  // + 3 (per-band paddingY · v1.1) + 3 (resolved typography) + 4 (alignment) =
  // **12 emitted variables** from 10 type fields (was 10 emitted from 8 in v1.0).
  //
  // Naming convention:
  //   --prismui-section-padding-x          (spacing CSSLength · default 1.5rem)
  //   --prismui-section-gap                (spacing CSSLength · default 0px · v1.1)
  //   --prismui-section-header-padding-y   (spacing CSSLength · default 1.5rem · v1.1)
  //   --prismui-section-content-padding-y  (spacing CSSLength · default 0px · v1.1)
  //   --prismui-section-footer-padding-y   (spacing CSSLength · default 1.5rem · v1.1)
  //   --prismui-section-title-font-size    (resolved from typography.title[size])
  //   --prismui-section-title-line-height  (resolved · "{n}px" format · SZ-TYPE-1)
  //   --prismui-section-title-font-weight  (resolved · numeric)
  //   --prismui-section-header-align       (CSS align-items literal)
  //   --prismui-section-header-justify     (CSS justify-content literal)
  //   --prismui-section-footer-justify     (CSS justify-content literal)
  //   --prismui-section-content-scroll     (CSS overflow-y literal)
  //
  // Why resolve the title triplet here rather than letting containers
  // reference `--prismui-typography-title-md-*` directly:
  //   1. Single source of truth — changing `theme.layout.section.titleSize`
  //      from 'md' to 'lg' auto-propagates to every container without any
  //      CSS edit. Otherwise the size key would only be type-level metadata
  //      and SZ-SEC-1 ("must consume tokens, not hardcode") becomes a half-
  //      promise (containers would still hardcode the family/size pair).
  //   2. Container CSS stays declarative: `font-size: var(--prismui-section-
  //      title-font-size)` is the canonical form across all consumers.
  //
  // Alignment mapping table (D-4 · stable contract):
  //   header.align    'center'  → 'center'         · 'start'   → 'flex-start'
  //   header.justify  'between' → 'space-between'
  //   footer.justify  'end'     → 'flex-end'       · 'between' → 'space-between'
  //                   'start'   → 'flex-start'
  //   content.scroll  'auto'    → 'auto'           · 'never'   → 'visible'
  const section = theme.layout.section;

  vars['--prismui-section-padding-x'] = String(section.paddingX);
  vars['--prismui-section-gap']        = String(section.gap);

  // v1.1 schema · per-band paddingY (was a single global field in v1.0).
  // The CSS layer references these via `var(--prismui-section-{band}-padding-y)`
  // so each band picks up its own value without inheriting from a shared parent.
  vars['--prismui-section-header-padding-y']  = String(section.header.paddingY);
  vars['--prismui-section-content-padding-y'] = String(section.content.paddingY);
  vars['--prismui-section-footer-padding-y']  = String(section.footer.paddingY);

  // Resolve title typography triplet from theme.typography.title[titleSize].
  // The lookup is type-safe because `titleSize: TypographySize` constrains
  // the index, and `theme.typography.title` is `Record<TypographySize, ...>`.
  const titleToken = theme.typography.title[section.titleSize];
  vars['--prismui-section-title-font-size']   = String(titleToken.fontSize);
  vars['--prismui-section-title-line-height'] = `${titleToken.lineHeight}px`;
  vars['--prismui-section-title-font-weight'] = String(titleToken.fontWeight);

  vars['--prismui-section-header-align'] =
    section.header.align === 'center' ? 'center' : 'flex-start';
  // header.justify is currently a single-value union ('between'). When v1.x
  // widens the union, an exhaustiveness check (assertNever) here would force
  // a branch update — the literal emission below is intentional v1 simplicity.
  vars['--prismui-section-header-justify'] = 'space-between';

  vars['--prismui-section-footer-justify'] =
    section.footer.justify === 'end'
      ? 'flex-end'
      : section.footer.justify === 'between'
        ? 'space-between'
        : 'flex-start';

  vars['--prismui-section-content-scroll'] =
    section.content.scroll === 'auto' ? 'auto' : 'visible';

  // ── Focus Ring ────────────────────────────────────────────────────────────
  vars['--prismui-focus-ring-width'] = String(theme.focusRing.width);
  vars['--prismui-focus-ring-offset'] = String(theme.focusRing.offset);
  vars['--prismui-focus-ring-color'] = theme.focusRing.color;

  // ── Focus Pointer-Halo (mode-B真分轨 weak-signal channel) ─────────────────
  // Companion to focusRing; consumed by Switch and future non-text-input
  // C-2 Abstract controls on the `:focus:not(:focus-visible)` selector.
  // See `focus-behavior.md` §4.3 and Switch `design.md` §11.1 for scope.
  vars['--prismui-focus-pointer-halo-width'] = String(
    theme.focusPointerHalo.width,
  );
  vars['--prismui-focus-pointer-halo-color'] = theme.focusPointerHalo.color;

  // ── Text Roles (Step 3.8) ─────────────────────────────────────────────────
  // Structured TextRoleRef → palette lookup. See stage-3-step-(stage-9)-8.md §3.
  //
  // Emitted names:
  //   --prismui-text-primary / secondary / disabled
  //   --prismui-text-danger / warning / success / info
  //
  // Usage boundary (Rule 3): text color ONLY. Non-text styling must use
  // --prismui-color-{semantic}-* instead.
  for (const [roleName, ref] of Object.entries(theme.textRoles) as Array<
    [TextRoleName, TextRoleRef]
  >) {
    vars[`--prismui-text-${roleName}`] = resolveTextRole(ref, palette, theme);
  }

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
