'use client';

import { useRuntimeKernel } from '../RuntimeContext';
import type { DrawerController } from './types';

/**
 * Returns the DrawerController from the runtime kernel.
 *
 * Throws if `drawerModule()` was not registered in PrismuiProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const drawer = useDrawerController();
 *   const handleOpen = () => {
 *     drawer.open({ title: 'Settings', position: 'right', content: <SettingsPanel /> });
 *   };
 * }
 * ```
 */
export function useDrawerController(): DrawerController {
  const kernel = useRuntimeKernel();
  const controller = kernel.getExposed<DrawerController>('drawer');

  if (!controller) {
    throw new Error(
      '[PrismUI Runtime] DrawerController not found. ' +
      'Did you add drawerModule() to your PrismuiProvider modules?',
    );
  }

  return controller;
}
