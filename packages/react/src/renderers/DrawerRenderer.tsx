// ---------------------------------------------------------------------------
// DrawerRenderer — Layer 3 Rendering Component
// Subscribes to drawerStack and renders each drawer with anchor positioning.
// Zero business logic — purely presentational.
// ---------------------------------------------------------------------------

import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { DrawerAnchor } from '@prismui/core';
import { useDrawer } from '../use-drawer';

/** Props for DrawerRenderer. */
export interface DrawerRendererProps {
  /** Render prop: receives (drawerId, anchor, closeFn) and returns the drawer content. */
  children: (drawerId: string, anchor: DrawerAnchor, close: () => void) => React.ReactNode;
  /** Whether clicking the backdrop closes the top drawer. Default: true. */
  backdropClose?: boolean;
  /** Whether pressing Escape closes the top drawer. Default: true. */
  escapeClose?: boolean;
  /** Optional className applied to the overlay wrapper. */
  className?: string;
}

// Inline styles — no external CSS dependency
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1100,
};

const backdropStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
};

function getDrawerStyle(anchor: DrawerAnchor): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: '#fff',
    overflow: 'auto',
  };

  switch (anchor) {
    case 'left':
      return { ...base, top: 0, left: 0, bottom: 0, width: '300px' };
    case 'right':
      return { ...base, top: 0, right: 0, bottom: 0, width: '300px' };
    case 'top':
      return { ...base, top: 0, left: 0, right: 0, height: '300px' };
    case 'bottom':
      return { ...base, bottom: 0, left: 0, right: 0, height: '300px' };
    default:
      return { ...base, top: 0, left: 0, bottom: 0, width: '300px' };
  }
}

/**
 * DrawerRenderer — renders all open drawers from the runtime drawer stack.
 *
 * Uses a render-prop pattern so the application provides its own drawer UI.
 * Each drawer is rendered with correct anchor positioning (left/right/top/bottom).
 */
export function DrawerRenderer({
  children,
  backdropClose = true,
  escapeClose = true,
  className,
}: DrawerRendererProps) {
  const { drawerStack, close } = useDrawer();

  // Escape key handler — closes the top drawer
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (escapeClose && e.key === 'Escape' && drawerStack.length > 0) {
        close(); // close top of stack
      }
    },
    [escapeClose, drawerStack.length, close],
  );

  useEffect(() => {
    if (drawerStack.length === 0) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerStack.length, handleKeyDown]);

  if (drawerStack.length === 0) {
    return null;
  }

  return createPortal(
    <>
      {drawerStack.map((entry, index) => (
        <div
          key={entry.drawerId}
          className={className}
          style={{ ...overlayStyle, zIndex: 1100 + index }}
          data-testid={`drawer-overlay-${entry.drawerId}`}
        >
          <div
            style={backdropStyle}
            data-testid={`drawer-backdrop-${entry.drawerId}`}
            onClick={
              backdropClose
                ? () => close(entry.drawerId)
                : undefined
            }
          />
          <div
            style={getDrawerStyle(entry.anchor)}
            data-testid={`drawer-panel-${entry.drawerId}`}
            data-anchor={entry.anchor}
            role="complementary"
          >
            {children(entry.drawerId, entry.anchor, () => close(entry.drawerId))}
          </div>
        </div>
      ))}
    </>,
    document.body,
  );
}
