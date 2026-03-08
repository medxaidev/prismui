// ---------------------------------------------------------------------------
// useUI — convenience hook providing the Interaction DSL
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { createInteractionDSL, type InteractionDSL } from '@prismui/core';
import { useRuntime } from './use-runtime';

/**
 * Convenience hook that returns a memoized InteractionDSL instance.
 * The DSL provides a unified, fluent API for all runtime module controllers.
 */
export function useUI(): InteractionDSL {
  const runtime = useRuntime();
  return useMemo(() => createInteractionDSL(runtime), [runtime]);
}
