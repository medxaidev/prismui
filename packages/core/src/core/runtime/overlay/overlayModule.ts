import type { PrismuiModule } from '../types';
import { createOverlayManager } from './OverlayManager';
import type { CreateOverlayManagerOptions } from './OverlayManager';

// ---------------------------------------------------------------------------
// Module factory
// ---------------------------------------------------------------------------

/**
 * Creates the Overlay runtime module.
 *
 * Registers an `OverlayManager` in the kernel and sets up a global
 * `keydown` listener for Escape key handling.
 *
 * @example
 * ```tsx
 * <PrismuiProvider modules={[overlayModule()]}>
 *   <App />
 * </PrismuiProvider>
 * ```
 */
export function overlayModule(options?: CreateOverlayManagerOptions): PrismuiModule {
  let cleanup: (() => void) | null = null;

  return {
    name: 'overlay',

    setup(kernel) {
      const manager = createOverlayManager(options);
      kernel.register('overlay', manager);

      // Global escape handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          manager.handleEscape();
        }
      };

      if (typeof document !== 'undefined') {
        document.addEventListener('keydown', handleKeyDown);
      }

      cleanup = () => {
        if (typeof document !== 'undefined') {
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
    },

    teardown() {
      cleanup?.();
      cleanup = null;
    },
  };
}
