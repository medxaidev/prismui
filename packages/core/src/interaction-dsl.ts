// ---------------------------------------------------------------------------
// Interaction DSL — High-level fluent API wrapping all runtime module controllers
// Pure delegation layer — zero new state, zero new events, zero new reducers.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { InteractionRuntime } from './runtime';
import type { ModalController } from './modules/modal-module';
import type { DrawerController, DrawerAnchor } from './modules/drawer-module';
import type { NotificationController, NotificationEntry } from './modules/notification-module';
import type { FormController, FormValidator } from './modules/form-module';
import type { AsyncController } from './modules/async-module';
import type {
  WorkflowController,
  WorkflowDefinition,
  WorkflowResult,
  WorkflowInstance,
} from './modules/workflow-module';

// ── Types ─────────────────────────────────────────────────────────────

/** Options for notify shorthand methods. */
export interface NotifyOptions {
  autoDismissMs?: number;
}

/** Modal DSL namespace. */
export interface ModalDSL {
  open(modalId: string): void;
  close(modalId?: string): void;
  closeAll(): void;
  isOpen(modalId: string): boolean;
}

/** Drawer DSL namespace. */
export interface DrawerDSL {
  open(drawerId: string, anchor?: DrawerAnchor): void;
  close(drawerId?: string): void;
  closeAll(): void;
  isOpen(drawerId: string): boolean;
}

/** Notification DSL namespace. */
export interface NotifyDSL {
  info(message: string, options?: NotifyOptions): string;
  success(message: string, options?: NotifyOptions): string;
  warning(message: string, options?: NotifyOptions): string;
  error(message: string, options?: NotifyOptions): string;
  dismiss(id: string): void;
  dismissAll(): void;
}

/** Form DSL namespace. */
export interface FormDSL {
  register(name: string, initialValue?: unknown): void;
  unregister(name: string): void;
  set(name: string, value: unknown): void;
  touch(name: string): void;
  validate(validator: FormValidator): boolean;
  submit(): void;
  submitDone(): void;
  submitFail(error: string): void;
  reset(): void;
  values(): Record<string, unknown>;
  errors(): Record<string, string | null>;
  isValid(): boolean;
  isDirty(): boolean;
}

/** Async DSL namespace. */
export interface AsyncDSL {
  start(operationId: string): void;
  done(operationId: string, data?: unknown): void;
  fail(operationId: string, error: string): void;
  reset(operationId: string): void;
  isLoading(operationId: string): boolean;
  isAnyLoading(): boolean;
}

/** Workflow DSL namespace. */
export interface WorkflowDSL {
  define(definition: WorkflowDefinition): void;
  start(workflowId: string, payload?: Record<string, unknown>): Promise<WorkflowResult>;
  abort(instanceId: string): void;
  getInstances(): WorkflowInstance[];
  getInstance(instanceId: string): WorkflowInstance | undefined;
}

/** The unified Interaction DSL. */
export interface InteractionDSL {
  readonly modal: ModalDSL;
  confirm(modalId: string): Promise<boolean>;
  readonly drawer: DrawerDSL;
  readonly notify: NotifyDSL;
  readonly form: FormDSL;
  readonly async: AsyncDSL;
  readonly workflow: WorkflowDSL;
}

// ── Factory ───────────────────────────────────────────────────────────

/**
 * Create an InteractionDSL from a runtime instance.
 * Pure delegation — all methods forward to existing module controllers.
 */
export function createInteractionDSL(runtime: InteractionRuntime): InteractionDSL {
  const modalCtrl = runtime.modules.modal as ModalController | undefined;
  const drawerCtrl = runtime.modules.drawer as DrawerController | undefined;
  const notifCtrl = runtime.modules.notification as NotificationController | undefined;
  const formCtrl = runtime.modules.form as FormController | undefined;
  const asyncCtrl = runtime.modules.async as AsyncController | undefined;
  const workflowCtrl = runtime.modules.workflow as WorkflowController | undefined;

  // ── Modal DSL ───────────────────────────────────────────────────────

  const modal: ModalDSL = {
    open(modalId: string): void {
      modalCtrl?.open(modalId);
    },
    close(modalId?: string): void {
      modalCtrl?.close(modalId);
    },
    closeAll(): void {
      modalCtrl?.closeAll();
    },
    isOpen(modalId: string): boolean {
      return modalCtrl?.isOpen(modalId) ?? false;
    },
  };

  // ── Confirm ─────────────────────────────────────────────────────────

  function confirm(modalId: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      modalCtrl?.open(modalId);

      const unsubscribe = runtime.bus.subscribe((event) => {
        if (event.type === 'MODAL_CLOSE') {
          const payload = event.payload as { modalId?: string } | undefined;
          // MODAL_CLOSE with no modalId closes top — check if our modal was closed
          if (!payload?.modalId || payload.modalId === modalId) {
            if (!modalCtrl?.isOpen(modalId)) {
              unsubscribe();
              resolve(true);
            }
          }
        } else if (event.type === 'MODAL_CLOSE_ALL') {
          unsubscribe();
          resolve(false);
        }
      });
    });
  }

  // ── Drawer DSL ──────────────────────────────────────────────────────

  const drawer: DrawerDSL = {
    open(drawerId: string, anchor?: DrawerAnchor): void {
      drawerCtrl?.open(drawerId, anchor);
    },
    close(drawerId?: string): void {
      drawerCtrl?.close(drawerId);
    },
    closeAll(): void {
      drawerCtrl?.closeAll();
    },
    isOpen(drawerId: string): boolean {
      return drawerCtrl?.isOpen(drawerId) ?? false;
    },
  };

  // ── Notify DSL ──────────────────────────────────────────────────────

  function showNotification(
    type: 'info' | 'success' | 'warning' | 'error',
    message: string,
    options?: NotifyOptions,
  ): string {
    if (!notifCtrl) return '';
    return notifCtrl.show({
      type,
      message,
      autoDismissMs: options?.autoDismissMs,
    } as Omit<NotificationEntry, 'id' | 'timestamp'>);
  }

  const notify: NotifyDSL = {
    info(message: string, options?: NotifyOptions): string {
      return showNotification('info', message, options);
    },
    success(message: string, options?: NotifyOptions): string {
      return showNotification('success', message, options);
    },
    warning(message: string, options?: NotifyOptions): string {
      return showNotification('warning', message, options);
    },
    error(message: string, options?: NotifyOptions): string {
      return showNotification('error', message, options);
    },
    dismiss(id: string): void {
      notifCtrl?.dismiss(id);
    },
    dismissAll(): void {
      notifCtrl?.dismissAll();
    },
  };

  // ── Form DSL ────────────────────────────────────────────────────────

  const form: FormDSL = {
    register(name: string, initialValue?: unknown): void {
      formCtrl?.registerField(name, initialValue);
    },
    unregister(name: string): void {
      formCtrl?.unregisterField(name);
    },
    set(name: string, value: unknown): void {
      formCtrl?.setValue(name, value);
    },
    touch(name: string): void {
      formCtrl?.setTouched(name);
    },
    validate(validator: FormValidator): boolean {
      return formCtrl?.validate(validator) ?? true;
    },
    submit(): void {
      formCtrl?.submitStart();
    },
    submitDone(): void {
      formCtrl?.submitSuccess();
    },
    submitFail(error: string): void {
      formCtrl?.submitError(error);
    },
    reset(): void {
      formCtrl?.reset();
    },
    values(): Record<string, unknown> {
      return formCtrl?.getValues() ?? {};
    },
    errors(): Record<string, string | null> {
      return formCtrl?.getErrors() ?? {};
    },
    isValid(): boolean {
      return formCtrl?.isValid() ?? true;
    },
    isDirty(): boolean {
      return formCtrl?.isDirty() ?? false;
    },
  };

  // ── Async DSL ───────────────────────────────────────────────────────

  const asyncDSL: AsyncDSL = {
    start(operationId: string): void {
      asyncCtrl?.start(operationId);
    },
    done(operationId: string, data?: unknown): void {
      asyncCtrl?.success(operationId, data);
    },
    fail(operationId: string, error: string): void {
      asyncCtrl?.error(operationId, error);
    },
    reset(operationId: string): void {
      asyncCtrl?.reset(operationId);
    },
    isLoading(operationId: string): boolean {
      return asyncCtrl?.isLoading(operationId) ?? false;
    },
    isAnyLoading(): boolean {
      return asyncCtrl?.isAnyLoading() ?? false;
    },
  };

  // ── Workflow DSL ─────────────────────────────────────────────────────

  const workflow: WorkflowDSL = {
    define(definition: WorkflowDefinition): void {
      workflowCtrl?.define(definition);
    },
    start(workflowId: string, payload?: Record<string, unknown>): Promise<WorkflowResult> {
      if (!workflowCtrl) return Promise.reject(new Error('Workflow module not registered'));
      return workflowCtrl.start(workflowId, payload);
    },
    abort(instanceId: string): void {
      workflowCtrl?.abort(instanceId);
    },
    getInstances(): WorkflowInstance[] {
      return workflowCtrl?.getInstances() ?? [];
    },
    getInstance(instanceId: string): WorkflowInstance | undefined {
      return workflowCtrl?.getInstance(instanceId);
    },
  };

  return {
    modal,
    confirm,
    drawer,
    notify,
    form,
    async: asyncDSL,
    workflow,
  };
}
