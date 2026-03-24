import { useDrawer } from '@prismui/react';
import type { DrawerAnchor } from '@prismui/core';

const anchorOptions: DrawerAnchor[] = ['left', 'right', 'top', 'bottom'];

export function DrawerModulePage() {
  const { drawerStack, open, close, closeAll } = useDrawer();

  return (
    <div>
      <div className="demo-content__header">
        <h2 className="demo-content__title">Drawer Module</h2>
        <p className="demo-content__subtitle">
          Stack-based drawer management with anchor positioning — left, right, top, bottom.
        </p>
      </div>

      <div className="info-card info-card--blue">
        Drawers work similarly to modals — they are managed as a <b>stack</b> with string IDs.
        Each drawer also has an <b>anchor</b> property that determines its position.
      </div>

      {/* API */}
      <div className="feature-section">
        <h3 className="feature-section__title">Drawer API</h3>
        <div className="code-block">
          {`const { open, close, closeAll, drawerStack } = useDrawer();

open('patient-info', 'right');    // Open drawer on right side
open('nav-menu', 'left');         // Open drawer on left side
close('patient-info');            // Close specific drawer
closeAll();                       // Close all drawers
drawerStack;                      // [{ drawerId, anchor }, ...]`}
        </div>
      </div>

      {/* Try it */}
      <div className="feature-section">
        <h3 className="feature-section__title">Try: Open Drawers</h3>
        <p className="feature-section__desc">
          Open drawers at different anchor positions. Watch the drawer stack in the right panel update.
        </p>
        <div className="feature-section__actions">
          {anchorOptions.map((anchor) => (
            <button
              key={anchor}
              className="btn"
              onClick={() => open(`drawer-${anchor}`, anchor)}
            >
              Open {anchor}
            </button>
          ))}
        </div>
        <div className="feature-section__actions">
          <button
            className="btn btn--danger"
            onClick={closeAll}
            disabled={drawerStack.length === 0}
          >
            Close All ({drawerStack.length})
          </button>
        </div>

        {/* Current Stack */}
        {drawerStack.length > 0 ? (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
              Open drawers:
            </div>
            {drawerStack.map((entry) => (
              <div key={entry.drawerId} className="data-row">
                <span className="data-row__label">
                  {entry.drawerId}
                  <span style={{ color: 'var(--color-text-muted)', marginLeft: 6 }}>({entry.anchor})</span>
                </span>
                <button className="data-row__close" onClick={() => close(entry.drawerId)}>×</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="result-display">No drawers open</div>
        )}
      </div>

      {/* Event Flow */}
      <div className="feature-section">
        <h3 className="feature-section__title">Event Flow</h3>
        <div className="code-block">
          {`open('patient-info', 'right')
  → dispatch({
      type: "drawer/open",
      payload: { drawerId: "patient-info", anchor: "right" }
    })
  → Scheduler → Reducer: push onto drawerStack
  → Store commits → React re-renders`}
        </div>
      </div>
    </div>
  );
}
