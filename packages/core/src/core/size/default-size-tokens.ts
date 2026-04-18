import type { PrismuiSizeTokens } from './types';

/**
 * defaultSizeTokens — Size System v3
 *
 * Five-dimension proportional scale for all 5 size tiers.
 *
 * Design decisions:
 *   Stage-3 Step-1 v2 (2026-04-15): md = 36px aligns with MUI / Mantine.
 *   Stage-3 Step-9 v3 (2026-04-17): add slotSize + innerGap (internal layout).
 *
 * Scale:
 *   height    — step +6  (24 → 30 → 36 → 42 → 48)
 *   paddingX  — step +2  ( 8 → 10 → 12 → 14 → 16)
 *   fontSize  — step +1  (12 → 13 → 14 → 15 → 16)
 *   slotSize  — step +2  (14 → 16 → 18 → 20 → 22)  [v3]
 *   innerGap  — step +2  ( 4 →  6 →  8 → 10 → 12)  [v3]
 *
 * Proportions:
 *   slotSize / height   ≈ 0.46 ~ 0.58  (slot roughly half of height; ratio
 *                                        drifts because step +2 vs height step +6)
 *   innerGap / paddingX ≈ 0.5 ~ 0.75   (spacing one tier tighter than padding)
 *   slotSize > fontSize (slot fits icon + tiny padding around text)
 *
 * Core principle: Typography 比 Layout 更稳定
 *   fontSize(+1) < paddingX(+2) ≈ slotSize(+2) ≈ innerGap(+2) < height(+6)
 *
 * Units: px strings (CSSLength format)
 */
export const defaultSizeTokens: PrismuiSizeTokens = {
  xs: { height: '24px', paddingX:  '8px', fontSize: '12px', slotSize: '14px', innerGap:  '4px' },
  sm: { height: '30px', paddingX: '10px', fontSize: '13px', slotSize: '16px', innerGap:  '6px' },
  md: { height: '36px', paddingX: '12px', fontSize: '14px', slotSize: '18px', innerGap:  '8px' },
  lg: { height: '42px', paddingX: '14px', fontSize: '15px', slotSize: '20px', innerGap: '10px' },
  xl: { height: '48px', paddingX: '16px', fontSize: '16px', slotSize: '22px', innerGap: '12px' },
};
