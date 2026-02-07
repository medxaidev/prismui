import type {
  PrismuiColorShade,
  PrismuiResolvedColorScheme,
  PrismuiTheme,
} from '../theme/types';
import { getPaletteVars } from './palette-vars';

const SHADE_STEPS: readonly PrismuiColorShade[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
];

// ---------------------------------------------------------------------------
// CSS variable generation
// ---------------------------------------------------------------------------

export function getPrismuiCssVariables(
  theme: PrismuiTheme,
  scheme: PrismuiResolvedColorScheme
): Record<string, string> {
  const vars: Record<string, string> = {};

  // --- Color family shades (--prismui-color-blue-50 .. --prismui-color-blue-900) ---
  for (const [family, scale] of Object.entries(theme.colorFamilies)) {
    for (const shade of SHADE_STEPS) {
      vars[`--prismui-color-${family}-${shade}`] = scale[shade];
    }
  }

  // --- Scheme ---
  vars['--prismui-scheme'] = scheme;

  // --- Palette (semantic colors, text, background, divider, action) ---
  Object.assign(vars, getPaletteVars(theme, scheme));

  // --- Font ---
  vars['--prismui-font-family'] = theme.fontFamily;
  vars['--prismui-font-family-monospace'] = theme.fontFamilyMonospace;

  // --- Spacing ---
  for (const [key, value] of Object.entries(theme.spacing)) {
    vars[`--prismui-spacing-${key}`] = value;
  }

  return vars;
}

export function cssVariablesToCssText(
  selector: string,
  vars: Record<string, string>
): string {
  const declarations = Object.entries(vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join('\n');
  return `${selector} {\n${declarations}\n}`;
}

export function getPrismuiThemeCssText(
  theme: PrismuiTheme,
  scheme: PrismuiResolvedColorScheme,
  selector = ':root'
): string {
  const vars = getPrismuiCssVariables(theme, scheme);
  return cssVariablesToCssText(selector, vars);
}
