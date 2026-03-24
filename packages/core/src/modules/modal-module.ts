// ---------------------------------------------------------------------------
// Modal Module — Built-in Interaction Module (Layer 0.5)
// Manages modal stack (open/close/closeAll) via RuntimeModule interface.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeStore } from '../store';
import { createModuleActions } from '../action-types';

/** State slice contributed by the Modal Module. */
export interface ModalModuleState {
  modalStack: string[];
}

/** Controller API exposed on runtime.modules.modal */
export interface ModalController {
  open(modalId: string): void;
  close(modalId?: string): void;
  closeAll(): void;
  isOpen(modalId: string): boolean;
  getStack(): string[];
}

// Event type constants (namespaced)
const ModalActions = createModuleActions('modal', {
  OPEN: 'open',
  CLOSE: 'close',
  CLOSE_ALL: 'closeAll',
});

/** @deprecated Use ModalActions — kept for backward compatibility */
export const MODAL_OPEN = ModalActions.OPEN;
/** @deprecated Use ModalActions — kept for backward compatibility */
export const MODAL_CLOSE = ModalActions.CLOSE;
/** @deprecated Use ModalActions — kept for backward compatibility */
export const MODAL_CLOSE_ALL = ModalActions.CLOSE_ALL;

export { ModalActions };

/**
 * Create the Modal Module.
 *
 * Contributes: modalStack to RuntimeState.
 * Registers reducers for MODAL_OPEN, MODAL_CLOSE, MODAL_CLOSE_ALL.
 */
export function createModalModule(): RuntimeModule<ModalController> {
  return {
    name: 'modal',

    initialState: {
      modalStack: [],
    },

    reducers: {
      [ModalActions.OPEN]: (event, prevState) => {
        const { modalId } = event.payload as { modalId: string };
        const stack = prevState.modalStack as string[];

        // Already open — no-op
        if (stack.includes(modalId)) {
          return { nextState: prevState };
        }

        return {
          nextState: {
            ...prevState,
            modalStack: [...stack, modalId],
          },
        };
      },

      [ModalActions.CLOSE]: (event, prevState) => {
        const payload = event.payload as { modalId?: string } | undefined;
        const stack = prevState.modalStack as string[];

        if (payload?.modalId) {
          // Close specific modal
          return {
            nextState: {
              ...prevState,
              modalStack: stack.filter((id) => id !== payload.modalId),
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
            modalStack: stack.slice(0, -1),
          },
        };
      },

      [ModalActions.CLOSE_ALL]: (_event, prevState) => {
        return {
          nextState: { ...prevState, modalStack: [] },
        };
      },
    },

    createController: ({ bus, store }: { bus: EventBus; store: RuntimeStore }) => ({
      open(modalId: string): void {
        bus.dispatch({ type: ModalActions.OPEN, payload: { modalId } });
      },
      close(modalId?: string): void {
        bus.dispatch({ type: ModalActions.CLOSE, payload: { modalId } });
      },
      closeAll(): void {
        bus.dispatch({ type: ModalActions.CLOSE_ALL });
      },
      isOpen(modalId: string): boolean {
        return (store.getState().modalStack as string[]).includes(modalId);
      },
      getStack(): string[] {
        return store.getState().modalStack as string[];
      },
    }),
  };
}
