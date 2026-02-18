'use client';

import { useRuntimeKernel } from '../RuntimeContext';
import type { PopoverController } from './types';

/**
 * Returns the PopoverController from the runtime kernel.
 *
 * Throws if `popoverModule()` was not registered in PrismuiProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const popover = usePopoverController();
 *   const handleClick = () => {
 *     popover.open({ target: buttonRef.current!, content: <Menu /> });
 *   };
 * }
 * ```
 */
export function usePopoverController(): PopoverController {
  const kernel = useRuntimeKernel();
  const controller = kernel.getExposed<PopoverController>('popover');

  if (!controller) {
    throw new Error(
      '[PrismUI Runtime] PopoverController not found. ' +
      'Did you add popoverModule() to your PrismuiProvider modules?',
    );
  }

  return controller;
}
