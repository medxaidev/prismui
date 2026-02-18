'use client';

import { useRuntimeKernel } from '../RuntimeContext';
import type { OverlayManager } from './types';

/**
 * Returns the OverlayManager from the runtime kernel.
 *
 * Throws if `overlayModule()` was not registered in PrismuiProvider.
 *
 * @example
 * ```tsx
 * function MyOverlayComponent() {
 *   const manager = useOverlayManager();
 *   const stack = manager.getStack();
 *   // ...
 * }
 * ```
 */
export function useOverlayManager(): OverlayManager {
  const kernel = useRuntimeKernel();
  const manager = kernel.get<OverlayManager>('overlay');

  if (!manager) {
    throw new Error(
      '[PrismUI Runtime] OverlayManager not found. ' +
      'Did you add overlayModule() to your PrismuiProvider modules?',
    );
  }

  return manager;
}
