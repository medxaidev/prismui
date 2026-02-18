// ---------------------------------------------------------------------------
// PopoverController — Programmatic Layer (Layer 4) Types
// ---------------------------------------------------------------------------

import type { PopoverBasePosition } from '../../../components/PopoverBase/PopoverBase.context';

/**
 * Options for opening a programmatic popover.
 */
export interface PopoverControllerOptions {
  /** Content to render inside the popover dropdown. */
  content: React.ReactNode;

  /** The target element to anchor the popover to. */
  target: HTMLElement;

  /** Popover position relative to target. @default 'bottom' */
  position?: PopoverBasePosition;

  /** Whether to show an arrow. @default true */
  withArrow?: boolean;

  /** Offset from the target element in px. @default 8 */
  offset?: number;

  /** Whether clicking outside should close the popover. @default true */
  closeOnClickOutside?: boolean;

  /** Whether pressing Escape should close the popover. @default true */
  closeOnEscape?: boolean;

  /** Popover width. */
  width?: number | string;

  /** Additional className for the dropdown. */
  className?: string;
}

/**
 * Internal representation of a programmatic popover instance.
 */
export interface PopoverInstance {
  /** Unique identifier. */
  id: string;

  /** Options for this popover. */
  options: PopoverControllerOptions;
}

/**
 * Listener callback for popover state changes.
 */
export type PopoverChangeListener = (popovers: PopoverInstance[]) => void;

/**
 * Programmatic API for imperative popover control.
 *
 * Registered by `popoverModule()` and accessed via `usePopoverController()`.
 */
export interface PopoverController {
  /** Open a popover with the given options. Returns the popover id. */
  open(options: PopoverControllerOptions): string;

  /** Close a popover by id. */
  close(id: string): void;

  /** Close all open popovers. */
  closeAll(): void;

  /** Get all currently open popover instances. */
  getPopovers(): PopoverInstance[];

  /** Subscribe to popover state changes. Returns an unsubscribe function. */
  subscribe(listener: PopoverChangeListener): () => void;
}
