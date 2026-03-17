// ---------------------------------------------------------------------------
// PrismUIRootRenderer — Convenience wrapper that renders all Layer 3 renderers.
// Single component to add Modal + Drawer + Notification rendering to your app.
// ---------------------------------------------------------------------------

import { ModalRenderer } from './ModalRenderer';
import type { ModalRendererProps } from './ModalRenderer';
import { DrawerRenderer } from './DrawerRenderer';
import type { DrawerRendererProps } from './DrawerRenderer';
import { NotificationRenderer } from './NotificationRenderer';
import type { NotificationRendererProps } from './NotificationRenderer';

/** Props for PrismUIRootRenderer. */
export interface PrismUIRootRendererProps {
  /** Props passed to the ModalRenderer. Required if modals are used. */
  modal?: ModalRendererProps;
  /** Props passed to the DrawerRenderer. Required if drawers are used. */
  drawer?: DrawerRendererProps;
  /** Props passed to the NotificationRenderer. Renders with defaults if provided as empty object. */
  notification?: Omit<NotificationRendererProps, 'children'>;
}

/**
 * PrismUIRootRenderer — convenience component that renders all Layer 3 renderers.
 *
 * Place this once in your app root, inside `<PrismUIProvider>`.
 *
 * ```tsx
 * <PrismUIProvider runtime={runtime}>
 *   <PrismUIRootRenderer
 *     modal={{ children: (id, close) => <MyModal id={id} onClose={close} /> }}
 *     drawer={{ children: (id, anchor, close) => <MyDrawer id={id} anchor={anchor} onClose={close} /> }}
 *     notification={{ position: 'bottom-right' }}
 *   />
 *   <App />
 * </PrismUIProvider>
 * ```
 */
export function PrismUIRootRenderer({
  modal,
  drawer,
  notification,
}: PrismUIRootRendererProps) {
  return (
    <>
      {modal && <ModalRenderer {...modal} />}
      {drawer && <DrawerRenderer {...drawer} />}
      {notification !== undefined && <NotificationRenderer {...notification} />}
    </>
  );
}
