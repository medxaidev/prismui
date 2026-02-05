import type {
  PrismuiColorFamilies,
  PrismuiColorFamily,
} from './colors';
import type { PrismuiColorSchemes } from './palette';
import type { PrismuiSpacingValues } from './spacing';
import type { PrismuiPrimaryShade } from './primary-shade';


export interface PrismuiTheme {
  colorFamilies: PrismuiColorFamilies;
  primaryShade: PrismuiPrimaryShade;
  colorSchemes: PrismuiColorSchemes;



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