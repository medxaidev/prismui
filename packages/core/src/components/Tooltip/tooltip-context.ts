/**
 * Tooltip · internal Context.
 *
 * Carries the Tooltip.Root state and timing scheduler down to Trigger + Content.
 * Not exported from the package barrel · use the compound `Tooltip.Trigger` /
 * `Tooltip.Content` components instead.
 */

import { createContext, useContext, type RefObject } from 'react';

export interface TooltipContextValue {
  open: boolean;
  /**
   * Imperative open/close · cancels any pending schedule. Used by Esc keydown
   * (component-layer · §6.5.1) and focus path (§5.2 · immediate open).
   */
  setOpen: (next: boolean) => void;
  /** Mutable ref populated by Tooltip.Trigger. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Mutable ref populated by Tooltip.Content. */
  contentRef: RefObject<HTMLElement | null>;
  triggerId: string;
  contentId: string;
  /** Hover-path open delay · default 500ms (Round 1 OQ-TT-1 = C). */
  openDelay: number;
  /** Symmetric close delay · default 150ms (Round 1 OQ-TT-2 / OV-DISMISS-9). */
  closeDelay: number;
  /** Schedule open after `openDelay` · cancels any pending schedule first. */
  scheduleOpen: () => void;
  /** Schedule close after `closeDelay` · cancels any pending schedule first. */
  scheduleClose: () => void;
  /**
   * Cancel any pending open/close schedule without flipping state. Invoked by
   * the focus path (which then opens immediately) and on unmount.
   */
  cancelSchedule: () => void;
}

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltipContext(component: string): TooltipContextValue {
  const ctx = useContext(TooltipContext);
  if (ctx == null) {
    throw new Error(
      `[PrismUI Tooltip] \`${component}\` must be rendered inside a \`<Tooltip.Root>\`.`,
    );
  }
  return ctx;
}
