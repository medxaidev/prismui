/**
 * Modal · internal Context.
 *
 * Authority: ADR-007 决策 15 + 决策 16 + 决策 8-11.
 *
 * Carries Modal.Root state down to Trigger / Backdrop / Content / Title /
 * Description / Close. Not exported from the package barrel · use the
 * compound `Modal.*` components instead.
 *
 * Mirrors `popover-context.ts` shape · Modal-specific additions:
 *   - `backdropRef` — separate from `contentRef` per OV-MODAL-3 (决策 11
 *     · independent DOM child + independent Presence)
 *   - `titleId` / `descriptionId` — auto-wired aria-labelledby /
 *     aria-describedby chains (议题 E 决策 16)
 *   - `role` — `'dialog' | 'alertdialog'` per 决策 16 (no separate
 *     AlertDialog component · `role` prop forwarded)
 *   - `dismissOnEscape` / `dismissOnBackdropClick` — flat opt-out flags
 *     per 决策 10 (双扁平 prop · 不嵌套对象)
 */

import { createContext, useContext, type RefObject } from 'react';

export type ModalRole = 'dialog' | 'alertdialog';

export interface ModalContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  /** Mutable ref populated by Modal.Trigger · used by useFocusTrap return-focus + useDismissal exclusion. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Mutable ref populated by Modal.Content · trap container + useDismissal overlay boundary. */
  contentRef: RefObject<HTMLElement | null>;
  /** Mutable ref populated by Modal.Backdrop · OV-MODAL-3 independent DOM child. */
  backdropRef: RefObject<HTMLElement | null>;
  /** Auto-generated · attached to Modal.Trigger when no user `id` is provided. */
  triggerId: string;
  /** Auto-generated · attached to Modal.Content `id` (consumed by aria-controls). */
  contentId: string;
  /** Auto-generated · attached to Modal.Title (consumed by Modal.Content aria-labelledby). */
  titleId: string;
  /** Auto-generated · attached to Modal.Description (consumed by Modal.Content aria-describedby). */
  descriptionId: string;
  /** ARIA role · `'dialog'` (default) | `'alertdialog'` (议题 E 决策 16). */
  role: ModalRole;
  /** Whether ESC key dismisses (议题 C 决策 9). Default `true`. */
  dismissOnEscape: boolean;
  /** Whether backdrop click dismisses (议题 C 决策 8). Default `true`. */
  dismissOnBackdropClick: boolean;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext(component: string): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (ctx == null) {
    throw new Error(
      `[PrismUI Modal] \`${component}\` must be rendered inside a \`<Modal.Root>\`.`,
    );
  }
  return ctx;
}
