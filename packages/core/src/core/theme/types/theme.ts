import type {
  PrismuiColorFamilies,
  PrismuiColorFamily,
} from './colors';
import type { PrismuiColorSchemes, PrismuiColorSchemesInput } from './palette';
import type { PrismuiSpacingValues } from './spacing';
import type { PrismuiPrimaryShade } from './primary-shade';

interface PrismuiThemeBase {
  colorFamilies: PrismuiColorFamilies;
  primaryShade: PrismuiPrimaryShade;

  primaryColor: PrismuiColorFamily;
  secondaryColor: PrismuiColorFamily;
  infoColor: PrismuiColorFamily;
  successColor: PrismuiColorFamily;
  warningColor: PrismuiColorFamily;
  errorColor: PrismuiColorFamily;
  neutralColor: PrismuiColorFamily;

  spacing: PrismuiSpacingValues;

  other: Record<string, unknown>;
}

/**
 * Theme input — palette semantic colors are optional (resolver fills them in).
 * Used by default-theme definition and user-provided config.
 */
export interface PrismuiThemeInput extends PrismuiThemeBase {
  colorSchemes: PrismuiColorSchemesInput;
}

/**
 * Fully resolved theme — all palette semantic colors are guaranteed present.
 * This is the output of createTheme and what components/providers consume.
 */
export interface PrismuiTheme extends PrismuiThemeBase {
  colorSchemes: PrismuiColorSchemes;
}