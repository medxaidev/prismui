import { useNotification } from '@prismui/react';
import type { NotificationType } from '@prismui/core';

const typeColors: Record<NotificationType, { bg: string; border: string; text: string }> = {
  info: { bg: '#e8f4fd', border: '#b3d9f2', text: '#1a6fa8' },
  success: { bg: '#e8f5e9', border: '#a5d6a7', text: '#2e7d32' },
  warning: { bg: '#fff8e1', border: '#ffe082', text: '#f57f17' },
  error: { bg: '#ffebee', border: '#ef9a9a', text: '#c62828' },
};

export function NotificationPanel() {
  const { notifications, count, show, dismiss, dismissAll } = useNotification();

  return (
    <div>
      <h4 style={{ margin: '0 0 8px' }}>Notifications ({count})</h4>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: 8 }}>
        {(['info', 'success', 'warning', 'error'] as NotificationType[]).map((type) => (
          <button
            key={type}
            onClick={() => show({ type, message: `${type.charAt(0).toUpperCase() + type.slice(1)} notification at ${new Date().toLocaleTimeString()}` })}
            style={{
              padding: '4px 10px',
              border: `1px solid ${typeColors[type].border}`,
              borderRadius: '4px',
              background: typeColors[type].bg,
              color: typeColors[type].text,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {type}
          </button>
        ))}
      </div>
      {count > 0 && (
        <button
          onClick={dismissAll}
          style={{
            padding: '4px 10px',
            border: '1px solid #c00',
            borderRadius: '4px',
            background: '#fee',
            color: '#c00',
            cursor: 'pointer',
            fontSize: '12px',
            marginBottom: 8,
          }}
        >
          Dismiss All
        </button>
      )}

      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {notifications.map((n) => {
          const colors = typeColors[n.type];
          return (
            <div
              key={n.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 8px',
                marginBottom: 4,
                borderRadius: '4px',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                fontSize: '12px',
              }}
            >
              <span style={{ color: colors.text, flex: 1 }}>
                <b>[{n.type}]</b> {n.message}
              </span>
              <button
                onClick={() => dismiss(n.id)}
                style={{
                  padding: '1px 6px',
                  border: 'none',
                  borderRadius: '3px',
                  background: 'transparent',
                  color: colors.text,
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                ×
              </button>
            </div>
          );
        })}
        {count === 0 && (
          <div style={{ fontSize: '12px', color: '#999' }}>No notifications</div>
        )}
      </div>
    </div>
  );
}
