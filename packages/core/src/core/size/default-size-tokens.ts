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
  // Stage-14 Phase 3 (Phase 3 Additive · v1.0 lock):
  // 新增 `lineHeight` / `paddingY` / `borderY` 三项公式输入字段·与 SZ-COMP-1
  // `height = lineHeight + paddingY * 2 + borderY` 严格对接·测试层 ratchet
  // 守护 drift。
  //
  // ── Drift 表（actual height = v1 baseline · ideal = SZ-COMP-1 公式输出） ──
  //   xs:  ideal = 16 + 4*2  + 2 = 26 · actual = 24 · drift = -2
  //   sm:  ideal = 20 + 4*2  + 2 = 30 · actual = 30 · drift =  0  ✅
  //   md:  ideal = 20 + 8*2  + 2 = 38 · actual = 36 · drift = -2  (SZ-COMP-2 锁 38)
  //   lg:  ideal = 24 + 8*2  + 2 = 42 · actual = 42 · drift =  0  ✅
  //   xl:  ideal = 24 + 12*2 + 2 = 50 · actual = 48 · drift = -2
  //
  // drift 全部 ∈ {-2, 0}·全部 actual ≤ ideal·v1.x backlog 迁移到 ideal·
  // 测试层 ratchet 守护 drift "仅减不增"（详见 compute-height.test.ts）。
  //
  // ── lineHeight 来源（typography family alignment · OQ-SZ-1=B 延伸） ──
  //   xs:  label.sm.lineHeight = 16
  //   sm:  label.md.lineHeight = 20  (sm 用 label.md · 与 OQ-SZ-1=B 同模式)
  //   md:  label.md.lineHeight = 20  (Button label baseline · §3.6 锚)
  //   lg:  label.lg.lineHeight = 24
  //   xl:  label.lg.lineHeight = 24  (xl 用 label.lg · typography 上限 24)
  //
  // paddingY 全部 % 4 === 0（SZ-SCALE-2 ✅）·borderY 全部 = 2（SZ-COMP-6 ✅）。
  xs: { height: '24px', paddingX:  '8px', fontSize: '12px', slotSize: '14px', innerGap:  '4px',
        lineHeight: 16, paddingY:  '4px', borderY: 2 },
  sm: { height: '30px', paddingX: '10px', fontSize: '13px', slotSize: '16px', innerGap:  '6px',
        lineHeight: 20, paddingY:  '4px', borderY: 2 },
  md: { height: '36px', paddingX: '12px', fontSize: '14px', slotSize: '18px', innerGap:  '8px',
        lineHeight: 20, paddingY:  '8px', borderY: 2 },
  lg: { height: '42px', paddingX: '14px', fontSize: '15px', slotSize: '20px', innerGap: '10px',
        lineHeight: 24, paddingY:  '8px', borderY: 2 },
  xl: { height: '48px', paddingX: '16px', fontSize: '16px', slotSize: '22px', innerGap: '12px',
        lineHeight: 24, paddingY: '12px', borderY: 2 },
};
