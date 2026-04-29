/**
 * Stage-11 · L0 Overlay Foundation · Dismissal · boundary detection helpers
 *
 * Contract: `@/devdocs/system/dismissal-primitive.md` v0.1.2 §3.1 + §3.3 + §3.4
 *
 * Shared between pointer-outside, focus-outside and scroll-outside channels:
 *   · `isInsideOverlay` — overlay boundary check (P1-1 conservative null default)
 *   · `isInsideTrigger` — OV-DISMISS-3 self-reflexive exclusion
 *
 * Note: cross iframe / Shadow DOM detection is NOT supported (see §8.7).
 * `event.target` retargeting at shadow boundaries causes `contains` to return
 * `false` for nodes inside closed shadow trees.
 */

import type { RefObject } from 'react';

/**
 * `true` when `target` is within `overlayRef.current`. When the ref is not yet
 * populated (`current === null`), returns `true` (P1-1 — the conservative
 * default treats an un-mounted overlay as "infinite inside" so the hook does
 * NOT dismiss before the user can interact with it).
 */
export function isInsideOverlay(
  overlayRef: RefObject<Element | null>,
  target: Node | null,
): boolean {
  const node = overlayRef.current;
  if (!node) return true;
  if (!target) return false;
  return node.contains(target);
}

/**
 * `true` when `target` is within `triggerRef.current`. Returns `false` when
 * the ref is missing or `current === null` (no trigger to exclude).
 */
export function isInsideTrigger(
  triggerRef: RefObject<Element | null> | undefined,
  target: Node | null,
): boolean {
  const node = triggerRef?.current;
  if (!node || !target) return false;
  return node.contains(target);
}
