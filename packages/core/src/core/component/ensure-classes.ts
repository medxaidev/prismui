/**
 * 编译期类型约束：从 stylesNames 数组推导 Names，确保 CSS Modules 包含所有必需的 class。
 *
 * 检查：
 * 1. 缺少 class → ❌ 编译错误
 * 2. 拼错 class → ❌ 编译错误
 *
 * 多余 class 由 Layer 2 Runtime 验证覆盖（__PRISMUI_INTERNAL__ 环境）。
 *
 * @example
 * ```ts
 * import styles from './Button.module.css';
 *
 * // ✅ 无需手动写泛型参数，Names 从 stylesNames 自动推导
 * const stylesNames = ['root', 'inner', 'label'] as const;
 * const classes = ensureClasses(stylesNames, styles);
 * ```
 */
export function ensureClasses<
  const Names extends readonly string[],
  ClassesObj extends Record<Names[number], string>,
>(
  _stylesNames: Names,
  classes: ClassesObj,
): Record<Names[number], string> {
  return classes;
}
