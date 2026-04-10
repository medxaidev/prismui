/**
 * Size System Types
 *
 * Core Definition:
 * Size System = 组件盒子模型的统一映射协议
 *
 * Constraints:
 * - SizeScale only covers box model: height + paddingX
 * - Explicitly excludes: fontSize (Typography System), iconSize (Icon System), gap (Spacing System)
 */

/**
 * PrismuiSize
 *
 * The 5 standard size tiers shared across all PrismUI components.
 */
export type PrismuiSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * SizeScale — 盒子模型维度。
 *
 * 职责：height（组件高度）+ paddingX（水平内边距）。
 *
 * 明确排除：
 *   fontSize  → 属于 Typography System（未来 Step）
 *   iconSize  → 属于 Icon System（未来 Step）
 *   gap       → 属于 Layout/Spacing System（未来 Step）
 */
export interface SizeScale {
  height: string;
  paddingX: string;
}

/**
 * PrismuiSizeTokens
 *
 * A complete mapping from each PrismuiSize tier to its SizeScale values.
 * Stored in theme.size and consumed by withSizeVars middleware.
 */
export type PrismuiSizeTokens = Record<PrismuiSize, SizeScale>;
