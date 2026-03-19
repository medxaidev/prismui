// ---------------------------------------------------------------------------
// Router Module — Built-in Interaction Module (Layer 0.5)
// Manages URL-driven navigation with pluggable adapter pattern.
// Zero React, zero DOM in module logic — browser API isolated in adapters.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeState, RuntimeStore } from '../store';

// ── Types ─────────────────────────────────────────────────────────────

/** Parsed URL location. */
export interface RouterLocation {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
}

/** Pluggable adapter interface for URL management. */
export interface RouterAdapter {
  getLocation(): RouterLocation;
  push(path: string, state?: unknown): void;
  replace(path: string, state?: unknown): void;
  back(): void;
  forward(): void;
  go(delta: number): void;
  subscribe(listener: (location: RouterLocation) => void): () => void;
  createHref(path: string): string;
}

/** State slice contributed by the Router Module. */
export interface RouterModuleState {
  routerLocation: RouterLocation;
  routerHistory: string[];
  routerHistoryIndex: number;
}

/** Controller API exposed on runtime.modules.router */
export interface RouterController {
  push(path: string, state?: unknown): void;
  replace(path: string, state?: unknown): void;
  back(): void;
  forward(): void;
  go(delta: number): void;
  getLocation(): RouterLocation;
  getPath(): string;
  getQuery(): Record<string, string>;
  getHash(): string;
  getState(): unknown;
  createHref(path: string): string;
}

/** Options for createRouterModule. */
export interface RouterModuleOptions {
  adapter?: RouterAdapter;
  maxHistorySize?: number;
}

// ── Event Constants ───────────────────────────────────────────────────

export const ROUTER_NAVIGATE = 'ROUTER_NAVIGATE';
export const ROUTER_REPLACE = 'ROUTER_REPLACE';
export const ROUTER_BACK = 'ROUTER_BACK';
export const ROUTER_FORWARD = 'ROUTER_FORWARD';
export const ROUTER_GO = 'ROUTER_GO';
export const ROUTER_LOCATION_CHANGED = 'ROUTER_LOCATION_CHANGED';

// ── Utilities ─────────────────────────────────────────────────────────

/** Parse a query string into a key-value map. */
export function parseQueryString(search: string): Record<string, string> {
  const result: Record<string, string> = {};
  const raw = search.startsWith('?') ? search.slice(1) : search;
  if (!raw) return result;

  for (const pair of raw.split('&')) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) {
      result[decodeURIComponent(pair)] = '';
    } else {
      const key = decodeURIComponent(pair.slice(0, eqIdx));
      const value = decodeURIComponent(pair.slice(eqIdx + 1));
      result[key] = value;
    }
  }
  return result;
}

/** Build a query string from a key-value map. */
export function buildQueryString(params: Record<string, string>): string {
  const entries = Object.entries(params);
  if (entries.length === 0) return '';
  return '?' + entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

// ── Memory Router Adapter ─────────────────────────────────────────────

/** In-memory router adapter for testing and SSR. */
export function createMemoryRouterAdapter(
  initialPath: string = '/',
): RouterAdapter {
  const listeners = new Set<(location: RouterLocation) => void>();
  const history: { path: string; state: unknown }[] = [
    { path: initialPath, state: null },
  ];
  let currentIndex = 0;

  function parsePath(path: string): RouterLocation {
    const hashIdx = path.indexOf('#');
    const searchIdx = path.indexOf('?');
    let pathname = path;
    let search = '';
    let hash = '';

    if (hashIdx >= 0) {
      hash = path.slice(hashIdx);
      pathname = path.slice(0, hashIdx);
    }
    if (searchIdx >= 0 && (hashIdx < 0 || searchIdx < hashIdx)) {
      search = pathname.slice(searchIdx);
      pathname = pathname.slice(0, searchIdx);
    }

    return { pathname, search, hash, state: history[currentIndex]?.state ?? null };
  }

  function getCurrentLocation(): RouterLocation {
    const entry = history[currentIndex];
    return parsePath(entry.path);
  }

  function notify(): void {
    const loc = getCurrentLocation();
    for (const listener of listeners) {
      listener(loc);
    }
  }

  return {
    getLocation: getCurrentLocation,

    push(path: string, state?: unknown): void {
      // Remove forward history
      history.splice(currentIndex + 1);
      history.push({ path, state: state ?? null });
      currentIndex = history.length - 1;
      notify();
    },

    replace(path: string, state?: unknown): void {
      history[currentIndex] = { path, state: state ?? null };
      notify();
    },

    back(): void {
      if (currentIndex > 0) {
        currentIndex--;
        notify();
      }
    },

    forward(): void {
      if (currentIndex < history.length - 1) {
        currentIndex++;
        notify();
      }
    },

    go(delta: number): void {
      const newIndex = currentIndex + delta;
      if (newIndex >= 0 && newIndex < history.length) {
        currentIndex = newIndex;
        notify();
      }
    },

    subscribe(listener: (location: RouterLocation) => void): () => void {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },

    createHref(path: string): string {
      return path;
    },
  };
}

// ── Browser Router Adapter ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWindow = any;

function getGlobalWindow(): AnyWindow | undefined {
  const g = typeof globalThis !== 'undefined' ? (globalThis as Record<string, unknown>) : undefined;
  if (g && typeof g.window !== 'undefined' && typeof (g.window as Record<string, unknown>).history !== 'undefined') {
    return g.window as AnyWindow;
  }
  return undefined;
}

/** Browser History API adapter. SSR-safe — no-ops if window is undefined. */
export function createBrowserRouterAdapter(): RouterAdapter {
  const win = getGlobalWindow();

  function getLocation(): RouterLocation {
    if (!win) {
      return { pathname: '/', search: '', hash: '', state: null };
    }
    return {
      pathname: win.location.pathname as string,
      search: win.location.search as string,
      hash: win.location.hash as string,
      state: (win.history.state as unknown) ?? null,
    };
  }

  return {
    getLocation,

    push(path: string, state?: unknown): void {
      if (!win) return;
      win.history.pushState(state ?? null, '', path);
      // Manually dispatch popstate since pushState doesn't fire it
      const evt = new (win.PopStateEvent as new (type: string, init?: Record<string, unknown>) => unknown)('popstate', { state: state ?? null });
      win.dispatchEvent(evt);
    },

    replace(path: string, state?: unknown): void {
      if (!win) return;
      win.history.replaceState(state ?? null, '', path);
      const evt = new (win.PopStateEvent as new (type: string, init?: Record<string, unknown>) => unknown)('popstate', { state: state ?? null });
      win.dispatchEvent(evt);
    },

    back(): void {
      if (!win) return;
      win.history.back();
    },

    forward(): void {
      if (!win) return;
      win.history.forward();
    },

    go(delta: number): void {
      if (!win) return;
      win.history.go(delta);
    },

    subscribe(listener: (location: RouterLocation) => void): () => void {
      if (!win) return () => { };
      const handler = () => listener(getLocation());
      win.addEventListener('popstate', handler);
      return () => win.removeEventListener('popstate', handler);
    },

    createHref(path: string): string {
      return path;
    },
  };
}

// ── Helper ────────────────────────────────────────────────────────────

function getRouterState(state: Readonly<RuntimeState>): RouterModuleState {
  return {
    routerLocation: state.routerLocation as RouterLocation,
    routerHistory: state.routerHistory as string[],
    routerHistoryIndex: state.routerHistoryIndex as number,
  };
}

// ── Router Module Factory ─────────────────────────────────────────────

/**
 * Create the Router Module.
 *
 * Contributes: routerLocation, routerHistory, routerHistoryIndex to RuntimeState.
 * Registers reducers for ROUTER_NAVIGATE, ROUTER_REPLACE, ROUTER_LOCATION_CHANGED.
 */
export function createRouterModule(options?: RouterModuleOptions): RuntimeModule<RouterController> {
  const maxHistory = options?.maxHistorySize ?? 50;
  // Adapter is created lazily — allows module definition without browser
  let adapter: RouterAdapter | null = options?.adapter ?? null;
  let adapterUnsubscribe: (() => void) | null = null;
  let suppressNotify = false;

  function getAdapter(): RouterAdapter {
    if (!adapter) {
      adapter = createMemoryRouterAdapter('/');
    }
    return adapter;
  }

  const initialLocation = options?.adapter?.getLocation() ?? {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  };

  return {
    name: 'router',

    initialState: {
      routerLocation: initialLocation,
      routerHistory: [initialLocation.pathname],
      routerHistoryIndex: 0,
    },

    reducers: {
      [ROUTER_LOCATION_CHANGED]: (event, prevState) => {
        const { location } = event.payload as { location: RouterLocation };
        const rs = getRouterState(prevState);

        // Add to history if path changed and this isn't a replace
        const isNewPath = location.pathname !== rs.routerLocation.pathname ||
          location.search !== rs.routerLocation.search;

        let nextHistory = rs.routerHistory;
        let nextIndex = rs.routerHistoryIndex;

        if (isNewPath) {
          // Check if we're navigating back/forward in existing history
          const existingIdx = rs.routerHistory.indexOf(
            location.pathname + location.search,
          );
          if (existingIdx >= 0 && Math.abs(existingIdx - rs.routerHistoryIndex) <= 1) {
            nextIndex = existingIdx;
          } else {
            // New navigation — truncate forward history and append
            nextHistory = [
              ...rs.routerHistory.slice(0, rs.routerHistoryIndex + 1),
              location.pathname + location.search,
            ];
            // Enforce max history size
            if (nextHistory.length > maxHistory) {
              nextHistory = nextHistory.slice(nextHistory.length - maxHistory);
            }
            nextIndex = nextHistory.length - 1;
          }
        }

        return {
          nextState: {
            ...prevState,
            routerLocation: location,
            routerHistory: nextHistory,
            routerHistoryIndex: nextIndex,
          },
        };
      },

      [ROUTER_REPLACE]: (event, prevState) => {
        const { location } = event.payload as { location: RouterLocation };
        const rs = getRouterState(prevState);

        // Replace current entry in history
        const nextHistory = [...rs.routerHistory];
        nextHistory[rs.routerHistoryIndex] = location.pathname + location.search;

        return {
          nextState: {
            ...prevState,
            routerLocation: location,
            routerHistory: nextHistory,
          },
        };
      },
    },

    onInit: ({ bus }) => {
      const a = getAdapter();

      // Subscribe to adapter's location changes and sync to store
      adapterUnsubscribe = a.subscribe((location) => {
        if (suppressNotify) return;
        bus.dispatch({
          type: ROUTER_LOCATION_CHANGED,
          payload: { location },
        });
      });
    },

    onDestroy: () => {
      if (adapterUnsubscribe) {
        adapterUnsubscribe();
        adapterUnsubscribe = null;
      }
    },

    createController: ({ bus, store }: { bus: EventBus; store: RuntimeStore }) => ({
      push(path: string, state?: unknown): void {
        const a = getAdapter();
        a.push(path, state);
        // Event is dispatched by the adapter's subscribe callback
      },

      replace(path: string, state?: unknown): void {
        const a = getAdapter();
        // Suppress adapter notification — we dispatch ROUTER_REPLACE ourselves
        suppressNotify = true;
        a.replace(path, state);
        suppressNotify = false;
        // Dispatch replace event for the store
        bus.dispatch({
          type: ROUTER_REPLACE,
          payload: { location: a.getLocation() },
        });
      },

      back(): void {
        getAdapter().back();
      },

      forward(): void {
        getAdapter().forward();
      },

      go(delta: number): void {
        getAdapter().go(delta);
      },

      getLocation(): RouterLocation {
        return store.getState().routerLocation as RouterLocation;
      },

      getPath(): string {
        return (store.getState().routerLocation as RouterLocation).pathname;
      },

      getQuery(): Record<string, string> {
        const loc = store.getState().routerLocation as RouterLocation;
        return parseQueryString(loc.search);
      },

      getHash(): string {
        return (store.getState().routerLocation as RouterLocation).hash;
      },

      getState(): unknown {
        return (store.getState().routerLocation as RouterLocation).state;
      },

      createHref(path: string): string {
        return getAdapter().createHref(path);
      },
    }),
  };
}
