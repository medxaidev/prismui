// ---------------------------------------------------------------------------
// Page Module — Built-in Interaction Module (Layer 0.5)
// Manages page mount/unmount/transition/lock via RuntimeModule interface.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeState, RuntimeStore } from '../store';

/** State slice contributed by the Page Module. */
export interface PageModuleState {
  currentPage: string | null;
  mountedPages: string[];
  locked: boolean;
}

/** Controller API exposed on runtime.modules.page */
export interface PageController {
  mount(pageId: string): void;
  unmount(pageId: string): void;
  transition(pageId: string): void;
  lock(): void;
  unlock(): void;
  getCurrent(): string | null;
  getMounted(): string[];
  isLocked(): boolean;
}

// Event type constants
const PAGE_MOUNT = 'PAGE_MOUNT';
const PAGE_UNMOUNT = 'PAGE_UNMOUNT';
const PAGE_TRANSITION = 'PAGE_TRANSITION';
const PAGE_LOCK = 'PAGE_LOCK';
const PAGE_UNLOCK = 'PAGE_UNLOCK';

/** Helper to read page state from RuntimeState. */
function getPageState(state: Readonly<RuntimeState>): PageModuleState {
  return {
    currentPage: state.currentPage as string | null,
    mountedPages: state.mountedPages as string[],
    locked: state.locked as boolean,
  };
}

/**
 * Create the Page Module.
 *
 * Contributes: currentPage, mountedPages, locked to RuntimeState.
 * Registers reducers for PAGE_MOUNT, PAGE_UNMOUNT, PAGE_TRANSITION, PAGE_LOCK, PAGE_UNLOCK.
 */
export function createPageModule(): RuntimeModule<PageController> {
  return {
    name: 'page',

    initialState: {
      currentPage: null,
      mountedPages: [],
      locked: false,
    },

    reducers: {
      [PAGE_MOUNT]: (event, prevState) => {
        const { pageId } = event.payload as { pageId: string };
        const ps = getPageState(prevState);

        // Already mounted — no-op
        if (ps.mountedPages.includes(pageId)) {
          return { nextState: prevState };
        }

        const nextMounted = [...ps.mountedPages, pageId];
        // Auto-set currentPage to the newly mounted page
        return {
          nextState: {
            ...prevState,
            mountedPages: nextMounted,
            currentPage: pageId,
          },
        };
      },

      [PAGE_UNMOUNT]: (event, prevState) => {
        const { pageId } = event.payload as { pageId: string };
        const ps = getPageState(prevState);

        const nextMounted = ps.mountedPages.filter((p) => p !== pageId);
        const nextCurrent = ps.currentPage === pageId ? null : ps.currentPage;

        return {
          nextState: {
            ...prevState,
            mountedPages: nextMounted,
            currentPage: nextCurrent,
          },
        };
      },

      [PAGE_TRANSITION]: (event, prevState) => {
        const { pageId } = event.payload as { pageId: string };
        const ps = getPageState(prevState);

        // Blocked when locked
        if (ps.locked) {
          return { nextState: prevState };
        }

        // Only transition to mounted pages
        if (!ps.mountedPages.includes(pageId)) {
          return { nextState: prevState };
        }

        return {
          nextState: { ...prevState, currentPage: pageId },
        };
      },

      [PAGE_LOCK]: (_event, prevState) => {
        return {
          nextState: { ...prevState, locked: true },
        };
      },

      [PAGE_UNLOCK]: (_event, prevState) => {
        return {
          nextState: { ...prevState, locked: false },
        };
      },
    },

    createController: ({ bus, store }: { bus: EventBus; store: RuntimeStore }) => ({
      mount(pageId: string): void {
        bus.dispatch({ type: PAGE_MOUNT, payload: { pageId } });
      },
      unmount(pageId: string): void {
        bus.dispatch({ type: PAGE_UNMOUNT, payload: { pageId } });
      },
      transition(pageId: string): void {
        bus.dispatch({ type: PAGE_TRANSITION, payload: { pageId } });
      },
      lock(): void {
        bus.dispatch({ type: PAGE_LOCK });
      },
      unlock(): void {
        bus.dispatch({ type: PAGE_UNLOCK });
      },
      getCurrent(): string | null {
        return store.getState().currentPage as string | null;
      },
      getMounted(): string[] {
        return store.getState().mountedPages as string[];
      },
      isLocked(): boolean {
        return store.getState().locked as boolean;
      },
    }),
  };
}
