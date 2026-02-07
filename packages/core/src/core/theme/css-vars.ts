import type {
  PrismuiColorShade,
  PrismuiColorScale,
  PrismuiColorFamily,
  PrismuiPaletteColor,
  PrismuiResolvedColorScheme,
  PrismuiShadeIndex,
  PrismuiTheme,
} from './types';
import { PRISMUI_SHADE_STEPS } from './types';

const SHADE_STEPS: readonly PrismuiColorShade[] = [
  50,
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900,
];

function hexToRgbChannels(hex: string): string | null {
  const value = hex.trim();
  if (!value.startsWith('#')) return null;
  const raw = value.slice(1);

  const full =
    raw.length === 3
      ? raw
        .split('')
        .map((c) => c + c)
        .join('')
      : raw;

  if (full.length !== 6) return null;

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return `${r} ${g} ${b}`;
}

function getColorChannels(color: string): string | null {
  return hexToRgbChannels(color);
}

// ---------------------------------------------------------------------------
// Shade resolver (resolves semantic palette colors from colorFamilies)
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

function defaultContrastText(scheme: 'light' | 'dark'): string {
  return scheme === 'light' ? '#FFFFFF' : '#0B0D0E';
}

const SEMANTIC_COLOR_KEYS = [
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
] as const;

type SemanticColorKey = (typeof SEMANTIC_COLOR_KEYS)[number];

const SEMANTIC_TO_CONFIG: Record<SemanticColorKey, keyof PrismuiTheme> = {
  primary: 'primaryColor',
  secondary: 'secondaryColor',
  info: 'infoColor',
  success: 'successColor',
  warning: 'warningColor',
  error: 'errorColor',
};

// ---------------------------------------------------------------------------
// CSS variable generation
// ---------------------------------------------------------------------------

export function getPrismuiCssVariables(
  theme: PrismuiTheme,
  scheme: PrismuiResolvedColorScheme
): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [family, scale] of Object.entries(theme.colorFamilies)) {
    for (const shade of SHADE_STEPS) {
      vars[`--prismui-color-${family}-${shade}`] = scale[shade];
    }
  }

  const palette = theme.colorSchemes[scheme].palette;

  vars['--prismui-scheme'] = palette.scheme;

  vars['--prismui-common-black'] = palette.common.black;
  vars['--prismui-common-white'] = palette.common.white;

  // Resolve semantic palette colors from colorFamilies + primaryShade
  // if they are not explicitly provided in the palette.
  const center = theme.primaryShade[scheme];
  const resolvedSemantic: Record<string, PrismuiPaletteColor> = {};

  for (const key of SEMANTIC_COLOR_KEYS) {
    if (palette[key]) {
      resolvedSemantic[key] = palette[key];
    } else {
      const familyName = theme[SEMANTIC_TO_CONFIG[key]] as PrismuiColorFamily;
      const scale = theme.colorFamilies[familyName];
      if (scale) {
        resolvedSemantic[key] = resolvePaletteColor(
          scale,
          center,
          defaultContrastText(scheme),
        );
      }
    }
  }

  const paletteColors = {
    ...resolvedSemantic,
    neutral: palette.neutral,
  };

  for (const [name, value] of Object.entries(paletteColors)) {
    vars[`--prismui-${name}-main`] = value.main;
    vars[`--prismui-${name}-light`] = value.light;
    vars[`--prismui-${name}-dark`] = value.dark;
    vars[`--prismui-${name}-contrastText`] = value.contrastText;

    if (value.lighter) vars[`--prismui-${name}-lighter`] = value.lighter;
    if (value.darker) vars[`--prismui-${name}-darker`] = value.darker;

    const mainChannel = getColorChannels(value.main);
    if (mainChannel) vars[`--prismui-${name}-mainChannel`] = mainChannel;

    const lightChannel = getColorChannels(value.light);
    if (lightChannel) vars[`--prismui-${name}-lightChannel`] = lightChannel;

    const darkChannel = getColorChannels(value.dark);
    if (darkChannel) vars[`--prismui-${name}-darkChannel`] = darkChannel;
  }

  vars['--prismui-text-primary'] = palette.text.primary;
  vars['--prismui-text-secondary'] = palette.text.secondary;
  vars['--prismui-text-disabled'] = palette.text.disabled;

  if (palette.text.icon) {
    vars['--prismui-text-icon'] = palette.text.icon;
  }

  if (palette.text.primaryChannel) {
    vars['--prismui-text-primaryChannel'] = palette.text.primaryChannel;
  }
  if (palette.text.secondaryChannel) {
    vars['--prismui-text-secondaryChannel'] =
      palette.text.secondaryChannel;
  }
  if (palette.text.disabledChannel) {
    vars['--prismui-text-disabledChannel'] = palette.text.disabledChannel;
  }

  vars['--prismui-background-paper'] = palette.background.paper;
  vars['--prismui-background-default'] = palette.background.default;
  vars['--prismui-background-neutral'] = palette.background.neutral;

  if (palette.background.paperChannel) {
    vars['--prismui-background-paperChannel'] =
      palette.background.paperChannel;
  }
  if (palette.background.defaultChannel) {
    vars['--prismui-background-defaultChannel'] =
      palette.background.defaultChannel;
  }
  if (palette.background.neutralChannel) {
    vars['--prismui-background-neutralChannel'] =
      palette.background.neutralChannel;
  }

  vars['--prismui-divider'] = palette.divider;

  vars['--prismui-action-hover'] = palette.action.hover;
  vars['--prismui-action-selected'] = palette.action.selected;
  vars['--prismui-action-active'] = palette.action.active;
  vars['--prismui-action-focus'] = palette.action.focus;
  vars['--prismui-action-disabled'] = palette.action.disabled;
  vars['--prismui-action-disabledBackground'] =
    palette.action.disabledBackground;

  if (palette.action.hoverOpacity != null) {
    vars['--prismui-action-hoverOpacity'] = String(
      palette.action.hoverOpacity
    );
  }

  if (palette.action.selectedOpacity != null) {
    vars['--prismui-action-selectedOpacity'] = String(
      palette.action.selectedOpacity
    );
  }

  if (palette.action.focusOpacity != null) {
    vars['--prismui-action-focusOpacity'] = String(
      palette.action.focusOpacity
    );
  }

  if (palette.action.activatedOpacity != null) {
    vars['--prismui-action-activatedOpacity'] = String(
      palette.action.activatedOpacity
    );
    vars['--prismui-action-activeOpacity'] = String(
      palette.action.activatedOpacity
    );
  }

  if (palette.action.activeChannel) {
    vars['--prismui-action-activeChannel'] = palette.action.activeChannel;
  }

  if (palette.action.selectedChannel) {
    vars['--prismui-action-selectedChannel'] =
      palette.action.selectedChannel;
  }

  vars['--prismui-font-family'] = theme.fontFamily;
  vars['--prismui-font-family-monospace'] = theme.fontFamilyMonospace;

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