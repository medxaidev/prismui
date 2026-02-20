import type {
  ToastController,
  ToastControllerOptions,
  ToastInstance,
  ToastChangeListener,
  ToastPromiseOptions,
} from './types';

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------

let counter = 0;

function generateId(): string {
  counter += 1;
  return `toast-${counter}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a ToastController for imperative toast management.
 *
 * The controller maintains a list of active toast instances and notifies
 * subscribers when the list changes. A `ToastRenderer` component subscribes
 * to these changes and renders the corresponding Toast components.
 *
 * @example
 * ```ts
 * const controller = createToastController();
 * controller.show({ title: 'Saved', severity: 'success' });
 * controller.success('File uploaded');
 * const id = await controller.promise(uploadFile(), {
 *   loading: { title: 'Uploading...' },
 *   success: { title: 'Done!' },
 *   error: { title: 'Failed' },
 * });
 * ```
 */
export function createToastController(): ToastController {
  const toasts = new Map<string, ToastInstance>();
  const listeners = new Set<ToastChangeListener>();

  function notify(): void {
    const snapshot = Array.from(toasts.values());
    listeners.forEach((listener) => listener(snapshot));
  }

  const controller: ToastController = {
    show(options: ToastControllerOptions): string {
      const id = generateId();
      toasts.set(id, {
        id,
        options: { duration: 4000, dismissible: true, ...options },
        createdAt: Date.now(),
      });
      notify();
      return id;
    },

    hide(id: string): void {
      const instance = toasts.get(id);
      if (instance) {
        instance.options.onClose?.();
        toasts.delete(id);
        notify();
      }
    },

    hideAll(): void {
      if (toasts.size > 0) {
        toasts.forEach((instance) => instance.options.onClose?.());
        toasts.clear();
        notify();
      }
    },

    success(title: string, options?: Partial<ToastControllerOptions>): string {
      return controller.show({ ...options, title, severity: 'success' });
    },

    error(title: string, options?: Partial<ToastControllerOptions>): string {
      return controller.show({ ...options, title, severity: 'error' });
    },

    warning(title: string, options?: Partial<ToastControllerOptions>): string {
      return controller.show({ ...options, title, severity: 'warning' });
    },

    info(title: string, options?: Partial<ToastControllerOptions>): string {
      return controller.show({ ...options, title, severity: 'info' });
    },

    promise<T>(
      promiseOrFn: Promise<T> | (() => Promise<T>),
      options: ToastPromiseOptions<T>,
    ): string {
      const id = generateId();
      const successDuration = options.duration ?? 4000;

      // Start in loading state — uses semantic (white bg) style with neutral icon
      toasts.set(id, {
        id,
        options: {
          title: options.loading.title,
          description: options.loading.description,
          severity: 'info',
          duration: 0, // No auto-dismiss during loading
          dismissible: false,
        },
        createdAt: Date.now(),
        promiseState: 'loading',
        loading: true,
      });
      notify();

      const p = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;

      p.then((data) => {
        const instance = toasts.get(id);
        if (!instance) return; // Already removed

        const successOpts =
          typeof options.success === 'function'
            ? options.success(data)
            : options.success;

        // Reset createdAt so the auto-dismiss timer restarts fresh
        toasts.set(id, {
          ...instance,
          options: {
            ...instance.options,
            title: successOpts.title,
            description: successOpts.description,
            severity: 'success',
            duration: successDuration,
            dismissible: true,
          },
          createdAt: Date.now(),
          promiseState: 'success',
          loading: false,
        });
        notify();
      }).catch((err) => {
        const instance = toasts.get(id);
        if (!instance) return;

        const errorOpts =
          typeof options.error === 'function'
            ? options.error(err)
            : options.error;

        // Reset createdAt so the auto-dismiss timer restarts fresh
        toasts.set(id, {
          ...instance,
          options: {
            ...instance.options,
            title: errorOpts.title,
            description: errorOpts.description,
            severity: 'error',
            duration: successDuration,
            dismissible: true,
          },
          createdAt: Date.now(),
          promiseState: 'error',
          loading: false,
        });
        notify();
      });

      return id;
    },

    update(id: string, options: Partial<ToastControllerOptions>): void {
      const instance = toasts.get(id);
      if (instance) {
        toasts.set(id, {
          ...instance,
          options: { ...instance.options, ...options },
        });
        notify();
      }
    },

    getToasts(): ToastInstance[] {
      return Array.from(toasts.values());
    },

    subscribe(listener: ToastChangeListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return controller;
}
