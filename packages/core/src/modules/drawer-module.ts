// ---------------------------------------------------------------------------
// Drawer Module — Built-in Interaction Module (Layer 0.5)
// Manages drawer stack (open/close/closeAll) with anchor positioning.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeStore } from '../store';
import { createModuleActions } from '../action-types';

/** Anchor position for a drawer. */
export type DrawerAnchor = 'left' | 'right' | 'top' | 'bottom';

/** A single drawer entry in the stack. */
export interface DrawerEntry {
  drawerId: string;
  anchor: DrawerAnchor;
}

/** State slice contributed by the Drawer Module. */
export interface DrawerModuleState {
  drawerStack: DrawerEntry[];
}

/** Controller API exposed on runtime.modules.drawer */
export interface DrawerController {
  open(drawerId: string, anchor?: DrawerAnchor): void;
  close(drawerId?: string): void;
  closeAll(): void;
  isOpen(drawerId: string): boolean;
  getStack(): DrawerEntry[];
  getAnchor(drawerId: string): DrawerAnchor | undefined;
}

// Event type constants (namespaced)
const DrawerActions = createModuleActions('drawer', {
  OPEN: 'open',
  CLOSE: 'close',
  CLOSE_ALL: 'closeAll',
});

export { DrawerActions };

/**
 * Create the Drawer Module.
 *
 * Contributes: drawerStack to RuntimeState.
 * Registers reducers for DRAWER_OPEN, DRAWER_CLOSE, DRAWER_CLOSE_ALL.
 */
export function createDrawerModule(): RuntimeModule<DrawerController> {
  return {
    name: 'drawer',

    initialState: {
      drawerStack: [],
    },

    reducers: {
      [DrawerActions.OPEN]: (event, prevState) => {
        const { drawerId, anchor = 'left' } = event.payload as {
          drawerId: string;
          anchor?: DrawerAnchor;
        };
        const stack = prevState.drawerStack as DrawerEntry[];

        // Already open — no-op
        if (stack.some((e) => e.drawerId === drawerId)) {
          return { nextState: prevState };
        }

        return {
          nextState: {
            ...prevState,
            drawerStack: [...stack, { drawerId, anchor }],
          },
        };
      },

      [DrawerActions.CLOSE]: (event, prevState) => {
        const payload = event.payload as { drawerId?: string } | undefined;
        const stack = prevState.drawerStack as DrawerEntry[];

        if (payload?.drawerId) {
          // Close specific drawer
          return {
            nextState: {
              ...prevState,
              drawerStack: stack.filter((e) => e.drawerId !== payload.drawerId),
            },
          };
        }

        // Close top of stack
        if (stack.length === 0) {
          return { nextState: prevState };
        }

        return {
          nextState: {
            ...prevState,
            drawerStack: stack.slice(0, -1),
          },
        };
      },

      [DrawerActions.CLOSE_ALL]: (_event, prevState) => {
        return {
          nextState: { ...prevState, drawerStack: [] },
        };
      },
    },

    createController: ({ bus, store }: { bus: EventBus; store: RuntimeStore }) => ({
      open(drawerId: string, anchor?: DrawerAnchor): void {
        bus.dispatch({ type: DrawerActions.OPEN, payload: { drawerId, anchor } });
      },
      close(drawerId?: string): void {
        bus.dispatch({ type: DrawerActions.CLOSE, payload: { drawerId } });
      },
      closeAll(): void {
        bus.dispatch({ type: DrawerActions.CLOSE_ALL });
      },
      isOpen(drawerId: string): boolean {
        return (store.getState().drawerStack as DrawerEntry[]).some(
          (e) => e.drawerId === drawerId,
        );
      },
      getStack(): DrawerEntry[] {
        return store.getState().drawerStack as DrawerEntry[];
      },
      getAnchor(drawerId: string): DrawerAnchor | undefined {
        const entry = (store.getState().drawerStack as DrawerEntry[]).find(
          (e) => e.drawerId === drawerId,
        );
        return entry?.anchor;
      },
    }),
  };
}
