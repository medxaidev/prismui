import type { PrismuiSize, PrismuiThemeSizesOverride } from './size';

/**
 * Font size keys used by PrismUI.
 *
 * By default uses the standard size scale (xs/sm/md/lg/xl).
 * Consumers can override by extending PrismuiThemeSizesOverride.
 */
export type PrismuiFontSizeKey =
  PrismuiThemeSizesOverride extends {
    fontSizes: Record<infer CustomKeys extends string, string>;
  }
  ? CustomKeys
  : PrismuiSize;

/**
 * A font size name used in component size props.
 * Allows custom strings in addition to the known font size keys.
 */
export type PrismuiFontSize = PrismuiFontSizeKey | (string & {});

/** Font sizes map: size key -> CSS length (e.g. "0.875rem"). */
export type PrismuiFontSizesValues = Record<PrismuiFontSizeKey, string>;
