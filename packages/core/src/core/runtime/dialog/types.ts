// ---------------------------------------------------------------------------
// DialogController — Programmatic Layer (Layer 4) Types
// ---------------------------------------------------------------------------

/**
 * Options for opening a programmatic dialog.
 */
export interface DialogControllerOptions {
  /** Dialog title. */
  title?: string;

  /** Dialog body content (rendered as text or React node by the renderer). */
  content?: string;

  /** Called when the user confirms. */
  onConfirm?: () => void | Promise<void>;

  /** Called when the user cancels. */
  onCancel?: () => void;

  /** Text for the confirm button. @default 'OK' */
  confirmText?: string;

  /** Text for the cancel button. @default 'Cancel' */
  cancelText?: string;

  /** Whether the dialog can be closed by pressing Escape. @default true */
  closeOnEscape?: boolean;

  /** Whether the dialog can be closed by clicking outside. @default true */
  closeOnClickOutside?: boolean;

  /** Dialog size. @default 440 */
  size?: number | string;

  /** Whether to center the dialog vertically. @default false */
  centered?: boolean;
}

/**
 * Internal representation of a programmatic dialog instance.
 */
export interface DialogInstance {
  /** Unique identifier. */
  id: string;

  /** Options for this dialog. */
  options: DialogControllerOptions;
}

/**
 * Listener callback for dialog state changes.
 */
export type DialogChangeListener = (dialogs: DialogInstance[]) => void;

/**
 * Programmatic API for imperative dialog control.
 *
 * Registered by `dialogModule()` and accessed via `useDialogController()`.
 */
export interface DialogController {
  /** Open a dialog with the given options. Returns the dialog id. */
  open(options: DialogControllerOptions): string;

  /** Close a dialog by id. */
  close(id: string): void;

  /** Close all open dialogs. */
  closeAll(): void;

  /**
   * Open a confirmation dialog. Resolves `true` if confirmed, `false` if cancelled.
   */
  confirm(options: DialogControllerOptions): Promise<boolean>;

  /**
   * Open an alert dialog (no cancel button). Resolves when confirmed.
   */
  alert(options: Omit<DialogControllerOptions, 'onCancel' | 'cancelText'>): Promise<void>;

  /** Get all currently open dialog instances. */
  getDialogs(): DialogInstance[];

  /** Subscribe to dialog state changes. Returns an unsubscribe function. */
  subscribe(listener: DialogChangeListener): () => void;
}
