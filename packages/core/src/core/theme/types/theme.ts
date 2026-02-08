import type {
  PrismuiColorFamilies,
  PrismuiColorFamily,
} from './colors';
import type { PrismuiColorSchemes } from './palette';
import type { PrismuiSpacingValues } from './spacing';
import type { PrismuiPrimaryShade } from './primary-shade';
import type { PrismuiBreakpointsValues } from './breakpoint';
import type { PrismuiFontSizesValues } from './font-size';
import type { PrismuiLineHeightsValues } from './line-height';
import type { PrismuiRadiusValues } from './radius';

/**
 * PrismUI theme object.
 *
 * Semantic palette colors (primary..error) are optional here — they are
 * resolved from `colorFamilies + primaryShade` at CSS variable generation time.
 * `createTheme` only merges user config with defaults; it does NOT resolve.
 */
export interface PrismuiTheme {
  colorFamilies: PrismuiColorFamilies;
  primaryShade: PrismuiPrimaryShade;

  primaryColor: PrismuiColorFamily;
  secondaryColor: PrismuiColorFamily;
  infoColor: PrismuiColorFamily;
  successColor: PrismuiColorFamily;
  warningColor: PrismuiColorFamily;
  errorColor: PrismuiColorFamily;
  neutralColor: PrismuiColorFamily;

  colorSchemes: PrismuiColorSchemes;

  fontSize: number;
  fontSizes: PrismuiFontSizesValues;
  fontFamily: string;
  fontFamilyMonospace: string;

  scale: number;
  spacingUnit: number;

  lineHeights: PrismuiLineHeightsValues;
  radius: PrismuiRadiusValues;

  spacing?: Partial<PrismuiSpacingValues>;
  breakpoints: PrismuiBreakpointsValues;

  other: Record<string, unknown>;
}

/** @deprecated Use PrismuiTheme instead. */
export type PrismuiThemeInput = PrismuiTheme;