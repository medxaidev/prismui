import type { PrismuiTheme } from './types';

// ---------------------------------------------------------------------------
// Semantic color keys that map to --prismui-{key}-main
// ---------------------------------------------------------------------------

const SEMANTIC_KEYS = [
  'primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral',
] as const;

// ---------------------------------------------------------------------------
// Palette token keys that map to --prismui-{group}-{token}
// ---------------------------------------------------------------------------

const PALETTE_TOKEN_MAP: Record<string, string> = {
  'text.primary': '--prismui-text-primary',
  'text.secondary': '--prismui-text-secondary',
  'text.disabled': '--prismui-text-disabled',
  'text.icon': '--prismui-text-icon',
  'background.paper': '--prismui-background-paper',
  'background.default': '--prismui-background-default',
  'background.neutral': '--prismui-background-neutral',
  'common.black': '--prismui-common-black',
  'common.white': '--prismui-common-white',
  'divider': '--prismui-divider',
};

// ---------------------------------------------------------------------------
// Semantic sub-field keys (e.g. 'primary.dark' → --prismui-primary-dark)
// ---------------------------------------------------------------------------

const SEMANTIC_FIELDS = [
  'lighter', 'light', 'main', 'dark', 'darker', 'contrastText',
  'lighterChannel', 'lightChannel', 'mainChannel', 'darkChannel', 'darkerChannel', 'contrastTextChannel',
] as const;

// ---------------------------------------------------------------------------
// getThemeColor
// ---------------------------------------------------------------------------

/**
 * Resolves a color string to a CSS value.
 *
 * Resolution order:
 * 1. Semantic color key → `var(--prismui-{key}-main)`
 *    e.g. `'primary'` → `'var(--prismui-primary-main)'`
 *
 * 2. Semantic color + field → `var(--prismui-{key}-{field})`
 *    e.g. `'primary.dark'` → `'var(--prismui-primary-dark)'`
 *
 * 3. Color family + shade → `var(--prismui-color-{family}-{shade})`
 *    e.g. `'blue.500'` → `'var(--prismui-color-blue-500)'`
 *
 * 4. Color family (no shade) → `var(--prismui-color-{family}-{mainShade})`
 *    e.g. `'blue'` → `'var(--prismui-color-blue-500)'` (light scheme, center=5)
 *
 * 5. Palette token → `var(--prismui-{token})`
 *    e.g. `'text.primary'` → `'var(--prismui-text-primary)'`
 *
 * 6. CSS passthrough — any other string returned as-is
 *    e.g. `'#ff0000'` → `'#ff0000'`
 *    e.g. `'rgb(255,0,0)'` → `'rgb(255,0,0)'`
 */
export function getThemeColor(
  color: string | undefined,
  theme: PrismuiTheme,
): string | undefined {
  if (color == null || color === '') return undefined;

  // --- Palette tokens (text.primary, background.paper, etc.) ---
  const paletteVar = PALETTE_TOKEN_MAP[color];
  if (paletteVar) {
    return `var(${paletteVar})`;
  }

  // --- Dot notation: could be semantic.field or family.shade ---
  if (color.includes('.')) {
    const [prefix, suffix] = color.split('.', 2);

    // Semantic color + field (e.g. 'primary.dark')
    if (
      (SEMANTIC_KEYS as readonly string[]).includes(prefix) &&
      (SEMANTIC_FIELDS as readonly string[]).includes(suffix)
    ) {
      return `var(--prismui-${prefix}-${suffix})`;
    }

    // Color family + shade (e.g. 'blue.500')
    const shade = Number(suffix);
    if (prefix in theme.colorFamilies && !Number.isNaN(shade)) {
      return `var(--prismui-color-${prefix}-${shade})`;
    }
  }

  // --- Semantic color key (e.g. 'primary') ---
  if ((SEMANTIC_KEYS as readonly string[]).includes(color)) {
    return `var(--prismui-${color}-main)`;
  }

  // --- Color family without shade (e.g. 'blue') ---
  if (color in theme.colorFamilies) {
    // Use primaryShade to determine the default shade
    // We don't have scheme here, so use light as default
    const center = theme.primaryShade.light;
    const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
    const shade = SHADE_STEPS[center];
    return `var(--prismui-color-${color}-${shade})`;
  }

  // --- CSS passthrough ---
  return color;
}
