/**
 * `useTooltipDismissal` · Stage-11 Phase 6 · OQ-OV-3 Decision B 路径第二批落地。
 *
 * Contract: `@/devdocs/components/Tooltip/design.md` v0.5 §七 +
 *           `@/devdocs/system/dismissal-primitive.md` v0.1.4 §8.3
 *
 * Thin wrapper over `useDismissal` (Stage-11 dismissal primitive) that:
 *   · presets exactly ONE Tooltip-friendly default channel (scrollOutside = true)
 *   · DOES NOT preset escape-key (Tooltip Esc handled by Trigger keydown · v0.5 [Esc])
 *   · DOES NOT preset pointerOutside (Tooltip uses hover-leave timer · v0.5 [Timing])
 *   · DOES NOT preset focusOutside (Tooltip does not accept focus · v0.5 §1.3)
 *
 * Notes:
 *   · OQ-TT-6 Round 1 locked v0.4 = A (provide hook) with downgrade clause —
 *     v0.5 Round 2 评审决议 · hook 保留（与 useDismissPopover surface 对称）·
 *     v1.x 重评阈值 = ≥2 例业务消费仅用 default · 触发 inline 化评估。
 *   · openDelay / closeDelay / hover-leave / blur are NOT this hook's concern;
 *     they live on `Tooltip.Root` (component-layer scheduler · v0.5 [Timing]).
 *   · Esc nested-scenario arbitration locked v0.5 = path 3 (APG either-may-close) ·
 *     Tooltip.Trigger.onKeyDown intentionally does NOT stopPropagation · single Esc
 *     closes both Tooltip and parent overlay (e.g. Popover) by design.
 */

import type { RefObject } from 'react';

import {
  useDismissal,
  type DismissalReason,
} from '../../core/overlay/dismissal';

export interface UseTooltipDismissalOptions {
  /** Reactive `open` state · `useDismissal.enabled = open`. */
  open: boolean;
  /** Driven setter · invoked synchronously from `onDismiss`. */
  onOpenChange: (next: boolean) => void;
  /** Trigger ref · self-reflexive exclusion target. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Overlay ref · forwarded as `useDismissal.overlayRef`. */
  overlayRef: RefObject<HTMLElement | null>;

  /**
   * `scroll-outside` channel opt-in · default `true` (the only channel this
   * hook enables on Tooltip's behalf).
   */
  scrollOutside?: boolean;

  /**
   * Optional veto hook · runs before `onOpenChange(false)`.
   * Return `false` to cancel this dismissal.
   *
   * Note: this veto only sees `'scroll-outside'` (and `'programmatic-close'`
   * if a consumer manually invokes the primitive's `close()`). Esc / pointer /
   * focus channels are unsubscribed at this layer · v0.4 [Hook].
   */
  onBeforeDismiss?: (reason: DismissalReason, event: Event | null) => boolean | void;
}

/**
 * Tooltip-flavoured wrapper over `useDismissal`. v1 only opts the
 * `scroll-outside` channel in by default.
 */
export function useTooltipDismissal(options: UseTooltipDismissalOptions): void {
  const {
    open,
    onOpenChange,
    triggerRef,
    overlayRef,
    scrollOutside = true,
    onBeforeDismiss,
  } = options;

  useDismissal({
    enabled: open,
    overlayRef,
    triggerRef,
    // v0.4 [Hook]: pointer / escape / focus are intentionally OFF at this
    // layer. They are either component-layer responsibilities (Esc, hover) or
    // not applicable to Tooltip (focus-outside · Tooltip never accepts focus).
    pointerOutside: false,
    escapeKey: false,
    focusOutside: false,
    scrollOutside,
    onDismiss: (reason, event) => {
      if (onBeforeDismiss) {
        const veto = onBeforeDismiss(reason, event);
        if (veto === false) return false;
      }
      onOpenChange(false);
      return undefined;
    },
  });
}
