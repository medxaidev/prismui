/**
 * Popover · internal Context.
 *
 * Carries the Popover.Root state down to Trigger + Content. Not exported from
 * the package barrel · use the compound `Popover.Trigger` / `Popover.Content`
 * components instead.
 */

import { createContext, useContext, type RefObject } from 'react';

export interface PopoverContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  /** Mutable ref populated by Popover.Trigger · used by useDismissal + return-focus. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Mutable ref populated by Popover.Content · overlay boundary for useDismissal. */
  contentRef: RefObject<HTMLElement | null>;
  triggerId: string;
  contentId: string;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(component: string): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (ctx == null) {
    throw new Error(
      `[PrismUI Popover] \`${component}\` must be rendered inside a \`<Popover.Root>\`.`,
    );
  }
  return ctx;
}
