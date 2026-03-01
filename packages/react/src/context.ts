// ---------------------------------------------------------------------------
// RuntimeContext — React Context for the Interaction Runtime
// ---------------------------------------------------------------------------

import { createContext } from 'react';
import type { InteractionRuntime } from '@prismui/core';

/**
 * React Context holding the InteractionRuntime instance.
 * null when outside of PrismUIProvider.
 */
export const RuntimeContext = createContext<InteractionRuntime | null>(null);
