/**
 * Size System Types
 *
 * Core Definition:
 * Size System = 组件盒子模型 + 文字大小的统一映射协议
 *
 * Three dimensions (v2):
 * - height   — 组件高度，step = +6
 * - paddingX — 水平内边距，step = +2
 * - fontSize — 组件文字大小，step = +1
 *
 * Core principle: Typography 比 Layout 更稳定
 *   height(+6) > paddingX(+2) > fontSize(+1)
 *
 * Explicitly excludes: iconSize (Icon System), gap (Spacing System)
 */

/**
 * PrismuiSize
 *
 * The 5 standard size tiers shared across all PrismUI components.
 */
export type PrismuiSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * SizeScale — 三维度比例单元。
 *
 * 职责：
 *   height   — 组件高度
 *   paddingX — 水平内边距
 *   fontSize — 组件文字大小
 *
 * 比例协调原则：
 *   height / paddingX / fontSize 是一组，修改任何一个都必须同时审计另外两个。
 *   Typography 比 Layout 更稳定：fontSize 步长 (+1) < paddingX (+2) < height (+6)
 *
 * 明确排除：
 *   iconSize → 属于 Icon System（未来 Step）
 *   gap      → 属于 Layout/Spacing System（未来 Step）
 */
export interface SizeScale {
  height: string;
  paddingX: string;
  fontSize: string;
}

/**
 * PrismuiSizeTokens
 *
 * A complete mapping from each PrismuiSize tier to its SizeScale values.
 * Stored in theme.size and consumed by withSizeVars middleware.
 */
export type PrismuiSizeTokens = Record<PrismuiSize, SizeScale>;
