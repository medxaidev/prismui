// ---------------------------------------------------------------------------
// useWorkflow — convenience hook combining reactive workflow state + controller
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import type {
  WorkflowController,
  WorkflowInstance,
  WorkflowDefinition,
  WorkflowResult,
} from '@prismui/core';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';

/** Return type of useWorkflow(). */
export interface UseWorkflowReturn {
  instances: WorkflowInstance[];
  define: (definition: WorkflowDefinition) => void;
  start: (workflowId: string, payload?: Record<string, unknown>) => Promise<WorkflowResult>;
  abort: (instanceId: string) => void;
  getInstance: (instanceId: string) => WorkflowInstance | undefined;
  getDefinitions: () => WorkflowDefinition[];
}

/**
 * Convenience hook for workflow operations.
 * Combines `useRuntimeState()` for reactive `workflowInstances` with `runtime.modules.workflow` for actions.
 */
export function useWorkflow(): UseWorkflowReturn {
  const runtime = useRuntime();
  const state = useRuntimeState();
  const controller = runtime.modules.workflow as WorkflowController;

  const define = useCallback(
    (definition: WorkflowDefinition) => controller.define(definition),
    [controller],
  );
  const start = useCallback(
    (workflowId: string, payload?: Record<string, unknown>) => controller.start(workflowId, payload),
    [controller],
  );
  const abort = useCallback(
    (instanceId: string) => controller.abort(instanceId),
    [controller],
  );
  const getInstance = useCallback(
    (instanceId: string) => controller.getInstance(instanceId),
    [controller],
  );
  const getDefinitions = useCallback(
    () => controller.getDefinitions(),
    [controller],
  );

  // Derived from reactive state for re-render triggers
  const workflowInstances = state.workflowInstances as Record<string, WorkflowInstance> | undefined;
  const instances = workflowInstances ? Object.values(workflowInstances) : [];

  return {
    instances,
    define,
    start,
    abort,
    getInstance,
    getDefinitions,
  };
}
