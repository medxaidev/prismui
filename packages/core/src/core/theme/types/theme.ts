import type {
  PrismuiColorFamilies,
  PrismuiColorFamily,
} from './colors';
import type { PrismuiColorSchemes } from './palette';
import type { PrismuiSpacingValues } from './spacing';
import type { PrismuiPrimaryShade } from './primary-shade';

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

  fontFamily: string;
  fontFamilyMonospace: string;

  spacing: PrismuiSpacingValues;

  other: Record<string, unknown>;
}

/** @deprecated Use PrismuiTheme instead. */
export type PrismuiThemeInput = PrismuiTheme;