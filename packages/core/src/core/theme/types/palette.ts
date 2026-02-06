import type { PrismuiResolvedColorScheme } from './color-scheme';

export interface PrismuiPaletteCommon {
  black: string;
  white: string;
}

export interface PrismuiPaletteColor {
  main: string;
  light: string;
  lighter: string;
  dark: string;
  darker: string;
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

/**
 * Palette — semantic colors (primary..error) are optional.
 * They are resolved from colorFamilies + primaryShade at CSS variable generation time.
 */
export interface PrismuiPalette<S extends PrismuiResolvedColorScheme = PrismuiResolvedColorScheme> {
  scheme: S;

  common: PrismuiPaletteCommon;

  primary?: PrismuiPaletteColor;
  secondary?: PrismuiPaletteColor;
  info?: PrismuiPaletteColor;
  success?: PrismuiPaletteColor;
  warning?: PrismuiPaletteColor;
  error?: PrismuiPaletteColor;

  neutral: PrismuiPaletteColor;

  text: PrismuiPaletteText;
  background: PrismuiPaletteBackground;
  divider: string;
  action: PrismuiPaletteAction;
}

/** @deprecated Use PrismuiPalette instead. */
export type PrismuiPaletteInput<S extends PrismuiResolvedColorScheme = PrismuiResolvedColorScheme> = PrismuiPalette<S>;

export interface PrismuiColorSchemes {
  light: { palette: PrismuiPalette<'light'> };
  dark: { palette: PrismuiPalette<'dark'> };
}

/** @deprecated Use PrismuiColorSchemes instead. */
export type PrismuiColorSchemesInput = PrismuiColorSchemes;