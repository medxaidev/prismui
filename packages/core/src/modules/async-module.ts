// ---------------------------------------------------------------------------
// Async Module — Built-in Interaction Module (Layer 0.5)
// Manages async operation lifecycle: idle → loading → success/error.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeStore } from '../store';
import { createModuleActions } from '../action-types';

// ── Types ─────────────────────────────────────────────────────────────

/** Status of an async operation. */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/** A single async operation entry. */
export interface AsyncOperation {
  status: AsyncStatus;
  data: unknown;
  error: string | null;
  startedAt: number | null;
  completedAt: number | null;
}

/** State slice contributed by the Async Module. */
export interface AsyncModuleState {
  asyncOperations: Record<string, AsyncOperation>;
}

/** Controller API for the Async Module. */
export interface AsyncController {
  start(operationId: string): void;
  success(operationId: string, data?: unknown): void;
  error(operationId: string, error: string): void;
  reset(operationId: string): void;
  getOperation(operationId: string): AsyncOperation | undefined;
  getStatus(operationId: string): AsyncStatus;
  isLoading(operationId: string): boolean;
  isAnyLoading(): boolean;
}

// ── Events ────────────────────────────────────────────────────────────

// Event type constants (namespaced)
const AsyncActions = createModuleActions('async', {
  START: 'start',
  SUCCESS: 'success',
  ERROR: 'error',
  RESET: 'reset',
});

export { AsyncActions };

/** @deprecated Use AsyncActions — kept for backward compatibility */
export const ASYNC_START = AsyncActions.START;
/** @deprecated Use AsyncActions — kept for backward compatibility */
export const ASYNC_SUCCESS = AsyncActions.SUCCESS;
/** @deprecated Use AsyncActions — kept for backward compatibility */
export const ASYNC_ERROR = AsyncActions.ERROR;
/** @deprecated Use AsyncActions — kept for backward compatibility */
export const ASYNC_RESET = AsyncActions.RESET;

// ── Module Factory ────────────────────────────────────────────────────

export function createAsyncModule(): RuntimeModule<AsyncController> {
  return {
    name: 'async',

    initialState: {
      asyncOperations: {} as Record<string, AsyncOperation>,
    },

    reducers: {
      [AsyncActions.START]: (event, prevState) => {
        const { operationId } = event.payload as { operationId: string };
        const ops = prevState.asyncOperations as Record<string, AsyncOperation>;

        return {
          nextState: {
            ...prevState,
            asyncOperations: {
              ...ops,
              [operationId]: {
                status: 'loading' as AsyncStatus,
                data: ops[operationId]?.data ?? null,
                error: null,
                startedAt: Date.now(),
                completedAt: null,
              },
            },
          },
        };
      },

      [AsyncActions.SUCCESS]: (event, prevState) => {
        const { operationId, data } = event.payload as {
          operationId: string;
          data?: unknown;
        };
        const ops = prevState.asyncOperations as Record<string, AsyncOperation>;
        const existing = ops[operationId];
        if (!existing) return { nextState: prevState };

        return {
          nextState: {
            ...prevState,
            asyncOperations: {
              ...ops,
              [operationId]: {
                ...existing,
                status: 'success' as AsyncStatus,
                data: data ?? null,
                error: null,
                completedAt: Date.now(),
              },
            },
          },
        };
      },

      [AsyncActions.ERROR]: (event, prevState) => {
        const { operationId, error } = event.payload as {
          operationId: string;
          error: string;
        };
        const ops = prevState.asyncOperations as Record<string, AsyncOperation>;
        const existing = ops[operationId];
        if (!existing) return { nextState: prevState };

        return {
          nextState: {
            ...prevState,
            asyncOperations: {
              ...ops,
              [operationId]: {
                ...existing,
                status: 'error' as AsyncStatus,
                error,
                completedAt: Date.now(),
              },
            },
          },
        };
      },

      [AsyncActions.RESET]: (event, prevState) => {
        const { operationId } = event.payload as { operationId: string };
        const ops = { ...(prevState.asyncOperations as Record<string, AsyncOperation>) };
        delete ops[operationId];

        return {
          nextState: {
            ...prevState,
            asyncOperations: ops,
          },
        };
      },
    },

    createController: ({ bus, store }: { bus: EventBus; store: RuntimeStore }) => ({
      start(operationId: string): void {
        bus.dispatch({ type: AsyncActions.START, payload: { operationId } });
      },

      success(operationId: string, data?: unknown): void {
        bus.dispatch({ type: AsyncActions.SUCCESS, payload: { operationId, data } });
      },

      error(operationId: string, error: string): void {
        bus.dispatch({ type: AsyncActions.ERROR, payload: { operationId, error } });
      },

      reset(operationId: string): void {
        bus.dispatch({ type: AsyncActions.RESET, payload: { operationId } });
      },

      getOperation(operationId: string): AsyncOperation | undefined {
        const ops = store.getState().asyncOperations as Record<string, AsyncOperation>;
        return ops[operationId];
      },

      getStatus(operationId: string): AsyncStatus {
        const ops = store.getState().asyncOperations as Record<string, AsyncOperation>;
        return ops[operationId]?.status ?? 'idle';
      },

      isLoading(operationId: string): boolean {
        const ops = store.getState().asyncOperations as Record<string, AsyncOperation>;
        return ops[operationId]?.status === 'loading';
      },

      isAnyLoading(): boolean {
        const ops = store.getState().asyncOperations as Record<string, AsyncOperation>;
        return Object.values(ops).some((op) => op.status === 'loading');
      },
    }),
  };
}
