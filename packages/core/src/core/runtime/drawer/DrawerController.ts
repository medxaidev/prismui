import type {
  DrawerController,
  DrawerControllerOptions,
  DrawerInstance,
  DrawerChangeListener,
} from './types';

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------

let counter = 0;

function generateId(): string {
  counter += 1;
  return `drawer-${counter}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a DrawerController for imperative drawer management.
 *
 * The controller maintains a list of open drawer instances and notifies
 * subscribers when the list changes. A `DrawerRenderer` component subscribes
 * to these changes and renders the corresponding Drawer components.
 *
 * @example
 * ```ts
 * const controller = createDrawerController();
 * const id = controller.open({ title: 'Settings', position: 'right' });
 * controller.close(id);
 * ```
 */
export function createDrawerController(): DrawerController {
  const drawers = new Map<string, DrawerInstance>();
  const listeners = new Set<DrawerChangeListener>();

  function notify(): void {
    const snapshot = Array.from(drawers.values());
    listeners.forEach((listener) => listener(snapshot));
  }

  const controller: DrawerController = {
    open(options: DrawerControllerOptions): string {
      const id = generateId();
      drawers.set(id, { id, options });
      notify();
      return id;
    },

    close(id: string): void {
      if (drawers.has(id)) {
        drawers.delete(id);
        notify();
      }
    },

    closeAll(): void {
      if (drawers.size > 0) {
        drawers.clear();
        notify();
      }
    },

    getDrawers(): DrawerInstance[] {
      return Array.from(drawers.values());
    },

    subscribe(listener: DrawerChangeListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return controller;
}
