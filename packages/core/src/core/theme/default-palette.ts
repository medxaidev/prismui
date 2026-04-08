import type { PrismUIPalette } from "./types";

/**
 * Default Light Palette
 *
 * Semantic color references for light mode.
 * Uses mid-to-deep shades that work well on white/light backgrounds.
 *
 * Convention (not rule):
 * - base:   500 (primary shade)
 * - hover:  600 (slightly darker)
 * - active: 700 (darkest of the three)
 */
export const defaultLightPalette: PrismUIPalette = {
  primary: {
    base: "colors.blue.500",
    hover: "colors.blue.600",
    active: "colors.blue.700",
  },

  secondary: {
    base: "colors.violet.500",
    hover: "colors.violet.600",
    active: "colors.violet.700",
  },

  info: {
    base: "colors.cyan.500",
    hover: "colors.cyan.600",
    active: "colors.cyan.700",
  },

  success: {
    base: "colors.green.500",
    hover: "colors.green.600",
    active: "colors.green.700",
  },

  warning: {
    base: "colors.yellow.500",
    hover: "colors.yellow.600",
    active: "colors.yellow.700",
  },

  error: {
    base: "colors.red.500",
    hover: "colors.red.600",
    active: "colors.red.700",
  },

  neutral: {
    base: "colors.gray.600",
    hover: "colors.gray.700",
    active: "colors.gray.800",
  },
};

/**
 * Default Dark Palette
 *
 * Semantic color references for dark mode.
 * Uses lighter shades that work well on dark backgrounds.
 *
 * Convention (not rule):
 * - base:   400 (primary shade for dark bg)
 * - hover:  300 (slightly lighter)
 * - active: 200 (lightest of the three)
 */
export const defaultDarkPalette: PrismUIPalette = {
  primary: {
    base: "colors.blue.400",
    hover: "colors.blue.300",
    active: "colors.blue.200",
  },

  secondary: {
    base: "colors.violet.400",
    hover: "colors.violet.300",
    active: "colors.violet.200",
  },

  info: {
    base: "colors.cyan.400",
    hover: "colors.cyan.300",
    active: "colors.cyan.200",
  },

  success: {
    base: "colors.green.400",
    hover: "colors.green.300",
    active: "colors.green.200",
  },

  warning: {
    base: "colors.yellow.400",
    hover: "colors.yellow.300",
    active: "colors.yellow.200",
  },

  error: {
    base: "colors.red.400",
    hover: "colors.red.300",
    active: "colors.red.200",
  },

  neutral: {
    base: "colors.gray.400",
    hover: "colors.gray.300",
    active: "colors.gray.200",
  },
};
