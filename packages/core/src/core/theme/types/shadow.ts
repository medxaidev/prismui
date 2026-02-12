export type PrismuiShadowSizeKey =
  | 'xxs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'xxl';

export type PrismuiShadowComponentKey =
  | 'dialog'
  | 'card'
  | 'dropdown';

export type PrismuiShadowSemanticKey =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type PrismuiShadowKey =
  | PrismuiShadowSizeKey
  | PrismuiShadowComponentKey
  | PrismuiShadowSemanticKey;

/** Accepts a shadow key, direct CSS string, or `none` to remove shadow. */
export type PrismuiShadow = PrismuiShadowKey | (string & {});

/**
 * Palette-level shadow configuration.
 *
 * Shadows are **generated** at CSS variable time, not stored as final values.
 * The palette only provides the base shadow color (scheme-dependent).
 * - `color`: the base shadow color string (e.g. gray-500 hex for light, black for dark)
 * - `dialogColor`: optional override for dialog shadow color (defaults to common.black)
 *
 * Shadow geometry (offsets, spread, opacity) is defined as static templates
 * in the CSS variable generation pipeline.
 */
export interface PrismuiPaletteShadow {
  color: string;
  dialogColor?: string;
}
