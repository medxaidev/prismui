export type { Variant, ThemeColor } from "./types";
export { VARIANTS, THEME_COLORS } from "./types";

export { variantColorResolver, VARIANT_TO_ROLE } from "./variant-color-resolver";
export type { VariantColorResolverInput, VariantColorOutput } from "./variant-color-resolver";

export { withVariantColors, VARIANT_CSS_VARS } from "./with-variant-colors";
export type { VariantCssVarKey, VariantCssVarName, WithVariantColorsOptions } from "./with-variant-colors";

export { SHADE_SCALE, VARIANT_STEP_RULES, NEUTRAL_VARIANT_STEP_RULES, getColorStrategy } from "./variant-step-rules";
export type { VariantStepRule, ColorStrategy } from "./variant-step-rules";
