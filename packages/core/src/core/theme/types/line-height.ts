import type { PrismuiSize } from './size';

export type PrismuiLineHeightKey = PrismuiSize;

export type PrismuiLineHeight = PrismuiLineHeightKey | (string & {});

/** Line heights map: size key -> unitless ratio (e.g. "1.5"). */
export type PrismuiLineHeightsValues = Record<PrismuiLineHeightKey, string>;
