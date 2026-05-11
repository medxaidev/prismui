/**
 * `useDismissModal` · Modal-flavoured wrapper over `useDismissal`.
 *
 * Authority: ADR-007 决策 8-11 (dismiss 2 channel default-on opt-out) +
 * 议题 D 决策 12 (nested coordination via OV-DISMISS-2 stack reuse).
 *
 * Thin wrapper presetting Modal-specific defaults:
 *   · `pointerOutside` = `dismissOnBackdropClick` (default `true` · 决策 8)
 *   · `escapeKey`      = `dismissOnEscape`         (default `true` · 决策 9)
 *   · `focusOutside`   = `false` (议题 A useFocusTrap traps focus inside
 *                        Modal.Content · focus cannot escape · channel mute)
 *   · `scrollOutside`  = `false` (议题 B 决策 5 ModalScrollLock prevents
 *                        outer page scroll · channel mute)
 *
 * **Pointer-outside semantics for Modal**:
 * `useDismissal.pointerOutside` checks `target ∉ overlayRef && target ∉ triggerRef`.
 * For Modal `overlayRef` = `contentRef`. Backdrop is rendered as a Portal
 * sibling of Content (per OV-MODAL-3) · so a click on Backdrop has
 * `target ∉ contentRef && target ∉ triggerRef` → fires `pointer-outside`
 * dismiss naturally. No special backdrop click handler needed.
 *
 * **Return-focus**: NOT handled here. Modal uses `useFocusTrap` (Phase 7a)
 * which captures pre-activation focus and restores on cleanup. That covers
 * all dismiss channels (pointer / escape / programmatic) uniformly. This
 * differs from `useDismissPopover` which manually focuses `triggerRef` —
 * Popover has no focus trap, so dismissal must drive return-focus directly.
 *
 * **Stack semantics (议题 D 决策 12)**: `useDismissal` registers in
 * Stage-11 `DismissalStack` when `escapeKey || pointerOutside` is true.
 * Nested Modals stack naturally · only the top entry receives ESC /
 * pointer-outside · OV-DISMISS-2 invariant satisfied.
 */

import type { RefObject } from 'react';

import {
  useDismissal,
  type DismissalReason,
  type UseDismissalOptions,
} from '../../core/overlay/dismissal';

export interface UseDismissModalOptions {
  /** Reactive `open` state · forwards as `useDismissal.enabled = open`. */
  open: boolean;
  /** Driven setter · invoked synchronously from `onDismiss`. */
  onOpenChange: (next: boolean) => void;
  /** Modal.Trigger ref · forwarded for self-reflexive exclusion. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Modal.Content ref · forwarded as `useDismissal.overlayRef`. */
  contentRef: RefObject<HTMLElement | null>;
  /** ESC dismissal channel · default `true` per ADR 决策 9. */
  dismissOnEscape?: boolean;
  /** Backdrop click dismissal channel · default `true` per ADR 决策 8. */
  dismissOnBackdropClick?: boolean;
  /**
   * Optional veto · runs BEFORE `setOpen(false)`. Return `false` to cancel.
   * Forwarded to `useDismissal.onDismiss` cancellation contract.
   */
  onBeforeDismiss?: (reason: DismissalReason, event: Event | null) => boolean | void;
}

export function useDismissModal(options: UseDismissModalOptions): void {
  const {
    open,
    onOpenChange,
    triggerRef,
    contentRef,
    dismissOnEscape = true,
    dismissOnBackdropClick = true,
    onBeforeDismiss,
  } = options;

  // Map flat Modal flags to underlying useDismissal channels.
  const pointerOutside: UseDismissalOptions['pointerOutside'] = dismissOnBackdropClick;
  const escapeKey = dismissOnEscape;

  useDismissal({
    enabled: open,
    overlayRef: contentRef,
    triggerRef,
    pointerOutside,
    escapeKey,
    focusOutside: false, // useFocusTrap covers this channel.
    scrollOutside: false, // ModalScrollLock covers this channel.
    onDismiss: (reason, event) => {
      if (onBeforeDismiss) {
        const veto = onBeforeDismiss(reason, event);
        if (veto === false) return false;
      }
      // Return-focus handled by useFocusTrap cleanup · do NOT focus trigger
      // here (would race against the trap's queueMicrotask restore path).
      onOpenChange(false);
      return undefined;
    },
  });
}
