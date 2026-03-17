// ---------------------------------------------------------------------------
// NotificationRenderer — Layer 3 Rendering Component
// Subscribes to notifications and renders toast notifications.
// Zero business logic — purely presentational.
// ---------------------------------------------------------------------------

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { NotificationEntry } from '@prismui/core';
import { useNotification } from '../use-notification';

/** Notification position on screen. */
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/** Props for NotificationRenderer. */
export interface NotificationRendererProps {
  /** Position of the notification container. Default: 'top-right'. */
  position?: NotificationPosition;
  /** Custom render function for each notification. */
  renderNotification?: (entry: NotificationEntry, dismiss: () => void) => React.ReactNode;
  /** Optional className applied to the container. */
  className?: string;
}

function getContainerStyle(position: NotificationPosition): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1200,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    pointerEvents: 'none',
    maxHeight: '100vh',
    overflow: 'hidden',
  };

  switch (position) {
    case 'top-right':
      return { ...base, top: 0, right: 0 };
    case 'top-left':
      return { ...base, top: 0, left: 0 };
    case 'bottom-right':
      return { ...base, bottom: 0, right: 0 };
    case 'bottom-left':
      return { ...base, bottom: 0, left: 0 };
    default:
      return { ...base, top: 0, right: 0 };
  }
}

const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: '#e3f2fd', border: '#1976d2', icon: 'ℹ' },
  success: { bg: '#e8f5e9', border: '#2e7d32', icon: '✓' },
  warning: { bg: '#fff3e0', border: '#ed6c02', icon: '⚠' },
  error: { bg: '#fbe9e7', border: '#d32f2f', icon: '✕' },
};

function getToastStyle(type: string): React.CSSProperties {
  const colors = typeColors[type] ?? typeColors.info;
  return {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: colors.bg,
    borderLeft: `4px solid ${colors.border}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    minWidth: '280px',
    maxWidth: '400px',
    fontSize: '14px',
    lineHeight: '1.5',
  };
}

const dismissButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  lineHeight: '1',
  opacity: 0.6,
  padding: '0 0 0 8px',
  marginLeft: 'auto',
  flexShrink: 0,
};

/** Default toast rendering. */
function DefaultToast({ entry, onDismiss }: { entry: NotificationEntry; onDismiss: () => void }) {
  const colors = typeColors[entry.type] ?? typeColors.info;
  return (
    <div style={getToastStyle(entry.type)} data-testid={`notification-toast-${entry.id}`} role="alert">
      <span style={{ color: colors.border, fontWeight: 'bold', flexShrink: 0 }}>{colors.icon}</span>
      <span style={{ flex: 1 }}>{entry.message}</span>
      <button
        style={dismissButtonStyle}
        onClick={onDismiss}
        aria-label="Dismiss notification"
        data-testid={`notification-dismiss-${entry.id}`}
      >
        ×
      </button>
    </div>
  );
}

/**
 * NotificationRenderer — renders all active notifications as toast messages.
 *
 * Supports auto-dismiss timers (reads autoDismissMs from each entry),
 * 4 screen positions, and custom rendering via renderNotification prop.
 */
export function NotificationRenderer({
  position = 'top-right',
  renderNotification,
  className,
}: NotificationRendererProps) {
  const { notifications, dismiss } = useNotification();
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Auto-dismiss logic
  const setupTimer = useCallback(
    (entry: NotificationEntry) => {
      if (!entry.autoDismissMs || entry.autoDismissMs <= 0) return;
      if (timersRef.current.has(entry.id)) return; // already tracked
      const timer = setTimeout(() => {
        dismiss(entry.id);
        timersRef.current.delete(entry.id);
      }, entry.autoDismissMs);
      timersRef.current.set(entry.id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    notifications.forEach(setupTimer);
  }, [notifications, setupTimer]);

  // Cleanup stale timers for dismissed notifications
  useEffect(() => {
    const activeIds = new Set(notifications.map((n) => n.id));
    timersRef.current.forEach((timer, id) => {
      if (!activeIds.has(id)) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
    });
  }, [notifications]);

  // Cleanup all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return createPortal(
    <div
      style={getContainerStyle(position)}
      className={className}
      data-testid="notification-container"
      data-position={position}
    >
      {notifications.map((entry) => (
        <div key={entry.id}>
          {renderNotification
            ? renderNotification(entry, () => dismiss(entry.id))
            : <DefaultToast entry={entry} onDismiss={() => dismiss(entry.id)} />}
        </div>
      ))}
    </div>,
    document.body,
  );
}
