'use client';

import { useRuntimeKernel } from '../RuntimeContext';
import type { ToastController } from './types';

/**
 * Returns the ToastController from the runtime kernel.
 *
 * Throws if `toastModule()` was not registered in PrismuiProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const toast = useToastController();
 *   toast.success('File uploaded');
 *   toast.error('Something went wrong');
 *   toast.promise(uploadFile(), {
 *     loading: { title: 'Uploading...' },
 *     success: { title: 'Done!' },
 *     error: { title: 'Failed' },
 *   });
 * }
 * ```
 */
export function useToastController(): ToastController {
  const kernel = useRuntimeKernel();
  const controller = kernel.getExposed<ToastController>('toast');

  if (!controller) {
    throw new Error(
      '[PrismUI Runtime] ToastController not found. ' +
      'Did you add toastModule() to your PrismuiProvider modules?',
    );
  }

  return controller;
}
