// ---------------------------------------------------------------------------
// ToastController — Programmatic Layer (Layer 4) Types
// ---------------------------------------------------------------------------

import type { ToastPosition } from '../../../components/ToastBase/ToastBase.context';
import type { ToastSeverity } from '../../../components/Toast/Toast';

/**
 * Options for showing a programmatic toast.
 */
export interface ToastControllerOptions {
  /** Toast title */
  title?: React.ReactNode;

  /** Toast description / message body */
  description?: React.ReactNode;

  /** Severity variant @default 'default' */
  severity?: ToastSeverity;

  /** Custom icon (overrides severity default) */
  icon?: React.ReactNode;

  /** Custom action area (buttons, links) */
  action?: React.ReactNode;

  /** Auto-dismiss duration in ms. 0 = no auto-dismiss. @default 4000 */
  duration?: number;

  /** Whether the close button is shown @default true */
  dismissible?: boolean;

  /** Position override (per-toast, overrides renderer default) */
  position?: ToastPosition;

  /** Called when toast is closed */
  onClose?: () => void;

  /** Called when toast auto-closes */
  onAutoClose?: () => void;
}

/**
 * Options for promise-based toasts.
 */
export interface ToastPromiseOptions<T = unknown> {
  loading: { title?: string; description?: string };
  success:
    | { title?: string; description?: string }
    | ((data: T) => { title?: string; description?: string });
  error:
    | { title?: string; description?: string }
    | ((err: unknown) => { title?: string; description?: string });
  /** Duration for success/error state before auto-dismiss @default 4000 */
  duration?: number;
}

/**
 * Internal representation of a toast instance.
 */
export interface ToastInstance {
  /** Unique identifier */
  id: string;

  /** Options for this toast */
  options: ToastControllerOptions;

  /** Creation timestamp */
  createdAt: number;

  /** For promise toasts: current state */
  promiseState?: 'loading' | 'success' | 'error';

  /** Whether the toast is in loading state */
  loading?: boolean;
}

/**
 * Listener callback for toast state changes.
 */
export type ToastChangeListener = (toasts: ToastInstance[]) => void;

/**
 * Programmatic API for imperative toast control.
 *
 * Registered by `toastModule()` and accessed via `useToastController()`.
 */
export interface ToastController {
  /** Show a toast. Returns the toast id. */
  show(options: ToastControllerOptions): string;

  /** Hide a specific toast by id. */
  hide(id: string): void;

  /** Hide all toasts. */
  hideAll(): void;

  /** Shorthand: show success toast */
  success(title: string, options?: Partial<ToastControllerOptions>): string;

  /** Shorthand: show error toast */
  error(title: string, options?: Partial<ToastControllerOptions>): string;

  /** Shorthand: show warning toast */
  warning(title: string, options?: Partial<ToastControllerOptions>): string;

  /** Shorthand: show info toast */
  info(title: string, options?: Partial<ToastControllerOptions>): string;

  /** Promise toast: loading → success/error */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    options: ToastPromiseOptions<T>,
  ): string;

  /** Update an existing toast */
  update(id: string, options: Partial<ToastControllerOptions>): void;

  /** Get all active toast instances */
  getToasts(): ToastInstance[];

  /** Subscribe to toast state changes. Returns an unsubscribe function. */
  subscribe(listener: ToastChangeListener): () => void;
}
