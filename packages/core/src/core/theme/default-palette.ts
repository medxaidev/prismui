import type { PrismUIPalette } from "./types";

/**
 * Opacity tokens — semantic layer for transparency control (ADR-001).
 *
 * Used by AlphaExpression in palette roles.
 * Changing a value here globally adjusts all variants that reference it.
 */
export const OPACITY_TOKENS = {
  outlinedBorder: 0.32,
  hoverBg: 0.08,
  activeBg: 0.16,
  softBg: 0.08,
  softHoverBg: 0.16,
  softActiveBg: 0.24,
  filledHoverShadow: 0.24,
} as const;

/**
 * Shadow geometry tokens — structural parameters for shadow effects.
 *
 * Used by ShadowExpression in palette roles (Effect System).
 * Changing a value here globally adjusts all shadow geometries that reference it.
 */
export const SHADOW_GEOMETRY = {
  filledHover: { offsetY: 8, blur: 16 },
} as const;

/**
 * Default Light Palette
 *
 * Semantic color references for light mode.
 * Uses ColorExpression objects (ADR-001: shade | alpha | raw).
 *
 * Convention (not rule):
 * - base:   500 (primary shade)
 * - hover:  700 (two shades darker — VARIANT_STEP_RULES.filled.hoverShade = 7)
 * - active: 800 (darkest of the three)
 *
 * Rule reference: core/variant/variant-step-rules.ts — VARIANT_STEP_RULES.filled
 */
export const defaultLightPalette: PrismUIPalette = {
  primary: {
    family: "blue",
    base: "colors.blue.500",
    hover: "colors.blue.600",
    active: "colors.blue.700",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 700 },
      activeBg:    { type: 'shade', shade: 800 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'shadow', shade: 600, opacity: OPACITY_TOKENS.filledHoverShadow, offsetY: SHADOW_GEOMETRY.filledHover.offsetY, blur: SHADOW_GEOMETRY.filledHover.blur },
    },
    low: {
      bg:       { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 700 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 600 },
      border:      { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 600 },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  secondary: {
    family: "violet",
    base: "colors.violet.500",
    hover: "colors.violet.600",
    active: "colors.violet.700",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 700 },
      activeBg:    { type: 'shade', shade: 800 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'shadow', shade: 600, opacity: OPACITY_TOKENS.filledHoverShadow, offsetY: SHADOW_GEOMETRY.filledHover.offsetY, blur: SHADOW_GEOMETRY.filledHover.blur },
    },
    low: {
      bg:       { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 700 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 600 },
      border:      { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 600 },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  info: {
    family: "cyan",
    base: "colors.cyan.500",
    hover: "colors.cyan.600",
    active: "colors.cyan.700",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 700 },
      activeBg:    { type: 'shade', shade: 800 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'shadow', shade: 600, opacity: OPACITY_TOKENS.filledHoverShadow, offsetY: SHADOW_GEOMETRY.filledHover.offsetY, blur: SHADOW_GEOMETRY.filledHover.blur },
    },
    low: {
      bg:       { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 700 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 600 },
      border:      { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 600 },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  success: {
    family: "green",
    base: "colors.green.500",
    hover: "colors.green.600",
    active: "colors.green.700",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 700 },
      activeBg:    { type: 'shade', shade: 800 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'shadow', shade: 600, opacity: OPACITY_TOKENS.filledHoverShadow, offsetY: SHADOW_GEOMETRY.filledHover.offsetY, blur: SHADOW_GEOMETRY.filledHover.blur },
    },
    low: {
      bg:       { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 700 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 600 },
      border:      { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 600 },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  warning: {
    family: "yellow",
    base: "colors.yellow.500",
    hover: "colors.yellow.600",
    active: "colors.yellow.700",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 700 },
      activeBg:    { type: 'shade', shade: 800 },
      fg:          { type: 'raw', value: '#212B36' }, // dark text for yellow
      hoverShadow: { type: 'shadow', shade: 600, opacity: OPACITY_TOKENS.filledHoverShadow, offsetY: SHADOW_GEOMETRY.filledHover.offsetY, blur: SHADOW_GEOMETRY.filledHover.blur },
    },
    low: {
      bg:       { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 700 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 600 },
      border:      { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 600 },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  error: {
    family: "red",
    base: "colors.red.500",
    hover: "colors.red.600",
    active: "colors.red.700",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 700 },
      activeBg:    { type: 'shade', shade: 800 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'shadow', shade: 600, opacity: OPACITY_TOKENS.filledHoverShadow, offsetY: SHADOW_GEOMETRY.filledHover.offsetY, blur: SHADOW_GEOMETRY.filledHover.blur },
    },
    low: {
      bg:       { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 700 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 600 },
      border:      { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 600 },
      hoverBg:  { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 500, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  neutral: {
    family: "gray",
    base: "colors.gray.600",
    hover: "colors.gray.700",
    active: "colors.gray.800",
    high: {
      bg:          { type: 'shade', shade: 600 },
      hoverBg:     { type: 'shade', shade: 800 },
      activeBg:    { type: 'shade', shade: 900 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'shadow', shade: 700, opacity: OPACITY_TOKENS.filledHoverShadow, offsetY: SHADOW_GEOMETRY.filledHover.offsetY, blur: SHADOW_GEOMETRY.filledHover.blur },
    },
    low: {
      bg:       { type: 'alpha', shade: 600, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 600, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 600, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 700 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 600 },
      border:      { type: 'alpha', shade: 600, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 600, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 600, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 600 },
      hoverBg:  { type: 'alpha', shade: 600, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 600, alpha: OPACITY_TOKENS.activeBg },
    },
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
    family: "blue",
    base: "colors.blue.400",
    hover: "colors.blue.300",
    active: "colors.blue.200",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 400 },
      activeBg:    { type: 'shade', shade: 300 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'raw', value: 'none' },
    },
    low: {
      bg:       { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 200 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 300 },
      border:      { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 300 },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  secondary: {
    family: "violet",
    base: "colors.violet.400",
    hover: "colors.violet.300",
    active: "colors.violet.200",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 400 },
      activeBg:    { type: 'shade', shade: 300 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'raw', value: 'none' },
    },
    low: {
      bg:       { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 200 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 300 },
      border:      { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 300 },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  info: {
    family: "cyan",
    base: "colors.cyan.400",
    hover: "colors.cyan.300",
    active: "colors.cyan.200",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 400 },
      activeBg:    { type: 'shade', shade: 300 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'raw', value: 'none' },
    },
    low: {
      bg:       { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 200 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 300 },
      border:      { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 300 },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  success: {
    family: "green",
    base: "colors.green.400",
    hover: "colors.green.300",
    active: "colors.green.200",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 400 },
      activeBg:    { type: 'shade', shade: 300 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'raw', value: 'none' },
    },
    low: {
      bg:       { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 200 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 300 },
      border:      { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 300 },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  warning: {
    family: "yellow",
    base: "colors.yellow.400",
    hover: "colors.yellow.300",
    active: "colors.yellow.200",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 400 },
      activeBg:    { type: 'shade', shade: 300 },
      fg:          { type: 'raw', value: '#212B36' },
      hoverShadow: { type: 'raw', value: 'none' },
    },
    low: {
      bg:       { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 200 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 300 },
      border:      { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 300 },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  error: {
    family: "red",
    base: "colors.red.400",
    hover: "colors.red.300",
    active: "colors.red.200",
    high: {
      bg:          { type: 'shade', shade: 500 },
      hoverBg:     { type: 'shade', shade: 400 },
      activeBg:    { type: 'shade', shade: 300 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'raw', value: 'none' },
    },
    low: {
      bg:       { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 200 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 300 },
      border:      { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 300 },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
    },
  },

  neutral: {
    family: "gray",
    base: "colors.gray.400",
    hover: "colors.gray.300",
    active: "colors.gray.200",
    high: {
      bg:          { type: 'shade', shade: 600 },
      hoverBg:     { type: 'shade', shade: 500 },
      activeBg:    { type: 'shade', shade: 400 },
      fg:          { type: 'raw', value: '#FFFFFF' },
      hoverShadow: { type: 'raw', value: 'none' },
    },
    low: {
      bg:       { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softBg },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softHoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.softActiveBg },
      fg:       { type: 'shade', shade: 200 },
    },
    bordered: {
      bg:          { type: 'raw', value: 'transparent' },
      fg:          { type: 'shade', shade: 300 },
      border:      { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.outlinedBorder },
      hoverBg:     { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg:    { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
      hoverBorder: { type: 'raw', value: 'currentcolor' },
      hoverShadow: { type: 'raw', value: 'currentcolor 0px 0px 0px 0.75px' },
    },
    minimal: {
      fg:       { type: 'shade', shade: 300 },
      hoverBg:  { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.hoverBg },
      activeBg: { type: 'alpha', shade: 400, alpha: OPACITY_TOKENS.activeBg },
    },
  },
};
