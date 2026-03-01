// ---------------------------------------------------------------------------
// useRuntime — access the full InteractionRuntime from React Context
// ---------------------------------------------------------------------------

import { useContext } from 'react';
import type { InteractionRuntime } from '@prismui/core';
import { RuntimeContext } from './context';

/**
 * Returns the InteractionRuntime instance from the nearest PrismUIProvider.
 * Throws if used outside of a PrismUIProvider.
 */
export function useRuntime(): InteractionRuntime {
  const runtime = useContext(RuntimeContext);
  if (!runtime) {
    throw new Error(
      '[PrismUI] useRuntime must be used within a PrismUIProvider',
    );
  }
  return runtime;
}
