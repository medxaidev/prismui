// ---------------------------------------------------------------------------
// useAsync — convenience hook combining reactive async state + controller
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import type { AsyncController, AsyncOperation, AsyncStatus } from '@prismui/core';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';

/** Return type of useAsync(). */
export interface UseAsyncReturn {
  operations: Record<string, AsyncOperation>;
  start: (operationId: string) => void;
  success: (operationId: string, data?: unknown) => void;
  error: (operationId: string, error: string) => void;
  reset: (operationId: string) => void;
  getOperation: (operationId: string) => AsyncOperation | undefined;
  getStatus: (operationId: string) => AsyncStatus;
  isLoading: (operationId: string) => boolean;
  isAnyLoading: () => boolean;
}

/**
 * Convenience hook for async operations.
 * Combines `useRuntimeState()` for reactive async state with `runtime.modules.async` for actions.
 */
export function useAsync(): UseAsyncReturn {
  const runtime = useRuntime();
  const state = useRuntimeState();
  const controller = runtime.modules.async as AsyncController;

  const start = useCallback((operationId: string) => controller.start(operationId), [controller]);
  const success = useCallback(
    (operationId: string, data?: unknown) => controller.success(operationId, data),
    [controller],
  );
  const error = useCallback(
    (operationId: string, err: string) => controller.error(operationId, err),
    [controller],
  );
  const reset = useCallback((operationId: string) => controller.reset(operationId), [controller]);
  const getOperation = useCallback(
    (operationId: string) => controller.getOperation(operationId),
    [controller],
  );
  const getStatus = useCallback(
    (operationId: string) => controller.getStatus(operationId),
    [controller],
  );
  const isLoading = useCallback(
    (operationId: string) => controller.isLoading(operationId),
    [controller],
  );
  const isAnyLoading = useCallback(() => controller.isAnyLoading(), [controller]);

  return {
    operations: (state.asyncOperations ?? {}) as Record<string, AsyncOperation>,
    start,
    success,
    error,
    reset,
    getOperation,
    getStatus,
    isLoading,
    isAnyLoading,
  };
}
