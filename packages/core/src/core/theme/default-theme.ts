import type { PrismUITheme } from './types';
import { defaultColorFamilies } from './default-colors';
import { defaultLightPalette, defaultDarkPalette } from './default-palette';

/**
 * Default PrismUI Theme
 *
 * Core Definition:
 * - All tokens have explicit units
 * - fontSize/spacing/radius use rem
 * - breakpoints use px (number)
 */
export const defaultTheme: PrismUITheme = {
  // ========== Color System ==========
  colors: defaultColorFamilies,

  palette: {
    light: defaultLightPalette,
    dark: defaultDarkPalette,
  },

  // ========== Typography System ==========
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyMonospace:
      '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',

    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
    },

    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      xs: 1.4,
      sm: 1.45,
      md: 1.5,
      lg: 1.55,
      xl: 1.6,
    },
  },

  // ========== Spacing System ==========
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },

  // ========== Radius System ==========
  radius: {
    xs: '0.125rem', // 2px
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
  },

  // ========== Shadow System ==========
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 10px 15px -5px, rgba(0, 0, 0, 0.04) 0px 7px 7px -5px',
    md: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
    lg: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 28px 23px -7px, rgba(0, 0, 0, 0.04) 0px 12px 12px -7px',
    xl: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 36px 28px -7px, rgba(0, 0, 0, 0.04) 0px 17px 17px -7px',
  },

  // ========== Breakpoint System ==========
  breakpoints: {
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1400,
  },

  // ========== Global Config ==========
  scale: 1,
};
