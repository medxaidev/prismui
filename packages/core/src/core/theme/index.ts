export { defaultTheme } from "./default-theme";
export { createTheme, deepMerge } from "./create-theme";
export type { DeepPartial } from "./create-theme";
export {
  ColorSchemeContext,
  ColorSchemeProvider,
  useColorScheme,
  useColorSchemeOptional,
} from "./color-scheme.context";
export type {
  ColorScheme,
  ColorSchemeStrategy,
  ColorSchemeContextValue,
  ColorSchemeProviderProps,
} from "./color-scheme.context";
export { defaultColorFamilies } from "./default-colors";
export { defaultLightPalette, defaultDarkPalette } from "./default-palette";
export { ThemeContext, useTheme, useThemeOptional } from "./context";
export { resolveColorRef, generateCSSVariables, applyDiffCSSVariables } from "./context";
export { PrismUIProvider } from "./provider";
export type { PrismUIProviderProps } from "./provider";
export type {
  CSSLength,
  TokenRef,
  PrismUITheme,
  PrismUIComponentConfig,
  SemanticColorToken,
  PrismUIPalette,
  SemanticColorName,
  ColorShade,
  ColorValue,
  ColorScale,
  DefaultColorFamily,
  PrismUIColorFamilies,
  ColorRef,
  SpacingScale,
  FontSizeScale,
  FontWeightScale,
  LineHeightScale,
  RadiusScale,
  ShadowScale,
  BreakpointScale,
  SpacingValue,
  FontSizeValue,
  FontWeightValue,
  LineHeightValue,
  RadiusValue,
  ShadowValue,
  BreakpointValue,
} from "./types";
