'use client';

import { useRuntimeKernel } from '../RuntimeContext';
import type { DialogController } from './types';

/**
 * Returns the DialogController from the runtime kernel.
 *
 * Throws if `dialogModule()` was not registered in PrismuiProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const dialog = useDialogController();
 *   const handleDelete = async () => {
 *     const confirmed = await dialog.confirm({ title: 'Delete?', content: 'This cannot be undone.' });
 *     if (confirmed) { ... }
 *   };
 * }
 * ```
 */
export function useDialogController(): DialogController {
  const kernel = useRuntimeKernel();
  const controller = kernel.getExposed<DialogController>('dialog');

  if (!controller) {
    throw new Error(
      '[PrismUI Runtime] DialogController not found. ' +
      'Did you add dialogModule() to your PrismuiProvider modules?',
    );
  }

  return controller;
}
