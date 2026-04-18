/**
 * Size System Types
 *
 * Core Definition:
 * Size System = 组件盒子模型 + 内部布局 + 文字大小的统一映射协议
 *
 * Five dimensions (v3, since 2026-04-17):
 * Layer 1 — External Box (v2 legacy):
 *   - height     — 组件高度，step = +6
 *   - paddingX   — 水平内边距，step = +2
 *   - fontSize   — 组件文字大小，step = +1
 * Layer 2 — Internal Layout (v3 new):
 *   - slotSize   — 内部固定占位 slot 方块尺寸（section icon 容器），step = +2
 *   - innerGap   — 主轴内部元素间距（section ↔ label），step = +2
 *
 * Design doc: devdocs/stage/stage-3-step-(stage-9)-9.md
 *
 * Core principle: Typography 比 Layout 更稳定
 *   fontSize(+1) < paddingX(+2) ≈ slotSize(+2) ≈ innerGap(+2) < height(+6)
 *
 * Default sync, independent override allowed — 5 dimensions may be independently
 * overridden via theme.size even though step coherence is the default recipe.
 *
 * Explicitly excludes: iconSize (Icon System, future), lineHeight (Typography
 * System, future), borderRadius / shadow (Radius / Elevation Systems).
 * See §3.5 Boundary in the design doc for authoritative rules.
 */

/**
 * PrismuiSize
 *
 * The 5 standard size tiers shared across all PrismUI components.
 */
export type PrismuiSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * SizeScale — 五维度比例单元（v3，自 2026-04-17）。
 *
 * Layer 1 — External Box：
 *   height   — 组件高度                              step +6
 *   paddingX — 水平内边距                            step +2
 *   fontSize — 组件文字大小                          step +1
 * Layer 2 — Internal Layout（v3 新增）：
 *   slotSize — 内部固定占位 slot 方块尺寸              step +2
 *   innerGap — 主轴内部元素间距                      step +2
 *
 * 默认协调原则：
 *   fontSize(+1) < paddingX(+2) ≈ slotSize(+2) ≈ innerGap(+2) < height(+6)
 *
 * 默认按步长协调，但允许独立 override（见 design doc §2）。
 *
 * 明确排除（归属其他 System）：
 *   iconSize    → Icon System（未来）
 *   lineHeight  → Typography System（未来）
 *   borderRadius → Radius System（已有）
 *   shadow      → Elevation System（未来）
 *
 * Design doc: devdocs/stage/stage-3-step-(stage-9)-9.md
 */
export interface SizeScale {
  height: string;
  paddingX: string;
  fontSize: string;
  /** v3 新增：内部固定占位 slot 的方块尺寸（如 Button/Input 的 section）。 */
  slotSize: string;
  /** v3 新增：主轴内部元素间距（如 section ↔ label）。 */
  innerGap: string;
}

/**
 * PrismuiSizeTokens
 *
 * A complete mapping from each PrismuiSize tier to its SizeScale values.
 * Stored in theme.size and consumed by withSizeVars middleware.
 */
export type PrismuiSizeTokens = Record<PrismuiSize, SizeScale>;
