import type { PrismuiModule } from '../types';
import { createPopoverController } from './PopoverController';

// ---------------------------------------------------------------------------
// Module factory
// ---------------------------------------------------------------------------

/**
 * Creates the Popover runtime module.
 *
 * Registers a `PopoverController` in the kernel and exposes it for
 * component access via `usePopoverController()`.
 *
 * @example
 * ```tsx
 * <PrismuiProvider modules={[overlayModule(), popoverModule()]}>
 *   <App />
 *   <PopoverRenderer />
 * </PrismuiProvider>
 * ```
 */
export function popoverModule(): PrismuiModule {
  return {
    name: 'popover',

    setup(kernel) {
      const controller = createPopoverController();
      kernel.register('popover', controller);
      kernel.expose('popover', controller);
    },
  };
}
