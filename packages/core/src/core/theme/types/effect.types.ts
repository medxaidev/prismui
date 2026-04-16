import type { ColorShade } from "./color.types";

/**
 * ShadowExpression — Structured shadow description (Effect System)
 *
 * Independent from Color System (ColorExpression).
 * Resolved by resolveShadowExpression(), NOT resolveColorExpression().
 *
 * Color reference: shade → var(--prismui-color-{family}-{shade})
 * Does NOT resolve hex — ensures dark mode / theme override dynamic updates.
 *
 * @see devdocs/stage/stage-3-step-(stage-9)-4.md
 */
export interface ShadowExpression {
  type: 'shadow';
  shade: ColorShade;           // references color family shade → generates var() reference
  opacity: number;             // 0–1, shadow opacity
  offsetX?: number;            // px, default 0
  offsetY: number;             // px, required
  blur: number;                // px, required
  spread?: number;             // px, default 0
}
