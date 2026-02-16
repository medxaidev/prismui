import type {
  PrismuiColorFamilies,
  PrismuiColorFamily,
} from './colors';
import type { PrismuiColorSchemes } from './palette';
import type { PrismuiSpacingValues } from './spacing';
import type { PrismuiPrimaryShade } from './primary-shade';
import type { PrismuiBreakpointsValues } from './breakpoint';
import type { PrismuiFontSizesValues } from './font-size';
import type { PrismuiLineHeightsValues } from './line-height';
import type { PrismuiRadiusValues } from './radius';
import type { VariantColorResolver } from '../variant-color-resolver/variant-color-resolver';
import type { PrismuiTransitions } from './transitions';

// ---------------------------------------------------------------------------
// Theme-level component customization
// ---------------------------------------------------------------------------

/**
 * Per-component theme customization entry.
 *
 * - `defaultProps` — merged by `useProps()` (Phase B). Can be object or `(theme) => object`.
 * - `classNames` / `styles` / `vars` — merged by `useStyles()` (Phase C, typed as `any` for now).
 */
export interface PrismuiThemeComponent {
  classNames?: any;
  styles?: any;
  vars?: any;
  defaultProps?: Record<string, any> | ((theme: PrismuiTheme) => Record<string, any>);
}

export type PrismuiThemeComponents = Record<string, PrismuiThemeComponent>;

// ---------------------------------------------------------------------------
// PrismuiTheme
// ---------------------------------------------------------------------------

/**
 * PrismUI theme object.
 *
 * Semantic palette colors (primary..error) are optional here — they are
 * resolved from `colorFamilies + primaryShade` at CSS variable generation time.
 * `createTheme` only merges user config with defaults; it does NOT resolve.
 */
export interface PrismuiTheme {
  colorFamilies: PrismuiColorFamilies;
  primaryShade: PrismuiPrimaryShade;

  primaryColor: PrismuiColorFamily;
  secondaryColor: PrismuiColorFamily;
  infoColor: PrismuiColorFamily;
  successColor: PrismuiColorFamily;
  warningColor: PrismuiColorFamily;
  errorColor: PrismuiColorFamily;
  neutralColor: PrismuiColorFamily;

  colorSchemes: PrismuiColorSchemes;

  fontSize: number;
  fontSizes: PrismuiFontSizesValues;
  fontFamily: string;
  fontFamilyMonospace: string;

  scale: number;
  spacingUnit: number;

  lineHeights: PrismuiLineHeightsValues;
  radius: PrismuiRadiusValues;

  spacing?: Partial<PrismuiSpacingValues>;
  breakpoints: PrismuiBreakpointsValues;

  /** Resolves variant + color to CSS values (background, color, border, hover) */
  variantColorResolver: VariantColorResolver;

  /** Transition durations and easing curves (MUI-inspired) */
  transitions: PrismuiTransitions;

  /** Allows adding `classNames`, `styles` and `defaultProps` to any component */
  components: PrismuiThemeComponents;

  other: Record<string, unknown>;
}

/** @deprecated Use PrismuiTheme instead. */
export type PrismuiThemeInput = PrismuiTheme;