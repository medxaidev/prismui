import type { PrismUITheme, CSSLength } from './theme.types';

/**
 * Usage Types
 *
 * 提供规范 + escape hatch
 * 供 Stage 2 的 StyleProps 使用
 */

// Spacing（支持 theme token + CSSLength）
export type SpacingValue = keyof PrismUITheme['spacing'] | CSSLength;

// Typography
export type FontSizeValue = keyof PrismUITheme['typography']['fontSize'] | CSSLength;
export type FontWeightValue = keyof PrismUITheme['typography']['fontWeight'] | number;
export type LineHeightValue = keyof PrismUITheme['typography']['lineHeight'] | number;

// Radius（支持 theme token + CSSLength）
export type RadiusValue = keyof PrismUITheme['radius'] | CSSLength;

// Shadow（支持 theme token + 任意 CSS shadow 字符串）
export type ShadowValue = keyof PrismUITheme['shadows'] | string;

// Breakpoint（支持 theme token + px 值）
export type BreakpointValue = keyof PrismUITheme['breakpoints'] | `${number}px`;

// Responsive（必须包含 base）
export type ResponsiveValue<T> =
  | T
  | {
      base?: T;
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
    };
