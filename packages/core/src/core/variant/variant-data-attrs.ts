import type { DataAttrsResolver } from '../component/data-attrs-resolver';

/**
 * variantDataAttrs
 *
 * Produces root `data-variant` and `data-color` from component props.
 *
 * NOTE (§5.8): `data-color` is v1 co-managed by the variant system as a
 * pragmatic shortcut. The contract treats `color` as orthogonal to `variant`;
 * a future independent `color` system will absorb this key without DOM-level
 * breakage. Do not add color-only logic to the variant system's varsResolver.
 */
export const variantDataAttrs: DataAttrsResolver<Record<string, any>> = (props) => ({
  'data-variant': props.variant != null ? String(props.variant) : undefined,
  'data-color':   props.color   != null ? String(props.color)   : undefined,
});
