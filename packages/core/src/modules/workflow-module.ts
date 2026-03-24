// ---------------------------------------------------------------------------
// Workflow Module — Built-in Interaction Module (Layer 0.5)
// Declarative multi-step workflow orchestration engine.
// Inspired by XState concepts (states, context, guards) but implemented as
// a lightweight step-sequence executor integrated with PrismUI modules.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeStore } from '../store';
import type { NotificationType } from './notification-module';
import { createModuleActions } from '../action-types';
import { ModalActions } from './modal-module';
import { NotificationActions } from './notification-module';

// ── Types ─────────────────────────────────────────────────────────────

/** Context passed through workflow steps — accumulates payload and results. */
export interface WorkflowContext {
  workflowId: string;
  instanceId: string;
  payload: Record<string, unknown>;
  results: Record<string, unknown>;
  currentStepIndex: number;
}

/** Error handling action for async/custom steps. */
export interface ErrorAction {
  action: 'abort' | 'skip' | 'continue';
  notify?: string | { type: NotificationType; message: string };
}

/** Base step interface — shared by all step types. */
export interface StepBase {
  id: string;
  /** Guard: skip this step if condition returns false. */
  condition?: (ctx: WorkflowContext) => boolean;
  /** Called before step execution. */
  onEnter?: (ctx: WorkflowContext) => void;
  /** Called after step completion (not called on error/skip). */
  onExit?: (ctx: WorkflowContext) => void;
}

/** Async step — executes a Promise-returning function. */
export interface AsyncStep extends StepBase {
  type: 'async';
  execute: (ctx: WorkflowContext) => Promise<unknown>;
  onError?: ErrorAction;
}

/** Confirm step — opens a modal and waits for user confirmation. */
export interface ConfirmStep extends StepBase {
  type: 'confirm';
  modalId: string;
  /** What to do if user rejects. Default: 'abort'. */
  onReject?: 'abort' | 'skip';
}

/** Notify step — sends a notification and continues immediately. */
export interface NotifyStep extends StepBase {
  type: 'notify';
  notification:
  | { type: NotificationType; message: string }
  | ((ctx: WorkflowContext) => { type: NotificationType; message: string });
}

/** Custom step — user-provided sync or async function. */
export interface CustomStep extends StepBase {
  type: 'custom';
  execute: (ctx: WorkflowContext) => unknown | Promise<unknown>;
  onError?: ErrorAction;
}

/** Union of all step types. */
export type WorkflowStep = AsyncStep | ConfirmStep | NotifyStep | CustomStep;

/** Workflow definition — registered by ID. */
export interface WorkflowDefinition {
  id: string;
  steps: WorkflowStep[];
}

/** Status of a workflow instance. */
export type WorkflowStatus = 'idle' | 'running' | 'completed' | 'failed' | 'aborted';

/** Status of an individual step. */
export type StepStatus = 'pending' | 'running' | 'completed' | 'skipped' | 'failed';

/** Tracked state for a single step within an instance. */
export interface StepState {
  id: string;
  type: string;
  status: StepStatus;
  result?: unknown;
  error?: string;
}

/** Runtime state for a single workflow instance. */
export interface WorkflowInstance {
  instanceId: string;
  workflowId: string;
  status: WorkflowStatus;
  payload: Record<string, unknown>;
  results: Record<string, unknown>;
  steps: StepState[];
  currentStepIndex: number;
  error?: string;
  startedAt: number;
  completedAt?: number;
}

/** Result returned when a workflow completes. */
export interface WorkflowResult {
  instanceId: string;
  status: 'completed' | 'failed' | 'aborted';
  results: Record<string, unknown>;
  error?: string;
}

/** State slice contributed by the Workflow Module. */
export interface WorkflowModuleState {
  workflowInstances: Record<string, WorkflowInstance>;
}

/** Controller API for the Workflow Module. */
export interface WorkflowController {
  define(definition: WorkflowDefinition): void;
  start(workflowId: string, payload?: Record<string, unknown>): Promise<WorkflowResult>;
  abort(instanceId: string): void;
  getInstances(): WorkflowInstance[];
  getInstance(instanceId: string): WorkflowInstance | undefined;
  getDefinitions(): WorkflowDefinition[];
}

// ── Events ────────────────────────────────────────────────────────────

// Event type constants (namespaced)
const WorkflowActions = createModuleActions('workflow', {
  START: 'start',
  STEP_START: 'stepStart',
  STEP_COMPLETE: 'stepComplete',
  STEP_SKIP: 'stepSkip',
  STEP_FAIL: 'stepFail',
  COMPLETE: 'complete',
  FAIL: 'fail',
  ABORT: 'abort',
});

export { WorkflowActions };

/** @deprecated Use WorkflowActions — kept for backward compatibility */
export const WORKFLOW_START = WorkflowActions.START;
/** @deprecated Use WorkflowActions — kept for backward compatibility */
export const WORKFLOW_STEP_START = WorkflowActions.STEP_START;
/** @deprecated Use WorkflowActions — kept for backward compatibility */
export const WORKFLOW_STEP_COMPLETE = WorkflowActions.STEP_COMPLETE;
/** @deprecated Use WorkflowActions — kept for backward compatibility */
export const WORKFLOW_STEP_SKIP = WorkflowActions.STEP_SKIP;
/** @deprecated Use WorkflowActions — kept for backward compatibility */
export const WORKFLOW_STEP_FAIL = WorkflowActions.STEP_FAIL;
/** @deprecated Use WorkflowActions — kept for backward compatibility */
export const WORKFLOW_COMPLETE = WorkflowActions.COMPLETE;
/** @deprecated Use WorkflowActions — kept for backward compatibility */
export const WORKFLOW_FAIL = WorkflowActions.FAIL;
/** @deprecated Use WorkflowActions — kept for backward compatibility */
export const WORKFLOW_ABORT = WorkflowActions.ABORT;

// ── Helpers ───────────────────────────────────────────────────────────

let instanceCounter = 0;

function generateInstanceId(workflowId: string): string {
  return `${workflowId}:${++instanceCounter}`;
}

/** Reset counter (for testing). */
export function _resetInstanceCounter(): void {
  instanceCounter = 0;
}

// ── Module Factory ────────────────────────────────────────────────────

export function createWorkflowModule(): RuntimeModule<WorkflowController> {
  const definitions = new Map<string, WorkflowDefinition>();
  // Track abort signals per instance
  const abortSignals = new Map<string, boolean>();

  return {
    name: 'workflow',

    initialState: {
      workflowInstances: {} as Record<string, WorkflowInstance>,
    },

    reducers: {
      [WorkflowActions.START]: (event, prevState) => {
        const instance = event.payload as WorkflowInstance;
        const instances = prevState.workflowInstances as Record<string, WorkflowInstance>;
        return {
          nextState: {
            ...prevState,
            workflowInstances: { ...instances, [instance.instanceId]: instance },
          },
        };
      },

      [WorkflowActions.STEP_START]: (event, prevState) => {
        const { instanceId, stepIndex } = event.payload as {
          instanceId: string;
          stepIndex: number;
        };
        const instances = prevState.workflowInstances as Record<string, WorkflowInstance>;
        const instance = instances[instanceId];
        if (!instance) return { nextState: prevState };

        const steps = [...instance.steps];
        steps[stepIndex] = { ...steps[stepIndex], status: 'running' as StepStatus };

        return {
          nextState: {
            ...prevState,
            workflowInstances: {
              ...instances,
              [instanceId]: { ...instance, steps, currentStepIndex: stepIndex },
            },
          },
        };
      },

      [WorkflowActions.STEP_COMPLETE]: (event, prevState) => {
        const { instanceId, stepIndex, result } = event.payload as {
          instanceId: string;
          stepIndex: number;
          result?: unknown;
        };
        const instances = prevState.workflowInstances as Record<string, WorkflowInstance>;
        const instance = instances[instanceId];
        if (!instance) return { nextState: prevState };

        const steps = [...instance.steps];
        const stepId = steps[stepIndex].id;
        steps[stepIndex] = { ...steps[stepIndex], status: 'completed' as StepStatus, result };

        const results = { ...instance.results, [stepId]: result };

        return {
          nextState: {
            ...prevState,
            workflowInstances: {
              ...instances,
              [instanceId]: { ...instance, steps, results },
            },
          },
        };
      },

      [WorkflowActions.STEP_SKIP]: (event, prevState) => {
        const { instanceId, stepIndex } = event.payload as {
          instanceId: string;
          stepIndex: number;
        };
        const instances = prevState.workflowInstances as Record<string, WorkflowInstance>;
        const instance = instances[instanceId];
        if (!instance) return { nextState: prevState };

        const steps = [...instance.steps];
        steps[stepIndex] = { ...steps[stepIndex], status: 'skipped' as StepStatus };

        return {
          nextState: {
            ...prevState,
            workflowInstances: {
              ...instances,
              [instanceId]: { ...instance, steps },
            },
          },
        };
      },

      [WorkflowActions.STEP_FAIL]: (event, prevState) => {
        const { instanceId, stepIndex, error } = event.payload as {
          instanceId: string;
          stepIndex: number;
          error: string;
        };
        const instances = prevState.workflowInstances as Record<string, WorkflowInstance>;
        const instance = instances[instanceId];
        if (!instance) return { nextState: prevState };

        const steps = [...instance.steps];
        steps[stepIndex] = { ...steps[stepIndex], status: 'failed' as StepStatus, error };

        return {
          nextState: {
            ...prevState,
            workflowInstances: {
              ...instances,
              [instanceId]: { ...instance, steps },
            },
          },
        };
      },

      [WorkflowActions.COMPLETE]: (event, prevState) => {
        const { instanceId } = event.payload as { instanceId: string };
        const instances = prevState.workflowInstances as Record<string, WorkflowInstance>;
        const instance = instances[instanceId];
        if (!instance) return { nextState: prevState };

        return {
          nextState: {
            ...prevState,
            workflowInstances: {
              ...instances,
              [instanceId]: {
                ...instance,
                status: 'completed' as WorkflowStatus,
                completedAt: Date.now(),
              },
            },
          },
        };
      },

      [WorkflowActions.FAIL]: (event, prevState) => {
        const { instanceId: iid, error: err } = event.payload as {
          instanceId: string;
          error: string;
        };
        const instances = prevState.workflowInstances as Record<string, WorkflowInstance>;
        const instance = instances[iid];
        if (!instance) return { nextState: prevState };

        return {
          nextState: {
            ...prevState,
            workflowInstances: {
              ...instances,
              [iid]: {
                ...instance,
                status: 'failed' as WorkflowStatus,
                error: err,
                completedAt: Date.now(),
              },
            },
          },
        };
      },

      [WorkflowActions.ABORT]: (event, prevState) => {
        const { instanceId } = event.payload as { instanceId: string };
        const instances = prevState.workflowInstances as Record<string, WorkflowInstance>;
        const instance = instances[instanceId];
        if (!instance) return { nextState: prevState };

        return {
          nextState: {
            ...prevState,
            workflowInstances: {
              ...instances,
              [instanceId]: {
                ...instance,
                status: 'aborted' as WorkflowStatus,
                completedAt: Date.now(),
              },
            },
          },
        };
      },
    },

    createController: ({ bus, store }: { bus: EventBus; store: RuntimeStore }) => {
      // ── Step Executors ──────────────────────────────────────────────

      /** Execute an async step. */
      async function executeAsyncStep(
        step: AsyncStep,
        ctx: WorkflowContext,
      ): Promise<{ result?: unknown; error?: string }> {
        try {
          const result = await step.execute(ctx);
          return { result };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      }

      /** Execute a confirm step using the bus-based modal pattern. */
      async function executeConfirmStep(
        step: ConfirmStep,
        _ctx: WorkflowContext,
        instanceId: string,
      ): Promise<{ confirmed: boolean }> {
        return new Promise<{ confirmed: boolean }>((resolve) => {
          // Open modal
          bus.dispatch({ type: ModalActions.OPEN, payload: { modalId: step.modalId } });

          const unsubscribe = bus.subscribe((event) => {
            if (event.type === ModalActions.CLOSE) {
              const payload = event.payload as { modalId?: string } | undefined;
              if (!payload?.modalId || payload.modalId === step.modalId) {
                unsubscribe();
                resolve({ confirmed: true });
              }
            } else if (event.type === ModalActions.CLOSE_ALL) {
              unsubscribe();
              resolve({ confirmed: false });
            } else if (event.type === WorkflowActions.ABORT) {
              const p = event.payload as { instanceId: string };
              if (p.instanceId === instanceId) {
                // Close the modal if workflow is aborted
                bus.dispatch({ type: ModalActions.CLOSE, payload: { modalId: step.modalId } });
                unsubscribe();
                resolve({ confirmed: false });
              }
            }
          });
        });
      }

      /** Execute a notify step. */
      function executeNotifyStep(step: NotifyStep, ctx: WorkflowContext): void {
        const notif =
          typeof step.notification === 'function'
            ? step.notification(ctx)
            : step.notification;
        bus.dispatch({
          type: NotificationActions.SHOW,
          payload: { type: notif.type, message: notif.message },
        });
      }

      /** Execute a custom step. */
      async function executeCustomStep(
        step: CustomStep,
        ctx: WorkflowContext,
      ): Promise<{ result?: unknown; error?: string }> {
        try {
          const result = await Promise.resolve(step.execute(ctx));
          return { result };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      }

      /** Handle step error based on ErrorAction config. */
      function handleErrorAction(
        errorAction: ErrorAction | undefined,
        _error: string,
      ): 'abort' | 'skip' | 'continue' {
        if (!errorAction) return 'abort'; // default: abort on error

        // Send notification if configured
        if (errorAction.notify) {
          const notif =
            typeof errorAction.notify === 'string'
              ? { type: 'error' as NotificationType, message: errorAction.notify }
              : errorAction.notify;
          bus.dispatch({
            type: NotificationActions.SHOW,
            payload: { type: notif.type, message: notif.message },
          });
        }

        return errorAction.action;
      }

      // ── Main Execution Engine ───────────────────────────────────────

      async function runWorkflow(
        definition: WorkflowDefinition,
        instanceId: string,
        payload: Record<string, unknown>,
      ): Promise<WorkflowResult> {
        const ctx: WorkflowContext = {
          workflowId: definition.id,
          instanceId,
          payload,
          results: {},
          currentStepIndex: 0,
        };

        for (let i = 0; i < definition.steps.length; i++) {
          // Check abort signal
          if (abortSignals.get(instanceId)) {
            bus.dispatch({ type: WorkflowActions.ABORT, payload: { instanceId } });
            abortSignals.delete(instanceId);
            return { instanceId, status: 'aborted', results: ctx.results };
          }

          const step = definition.steps[i];
          ctx.currentStepIndex = i;

          // Guard: check condition
          if (step.condition && !step.condition(ctx)) {
            bus.dispatch({
              type: WorkflowActions.STEP_SKIP,
              payload: { instanceId, stepIndex: i },
            });
            continue;
          }

          // Mark step as running
          bus.dispatch({
            type: WorkflowActions.STEP_START,
            payload: { instanceId, stepIndex: i },
          });

          // onEnter hook
          if (step.onEnter) {
            try { step.onEnter(ctx); } catch (_e) { /* ignore hook errors */ }
          }

          // Execute based on type
          let stepResult: unknown = undefined;
          let stepError: string | undefined = undefined;

          switch (step.type) {
            case 'async': {
              const r = await executeAsyncStep(step, ctx);
              stepResult = r.result;
              stepError = r.error;
              if (stepError) {
                const action = handleErrorAction(step.onError, stepError);
                if (action === 'abort') {
                  bus.dispatch({
                    type: WorkflowActions.STEP_FAIL,
                    payload: { instanceId, stepIndex: i, error: stepError },
                  });
                  bus.dispatch({
                    type: WorkflowActions.FAIL,
                    payload: { instanceId, error: stepError },
                  });
                  return { instanceId, status: 'failed', results: ctx.results, error: stepError };
                } else if (action === 'skip') {
                  bus.dispatch({
                    type: WorkflowActions.STEP_SKIP,
                    payload: { instanceId, stepIndex: i },
                  });
                  continue;
                }
                // 'continue': fall through to complete
              }
              break;
            }

            case 'confirm': {
              const { confirmed } = await executeConfirmStep(step, ctx, instanceId);
              stepResult = confirmed;
              if (!confirmed) {
                const rejectAction = step.onReject ?? 'abort';
                if (rejectAction === 'abort') {
                  bus.dispatch({
                    type: WorkflowActions.STEP_FAIL,
                    payload: { instanceId, stepIndex: i, error: 'User rejected confirmation' },
                  });
                  bus.dispatch({
                    type: WorkflowActions.ABORT,
                    payload: { instanceId },
                  });
                  return { instanceId, status: 'aborted', results: ctx.results };
                } else {
                  // skip
                  bus.dispatch({
                    type: WorkflowActions.STEP_SKIP,
                    payload: { instanceId, stepIndex: i },
                  });
                  continue;
                }
              }
              break;
            }

            case 'notify': {
              executeNotifyStep(step, ctx);
              stepResult = true;
              break;
            }

            case 'custom': {
              const r = await executeCustomStep(step, ctx);
              stepResult = r.result;
              stepError = r.error;
              if (stepError) {
                const action = handleErrorAction(step.onError, stepError);
                if (action === 'abort') {
                  bus.dispatch({
                    type: WorkflowActions.STEP_FAIL,
                    payload: { instanceId, stepIndex: i, error: stepError },
                  });
                  bus.dispatch({
                    type: WorkflowActions.FAIL,
                    payload: { instanceId, error: stepError },
                  });
                  return { instanceId, status: 'failed', results: ctx.results, error: stepError };
                } else if (action === 'skip') {
                  bus.dispatch({
                    type: WorkflowActions.STEP_SKIP,
                    payload: { instanceId, stepIndex: i },
                  });
                  continue;
                }
                // 'continue': fall through to complete
              }
              break;
            }
          }

          // Mark step complete
          ctx.results[step.id] = stepResult;
          bus.dispatch({
            type: WorkflowActions.STEP_COMPLETE,
            payload: { instanceId, stepIndex: i, result: stepResult },
          });

          // onExit hook
          if (step.onExit) {
            try { step.onExit(ctx); } catch (_e) { /* ignore hook errors */ }
          }
        }

        // Check abort one more time after all steps
        if (abortSignals.get(instanceId)) {
          bus.dispatch({ type: WorkflowActions.ABORT, payload: { instanceId } });
          abortSignals.delete(instanceId);
          return { instanceId, status: 'aborted', results: ctx.results };
        }

        // All steps completed
        bus.dispatch({ type: WorkflowActions.COMPLETE, payload: { instanceId } });
        return { instanceId, status: 'completed', results: ctx.results };
      }

      // ── Controller ──────────────────────────────────────────────────

      return {
        define(definition: WorkflowDefinition): void {
          definitions.set(definition.id, definition);
        },

        async start(
          workflowId: string,
          payload?: Record<string, unknown>,
        ): Promise<WorkflowResult> {
          const definition = definitions.get(workflowId);
          if (!definition) {
            throw new Error(`Workflow "${workflowId}" is not defined`);
          }

          const instanceId = generateInstanceId(workflowId);
          const initialPayload = payload ?? {};

          // Build initial step states
          const stepStates: StepState[] = definition.steps.map((s) => ({
            id: s.id,
            type: s.type,
            status: 'pending' as StepStatus,
          }));

          const instance: WorkflowInstance = {
            instanceId,
            workflowId,
            status: 'running',
            payload: initialPayload,
            results: {},
            steps: stepStates,
            currentStepIndex: 0,
            startedAt: Date.now(),
          };

          // Dispatch start event (sets state in store)
          bus.dispatch({ type: WorkflowActions.START, payload: instance });

          // Run the workflow
          return runWorkflow(definition, instanceId, initialPayload);
        },

        abort(instanceId: string): void {
          const instances = store.getState().workflowInstances as Record<string, WorkflowInstance>;
          const instance = instances[instanceId];
          if (!instance || instance.status !== 'running') return;

          // Set abort signal — the running loop will pick it up
          abortSignals.set(instanceId, true);
          // Also dispatch immediately for confirm steps that are waiting
          bus.dispatch({ type: WorkflowActions.ABORT, payload: { instanceId } });
        },

        getInstances(): WorkflowInstance[] {
          const instances = store.getState().workflowInstances as Record<string, WorkflowInstance>;
          return Object.values(instances);
        },

        getInstance(instanceId: string): WorkflowInstance | undefined {
          const instances = store.getState().workflowInstances as Record<string, WorkflowInstance>;
          return instances[instanceId];
        },

        getDefinitions(): WorkflowDefinition[] {
          return Array.from(definitions.values());
        },
      };
    },
  };
}
