import type {
  PrismuiColorShade,
  PrismuiResolvedColorScheme,
  PrismuiTheme,
} from './types';

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

  vars['--prismui-palette-common-black'] = palette.common.black;
  vars['--prismui-palette-common-white'] = palette.common.white;

  const paletteColors = {
    primary: palette.primary,
    secondary: palette.secondary,
    info: palette.info,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    neutral: palette.neutral,
  } as const;

  for (const [name, value] of Object.entries(paletteColors)) {
    vars[`--prismui-palette-${name}-main`] = value.main;
    vars[`--prismui-palette-${name}-light`] = value.light;
    vars[`--prismui-palette-${name}-dark`] = value.dark;
    vars[`--prismui-palette-${name}-contrastText`] = value.contrastText;

    if (value.lighter) vars[`--prismui-palette-${name}-lighter`] = value.lighter;
    if (value.darker) vars[`--prismui-palette-${name}-darker`] = value.darker;

    const mainChannel = getColorChannels(value.main);
    if (mainChannel) vars[`--prismui-palette-${name}-mainChannel`] = mainChannel;

    const lightChannel = getColorChannels(value.light);
    if (lightChannel) vars[`--prismui-palette-${name}-lightChannel`] = lightChannel;

    const darkChannel = getColorChannels(value.dark);
    if (darkChannel) vars[`--prismui-palette-${name}-darkChannel`] = darkChannel;
  }

  vars['--prismui-palette-text-primary'] = palette.text.primary;
  vars['--prismui-palette-text-secondary'] = palette.text.secondary;
  vars['--prismui-palette-text-disabled'] = palette.text.disabled;

  if (palette.text.icon) {
    vars['--prismui-palette-text-icon'] = palette.text.icon;
  }

  if (palette.text.primaryChannel) {
    vars['--prismui-palette-text-primaryChannel'] = palette.text.primaryChannel;
  }
  if (palette.text.secondaryChannel) {
    vars['--prismui-palette-text-secondaryChannel'] =
      palette.text.secondaryChannel;
  }
  if (palette.text.disabledChannel) {
    vars['--prismui-palette-text-disabledChannel'] = palette.text.disabledChannel;
  }

  vars['--prismui-palette-background-paper'] = palette.background.paper;
  vars['--prismui-palette-background-default'] = palette.background.default;
  vars['--prismui-palette-background-neutral'] = palette.background.neutral;

  if (palette.background.paperChannel) {
    vars['--prismui-palette-background-paperChannel'] =
      palette.background.paperChannel;
  }
  if (palette.background.defaultChannel) {
    vars['--prismui-palette-background-defaultChannel'] =
      palette.background.defaultChannel;
  }
  if (palette.background.neutralChannel) {
    vars['--prismui-palette-background-neutralChannel'] =
      palette.background.neutralChannel;
  }

  vars['--prismui-palette-divider'] = palette.divider;

  vars['--prismui-palette-action-hover'] = palette.action.hover;
  vars['--prismui-palette-action-selected'] = palette.action.selected;
  vars['--prismui-palette-action-active'] = palette.action.active;
  vars['--prismui-palette-action-focus'] = palette.action.focus;
  vars['--prismui-palette-action-disabled'] = palette.action.disabled;
  vars['--prismui-palette-action-disabledBackground'] =
    palette.action.disabledBackground;

  if (palette.action.hoverOpacity != null) {
    vars['--prismui-palette-action-hoverOpacity'] = String(
      palette.action.hoverOpacity
    );
  }

  if (palette.action.selectedOpacity != null) {
    vars['--prismui-palette-action-selectedOpacity'] = String(
      palette.action.selectedOpacity
    );
  }

  if (palette.action.focusOpacity != null) {
    vars['--prismui-palette-action-focusOpacity'] = String(
      palette.action.focusOpacity
    );
  }

  if (palette.action.activatedOpacity != null) {
    vars['--prismui-palette-action-activatedOpacity'] = String(
      palette.action.activatedOpacity
    );
    vars['--prismui-palette-action-activeOpacity'] = String(
      palette.action.activatedOpacity
    );
  }

  if (palette.action.activeChannel) {
    vars['--prismui-palette-action-activeChannel'] = palette.action.activeChannel;
  }

  if (palette.action.selectedChannel) {
    vars['--prismui-palette-action-selectedChannel'] =
      palette.action.selectedChannel;
  }

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