// ---------------------------------------------------------------------------
// useNotification — convenience hook combining reactive notification state + controller
// Thin wrapper — zero business logic.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import type { NotificationController, NotificationEntry } from '@prismui/core';
import { useRuntime } from './use-runtime';
import { useRuntimeState } from './use-runtime-state';

/** Return type of useNotification(). */
export interface UseNotificationReturn {
  notifications: NotificationEntry[];
  count: number;
  show: (notification: Omit<NotificationEntry, 'id' | 'timestamp'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  getById: (id: string) => NotificationEntry | undefined;
}

/**
 * Convenience hook for notification operations.
 * Combines `useRuntimeState()` for reactive `notifications` with `runtime.modules.notification` for actions.
 */
export function useNotification(): UseNotificationReturn {
  const runtime = useRuntime();
  const state = useRuntimeState();
  const controller = runtime.modules.notification as NotificationController;

  const show = useCallback(
    (notification: Omit<NotificationEntry, 'id' | 'timestamp'>) => controller.show(notification),
    [controller],
  );
  const dismiss = useCallback((id: string) => controller.dismiss(id), [controller]);
  const dismissAll = useCallback(() => controller.dismissAll(), [controller]);

  // Derived from reactive state for re-render triggers
  const notifications = state.notifications as NotificationEntry[];
  const getById = useCallback(
    (id: string) => notifications.find((n) => n.id === id),
    [notifications],
  );

  return {
    notifications,
    count: notifications.length,
    show,
    dismiss,
    dismissAll,
    getById,
  };
}
