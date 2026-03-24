// ---------------------------------------------------------------------------
// Notification Module — Built-in Interaction Module (Layer 0.5)
// Manages notification queue with priority and auto-dismiss metadata.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeStore } from '../store';
import { createModuleActions } from '../action-types';

/** Notification severity type. */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/** A single notification entry. */
export interface NotificationEntry {
  id: string;
  type: NotificationType;
  message: string;
  autoDismissMs?: number; // 0 or undefined = persistent
  timestamp: number;
}

/** State slice contributed by the Notification Module. */
export interface NotificationModuleState {
  notifications: NotificationEntry[];
}

/** Options for createNotificationModule. */
export interface NotificationModuleOptions {
  maxNotifications?: number; // default: 50
}

/** Controller API exposed on runtime.modules.notification */
export interface NotificationController {
  show(notification: Omit<NotificationEntry, 'id' | 'timestamp'>): string;
  dismiss(id: string): void;
  dismissAll(): void;
  getAll(): NotificationEntry[];
  getById(id: string): NotificationEntry | undefined;
  count(): number;
}

// Event type constants (namespaced)
const NotificationActions = createModuleActions('notification', {
  SHOW: 'show',
  DISMISS: 'dismiss',
  DISMISS_ALL: 'dismissAll',
});

export { NotificationActions };

// Simple incrementing counter for unique IDs
let idCounter = 0;
function generateId(): string {
  return `notif-${++idCounter}`;
}

/**
 * Create the Notification Module.
 *
 * Contributes: notifications to RuntimeState.
 * Registers reducers for NOTIFICATION_SHOW, NOTIFICATION_DISMISS, NOTIFICATION_DISMISS_ALL.
 */
export function createNotificationModule(
  options?: NotificationModuleOptions,
): RuntimeModule<NotificationController> {
  const maxNotifications = options?.maxNotifications ?? 50;

  return {
    name: 'notification',

    initialState: {
      notifications: [],
    },

    reducers: {
      [NotificationActions.SHOW]: (event, prevState) => {
        const entry = event.payload as NotificationEntry;
        let queue = [...(prevState.notifications as NotificationEntry[]), entry];

        // Evict oldest if over limit
        if (queue.length > maxNotifications) {
          queue = queue.slice(queue.length - maxNotifications);
        }

        return {
          nextState: {
            ...prevState,
            notifications: queue,
          },
        };
      },

      [NotificationActions.DISMISS]: (event, prevState) => {
        const { id } = event.payload as { id: string };
        const queue = prevState.notifications as NotificationEntry[];

        return {
          nextState: {
            ...prevState,
            notifications: queue.filter((n) => n.id !== id),
          },
        };
      },

      [NotificationActions.DISMISS_ALL]: (_event, prevState) => {
        return {
          nextState: { ...prevState, notifications: [] },
        };
      },
    },

    createController: ({ bus, store }: { bus: EventBus; store: RuntimeStore }) => ({
      show(notification: Omit<NotificationEntry, 'id' | 'timestamp'>): string {
        const id = generateId();
        const entry: NotificationEntry = {
          ...notification,
          id,
          timestamp: Date.now(),
        };
        bus.dispatch({ type: NotificationActions.SHOW, payload: entry });
        return id;
      },

      dismiss(id: string): void {
        bus.dispatch({ type: NotificationActions.DISMISS, payload: { id } });
      },

      dismissAll(): void {
        bus.dispatch({ type: NotificationActions.DISMISS_ALL });
      },

      getAll(): NotificationEntry[] {
        return store.getState().notifications as NotificationEntry[];
      },

      getById(id: string): NotificationEntry | undefined {
        return (store.getState().notifications as NotificationEntry[]).find(
          (n) => n.id === id,
        );
      },

      count(): number {
        return (store.getState().notifications as NotificationEntry[]).length;
      },
    }),
  };
}
