import type { CSSVariablesObject, InlineStyleObject, StyleProp } from './types';

/**
 * Split user style into CSS Variables and inline styles.
 *
 * This enables layered merging: system vars → user vars → inline styles.
 * Critical for future Variant system (Step 3) to insert between layers.
 *
 * The function performs O(n) key-based splitting without parsing values.
 * It only checks if a key starts with '--' to determine if it's a CSS variable.
 *
 * @param style - The style object to split
 * @returns An object containing separated CSS variables and inline styles
 *
 * @example
 * ```ts
 * const style = { '--button-height': '60px', padding: 0 };
 * const { vars, inline } = splitStyle(style);
 * // vars = { '--button-height': '60px' }
 * // inline = { padding: 0 }
 * ```
 */
export function splitStyle(style?: StyleProp): {
  vars: CSSVariablesObject;
  inline: InlineStyleObject;
} {
  if (!style) return { vars: {}, inline: {} };

  const vars: CSSVariablesObject = {};
  const inline: InlineStyleObject = {};

  for (const key in style) {
    if (key.startsWith('--')) {
      vars[key as `--${string}`] = (style as any)[key];
    } else {
      (inline as any)[key] = (style as any)[key];
    }
  }

  return { vars, inline };
}
