import type { PrismuiSizeTokens } from './types';

/**
 * defaultSizeTokens
 *
 * Default box model values for all 5 size tiers.
 * Values are aligned with the existing Button sizeMap so migration is zero-visual-change.
 *
 * Units: px strings (CSSLength format)
 * Only height + paddingX — fontSize / iconSize / gap are NOT part of the size contract.
 */
export const defaultSizeTokens: PrismuiSizeTokens = {
  xs: { height: '24px', paddingX: '8px'  },
  sm: { height: '32px', paddingX: '12px' },
  md: { height: '40px', paddingX: '16px' },
  lg: { height: '48px', paddingX: '20px' },
  xl: { height: '56px', paddingX: '24px' },
};
