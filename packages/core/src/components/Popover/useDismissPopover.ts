/**
 * `useDismissPopover` · Stage-12 Phase 2 · OQ-OV-3 Decision B 路径首批落地。
 *
 * Contract: `@/devdocs/components/Popover/design.md` v0.1.2 §七
 *
 * Thin wrapper over `useDismissal` (Stage-11 dismissal primitive) that:
 *   · presets the four flat opt-in channels with Popover-friendly defaults
 *     (pointer / escape / scroll = true · focus = OQ-POP-8 临时 false)
 *   · routes `onDismiss` through component-layer side-effects (return-focus
 *     to trigger BEFORE `setOpen(false)` · TR-CROSS-3 评估点 1)
 *   · exposes an `onBeforeDismiss` veto hook (returning `false` cancels)
 *
 * Notes:
 *   · `routeChange` is intentionally NOT modelled here — `useDismissal` does
 *     not expose a route channel. Application layer must call
 *     `onOpenChange(false)` itself when the route changes.
 *   · This hook does NOT swallow the underlying primitive — consumers may
 *     still use `useDismissal` directly when finer control is needed.
 */

import type { RefObject } from 'react';

import {
  useDismissal,
  type DismissalReason,
  type UseDismissalOptions,
} from '../../core/overlay/dismissal';

export interface UseDismissPopoverOptions {
  /** Reactive `open` state — the wrapped `useDismissal` honours `enabled = open`. */
  open: boolean;
  /** Driven setter — invoked synchronously from `onDismiss` after return-focus. */
  onOpenChange: (next: boolean) => void;
  /** Trigger ref · forwarded for self-reflexive exclusion + return-focus target. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Overlay (popover content) ref · forwarded as `useDismissal.overlayRef`. */
  overlayRef: RefObject<HTMLElement | null>;

  // ── flat opt-in channel overrides — match real `useDismissal` shape ─────
  pointerOutside?: UseDismissalOptions['pointerOutside'];
  escapeKey?: boolean;
  focusOutside?: boolean;
  scrollOutside?: boolean;

  /**
   * Optional veto hook · runs BEFORE return-focus + `setOpen(false)`.
   * Return `false` to cancel this dismissal (forwarded to the underlying
   * `useDismissal.onDismiss` cancellation contract).
   */
  onBeforeDismiss?: (reason: DismissalReason, event: Event | null) => boolean | void;
}

/**
 * Popover-flavoured wrapper over `useDismissal`. Returns nothing — all side
 * effects are observed via `onOpenChange` + DOM focus.
 */
export function useDismissPopover(options: UseDismissPopoverOptions): void {
  const {
    open,
    onOpenChange,
    triggerRef,
    overlayRef,
    pointerOutside = true,
    escapeKey = true,
    focusOutside = false, // ⏸️ OQ-POP-8 待锁 · 临时默认 A
    scrollOutside = true,
    onBeforeDismiss,
  } = options;

  useDismissal({
    enabled: open,
    overlayRef,
    triggerRef,
    pointerOutside,
    escapeKey,
    focusOutside,
    scrollOutside,
    onDismiss: (reason, event) => {
      if (onBeforeDismiss) {
        const veto = onBeforeDismiss(reason, event);
        if (veto === false) return false;
      }
      // Return-focus BEFORE state flip — TR-CROSS-3 评估点 1 · X2 不变量。
      // `programmatic-close` reason: triggerRef.focus() is still safe (no-op
      // when ref is null or trigger already has focus).
      triggerRef.current?.focus();
      onOpenChange(false);
      return undefined;
    },
  });
}
