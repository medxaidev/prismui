import type {
  PopoverController,
  PopoverControllerOptions,
  PopoverInstance,
  PopoverChangeListener,
} from './types';

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------

let counter = 0;

function generateId(): string {
  counter += 1;
  return `popover-${counter}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a PopoverController for imperative popover management.
 *
 * The controller maintains a list of open popover instances and notifies
 * subscribers when the list changes. A `PopoverRenderer` component subscribes
 * to these changes and renders the corresponding Popover components.
 *
 * @example
 * ```ts
 * const controller = createPopoverController();
 * const id = controller.open({ target: buttonEl, content: <Menu /> });
 * controller.close(id);
 * ```
 */
export function createPopoverController(): PopoverController {
  const popovers = new Map<string, PopoverInstance>();
  const listeners = new Set<PopoverChangeListener>();

  function notify(): void {
    const snapshot = Array.from(popovers.values());
    listeners.forEach((listener) => listener(snapshot));
  }

  const controller: PopoverController = {
    open(options: PopoverControllerOptions): string {
      const id = generateId();
      popovers.set(id, { id, options });
      notify();
      return id;
    },

    close(id: string): void {
      if (popovers.has(id)) {
        popovers.delete(id);
        notify();
      }
    },

    closeAll(): void {
      if (popovers.size > 0) {
        popovers.clear();
        notify();
      }
    },

    getPopovers(): PopoverInstance[] {
      return Array.from(popovers.values());
    },

    subscribe(listener: PopoverChangeListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return controller;
}
