import type { PrismuiModule } from '../types';
import { createToastController } from './ToastController';

// ---------------------------------------------------------------------------
// Module factory
// ---------------------------------------------------------------------------

/**
 * Creates the Toast runtime module.
 *
 * Registers a `ToastController` in the kernel and exposes it for
 * component access via `useToastController()`.
 *
 * @example
 * ```tsx
 * <PrismuiProvider modules={[overlayModule(), toastModule()]}>
 *   <App />
 *   <ToastRenderer />
 * </PrismuiProvider>
 * ```
 */
export function toastModule(): PrismuiModule {
  return {
    name: 'toast',

    setup(kernel) {
      const controller = createToastController();
      kernel.register('toast', controller);
      kernel.expose('toast', controller);
    },
  };
}
