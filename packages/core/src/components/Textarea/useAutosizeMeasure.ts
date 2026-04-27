/**
 * useAutosizeMeasure — content-driven height hook for Textarea v1.
 *
 * Source of truth: `@/devdocs/components/Textarea/design.md` §9 (v0.3.2).
 *
 * ## Contract (T-4-A · dual-path closure · Round 1 P0-1 · Round 2 P2-1)
 *
 * Single `measure()` closure · two trigger paths · neither path is optional:
 *
 * ```text
 *   Path 1 — layout-effect (mount + deps change)
 *     deps = [autosize, minRows, maxRows, size, value]
 *       · controlled:   value is a real string · deps change on every keystroke
 *       · uncontrolled: value === undefined · does NOT participate in deps
 *
 *   Path 2 — onChange chain (uncontrolled fallback)
 *     Consumer wires `chainHandlers(userOnChange, measure)` on <textarea>
 *     onChange; uncontrolled typing fires measure via this path since Path 1
 *     deps did not change.
 * ```
 *
 * Invariant T-4-A: both paths MUST be wired — removing either breaks the
 * controlled-vs-uncontrolled matrix. See design.md §9.3.1 for the full proof.
 *
 * ## SSR safety
 *
 * Measure effects use `useIsomorphicLayoutEffect` (alias for
 * `useLayoutEffect` in browser, `useEffect` on server). On server there is
 * no DOM, and the component relies on CSS `min-height` (driven by
 * `--input-min-rows` · T-4-B) for baseline. Client hydration's first
 * layout-effect then adopts real content height via `measure()`.
 *
 * ## Cleanup
 *
 * When `autosize` flips from true → false, the hook strips inline
 * `height` and `overflow-y` so the UA default (rows attribute) resumes
 * governance. No cleanup on unmount: React detaches the DOM node.
 *
 * ## Performance
 *
 * · Single layout pass per measurement (write `height:'auto'` → read
 *   `scrollHeight` → write final px). Browsers batch this within the same
 *   animation frame.
 * · No RAF / debounce — design.md §9.1 explicitly rejects both (keystroke
 *   latency budget preserved).
 * · No ResizeObserver v1 (OQ-T-1 deferred). Container width changes that
 *   wrap text differently are out of scope; if the user resizes the window,
 *   the next keystroke re-measures via Path 2.
 */

import * as React from 'react';

import { useIsomorphicLayoutEffect } from '../../core/utils';
import type { PrismuiSize } from '../../core/size';

export interface UseAutosizeMeasureParams {
  /** Textarea DOM ref (consumer-owned · hook only reads `.current`). */
  ref: React.RefObject<HTMLTextAreaElement | null>;
  /** Feature switch. When false, `measure()` early-returns and cleanup runs. */
  autosize: boolean;
  /** Normalized min rows (T-8 · guaranteed ≥ 1, integer, finite). */
  minRows: number;
  /** Normalized max rows (T-8 · ≥ minRows, integer OR `Infinity`). */
  maxRows: number;
  /**
   * Size tier. Drives Path 1 re-measure when size changes (line-height /
   * padding-y depend on size · re-measure required).
   */
  size: PrismuiSize;
  /**
   * Controlled value. For controlled Textarea this is the user's value
   * string; for uncontrolled it is `undefined` and never triggers Path 1
   * (see §9.3.1 non-controlled matrix row).
   */
  value: unknown;
}

/**
 * Measure textarea content height and write the clamped px back as inline
 * `style.height`. Returns the `measure()` callback so the consumer can wire
 * it into `onChange` via `chainHandlers` (Path 2).
 */
export function useAutosizeMeasure({
  ref,
  autosize,
  minRows,
  maxRows,
  size,
  value,
}: UseAutosizeMeasureParams): () => void {
  // ── Latest deps in a ref so `measure()` is referentially stable ──────────
  //
  // `measure()` is spread into the onChange handler via chainHandlers every
  // render. If measure were re-created on every render, the textarea would
  // receive a new onChange function each render — harmless for React, but it
  // would also invalidate any downstream memo. The ref-latch keeps measure's
  // identity tied only to `ref` (stable) while letting the body read current
  // values (design.md §9.2 "稳定回调" requirement).
  const depsRef = React.useRef({ autosize, minRows, maxRows });
  useIsomorphicLayoutEffect(() => {
    depsRef.current = { autosize, minRows, maxRows };
  });

  // ── Single closure consumed by both paths (T-4-A) ────────────────────────
  const measure = React.useCallback(() => {
    const { autosize: on, minRows: lo, maxRows: hi } = depsRef.current;
    if (!on) return;
    const el = ref.current;
    if (!el) return;

    // Read computed typography / box metrics from the LIVE node so resolver-
    // driven tokens (font-size · line-height · padding-y) are authoritative.
    // This keeps measure in lock-step with the CSS min-height formula
    // (design.md §6.2 T-4-B).
    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || 0;
    const paddingY =
      parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const borderY =
      parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

    // Round-trip via 'auto' so scrollHeight reflects intrinsic content rather
    // than the previously-written clamped height. Single-frame mutation —
    // browsers batch sync style writes before layout.
    el.style.height = 'auto';
    const naturalContentH = el.scrollHeight; // incl paddingY · excl borderY

    // Row → px via line-height × rows + paddingY · matches §6.2 CSS formula.
    const minH = Math.ceil(lineHeight * lo + paddingY);
    const maxH = hi === Infinity
      ? Infinity
      : Math.ceil(lineHeight * hi + paddingY);
    const clampedH = Math.min(Math.max(naturalContentH, minH), maxH);

    // Final write: clamped content height + borderY (scrollHeight excludes
    // border · we add it back so the box-model total matches natural layout).
    el.style.height = `${clampedH + borderY}px`;
    // Overflow-y:'hidden' while within maxRows prevents scrollbars during
    // normal growth; flip to 'auto' when content exceeds maxRows so the user
    // can scroll within the capped box (§8.2 design contract).
    el.style.overflowY = naturalContentH > maxH ? 'auto' : 'hidden';
  }, [ref]);

  // ── Path 1 · mount + deps (autosize / minRows / maxRows / size / value) ──
  //
  // Controlled textarea: `value` is a string · changes on every keystroke ·
  // Path 1 fires ahead of paint, so the grown height is painted atomically
  // with the new character (no flicker).
  //
  // Uncontrolled textarea: `value === undefined` — deps list never changes
  // on typing; measure is still fired on `autosize` / `minRows` / `maxRows` /
  // `size` changes plus initial mount. Typing is handled by Path 2.
  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure, autosize, minRows, maxRows, size, value]);

  // ── Cleanup · autosize true → false transition ───────────────────────────
  //
  // Leaving autosize mode must strip the inline `height` / `overflow-y` the
  // hook previously wrote; otherwise the textarea would freeze at the last
  // measured height instead of reverting to rows-attribute default behavior.
  useIsomorphicLayoutEffect(() => {
    if (autosize) return;
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty('height');
    el.style.removeProperty('overflow-y');
  }, [autosize, ref]);

  return measure;
}
