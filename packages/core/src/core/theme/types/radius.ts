import type { PrismuiSize } from './size';

export type PrismuiRadiusKey = PrismuiSize;

export type PrismuiRadius = PrismuiRadiusKey | (string & {}) | number;

/** Border radius map: size key -> CSS length (e.g. "0.5rem"). */
export type PrismuiRadiusValues = Record<PrismuiRadiusKey, string>;
