/**
 * 编译期类型约束：确保 CSS Modules 完全对齐 stylesNames
 *
 * 三重检查：
 * 1. 缺少 class → ❌ 编译错误
 * 2. 拼错 class → ❌ 编译错误
 * 3. 多余 class → ❌ 编译错误
 *
 * @example
 * ```ts
 * type ButtonStylesNames = 'root' | 'inner' | 'label';
 * import styles from './Button.module.css';
 *
 * // ⚠️ 必须传入两个泛型参数
 * const classes = ensureAllClasses<ButtonStylesNames, typeof styles>(styles);
 * // ✅ 完全对齐检查
 * ```
 */
export type ExactClasses<
  Names extends string,
  ClassesObj extends Record<string, string>,
> =
  & Record<Names, string>  // 必须包含所有 Names
  & {
    [K in keyof ClassesObj]: K extends Names ? string : never;  // 禁止多余 key
  };

export function ensureAllClasses<
  Names extends string,
  ClassesObj extends Record<string, string>,
>(
  classes: ExactClasses<Names, ClassesObj>,
): Record<Names, string> {
  return classes;
}
