import type { PrismuiColorFamilies, PrismuiColorFamily, PrismuiColorSchemes } from './colors';
import type { PrismuiSpacingValues } from './spacing';

export type PrismuiShadeIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PrismuiPrimaryShade {
  light: PrismuiShadeIndex;
  dark: PrismuiShadeIndex;
}

export interface PrismuiTheme {
  colorFamilies: PrismuiColorFamilies;
  colorSchemes: PrismuiColorSchemes;

  primaryColor: PrismuiColorFamily;
  secondaryColor: PrismuiColorFamily;
  primaryShade: PrismuiPrimaryShade;

  spacing: PrismuiSpacingValues;

  other: Record<string, unknown>;
}