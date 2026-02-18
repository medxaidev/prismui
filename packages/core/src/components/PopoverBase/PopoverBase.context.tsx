'use client';

import { createContext, useContext } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PopoverBasePosition =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export interface PopoverBaseContextValue {
  /** Whether the popover is currently open. */
  opened: boolean;

  /** Callback to close the popover. */
  onClose: () => void;

  /** Callback to open the popover. */
  onOpen: () => void;

  /** Callback to toggle the popover. */
  onToggle: () => void;

  /** The z-index allocated for this popover. */
  zIndex: number;

  /** Popover position relative to target. */
  position: PopoverBasePosition;

  /** Whether to show an arrow. */
  withArrow: boolean;

  /** Offset from the target element in px. */
  offset: number;

  /** Ref setter for the target element. */
  setTargetRef: (node: HTMLElement | null) => void;

  /** Ref setter for the dropdown element. */
  setDropdownRef: (node: HTMLDivElement | null) => void;

  /** Unique id for the popover (used for aria attributes). */
  popoverId: string;

  /** Whether the popover is disabled. */
  disabled: boolean;

  /** Whether to render within a portal. */
  withinPortal: boolean;

  /** Transition duration in ms. */
  transitionDuration: number;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const PopoverBaseContext = createContext<PopoverBaseContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePopoverBaseContext(): PopoverBaseContextValue {
  const ctx = useContext(PopoverBaseContext);
  if (!ctx) {
    throw new Error(
      '[PrismUI] usePopoverBaseContext must be used within a <PopoverBase>. ' +
      'Make sure your component is a child of PopoverBase.',
    );
  }
  return ctx;
}
