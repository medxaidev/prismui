import type { PrismuiTheme, PrismuiPaletteColor, PrismuiColorFamily, PrismuiColorScale, PrismuiResolvedColorScheme } from '../types';
import type { VariantColorResolverInput, VariantColorsResult } from './variant-color-resolver';
import { getColorChannels } from '../../color-functions';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEMANTIC_COLOR_KEYS = [
  'primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral',
] as const;

type SemanticColorKey = (typeof SEMANTIC_COLOR_KEYS)[number];

const SEMANTIC_TO_CONFIG: Record<string, keyof PrismuiTheme> = {
  primary: 'primaryColor',
  secondary: 'secondaryColor',
  info: 'infoColor',
  success: 'successColor',
  warning: 'warningColor',
  error: 'errorColor',
  neutralColor: 'neutralColor',
};

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isSemanticColor(color: string): color is SemanticColorKey {
  return (SEMANTIC_COLOR_KEYS as readonly string[]).includes(color);
}

function isColorFamily(color: string, theme: PrismuiTheme): boolean {
  return color in theme.colorFamilies;
}

function getColorScale(color: string, theme: PrismuiTheme): PrismuiColorScale | undefined {
  return (theme.colorFamilies as Record<string, PrismuiColorScale>)[color];
}

/**
 * Resolve a semantic color key to its PrismuiPaletteColor.
 * Falls back to resolving from colorFamilies + primaryShade if not in palette.
 */
function resolveSemanticPalette(
  key: SemanticColorKey,
  theme: PrismuiTheme,
  scheme: PrismuiResolvedColorScheme,
): PrismuiPaletteColor | undefined {
  const palette = theme.colorSchemes[scheme].palette;

  // neutral is always present directly
  if (key === 'neutral') {
    return palette.neutral;
  }

  // Check if user provided explicit palette
  const explicit = palette[key as keyof typeof palette] as PrismuiPaletteColor | undefined;
  if (explicit) return explicit;

  // Resolve from colorFamilies + primaryShade
  const configKey = SEMANTIC_TO_CONFIG[key];
  if (!configKey) return undefined;

  const familyName = theme[configKey] as PrismuiColorFamily;
  const scale = getColorScale(familyName, theme);
  if (!scale) return undefined;

  const center = theme.primaryShade[scheme];
  const clamp = (i: number) => Math.max(0, Math.min(9, i));

  const main = scale[SHADE_STEPS[center]];
  return {
    lighter: scale[SHADE_STEPS[clamp(center - 4)]],
    light: scale[SHADE_STEPS[clamp(center - 2)]],
    main,
    dark: scale[SHADE_STEPS[clamp(center + 2)]],
    darker: scale[SHADE_STEPS[clamp(center + 4)]],
    contrastText: '', // will be computed by caller if needed
  };
}

/**
 * Get the channel string for a color value.
 * If the palette color has a pre-computed channel, use it; otherwise compute.
 */
function getChannel(color: string): string {
  return getColorChannels(color) ?? '0 0 0';
}

/**
 * Resolve a color family name to main/dark shades based on scheme.
 * Light: 500 main, 700 dark
 * Dark: 600 main, 800 dark
 */
function resolveColorFamilyShades(
  familyName: string,
  theme: PrismuiTheme,
  scheme: PrismuiResolvedColorScheme,
): { main: string; dark: string; mainChannel: string } | undefined {
  const scale = getColorScale(familyName, theme);
  if (!scale) return undefined;

  const center = theme.primaryShade[scheme];
  const clamp = (i: number) => Math.max(0, Math.min(9, i));

  const main = scale[SHADE_STEPS[center]];
  const dark = scale[SHADE_STEPS[clamp(center + 2)]];
  const mainChannel = getChannel(main);

  return { main, dark, mainChannel };
}

// ---------------------------------------------------------------------------
// Solid variant
// ---------------------------------------------------------------------------

function resolveSolid(input: VariantColorResolverInput): VariantColorsResult {
  const { color, theme, scheme } = input;

  // --- inherit ---
  if (color === 'inherit') {
    const gray800 = theme.colorFamilies.gray?.[800] ?? '#1C252E';
    const gray700 = theme.colorFamilies.gray?.[700] ?? '#454F5B';
    return {
      background: gray800,
      color: `var(--prismui-common-white)`,
      border: 'none',
      hoverBackground: gray700,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'var(--prismui-shadow-sm)',
    };
  }

  // --- black ---
  if (color === 'black') {
    return {
      background: `var(--prismui-common-black)`,
      color: `var(--prismui-common-white)`,
      border: 'none',
      hoverBackground: `rgba(var(--prismui-common-blackChannel) / calc(var(--prismui-opacity-solid-commonHoverBg) * 100%))`,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'var(--prismui-shadow-sm)',
    };
  }

  // --- white ---
  if (color === 'white') {
    return {
      background: `var(--prismui-common-white)`,
      color: `var(--prismui-common-black)`,
      border: 'none',
      hoverBackground: `rgba(var(--prismui-common-whiteChannel) / calc(var(--prismui-opacity-solid-commonHoverBg) * 100%))`,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'var(--prismui-shadow-sm)',
    };
  }

  // --- semantic color (primary, secondary, ..., neutral) ---
  if (isSemanticColor(color)) {
    const pc = resolveSemanticPalette(color, theme, scheme);
    if (pc) {
      return {
        background: `var(--prismui-${color}-main)`,
        color: `var(--prismui-${color}-contrastText)`,
        border: 'none',
        hoverBackground: `var(--prismui-${color}-dark)`,
        hoverColor: '',
        hoverBorder: '',
        hoverShadow: `var(--prismui-shadow-${color})`,
      };
    }
  }

  // --- color family (blue, red, ...) ---
  if (isColorFamily(color, theme)) {
    const shades = resolveColorFamilyShades(color, theme, scheme);
    if (shades) {
      return {
        background: shades.main,
        color: `var(--prismui-common-white)`,
        border: 'none',
        hoverBackground: shades.dark,
        hoverColor: '',
        hoverBorder: '',
        hoverShadow: `rgba(${shades.mainChannel.replace(/ /g, ', ')}, 0.24) 0 8px 16px 0`,
      };
    }
  }

  // --- fallback: treat as CSS color passthrough ---
  return {
    background: color,
    color: `var(--prismui-common-white)`,
    border: 'none',
    hoverBackground: color,
    hoverColor: '',
    hoverBorder: '',
    hoverShadow: 'none',
  };
}

// ---------------------------------------------------------------------------
// Outlined variant
// ---------------------------------------------------------------------------

function resolveOutlined(input: VariantColorResolverInput): VariantColorsResult {
  const { color, theme, scheme } = input;
  const hoverBgExpr = `color-mix(in srgb, currentColor calc(var(--prismui-action-hoverOpacity) * 100%), transparent)`;
  const borderExpr = `color-mix(in srgb, currentColor calc(var(--prismui-opacity-outlined-border) * 100%), transparent)`;
  const hoverEffect = 'currentcolor 0px 0px 0px 0.75px';

  // --- inherit ---
  if (color === 'inherit') {
    return {
      background: 'transparent',
      color: 'inherit',
      border: `1px solid rgba(var(--prismui-color-gray-500Channel) / calc(var(--prismui-opacity-outlined-border) * 100%))`,
      hoverBackground: 'transparent',
      hoverColor: '',
      hoverBorder: 'currentcolor',
      hoverShadow: hoverEffect,
    };
  }

  // --- black ---
  if (color === 'black') {
    return {
      background: 'transparent',
      color: `var(--prismui-common-black)`,
      border: `1px solid ${borderExpr}`,
      hoverBackground: hoverBgExpr,
      hoverColor: '',
      hoverBorder: 'currentcolor',
      hoverShadow: hoverEffect,
    };
  }

  // --- white ---
  if (color === 'white') {
    return {
      background: 'transparent',
      color: `var(--prismui-common-white)`,
      border: `1px solid ${borderExpr}`,
      hoverBackground: hoverBgExpr,
      hoverColor: '',
      hoverBorder: 'currentcolor',
      hoverShadow: hoverEffect,
    };
  }

  // --- semantic color ---
  if (isSemanticColor(color)) {
    return {
      background: 'transparent',
      color: `var(--prismui-${color}-main)`,
      border: `1px solid ${borderExpr}`,
      hoverBackground: hoverBgExpr,
      hoverColor: '',
      hoverBorder: 'currentcolor',
      hoverShadow: hoverEffect,
    };
  }

  // --- color family ---
  if (isColorFamily(color, theme)) {
    const shades = resolveColorFamilyShades(color, theme, scheme);
    if (shades) {
      return {
        background: 'transparent',
        color: shades.main,
        border: `1px solid ${borderExpr}`,
        hoverBackground: hoverBgExpr,
        hoverColor: '',
        hoverBorder: 'currentcolor',
        hoverShadow: hoverEffect,
      };
    }
  }

  // --- fallback ---
  return {
    background: 'transparent',
    color,
    border: `1px solid ${borderExpr}`,
    hoverBackground: hoverBgExpr,
    hoverColor: '',
    hoverBorder: 'currentcolor',
    hoverShadow: hoverEffect,
  };
}

// ---------------------------------------------------------------------------
// Soft variant
// ---------------------------------------------------------------------------

function resolveSoft(input: VariantColorResolverInput): VariantColorsResult {
  const { color, theme, scheme } = input;

  // --- inherit ---
  if (color === 'inherit') {
    return {
      background: `rgba(var(--prismui-color-gray-500Channel) / calc(var(--prismui-opacity-soft-bg) * 100%))`,
      color: 'inherit',
      border: 'none',
      hoverBackground: `rgba(var(--prismui-color-gray-500Channel) / calc(var(--prismui-opacity-soft-hoverBg) * 100%))`,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'none',
    };
  }

  // --- black ---
  if (color === 'black') {
    return {
      background: `color-mix(in srgb, currentColor calc(var(--prismui-opacity-soft-commonBg) * 100%), transparent)`,
      color: `var(--prismui-common-black)`,
      border: 'none',
      hoverBackground: `color-mix(in srgb, currentColor calc(var(--prismui-opacity-soft-commonHoverBg) * 100%), transparent)`,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'none',
    };
  }

  // --- white ---
  if (color === 'white') {
    return {
      background: `color-mix(in srgb, currentColor calc(var(--prismui-opacity-soft-commonBg) * 100%), transparent)`,
      color: `var(--prismui-common-white)`,
      border: 'none',
      hoverBackground: `color-mix(in srgb, currentColor calc(var(--prismui-opacity-soft-commonHoverBg) * 100%), transparent)`,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'none',
    };
  }

  // --- semantic color ---
  if (isSemanticColor(color)) {
    return {
      background: `rgba(var(--prismui-${color}-mainChannel) / calc(var(--prismui-opacity-soft-bg) * 100%))`,
      color: `var(--prismui-${color}-dark)`,
      border: 'none',
      hoverBackground: `rgba(var(--prismui-${color}-mainChannel) / calc(var(--prismui-opacity-soft-hoverBg) * 100%))`,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'none',
    };
  }

  // --- color family ---
  if (isColorFamily(color, theme)) {
    const shades = resolveColorFamilyShades(color, theme, scheme);
    if (shades) {
      const scale = getColorScale(color, theme)!;
      const darkShadeIdx = Math.min(9, theme.primaryShade[scheme] + 2);
      const darkColor = scale[SHADE_STEPS[darkShadeIdx]];
      return {
        background: `rgba(${shades.mainChannel.replace(/ /g, ', ')}, calc(var(--prismui-opacity-soft-bg) * 1))`,
        color: darkColor,
        border: 'none',
        hoverBackground: `rgba(${shades.mainChannel.replace(/ /g, ', ')}, calc(var(--prismui-opacity-soft-hoverBg) * 1))`,
        hoverColor: '',
        hoverBorder: '',
        hoverShadow: 'none',
      };
    }
  }

  // --- fallback ---
  return {
    background: `color-mix(in srgb, ${color} calc(var(--prismui-opacity-soft-bg) * 100%), transparent)`,
    color,
    border: 'none',
    hoverBackground: `color-mix(in srgb, ${color} calc(var(--prismui-opacity-soft-hoverBg) * 100%), transparent)`,
    hoverColor: '',
    hoverBorder: '',
    hoverShadow: 'none',
  };
}

// ---------------------------------------------------------------------------
// Plain variant
// ---------------------------------------------------------------------------

function resolvePlain(input: VariantColorResolverInput): VariantColorsResult {
  const { color, theme, scheme } = input;
  const hoverBgExpr = `color-mix(in srgb, currentColor calc(var(--prismui-action-hoverOpacity) * 100%), transparent)`;

  // --- inherit ---
  if (color === 'inherit') {
    return {
      background: 'transparent',
      color: 'inherit',
      border: 'none',
      hoverBackground: `var(--prismui-action-hover)`,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'none',
    };
  }

  // --- black ---
  if (color === 'black') {
    return {
      background: 'transparent',
      color: `var(--prismui-common-black)`,
      border: 'none',
      hoverBackground: hoverBgExpr,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'none',
    };
  }

  // --- white ---
  if (color === 'white') {
    return {
      background: 'transparent',
      color: `var(--prismui-common-white)`,
      border: 'none',
      hoverBackground: hoverBgExpr,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'none',
    };
  }

  // --- semantic color ---
  if (isSemanticColor(color)) {
    return {
      background: 'transparent',
      color: `var(--prismui-${color}-main)`,
      border: 'none',
      hoverBackground: hoverBgExpr,
      hoverColor: '',
      hoverBorder: '',
      hoverShadow: 'none',
    };
  }

  // --- color family ---
  if (isColorFamily(color, theme)) {
    const shades = resolveColorFamilyShades(color, theme, scheme);
    if (shades) {
      return {
        background: 'transparent',
        color: shades.main,
        border: 'none',
        hoverBackground: hoverBgExpr,
        hoverColor: '',
        hoverBorder: '',
        hoverShadow: 'none',
      };
    }
  }

  // --- fallback ---
  return {
    background: 'transparent',
    color,
    border: 'none',
    hoverBackground: hoverBgExpr,
    hoverColor: '',
    hoverBorder: '',
    hoverShadow: 'none',
  };
}

// ---------------------------------------------------------------------------
// defaultVariantColorsResolver
// ---------------------------------------------------------------------------

export const defaultVariantColorsResolver = (
  input: VariantColorResolverInput,
): VariantColorsResult => {
  switch (input.variant) {
    case 'solid':
      return resolveSolid(input);
    case 'outlined':
      return resolveOutlined(input);
    case 'soft':
      return resolveSoft(input);
    case 'plain':
      return resolvePlain(input);
    default:
      return resolveSolid(input);
  }
};
