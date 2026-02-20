'use client';

import { useEffect, useState } from 'react';
import { Drawer } from '../../../components/Drawer/Drawer';
import { useDrawerController } from './useDrawerController';
import type { DrawerInstance } from './types';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders programmatic drawers managed by the DrawerController.
 *
 * Place this component once inside your PrismuiProvider tree (typically
 * at the root level alongside other renderers).
 *
 * @example
 * ```tsx
 * <PrismuiProvider modules={[overlayModule(), drawerModule()]}>
 *   <App />
 *   <DrawerRenderer />
 * </PrismuiProvider>
 * ```
 */
export function DrawerRenderer() {
  const controller = useDrawerController();
  const [drawers, setDrawers] = useState<DrawerInstance[]>([]);

  useEffect(() => {
    // Sync initial state
    setDrawers(controller.getDrawers());

    // Subscribe to changes
    const unsubscribe = controller.subscribe((next) => {
      setDrawers([...next]);
    });

    return unsubscribe;
  }, [controller]);

  return (
    <>
      {drawers.map((instance) => {
        const { id, options } = instance;
        const {
          title,
          content,
          position = 'right',
          size,
          closeOnEscape = true,
          closeOnClickOutside = true,
          withCloseButton = true,
          withOverlay = true,
          onClose,
        } = options;

        const handleClose = () => {
          onClose?.();
          controller.close(id);
        };

        return (
          <Drawer
            key={id}
            opened
            onClose={handleClose}
            title={title}
            position={position}
            size={size}
            closeOnEscape={closeOnEscape}
            closeOnClickOutside={closeOnClickOutside}
            withCloseButton={withCloseButton}
            withOverlay={withOverlay}
          >
            {content}
          </Drawer>
        );
      })}
    </>
  );
}

DrawerRenderer.displayName = '@prismui/core/DrawerRenderer';
