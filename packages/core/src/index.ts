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

// State System (Stage 5.4)
export type { PrismuiStateTokens } from "./core/state";
export { defaultStateTokens, withStateVars, STATE_CSS_VARS } from "./core/state";
export type { WithStateVarsOptions, StateCssVarKey, StateCssVarName } from "./core/state";

// Props Contract (Stage 5.3)
export type { VariantProps, SizeProps, DisabledProps, PolymorphicSystemProps } from "./core/props";

// Size System (Stage 5.2)
export type { PrismuiSize, SizeScale, PrismuiSizeTokens } from "./core/size";
export { defaultSizeTokens, withSizeVars, SIZE_CSS_VARS } from "./core/size";
export type { WithSizeVarsOptions, SizeCssVarKey, SizeCssVarName } from "./core/size";

// Variant System (Stage 4)
export type { Variant, ThemeColor } from "./core/variant";
export { VARIANTS, THEME_COLORS } from "./core/variant";
export { variantColorResolver, VARIANT_TO_ROLE } from "./core/variant";
export type { VariantColorResolverInput, VariantColorOutput } from "./core/variant";
export { withVariantColors, VARIANT_CSS_VARS } from "./core/variant";
export type { VariantCssVarKey, VariantCssVarName, WithVariantColorsOptions } from "./core/variant";