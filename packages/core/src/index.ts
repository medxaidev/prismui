export interface CoreConfig {
  name: string;
}

export const hello = () => {
  console.log('Hello from core!');
};

// Theme System (Stage 3)
export { defaultTheme, defaultColorFamilies, defaultLightPalette, defaultDarkPalette } from "./core/theme";
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