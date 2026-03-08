import { useDrawer } from '@prismui/react';
import type { DrawerAnchor } from '@prismui/core';

const anchorOptions: DrawerAnchor[] = ['left', 'right', 'top', 'bottom'];

export function DrawerPanel() {
  const { drawerStack, open, close, closeAll } = useDrawer();

  return (
    <div>
      <h4 style={{ margin: '0 0 8px' }}>Drawer Controls</h4>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: 8 }}>
        {anchorOptions.map((anchor) => (
          <button
            key={anchor}
            onClick={() => open(`drawer-${anchor}`, anchor)}
            style={{
              padding: '4px 10px',
              border: '1px solid #aaa',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Open {anchor}
          </button>
        ))}
      </div>
      <button
        onClick={closeAll}
        disabled={drawerStack.length === 0}
        style={{
          padding: '4px 10px',
          border: '1px solid #c00',
          borderRadius: '4px',
          background: drawerStack.length > 0 ? '#fee' : '#f5f5f5',
          color: drawerStack.length > 0 ? '#c00' : '#999',
          cursor: drawerStack.length > 0 ? 'pointer' : 'default',
          fontSize: '12px',
          marginBottom: 8,
        }}
      >
        Close All
      </button>

      {drawerStack.length > 0 && (
        <div style={{ fontSize: '12px', color: '#555' }}>
          <b>Open drawers:</b>
          {drawerStack.map((entry) => (
            <div
              key={entry.drawerId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2px 0',
              }}
            >
              <span>
                {entry.drawerId} <span style={{ color: '#888' }}>({entry.anchor})</span>
              </span>
              <button
                onClick={() => close(entry.drawerId)}
                style={{
                  padding: '1px 6px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {drawerStack.length === 0 && (
        <div style={{ fontSize: '12px', color: '#999' }}>No drawers open</div>
      )}
    </div>
  );
}
