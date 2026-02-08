import type {
  PrismuiSpacing,
  PrismuiResponsiveValue,
} from '../theme/types';

/**
 * PrismUI system props.
 *
 * These props are parsed by `splitSystemProps` + `resolveSystemProps` to produce
 * inline styles and/or an injected responsive className.
 *
 * Combines Mantine's shorthand approach with additional MUI-inspired props
 * (overflow, visibility, cursor, z-index, gap, flex utilities).
 */
export interface SystemProps {
  /** Margin (supports responsive values). */
  m?: PrismuiResponsiveValue<PrismuiSpacing>;
  mt?: PrismuiResponsiveValue<PrismuiSpacing>;
  mb?: PrismuiResponsiveValue<PrismuiSpacing>;
  ml?: PrismuiResponsiveValue<PrismuiSpacing>;
  mr?: PrismuiResponsiveValue<PrismuiSpacing>;
  ms?: PrismuiResponsiveValue<PrismuiSpacing>;
  me?: PrismuiResponsiveValue<PrismuiSpacing>;
  mx?: PrismuiResponsiveValue<PrismuiSpacing>;
  my?: PrismuiResponsiveValue<PrismuiSpacing>;

  /** Padding (supports responsive values). */
  p?: PrismuiResponsiveValue<PrismuiSpacing>;
  pt?: PrismuiResponsiveValue<PrismuiSpacing>;
  pb?: PrismuiResponsiveValue<PrismuiSpacing>;
  pl?: PrismuiResponsiveValue<PrismuiSpacing>;
  pr?: PrismuiResponsiveValue<PrismuiSpacing>;
  ps?: PrismuiResponsiveValue<PrismuiSpacing>;
  pe?: PrismuiResponsiveValue<PrismuiSpacing>;
  px?: PrismuiResponsiveValue<PrismuiSpacing>;
  py?: PrismuiResponsiveValue<PrismuiSpacing>;

  /** Border & radius. */
  bd?: PrismuiResponsiveValue<string | number>;
  bdrs?: PrismuiResponsiveValue<string | number | 'theme' | 'none' | 'full'>;

  /** Colors. */
  bg?: PrismuiResponsiveValue<string>;
  c?: PrismuiResponsiveValue<string>;
  opacity?: PrismuiResponsiveValue<string | number>;

  /** Typography. */
  ff?: PrismuiResponsiveValue<string | 'sans' | 'mono' | 'default'>;
  fz?: PrismuiResponsiveValue<string | number | 'base' | 'md'>;
  fw?: PrismuiResponsiveValue<string | number>;
  lts?: PrismuiResponsiveValue<string | number>;
  ta?: PrismuiResponsiveValue<string>;
  lh?: PrismuiResponsiveValue<string | number | 'base' | 'md'>;
  fs?: PrismuiResponsiveValue<string>;
  tt?: PrismuiResponsiveValue<string>;
  td?: PrismuiResponsiveValue<string>;

  /** Sizing. */
  w?: PrismuiResponsiveValue<PrismuiSpacing>;
  miw?: PrismuiResponsiveValue<PrismuiSpacing>;
  maw?: PrismuiResponsiveValue<PrismuiSpacing>;
  h?: PrismuiResponsiveValue<PrismuiSpacing>;
  mih?: PrismuiResponsiveValue<PrismuiSpacing>;
  mah?: PrismuiResponsiveValue<PrismuiSpacing>;

  /** Background. */
  bgsz?: PrismuiResponsiveValue<string | number>;
  bgp?: PrismuiResponsiveValue<string>;
  bgr?: PrismuiResponsiveValue<string>;
  bga?: PrismuiResponsiveValue<string>;

  /** Positioning. */
  pos?: PrismuiResponsiveValue<string>;
  top?: PrismuiResponsiveValue<string | number>;
  left?: PrismuiResponsiveValue<string | number>;
  bottom?: PrismuiResponsiveValue<string | number>;
  right?: PrismuiResponsiveValue<string | number>;
  inset?: PrismuiResponsiveValue<string | number>;

  /** Display & flex. */
  display?: PrismuiResponsiveValue<string>;
  flex?: PrismuiResponsiveValue<string | number>;

  /** MUI-inspired additions. */
  overflow?: PrismuiResponsiveValue<string>;
  cursor?: PrismuiResponsiveValue<string>;
  visibility?: PrismuiResponsiveValue<string>;
  z?: PrismuiResponsiveValue<string | number>;
  gap?: PrismuiResponsiveValue<PrismuiSpacing>;
  rowGap?: PrismuiResponsiveValue<PrismuiSpacing>;
  columnGap?: PrismuiResponsiveValue<PrismuiSpacing>;
  alignItems?: PrismuiResponsiveValue<string>;
  justifyContent?: PrismuiResponsiveValue<string>;
  flexWrap?: PrismuiResponsiveValue<string>;
  flexDirection?: PrismuiResponsiveValue<string>;
  flexGrow?: PrismuiResponsiveValue<string | number>;
  flexShrink?: PrismuiResponsiveValue<string | number>;
}
