import type { ShadowExpression } from "../types/effect.types";

/**
 * resolveShadowExpression
 *
 * Converts a ShadowExpression into a CSS box-shadow string.
 *
 * Key: color reference uses var(), does NOT resolve hex.
 *   → Ensures dark mode / theme override dynamic updates.
 *
 * Note: Does NOT require a `theme` parameter — pure string template operation.
 * The var() reference is resolved by the browser at runtime.
 *
 * @param expr   - ShadowExpression object
 * @param family - color family name (e.g. 'blue'), used to construct CSS var name
 * @returns CSS box-shadow string
 *
 * @example
 * resolveShadowExpression(
 *   { type: 'shadow', shade: 600, opacity: 0.24, offsetY: 8, blur: 16 },
 *   'blue'
 * )
 * → "0px 8px 16px 0px color-mix(in srgb, var(--prismui-color-blue-600) 24%, transparent)"
 */
export function resolveShadowExpression(
  expr: ShadowExpression,
  family: string,
): string {
  const x = expr.offsetX ?? 0;
  const y = expr.offsetY;
  const b = expr.blur;
  const s = expr.spread ?? 0;
  const pct = Math.round(expr.opacity * 100);
  return `${x}px ${y}px ${b}px ${s}px color-mix(in srgb, var(--prismui-color-${family}-${expr.shade}) ${pct}%, transparent)`;
}
