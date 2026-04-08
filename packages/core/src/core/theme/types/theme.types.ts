/**
 * PrismUI Theme Types
 *
 * 核心定义：
 * Theme = Fully Static + Fully Resolvable Token Graph + Usage Types
 *
 * 约束：
 * - 纯数据，无函数
 * - 所有 token 都有明确粒度 + escape hatch
 * - 定义 Usage Types（供 Stage 2 使用）
 * - 可静态解析
 */

/**
 * CSS Length
 *
 * 支持的 CSS 长度单位
 * - number: 自动转 rem（依赖 scale）
 * - px: 像素
 * - rem: 相对根元素字体大小
 * - %: 百分比
 */
export type CSSLength = number | `${number}px` | `${number}rem` | `${number}%`;

/**
 * Token Reference
 *
 * 用于引用其他 token（Graph 结构）
 * 格式："category.key" 或 "category.family.shade"
 *
 * 示例：
 * - "colors.blue.6" → 引用 colors.blue[6]
 * - "spacing.md" → 引用 spacing.md
 */
export type TokenRef = string;

/**
 * PrismUI Theme
 */
export interface PrismUITheme {
  colors: PrismUIColorFamilies;
  palette: {
    light: PrismUIPalette;
    dark: PrismUIPalette;
  };
  typography: {
    fontFamily: string;
    fontFamilyMonospace: string;
    fontSize: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', CSSLength>;
    fontWeight: Record<'regular' | 'medium' | 'semibold' | 'bold', number>;
    lineHeight: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>;
  };
  spacing: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', CSSLength>;
  radius: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', CSSLength>;
  shadows: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>;
  breakpoints: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', `${number}px`>;
  scale: number;
}

/**
 * Color Families
 * 留给 Step 3.2
 */
export interface PrismUIColorFamilies {
  // 留给 Step 3.2
  [key: string]: unknown;
}

/**
 * Palette
 * 留给 Step 3.3
 *
 * ⚠️ 注意：内部使用 TokenRef（引用关系）
 * 示例：primary: "colors.blue.6"
 */
export interface PrismUIPalette {
  // 留给 Step 3.3
  [key: string]: unknown;
}
