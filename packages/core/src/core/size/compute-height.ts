/**
 * Stage-14 SZ-COMP-1 · Component Height Derivation Helper (Phase 3)
 *
 * Pure function implementing the Stage-14 single-source-of-truth formula for
 * deriving a component's outer height from its three structural inputs:
 *
 *     height = lineHeight + paddingY * 2 + borderY
 *
 * The formula is **directional only** (Stage-14 §3.6 single-direction
 * derivation rule): components MUST NOT define `height` directly and reverse-
 * engineer the inputs. Inputs are the discipline; output is the consequence.
 *
 * ── Invariant guardrails (advisory · this helper does NOT throw) ──────────
 *
 * - SZ-TYPE-1: `lineHeight` should be a px integer divisible by 4
 *   ({16, 20, 24, 28, 32, 36, 40, 48})
 * - SZ-SCALE-2: `paddingY` (when expressed in px) should satisfy `% 4 === 0`
 * - SZ-COMP-6: `borderY` defaults to 2 (transparent structural placeholder ·
 *   ensures Field-enterable components share identical structural border so
 *   solid/ghost/outline variants stay structurally aligned)
 * - SZ-COMP-1: all three inputs MUST be declared together (single-declaration
 *   rule · matches SZ-TYPE-3 typography-token rule one tier up)
 *
 * The helper accepts numbers (px) for `lineHeight` and `borderY` to guarantee
 * arithmetic safety; `paddingY` accepts a number too. CSSLength-string
 * conversion lives at the consumer boundary (e.g. size-token authoring sites)
 * so this helper stays a clean closed-form algebra.
 *
 * ── Why a pure helper instead of inlined arithmetic ─────────────────────────
 *
 * 1. Single source of truth — every place that derives a height (size token
 *    table, component CSS-var resolver, Storybook visualization) reads the
 *    same formula. Future formula evolution (e.g. v2 box-shadow factor) lands
 *    in one place.
 * 2. Test surface — the formula is unit-testable independently of any
 *    component, so SZ-COMP-1 can be guarded by direct assertions rather than
 *    indirectly via component snapshots.
 * 3. Drift audit — `default-size-tokens.ts` v1 baseline carries known drifts
 *    (xs/md/xl have actual = ideal − 2). The helper lets the test layer
 *    compute "ideal height" per tier and ratchet drift bounds (Stage-14 §13
 *    Phase 3 Audit Log: drift ∈ {-2, 0} · v1.x backlog migration target).
 *
 * Stage-14 reference: devdocs/stage/STAGE-14-OVERVIEW.md §3.3 SZ-COMP-1
 * Phase 3 ADR reference: devdocs/adr/ADR-005-stage-14-sizing-foundation.md
 *
 * @example
 * computeHeight({ lineHeight: 20, paddingY: 8, borderY: 2 }); // 38 (Button md ideal)
 * computeHeight({ lineHeight: 24, paddingY: 8, borderY: 2 }); // 42 (Button lg ideal)
 */
export interface ComputeHeightInputs {
  /**
   * Line height in px integer. Per SZ-TYPE-1 should be divisible by 4
   * ({16, 20, 24, 28, 32, 36, 40, 48}). Typically sourced from the
   * `theme.typography.{body|title|label}.{sm|md|lg}.lineHeight` family token.
   */
  lineHeight: number;
  /**
   * Vertical padding in px (one side · the formula multiplies by 2 for the
   * pair). Per SZ-SCALE-2 should satisfy `% 4 === 0` so the recommended pool
   * is {0, 4, 8, 12, 16, 20, 24, ...}.
   */
  paddingY: number;
  /**
   * Vertical structural border in px. Per SZ-COMP-6 defaults to 2 (transparent
   * placeholder so Field-enterable components share structural border across
   * solid/ghost/outline variants). The formula multiplies by 1 (not 2) because
   * the convention treats `borderY` as the **total** structural border budget
   * for top + bottom combined; e.g. `border: 1px solid` on each side = 2 total.
   */
  borderY: number;
}

/**
 * computeHeight — Stage-14 SZ-COMP-1 single-direction height derivation.
 *
 * Returns the **outer** (border-box) height in px. Components consuming this
 * helper MUST set `box-sizing: border-box` (Stage-14 SZ-COMP-1 invariant) so
 * the returned value matches the rendered outer bounding box.
 *
 * @returns Outer height in px integer
 */
export function computeHeight(inputs: ComputeHeightInputs): number {
  const { lineHeight, paddingY, borderY } = inputs;
  return lineHeight + paddingY * 2 + borderY;
}

/**
 * SZ-TYPE-1 advisory check (used by tests · NOT thrown by the helper).
 *
 * Accepts the px integer pool {16, 20, 24, 28, 32, 36, 40, 48} (% 4 === 0
 * and ≥ 16). Returns true when the value satisfies the invariant.
 */
export function isValidLineHeightPx(lineHeight: number): boolean {
  return Number.isInteger(lineHeight) && lineHeight >= 16 && lineHeight % 4 === 0;
}

/**
 * SZ-SCALE-2 advisory check for paddingY (used by tests · NOT thrown).
 *
 * Accepts non-negative integers divisible by 4 (the spacing 4-px base).
 * Note: SZ-SCALE-2 is "% 4 === 0" — the recommended-tier pool {0, 4, 8, 12,
 * 16, 20, 24} is just a convenient subset; the invariant itself is the
 * arithmetic check.
 */
export function isValidPaddingYPx(paddingY: number): boolean {
  return Number.isInteger(paddingY) && paddingY >= 0 && paddingY % 4 === 0;
}
