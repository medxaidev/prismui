'use client';

import { createContext, useContext } from 'react';
import type { RuntimeKernel } from './types';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const RuntimeContext = createContext<RuntimeKernel | null>(null);

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the RuntimeKernel from the nearest PrismuiProvider.
 *
 * Throws if no PrismuiProvider is found in the component tree.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const kernel = useRuntimeKernel();
 *   const overlay = kernel.get<OverlayManager>('overlay');
 *   // ...
 * }
 * ```
 */
export function useRuntimeKernel(): RuntimeKernel {
  const kernel = useContext(RuntimeContext);
  if (!kernel) {
    throw new Error(
      '[PrismUI Runtime] useRuntimeKernel must be used within a <PrismuiProvider>. ' +
      'Make sure your component is wrapped in a PrismuiProvider.',
    );
  }
  return kernel;
}

/**
 * Returns the RuntimeKernel if available, or `null` if no provider is present.
 *
 * Use this in components that should work **with or without** a runtime provider.
 */
export function useRuntimeKernelOptional(): RuntimeKernel | null {
  return useContext(RuntimeContext);
}

/**
 * Retrieves a specific module's service from the runtime kernel.
 *
 * @param name - The module name to look up
 * @returns The module service, or `undefined` if not registered
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const overlay = useRuntimeModule<OverlayManager>('overlay');
 *   if (!overlay) {
 *     console.warn('overlayModule not registered');
 *   }
 * }
 * ```
 */
export function useRuntimeModule<T>(name: string): T | undefined {
  const kernel = useRuntimeKernelOptional();
  return kernel?.get<T>(name);
}

/**
 * Retrieves an exposed API from the runtime kernel.
 *
 * @param name - The exposed API name
 * @returns The exposed API, or `undefined` if not available
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const dialog = useExposedApi<DialogController>('dialog');
 *   // dialog?.confirm({ title: 'Are you sure?' });
 * }
 * ```
 */
export function useExposedApi<T>(name: string): T | undefined {
  const kernel = useRuntimeKernelOptional();
  return kernel?.getExposed<T>(name);
}
