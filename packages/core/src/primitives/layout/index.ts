/**
 * Stage-15 Layout primitives barrel.
 *
 * Exports (Phase 1 · landing in sequence):
 *   - Box       · ✅ landed
 *   - Stack     · ✅ landed
 *   - Inline    · ✅ landed
 *   - Center    · ⏳ pending
 *   - Grid      · ⏳ pending
 *   - Divider   · ⏳ pending
 *
 * Contract (ADR-006 §6.1): this barrel MUST NOT re-export anything outside
 * the six Layout primitives. Scope / Section live in sibling barrels.
 * The shape of this barrel is part of the R-1 P0 dissolution condition
 * (Phase 1 PR diff must match §6.1 whitelist exactly).
 */
export { Box } from './Box';
export type { BoxOwnProps, BoxProps, BoxComponent } from './Box';

export { Stack, STACK_DEFAULT_GAP } from './Stack';
export type { StackOwnProps, StackProps, StackComponent } from './Stack';

export { Inline, INLINE_DEFAULT_GAP } from './Inline';
export type { InlineOwnProps, InlineProps, InlineComponent } from './Inline';
