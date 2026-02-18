import type {
  DialogController,
  DialogControllerOptions,
  DialogInstance,
  DialogChangeListener,
} from './types';

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------

let counter = 0;

function generateId(): string {
  counter += 1;
  return `dialog-${counter}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a DialogController for imperative dialog management.
 *
 * The controller maintains a list of open dialog instances and notifies
 * subscribers when the list changes. A `DialogRenderer` component subscribes
 * to these changes and renders the corresponding Dialog components.
 *
 * @example
 * ```ts
 * const controller = createDialogController();
 * const id = controller.open({ title: 'Hello', content: 'World' });
 * controller.close(id);
 *
 * const confirmed = await controller.confirm({ title: 'Sure?', content: 'Delete item?' });
 * ```
 */
export function createDialogController(): DialogController {
  const dialogs = new Map<string, DialogInstance>();
  const listeners = new Set<DialogChangeListener>();

  function notify(): void {
    const snapshot = Array.from(dialogs.values());
    listeners.forEach((listener) => listener(snapshot));
  }

  const controller: DialogController = {
    open(options: DialogControllerOptions): string {
      const id = generateId();
      dialogs.set(id, { id, options });
      notify();
      return id;
    },

    close(id: string): void {
      if (dialogs.has(id)) {
        dialogs.delete(id);
        notify();
      }
    },

    closeAll(): void {
      if (dialogs.size > 0) {
        dialogs.clear();
        notify();
      }
    },

    async confirm(options: DialogControllerOptions): Promise<boolean> {
      return new Promise<boolean>((resolve) => {
        const id = controller.open({
          ...options,
          onConfirm: async () => {
            await options.onConfirm?.();
            controller.close(id);
            resolve(true);
          },
          onCancel: () => {
            options.onCancel?.();
            controller.close(id);
            resolve(false);
          },
        });
      });
    },

    async alert(options: Omit<DialogControllerOptions, 'onCancel' | 'cancelText'>): Promise<void> {
      return new Promise<void>((resolve) => {
        const id = controller.open({
          ...options,
          onConfirm: async () => {
            await options.onConfirm?.();
            controller.close(id);
            resolve();
          },
        });
      });
    },

    getDialogs(): DialogInstance[] {
      return Array.from(dialogs.values());
    },

    subscribe(listener: DialogChangeListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return controller;
}
