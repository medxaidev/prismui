import type { PrismuiResolvedColorScheme } from './color-scheme';

export type PrismuiColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

export const PRISMUI_SHADE_STEPS = [
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
] as const satisfies readonly PrismuiColorShade[];

export type PrismuiColorScale = Record<PrismuiColorShade, string>;

export type PrismuiColorFamilyName =
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'violet'
  | 'gray'
  | 'neutral'
  | 'dark';

export interface PrismuiThemeColorFamiliesOverride { }

export type PrismuiColorFamily =
  keyof PrismuiThemeColorFamiliesOverride extends never
  ? PrismuiColorFamilyName
  : PrismuiColorFamilyName | keyof PrismuiThemeColorFamiliesOverride;

export type PrismuiColorFamilies = Record<PrismuiColorFamily, PrismuiColorScale>;

/* ---------------------------------- */
/* Palette (component-facing tokens)   */
/* ---------------------------------- */

export interface PrismuiPaletteCommon {
  black: string;
  white: string;
}

export interface PrismuiPaletteColor {
  main: string;
  light: string;
  lighter?: string;
  dark: string;
  darker?: string;
  contrastText: string;
}

export interface PrismuiPaletteText {
  primary: string;
  secondary: string;
  disabled: string;
  icon?: string;
  primaryChannel?: string;
  secondaryChannel?: string;
  disabledChannel?: string;
}

export interface PrismuiPaletteBackground {
  paper: string;
  default: string;
  neutral: string;
  paperChannel?: string;
  defaultChannel?: string;
  neutralChannel?: string;
}

export interface PrismuiPaletteAction {
  active: string;
  hover: string;
  selected: string;
  focus: string;
  disabled: string;
  disabledBackground: string;

  hoverOpacity?: number;
  selectedOpacity?: number;
  focusOpacity?: number;
  activatedOpacity?: number;
  disabledOpacity?: number;

  activeChannel?: string;
  selectedChannel?: string;
}

export interface PrismuiPalette<S extends PrismuiResolvedColorScheme = PrismuiResolvedColorScheme> {
  scheme: S;

  common: PrismuiPaletteCommon;

  primary: PrismuiPaletteColor;
  secondary: PrismuiPaletteColor;
  info: PrismuiPaletteColor;
  success: PrismuiPaletteColor;
  warning: PrismuiPaletteColor;
  error: PrismuiPaletteColor;

  neutral: PrismuiPaletteColor;

  text: PrismuiPaletteText;
  background: PrismuiPaletteBackground;
  divider: string;
  action: PrismuiPaletteAction;

  contrastThreshold: number;
  tonalOffset: number;

  getContrastText?: (background: string) => string;
}

export interface PrismuiColorSchemes {
  light: { palette: PrismuiPalette<'light'> };
  dark: { palette: PrismuiPalette<'dark'> };
}