import type { Style, StyleProp } from '../../types';
import type { PrismuiTheme } from './theme';

/**
 * Theme-aware style object/function.
 */
export type PrismuiStyle = Style<PrismuiTheme>;

/**
 * Theme-aware style prop that supports arrays and nested arrays.
 */
export type PrismuiStyleProp = StyleProp<PrismuiTheme>;
