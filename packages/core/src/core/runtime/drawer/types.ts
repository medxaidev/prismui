// ---------------------------------------------------------------------------
// DrawerController — Programmatic Layer (Layer 4) Types
// ---------------------------------------------------------------------------

import type { DrawerPosition } from '../../../components/DrawerBase/DrawerBase.context';

/**
 * Options for opening a programmatic drawer.
 */
export interface DrawerControllerOptions {
  /** Drawer title. */
  title?: string;

  /** Drawer body content (rendered as React node by the renderer). */
  content?: React.ReactNode;

  /** Which edge the drawer slides from. @default 'right' */
  position?: DrawerPosition;

  /** Drawer width (left/right) or height (top/bottom). @default 320 */
  size?: number | string;

  /** Whether pressing Escape should close this drawer. @default true */
  closeOnEscape?: boolean;

  /** Whether clicking outside the content should close the drawer. @default true */
  closeOnClickOutside?: boolean;

  /** Whether to show a close button. @default true */
  withCloseButton?: boolean;

  /** Whether to show the overlay backdrop. @default true */
  withOverlay?: boolean;

  /** Called when the drawer is closed. */
  onClose?: () => void;
}

/**
 * Internal representation of a programmatic drawer instance.
 */
export interface DrawerInstance {
  /** Unique identifier. */
  id: string;

  /** Options for this drawer. */
  options: DrawerControllerOptions;
}

/**
 * Listener callback for drawer state changes.
 */
export type DrawerChangeListener = (drawers: DrawerInstance[]) => void;

/**
 * Programmatic API for imperative drawer control.
 *
 * Registered by `drawerModule()` and accessed via `useDrawerController()`.
 */
export interface DrawerController {
  /** Open a drawer with the given options. Returns the drawer id. */
  open(options: DrawerControllerOptions): string;

  /** Close a drawer by id. */
  close(id: string): void;

  /** Close all open drawers. */
  closeAll(): void;

  /** Get all currently open drawer instances. */
  getDrawers(): DrawerInstance[];

  /** Subscribe to drawer state changes. Returns an unsubscribe function. */
  subscribe(listener: DrawerChangeListener): () => void;
}
