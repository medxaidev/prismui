import { useNotification } from '@prismui/react';
import type { NotificationType } from '@prismui/core';

const types: NotificationType[] = ['info', 'success', 'warning', 'error'];

export function NotificationPage() {
  const { notifications, count, show, dismiss, dismissAll } = useNotification();

  return (
    <div>
      <div className="demo-content__header">
        <h2 className="demo-content__title">Notification Module</h2>
        <p className="demo-content__subtitle">
          Queue-based notification management with typed severity levels and centralized state.
        </p>
      </div>

      <div className="info-card info-card--blue">
        Notifications are stored in the Runtime Store as a queue. Each notification has a unique ID,
        type (info/success/warning/error), and message. The queue is capped at{' '}
        <code className="code-inline">maxNotifications</code> (configured at 20 in this demo).
      </div>

      {/* API */}
      <div className="feature-section">
        <h3 className="feature-section__title">Notification API</h3>
        <div className="code-block">
{`const { show, dismiss, dismissAll, notifications, count } = useNotification();

show({ type: 'info', message: 'Hello!' });      // Add notification
show({ type: 'error', message: 'Failed!' });     // Error notification
dismiss(notificationId);                          // Remove by ID
dismissAll();                                     // Clear all
count;                                            // Current count`}
        </div>
      </div>

      {/* Try it */}
      <div className="feature-section">
        <h3 className="feature-section__title">Try: Send Notifications</h3>
        <p className="feature-section__desc">
          Click a type button to send a notification. Watch both the notification list below and
          the notification count in the right state panel.
        </p>
        <div className="feature-section__actions">
          {types.map((type) => (
            <button
              key={type}
              className={`btn btn--${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : ''}`}
              onClick={() => show({
                type,
                message: `${type.charAt(0).toUpperCase() + type.slice(1)} at ${new Date().toLocaleTimeString()}`,
              })}
            >
              {type}
            </button>
          ))}
          {count > 0 && (
            <button className="btn btn--danger" onClick={dismissAll}>
              Dismiss All ({count})
            </button>
          )}
        </div>

        {/* Notification List */}
        {notifications.length > 0 ? (
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {notifications.map((n) => (
              <div key={n.id} className={`notif-card notif-card--${n.type}`}>
                <span style={{ flex: 1 }}>
                  <b>[{n.type}]</b> {n.message}
                </span>
                <button className="data-row__close" onClick={() => dismiss(n.id)}>×</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="result-display">No notifications — send one above</div>
        )}
      </div>

      {/* DSL Integration */}
      <div className="feature-section">
        <h3 className="feature-section__title">DSL Shorthand</h3>
        <div className="code-block">
{`const ui = useUI();

ui.notify.info('Hello!');          // Shorthand for show({ type: 'info', ... })
ui.notify.success('Saved!');
ui.notify.warning('Check this');
ui.notify.error('Failed!');
ui.notify.dismissAll();`}
        </div>
      </div>
    </div>
  );
}
