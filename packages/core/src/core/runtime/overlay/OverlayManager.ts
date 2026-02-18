import type { OverlayInstance, OverlayInstanceOptions, OverlayManager } from './types';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export interface CreateOverlayManagerOptions {
  /** Base z-index for the first overlay. Each subsequent overlay gets +10. @default 1000 */
  baseZIndex?: number;
}

/**
 * Creates a new OverlayManager that manages a stack of overlay instances.
 *
 * @example
 * ```ts
 * const manager = createOverlayManager({ baseZIndex: 1000 });
 * manager.register({ id: 'dialog-1', trapFocus: true, closeOnEscape: true, lockScroll: true, onClose: () => {} });
 * manager.getActive(); // { id: 'dialog-1', zIndex: 1000, ... }
 * ```
 */
export function createOverlayManager(
  options?: CreateOverlayManagerOptions,
): OverlayManager {
  const baseZIndex = options?.baseZIndex ?? 1000;
  const stack: OverlayInstance[] = [];

  function allocateZIndex(index: number): number {
    return baseZIndex + index * 10;
  }

  return {
    // -- Stack management ---------------------------------------------------

    register(opts: OverlayInstanceOptions): void {
      // Prevent duplicate registration
      if (stack.some((i) => i.id === opts.id)) return;

      const instance: OverlayInstance = {
        ...opts,
        zIndex: allocateZIndex(stack.length),
      };
      stack.push(instance);
    },

    unregister(id: string): void {
      const index = stack.findIndex((i) => i.id === id);
      if (index !== -1) {
        stack.splice(index, 1);
        // Re-allocate z-indices for remaining items
        for (let i = index; i < stack.length; i++) {
          stack[i].zIndex = allocateZIndex(i);
        }
      }
    },

    getStack(): OverlayInstance[] {
      return [...stack];
    },

    getActive(): OverlayInstance | undefined {
      return stack.length > 0 ? stack[stack.length - 1] : undefined;
    },

    // -- Z-index allocation -------------------------------------------------

    getZIndex(id: string): number {
      const instance = stack.find((i) => i.id === id);
      return instance?.zIndex ?? baseZIndex;
    },

    // -- Event handling -----------------------------------------------------

    handleEscape(): void {
      // Walk from top of stack downward to find the first overlay with closeOnEscape
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].closeOnEscape) {
          stack[i].onClose();
          return;
        }
      }
    },

    // -- Scroll lock coordination -------------------------------------------

    shouldLockScroll(): boolean {
      return stack.some((i) => i.lockScroll);
    },

    // -- Introspection ------------------------------------------------------

    getStackSize(): number {
      return stack.length;
    },
  };
}
