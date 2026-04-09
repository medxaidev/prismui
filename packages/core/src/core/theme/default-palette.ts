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
    high: { bg: "colors.blue.500", hoverBg: "colors.blue.600", fg: "colors.gray.50" },
    low: { bg: "colors.blue.50", hoverBg: "colors.blue.100", fg: "colors.blue.700" },
    bordered: { border: "colors.blue.300", fg: "colors.blue.600", hoverBg: "colors.blue.50" },
    minimal: { fg: "colors.blue.600", hoverBg: "colors.blue.50" },
  },

  secondary: {
    base: "colors.violet.500",
    hover: "colors.violet.600",
    active: "colors.violet.700",
    high: { bg: "colors.violet.500", hoverBg: "colors.violet.600", fg: "colors.gray.50" },
    low: { bg: "colors.violet.50", hoverBg: "colors.violet.100", fg: "colors.violet.700" },
    bordered: { border: "colors.violet.300", fg: "colors.violet.600", hoverBg: "colors.violet.50" },
    minimal: { fg: "colors.violet.600", hoverBg: "colors.violet.50" },
  },

  info: {
    base: "colors.cyan.500",
    hover: "colors.cyan.600",
    active: "colors.cyan.700",
    high: { bg: "colors.cyan.500", hoverBg: "colors.cyan.600", fg: "colors.gray.50" },
    low: { bg: "colors.cyan.50", hoverBg: "colors.cyan.100", fg: "colors.cyan.700" },
    bordered: { border: "colors.cyan.300", fg: "colors.cyan.600", hoverBg: "colors.cyan.50" },
    minimal: { fg: "colors.cyan.600", hoverBg: "colors.cyan.50" },
  },

  success: {
    base: "colors.green.500",
    hover: "colors.green.600",
    active: "colors.green.700",
    high: { bg: "colors.green.500", hoverBg: "colors.green.600", fg: "colors.gray.50" },
    low: { bg: "colors.green.50", hoverBg: "colors.green.100", fg: "colors.green.700" },
    bordered: { border: "colors.green.300", fg: "colors.green.600", hoverBg: "colors.green.50" },
    minimal: { fg: "colors.green.600", hoverBg: "colors.green.50" },
  },

  warning: {
    base: "colors.yellow.500",
    hover: "colors.yellow.600",
    active: "colors.yellow.700",
    high: { bg: "colors.yellow.500", hoverBg: "colors.yellow.600", fg: "colors.gray.800" },
    low: { bg: "colors.yellow.50", hoverBg: "colors.yellow.100", fg: "colors.yellow.700" },
    bordered: { border: "colors.yellow.300", fg: "colors.yellow.600", hoverBg: "colors.yellow.50" },
    minimal: { fg: "colors.yellow.600", hoverBg: "colors.yellow.50" },
  },

  error: {
    base: "colors.red.500",
    hover: "colors.red.600",
    active: "colors.red.700",
    high: { bg: "colors.red.500", hoverBg: "colors.red.600", fg: "colors.gray.50" },
    low: { bg: "colors.red.50", hoverBg: "colors.red.100", fg: "colors.red.700" },
    bordered: { border: "colors.red.300", fg: "colors.red.600", hoverBg: "colors.red.50" },
    minimal: { fg: "colors.red.600", hoverBg: "colors.red.50" },
  },

  neutral: {
    base: "colors.gray.600",
    hover: "colors.gray.700",
    active: "colors.gray.800",
    high: { bg: "colors.gray.600", hoverBg: "colors.gray.700", fg: "colors.gray.50" },
    low: { bg: "colors.gray.100", hoverBg: "colors.gray.200", fg: "colors.gray.700" },
    bordered: { border: "colors.gray.300", fg: "colors.gray.600", hoverBg: "colors.gray.100" },
    minimal: { fg: "colors.gray.600", hoverBg: "colors.gray.100" },
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
    high: { bg: "colors.blue.500", hoverBg: "colors.blue.400", fg: "colors.gray.100" },
    low: { bg: "colors.blue.900", hoverBg: "colors.blue.800", fg: "colors.blue.200" },
    bordered: { border: "colors.blue.700", fg: "colors.blue.300", hoverBg: "colors.blue.900" },
    minimal: { fg: "colors.blue.300", hoverBg: "colors.blue.900" },
  },

  secondary: {
    base: "colors.violet.400",
    hover: "colors.violet.300",
    active: "colors.violet.200",
    high: { bg: "colors.violet.500", hoverBg: "colors.violet.400", fg: "colors.gray.100" },
    low: { bg: "colors.violet.900", hoverBg: "colors.violet.800", fg: "colors.violet.200" },
    bordered: { border: "colors.violet.700", fg: "colors.violet.300", hoverBg: "colors.violet.900" },
    minimal: { fg: "colors.violet.300", hoverBg: "colors.violet.900" },
  },

  info: {
    base: "colors.cyan.400",
    hover: "colors.cyan.300",
    active: "colors.cyan.200",
    high: { bg: "colors.cyan.500", hoverBg: "colors.cyan.400", fg: "colors.gray.100" },
    low: { bg: "colors.cyan.900", hoverBg: "colors.cyan.800", fg: "colors.cyan.200" },
    bordered: { border: "colors.cyan.700", fg: "colors.cyan.300", hoverBg: "colors.cyan.900" },
    minimal: { fg: "colors.cyan.300", hoverBg: "colors.cyan.900" },
  },

  success: {
    base: "colors.green.400",
    hover: "colors.green.300",
    active: "colors.green.200",
    high: { bg: "colors.green.500", hoverBg: "colors.green.400", fg: "colors.gray.100" },
    low: { bg: "colors.green.900", hoverBg: "colors.green.800", fg: "colors.green.200" },
    bordered: { border: "colors.green.700", fg: "colors.green.300", hoverBg: "colors.green.900" },
    minimal: { fg: "colors.green.300", hoverBg: "colors.green.900" },
  },

  warning: {
    base: "colors.yellow.400",
    hover: "colors.yellow.300",
    active: "colors.yellow.200",
    high: { bg: "colors.yellow.500", hoverBg: "colors.yellow.400", fg: "colors.gray.100" },
    low: { bg: "colors.yellow.900", hoverBg: "colors.yellow.800", fg: "colors.yellow.200" },
    bordered: { border: "colors.yellow.700", fg: "colors.yellow.300", hoverBg: "colors.yellow.900" },
    minimal: { fg: "colors.yellow.300", hoverBg: "colors.yellow.900" },
  },

  error: {
    base: "colors.red.400",
    hover: "colors.red.300",
    active: "colors.red.200",
    high: { bg: "colors.red.500", hoverBg: "colors.red.400", fg: "colors.gray.100" },
    low: { bg: "colors.red.900", hoverBg: "colors.red.800", fg: "colors.red.200" },
    bordered: { border: "colors.red.700", fg: "colors.red.300", hoverBg: "colors.red.900" },
    minimal: { fg: "colors.red.300", hoverBg: "colors.red.900" },
  },

  neutral: {
    base: "colors.gray.400",
    hover: "colors.gray.300",
    active: "colors.gray.200",
    high: { bg: "colors.gray.600", hoverBg: "colors.gray.500", fg: "colors.gray.100" },
    low: { bg: "colors.gray.800", hoverBg: "colors.gray.700", fg: "colors.gray.200" },
    bordered: { border: "colors.gray.600", fg: "colors.gray.300", hoverBg: "colors.gray.800" },
    minimal: { fg: "colors.gray.300", hoverBg: "colors.gray.800" },
  },
};
