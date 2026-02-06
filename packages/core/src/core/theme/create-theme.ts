import type {
  PrismuiTheme,
  PrismuiThemeInput,
  PrismuiPaletteColor,
  PrismuiPaletteInput,
  PrismuiPalette,
  PrismuiColorScale,
  PrismuiColorFamily,
  PrismuiColorFamilies,
  PrismuiColorShade,
} from './types';
import type { PrismuiShadeIndex, PrismuiPrimaryShade } from './types';
import { PRISMUI_SHADE_STEPS } from './types';
import { defaultTheme } from './default-theme';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function deepMerge<T>(target: T, source: Partial<T>): T {
  if (source === null || source === undefined) return target;

  if (Array.isArray(target) || Array.isArray(source)) {
    return source as T;
  }

  if (isPlainObject(target) && isPlainObject(source)) {
    const result: Record<string, unknown> = { ...target };
    for (const [key, value] of Object.entries(source)) {
      const existing = (result as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        result[key] = value;
        continue;
      }
      if (isPlainObject(existing) && isPlainObject(value)) {
        result[key] = deepMerge(existing, value);
        continue;
      }
      result[key] = value;
    }
    return result as T;
  }

  return source as T;
}

// ---------------------------------------------------------------------------
// Shade resolver
// ---------------------------------------------------------------------------

function clampIndex(index: number): PrismuiShadeIndex {
  return Math.max(0, Math.min(9, index)) as PrismuiShadeIndex;
}

function indexToShade(index: PrismuiShadeIndex): PrismuiColorShade {
  return PRISMUI_SHADE_STEPS[index];
}

function resolvePaletteColor(
  scale: PrismuiColorScale,
  center: PrismuiShadeIndex,
  contrastText: string,
): PrismuiPaletteColor {
  return {
    lighter: scale[indexToShade(clampIndex(center - 4))],
    light: scale[indexToShade(clampIndex(center - 2))],
    main: scale[indexToShade(center)],
    dark: scale[indexToShade(clampIndex(center + 2))],
    darker: scale[indexToShade(clampIndex(center + 4))],
    contrastText,
  };
}

// ---------------------------------------------------------------------------
// Semantic color keys that are auto-resolved from colorFamilies + primaryShade
// ---------------------------------------------------------------------------

const SEMANTIC_COLOR_KEYS = [
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
] as const;

type SemanticColorKey = (typeof SEMANTIC_COLOR_KEYS)[number];

const SEMANTIC_TO_CONFIG: Record<SemanticColorKey, keyof PrismuiThemeInput> = {
  primary: 'primaryColor',
  secondary: 'secondaryColor',
  info: 'infoColor',
  success: 'successColor',
  warning: 'warningColor',
  error: 'errorColor',
};

function defaultContrastText(scheme: 'light' | 'dark'): string {
  return scheme === 'light' ? '#FFFFFF' : '#0B0D0E';
}

// ---------------------------------------------------------------------------
// Palette resolver
// ---------------------------------------------------------------------------

function resolvePalette<S extends 'light' | 'dark'>(
  input: PrismuiPaletteInput<S>,
  scheme: S,
  families: PrismuiColorFamilies,
  primaryShade: PrismuiPrimaryShade,
  themeInput: PrismuiThemeInput,
): PrismuiPalette<S> {
  const center = primaryShade[scheme];

  const resolved: Record<string, unknown> = { ...input };

  for (const key of SEMANTIC_COLOR_KEYS) {
    if (input[key]) continue;

    const familyName = themeInput[SEMANTIC_TO_CONFIG[key]] as PrismuiColorFamily;
    const scale = families[familyName];
    if (!scale) continue;

    resolved[key] = resolvePaletteColor(
      scale,
      center,
      defaultContrastText(scheme),
    );
  }

  return resolved as unknown as PrismuiPalette<S>;
}

// ---------------------------------------------------------------------------
// createTheme
// ---------------------------------------------------------------------------

export function createTheme(
  config: Partial<PrismuiThemeInput> = {},
): PrismuiTheme {
  const merged = deepMerge(defaultTheme, config);

  const resolvedLight = resolvePalette(
    merged.colorSchemes.light.palette,
    'light',
    merged.colorFamilies,
    merged.primaryShade,
    merged,
  );

  const resolvedDark = resolvePalette(
    merged.colorSchemes.dark.palette,
    'dark',
    merged.colorFamilies,
    merged.primaryShade,
    merged,
  );

  return {
    ...merged,
    colorSchemes: {
      light: { palette: resolvedLight },
      dark: { palette: resolvedDark },
    },
  };
}