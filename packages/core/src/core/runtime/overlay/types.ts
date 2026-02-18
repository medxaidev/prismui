// ---------------------------------------------------------------------------
// Overlay Runtime System — Types
// ---------------------------------------------------------------------------

/**
 * Represents a single overlay instance in the stack.
 *
 * Created by `useOverlay` when an overlay opens, and removed when it closes.
 */
export interface OverlayInstance {
  /** Unique identifier for this overlay instance. */
  id: string;

  /** Allocated z-index for stacking. */
  zIndex: number;

  /** Whether this overlay should trap keyboard focus. */
  trapFocus: boolean;

  /** Whether pressing Escape should close this overlay. */
  closeOnEscape: boolean;

  /** Whether this overlay should lock body scroll. */
  lockScroll: boolean;

  /** Callback to close this overlay. */
  onClose: () => void;
}

/**
 * Options for creating an OverlayInstance (z-index is allocated by the manager).
 */
export type OverlayInstanceOptions = Omit<OverlayInstance, 'zIndex'>;

// ---------------------------------------------------------------------------
// OverlayManager interface
// ---------------------------------------------------------------------------

/**
 * Manages a stack of overlay instances with z-index allocation,
 * escape key handling, and scroll lock coordination.
 *
 * Created by `overlayModule()` and registered in the RuntimeKernel.
 */
export interface OverlayManager {
  // -- Stack management -----------------------------------------------------

  /** Register an overlay instance onto the stack. */
  register(instance: OverlayInstanceOptions): void;

  /** Remove an overlay instance from the stack by id. */
  unregister(id: string): void;

  /** Get a shallow copy of the current overlay stack (bottom → top). */
  getStack(): OverlayInstance[];

  /** Get the topmost (active) overlay, or undefined if stack is empty. */
  getActive(): OverlayInstance | undefined;

  // -- Z-index allocation ---------------------------------------------------

  /** Get the allocated z-index for a specific overlay by id. */
  getZIndex(id: string): number;

  // -- Event handling -------------------------------------------------------

  /**
   * Handle an Escape key press.
   * Closes the topmost overlay that has `closeOnEscape: true`.
   */
  handleEscape(): void;

  // -- Scroll lock coordination ---------------------------------------------

  /** Returns true if any overlay in the stack requires scroll lock. */
  shouldLockScroll(): boolean;

  // -- Introspection --------------------------------------------------------

  /** Returns the number of overlays in the stack. */
  getStackSize(): number;
}
