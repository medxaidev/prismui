import { useState } from 'react';
import { useModal, useDrawer, useNotification } from '@prismui/react';
import { ModalRenderer, DrawerRenderer, NotificationRenderer } from '@prismui/react';
import type { DrawerAnchor, NotificationType } from '@prismui/core';

const anchorOptions: DrawerAnchor[] = ['left', 'right', 'top', 'bottom'];
const notifTypes: NotificationType[] = ['info', 'success', 'warning', 'error'];

export function RenderingPage() {
  const { open: openModal } = useModal();
  const { open: openDrawer } = useDrawer();
  const { show: showNotif } = useNotification();
  const [autoDismiss, setAutoDismiss] = useState(true);

  return (
    <div>
      <div className="demo-content__header">
        <h2 className="demo-content__title">Rendering Layer</h2>
        <p className="demo-content__subtitle">
          Layer 3 — React rendering components for Modal, Drawer, and Notification modules.
          These renderers subscribe to runtime state and convert it to visible UI.
        </p>
      </div>

      <div className="info-card info-card--blue">
        Renderers contain <b>zero business logic</b>. They subscribe to runtime state via hooks,
        render JSX based on the state, and forward user actions to controllers.
        All rendering uses Portals (document.body) for proper stacking.
      </div>

      {/* ── Modal Renderer ── */}
      <div className="feature-section">
        <h3 className="feature-section__title">ModalRenderer</h3>
        <p className="feature-section__desc">
          Opens modals as stacked overlays with backdrop. Supports Escape key, backdrop click,
          and render-prop pattern for custom content.
        </p>
        <div className="code-block">
{`<ModalRenderer>
  {(modalId, close) => (
    <div className="my-modal">
      <h2>Modal: {modalId}</h2>
      <button onClick={close}>Close</button>
    </div>
  )}
</ModalRenderer>`}
        </div>
        <div className="feature-section__actions">
          <button className="btn" onClick={() => openModal('render-demo')}>
            Open Modal
          </button>
          <button className="btn" onClick={() => {
            openModal('render-first');
            setTimeout(() => openModal('render-second'), 100);
          }}>
            Open Stacked (×2)
          </button>
        </div>
      </div>

      {/* ── Drawer Renderer ── */}
      <div className="feature-section">
        <h3 className="feature-section__title">DrawerRenderer</h3>
        <p className="feature-section__desc">
          Renders drawers with anchor positioning (left/right/top/bottom).
          Each drawer appears as a panel over a backdrop overlay.
        </p>
        <div className="code-block">
{`<DrawerRenderer>
  {(drawerId, anchor, close) => (
    <nav className={\`drawer drawer--\${anchor}\`}>
      <h2>Drawer: {drawerId}</h2>
      <button onClick={close}>Close</button>
    </nav>
  )}
</DrawerRenderer>`}
        </div>
        <div className="feature-section__actions">
          {anchorOptions.map((anchor) => (
            <button
              key={anchor}
              className="btn"
              onClick={() => openDrawer(`render-${anchor}`, anchor)}
            >
              {anchor}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notification Renderer ── */}
      <div className="feature-section">
        <h3 className="feature-section__title">NotificationRenderer</h3>
        <p className="feature-section__desc">
          Renders toast notifications with type-based styling, auto-dismiss timers,
          and 4 screen positions. Supports custom rendering via <code className="code-inline">renderNotification</code> prop.
        </p>
        <div className="code-block">
{`<NotificationRenderer position="top-right" />

// With custom rendering:
<NotificationRenderer
  renderNotification={(entry, dismiss) => (
    <MyCustomToast entry={entry} onDismiss={dismiss} />
  )}
/>`}
        </div>
        <div className="feature-section__actions">
          {notifTypes.map((type) => (
            <button
              key={type}
              className={`btn btn--${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : ''}`}
              onClick={() => showNotif({
                type,
                message: `${type.charAt(0).toUpperCase() + type.slice(1)} notification at ${new Date().toLocaleTimeString()}`,
                autoDismissMs: autoDismiss ? 4000 : undefined,
              })}
            >
              {type}
            </button>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={autoDismiss}
              onChange={(e) => setAutoDismiss(e.target.checked)}
            />
            Auto-dismiss (4s)
          </label>
        </div>
      </div>

      {/* ── PrismUIRootRenderer ── */}
      <div className="feature-section">
        <h3 className="feature-section__title">PrismUIRootRenderer</h3>
        <p className="feature-section__desc">
          Convenience wrapper that renders all three renderers in one component.
          Place it once in your app root for complete rendering support.
        </p>
        <div className="code-block">
{`import { PrismUIRootRenderer } from '@prismui/react';

<PrismUIProvider runtime={runtime}>
  <PrismUIRootRenderer
    modal={{ children: (id, close) => <MyModal id={id} onClose={close} /> }}
    drawer={{ children: (id, anchor, close) => <MyDrawer id={id} anchor={anchor} onClose={close} /> }}
    notification={{ position: 'bottom-right' }}
  />
  <App />
</PrismUIProvider>`}
        </div>
      </div>

      {/* ── Actual Renderers (live in this demo) ── */}
      <ModalRenderer>
        {(modalId, close) => (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px 32px',
            minWidth: 320,
            maxWidth: 480,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ margin: '0 0 12px' }}>Modal: {modalId}</h3>
            <p style={{ color: '#666', margin: '0 0 16px' }}>
              This modal is rendered by <code>ModalRenderer</code> using a render-prop pattern.
              Try pressing Escape or clicking the backdrop to close.
            </p>
            <button className="btn" onClick={close}>Close</button>
          </div>
        )}
      </ModalRenderer>

      <DrawerRenderer>
        {(drawerId, anchor, close) => (
          <div style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 12px' }}>Drawer: {drawerId}</h3>
            <p style={{ color: '#666', fontSize: 14 }}>
              Anchor: <b>{anchor}</b>
            </p>
            <p style={{ color: '#666', fontSize: 14 }}>
              Rendered by <code>DrawerRenderer</code>. Click backdrop or press Escape to close.
            </p>
            <button className="btn" onClick={close}>Close</button>
          </div>
        )}
      </DrawerRenderer>

      <NotificationRenderer position="top-right" />
    </div>
  );
}
