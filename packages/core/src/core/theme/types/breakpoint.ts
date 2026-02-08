import type { PrismuiSize, PrismuiThemeSizesOverride } from './size';

/**
 * Breakpoint keys used by PrismUI.
 *
 * By default, PrismUI uses the standard size scale (xs/sm/md/lg/xl).
 * Consumers can override breakpoint keys by extending PrismuiThemeSizesOverride.
 */
export type PrismuiBreakpointKey =
  PrismuiThemeSizesOverride extends {
    breakpoints: Record<infer CustomBreakpoints extends string, string>;
  }
  ? CustomBreakpoints
  : PrismuiSize;

/**
 * A breakpoint name used in responsive values.
 * Allows custom strings in addition to the known breakpoint keys.
 */
export type PrismuiBreakpoint = PrismuiBreakpointKey | (string & {});

/** Theme breakpoints map: breakpoint key -> CSS length (e.g. "48rem"). */
export type PrismuiBreakpointsValues = Record<PrismuiBreakpointKey, string>;
