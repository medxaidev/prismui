import type { PrismuiSizeTokens } from './types';

/**
 * defaultSizeTokens — Size System v2
 *
 * Three-dimension proportional scale for all 5 size tiers.
 *
 * Design decision (Stage-3 Step-1 v2, 2026-04-15):
 * md = 36px aligns with industry consensus (MUI / Mantine).
 * See: devdocs/stage/stage-3-step-(stage-9)-1.md
 *
 * Scale:
 *   height   — step +6 (24 → 30 → 36 → 42 → 48)
 *   paddingX — step +2 ( 8 → 10 → 12 → 14 → 16)
 *   fontSize — step +1 (12 → 13 → 14 → 15 → 16)
 *
 * Core principle: Typography 比 Layout 更稳定
 *   height(+6) > paddingX(+2) > fontSize(+1)
 *
 * Units: px strings (CSSLength format)
 */
export const defaultSizeTokens: PrismuiSizeTokens = {
  xs: { height: '24px', paddingX: '8px',  fontSize: '12px' },
  sm: { height: '30px', paddingX: '10px', fontSize: '13px' },
  md: { height: '36px', paddingX: '12px', fontSize: '14px' },
  lg: { height: '42px', paddingX: '14px', fontSize: '15px' },
  xl: { height: '48px', paddingX: '16px', fontSize: '16px' },
};
