import type { PrismuiModule } from '../types';
import { createDialogController } from './DialogController';

// ---------------------------------------------------------------------------
// Module factory
// ---------------------------------------------------------------------------

/**
 * Creates the Dialog runtime module.
 *
 * Registers a `DialogController` in the kernel and exposes it for
 * component access via `useDialogController()`.
 *
 * @example
 * ```tsx
 * <PrismuiProvider modules={[overlayModule(), dialogModule()]}>
 *   <App />
 *   <DialogRenderer />
 * </PrismuiProvider>
 * ```
 */
export function dialogModule(): PrismuiModule {
  return {
    name: 'dialog',

    setup(kernel) {
      const controller = createDialogController();
      kernel.register('dialog', controller);
      kernel.expose('dialog', controller);
    },
  };
}
