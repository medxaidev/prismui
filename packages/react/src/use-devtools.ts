// ---------------------------------------------------------------------------
// useDevTools — React hook for DevTools controller access — STAGE-007
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';
import type {
  DevToolsController,
  TimelineEntry,
  PerformanceMetrics,
  DevToolsSnapshot,
  StateTreeNode,
} from '@prismui/core';

export interface UseDevToolsReturn {
  /** Whether DevTools module is available */
  available: boolean;
  /** State tree for inspector display */
  stateTree: StateTreeNode | null;
  /** Current timeline entries */
  timeline: TimelineEntry[];
  /** Current performance metrics */
  metrics: PerformanceMetrics | null;
  /** Current snapshots */
  snapshots: DevToolsSnapshot[];
  /** The full DevTools controller (for imperative actions) */
  controller: DevToolsController | null;
}

/**
 * React hook that provides DevTools data reactively.
 * Re-renders on every state change to keep inspector data fresh.
 * Returns `{ available: false }` if the DevTools module is not registered.
 */
export function useDevTools(): UseDevToolsReturn {
  const runtime = useRuntime();
  // Subscribe to state changes to trigger re-renders
  useRuntimeState();

  const controller = useMemo(() => {
    return (runtime.modules.devtools as DevToolsController) ?? null;
  }, [runtime]);

  if (!controller) {
    return {
      available: false,
      stateTree: null,
      timeline: [],
      metrics: null,
      snapshots: [],
      controller: null,
    };
  }

  return {
    available: true,
    stateTree: controller.getStateTree(),
    timeline: controller.getTimeline(),
    metrics: controller.getMetrics(),
    snapshots: controller.getSnapshots(),
    controller,
  };
}
