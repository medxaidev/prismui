// ---------------------------------------------------------------------------
// PrismUIProvider — bridges InteractionRuntime to React tree via Context
// ---------------------------------------------------------------------------

import type { ReactNode } from 'react';
import type { InteractionRuntime } from '@prismui/core';
import { RuntimeContext } from './context';

/** Props for PrismUIProvider. */
export interface PrismUIProviderProps {
  /** The InteractionRuntime instance to provide to the React tree. */
  runtime: InteractionRuntime;
  children: ReactNode;
}

/**
 * PrismUIProvider stores the runtime in React Context.
 * It does NOT create a runtime internally — the caller is responsible for that.
 */
export function PrismUIProvider({ runtime, children }: PrismUIProviderProps) {
  return (
    <RuntimeContext.Provider value={runtime}>
      {children}
    </RuntimeContext.Provider>
  );
}
