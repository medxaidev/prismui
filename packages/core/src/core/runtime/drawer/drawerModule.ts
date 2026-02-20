import type { PrismuiModule } from '../types';
import { createDrawerController } from './DrawerController';

// ---------------------------------------------------------------------------
// Module factory
// ---------------------------------------------------------------------------

/**
 * Creates the Drawer runtime module.
 *
 * Registers a `DrawerController` in the kernel and exposes it for
 * component access via `useDrawerController()`.
 *
 * @example
 * ```tsx
 * <PrismuiProvider modules={[overlayModule(), drawerModule()]}>
 *   <App />
 *   <DrawerRenderer />
 * </PrismuiProvider>
 * ```
 */
export function drawerModule(): PrismuiModule {
  return {
    name: 'drawer',

    setup(kernel) {
      const controller = createDrawerController();
      kernel.register('drawer', controller);
      kernel.expose('drawer', controller);
    },
  };
}
