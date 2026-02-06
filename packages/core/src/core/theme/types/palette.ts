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
 * Palette input — semantic colors (primary..error) are optional.
 * Used by default-theme and user config; resolver fills in the missing ones.
 */
export interface PrismuiPaletteInput<S extends PrismuiResolvedColorScheme = PrismuiResolvedColorScheme> {
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

/**
 * Fully resolved palette — all semantic colors are guaranteed present.
 * This is the output of the theme resolver and what components consume.
 */
export interface PrismuiPalette<S extends PrismuiResolvedColorScheme = PrismuiResolvedColorScheme>
  extends Required<Pick<PrismuiPaletteInput<S>,
    'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'
  >> {
  scheme: S;

  common: PrismuiPaletteCommon;

  neutral: PrismuiPaletteColor;

  text: PrismuiPaletteText;
  background: PrismuiPaletteBackground;
  divider: string;
  action: PrismuiPaletteAction;
}

export interface PrismuiColorSchemesInput {
  light: { palette: PrismuiPaletteInput<'light'> };
  dark: { palette: PrismuiPaletteInput<'dark'> };
}

export interface PrismuiColorSchemes {
  light: { palette: PrismuiPalette<'light'> };
  dark: { palette: PrismuiPalette<'dark'> };
}