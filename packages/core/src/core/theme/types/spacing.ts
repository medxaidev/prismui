import type { PrismuiSize } from './size';

export interface PrismuiThemeSpacingOverride { }

export type PrismuiSpacingKey =
  keyof PrismuiThemeSpacingOverride extends never
  ? PrismuiSize
  : PrismuiSize | keyof PrismuiThemeSpacingOverride;

export type PrismuiSpacing = number | PrismuiSpacingKey | (string & {});
export type PrismuiSpacingValues = Record<PrismuiSpacingKey, string>;