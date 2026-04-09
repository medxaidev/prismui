export interface CoreConfig {
  name: string;
}

export const hello = () => {
  console.log('Hello from core!');
};

// Theme System (Stage 3 + Stage 2 Extension)
export {
  defaultTheme,
  defaultColorFamilies,
  defaultLightPalette,
  defaultDarkPalette,
  // Theme Runtime (Stage 2 extension)
  ThemeContext,
  useTheme,
  useThemeOptional,
  PrismUIProvider,
  resolveColorRef,
  generateCSSVariables,
  applyDiffCSSVariables,
} from "./core/theme";
export type { PrismUIProviderProps } from "./core/theme";
export type {
  CSSLength,
  TokenRef,
  PrismUITheme,
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
} from "./core/theme";

// Variant System (Stage 4)
export type { Variant, ThemeColor } from "./core/variant";
export { VARIANTS, THEME_COLORS } from "./core/variant";
export { variantColorResolver, VARIANT_TO_ROLE } from "./core/variant";
export type { VariantColorResolverInput, VariantColorOutput } from "./core/variant";
export { withVariantColors, VARIANT_CSS_VARS } from "./core/variant";
export type { VariantCssVarKey, VariantCssVarName, WithVariantColorsOptions } from "./core/variant";