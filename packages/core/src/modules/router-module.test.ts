import { describe, it, expect } from 'vitest';
import { createInteractionRuntime } from '../index';
import {
  createRouterModule,
  createMemoryRouterAdapter,
  parseQueryString,
  buildQueryString,
  type RouterController,
  type RouterLocation,
} from './router-module';

function setup(initialPath = '/') {
  const adapter = createMemoryRouterAdapter(initialPath);
  const runtime = createInteractionRuntime({
    modules: [createRouterModule({ adapter })],
  });
  const router = runtime.modules.router as RouterController;
  return { runtime, router, adapter };
}

describe('Router Module', () => {
  // ── creation ──────────────────────────────────────────────────────────

  describe('creation', () => {
    it('createRouterModule returns valid RuntimeModule', () => {
      const mod = createRouterModule();
      expect(mod.name).toBe('router');
      expect(mod.initialState).toBeDefined();
      expect(mod.reducers).toBeDefined();
      expect(mod.createController).toBeDefined();
    });

    it('contributes initial state with default location', () => {
      const { runtime } = setup();
      const state = runtime.getState();
      const loc = state.routerLocation as RouterLocation;
      expect(loc.pathname).toBe('/');
      expect(loc.search).toBe('');
      expect(loc.hash).toBe('');
      expect(state.routerHistory).toEqual(['/']);
      expect(state.routerHistoryIndex).toBe(0);
    });

    it('contributes initial state with custom path', () => {
      const { runtime } = setup('/dashboard');
      const state = runtime.getState();
      const loc = state.routerLocation as RouterLocation;
      expect(loc.pathname).toBe('/dashboard');
    });
  });

  // ── push ──────────────────────────────────────────────────────────────

  describe('push', () => {
    it('push changes location', () => {
      const { router } = setup();
      router.push('/about');
      expect(router.getPath()).toBe('/about');
    });

    it('push adds to history', () => {
      const { runtime, router } = setup();
      router.push('/about');
      router.push('/contact');
      const state = runtime.getState();
      expect((state.routerHistory as string[]).length).toBeGreaterThanOrEqual(2);
    });

    it('push dispatches ROUTER_LOCATION_CHANGED event', () => {
      const { runtime, router } = setup();
      router.push('/about');
      const history = runtime.bus.getHistory();
      const navEvent = history.find((e) => e.type === 'router/locationChanged');
      expect(navEvent).toBeDefined();
    });

    it('push with state preserves route state', () => {
      const { router } = setup();
      router.push('/item/42', { id: 42 });
      expect(router.getPath()).toBe('/item/42');
    });
  });

  // ── replace ───────────────────────────────────────────────────────────

  describe('replace', () => {
    it('replace changes location without adding history entry', () => {
      const { runtime, router } = setup();
      router.push('/about');
      const historyBefore = (runtime.getState().routerHistory as string[]).length;
      router.replace('/about-v2');
      const historyAfter = (runtime.getState().routerHistory as string[]).length;
      expect(router.getPath()).toBe('/about-v2');
      expect(historyAfter).toBe(historyBefore);
    });

    it('replace dispatches ROUTER_REPLACE event', () => {
      const { runtime, router } = setup();
      router.replace('/replaced');
      const history = runtime.bus.getHistory();
      const replaceEvent = history.find((e) => e.type === 'router/replace');
      expect(replaceEvent).toBeDefined();
    });
  });

  // ── back / forward ────────────────────────────────────────────────────

  describe('back / forward', () => {
    it('back navigates to previous location', () => {
      const { router } = setup();
      router.push('/page1');
      router.push('/page2');
      router.back();
      expect(router.getPath()).toBe('/page1');
    });

    it('forward navigates to next location after back', () => {
      const { router } = setup();
      router.push('/page1');
      router.push('/page2');
      router.back();
      router.forward();
      expect(router.getPath()).toBe('/page2');
    });

    it('back at start is no-op', () => {
      const { router } = setup();
      router.back();
      expect(router.getPath()).toBe('/');
    });

    it('forward at end is no-op', () => {
      const { router } = setup();
      router.push('/page1');
      router.forward();
      expect(router.getPath()).toBe('/page1');
    });
  });

  // ── go ────────────────────────────────────────────────────────────────

  describe('go', () => {
    it('go(-1) behaves like back', () => {
      const { router } = setup();
      router.push('/page1');
      router.push('/page2');
      router.go(-1);
      expect(router.getPath()).toBe('/page1');
    });

    it('go(1) behaves like forward', () => {
      const { router } = setup();
      router.push('/page1');
      router.push('/page2');
      router.go(-1);
      router.go(1);
      expect(router.getPath()).toBe('/page2');
    });

    it('go with out of range delta is no-op', () => {
      const { router } = setup();
      router.go(-5);
      expect(router.getPath()).toBe('/');
    });
  });

  // ── query ─────────────────────────────────────────────────────────────

  describe('query', () => {
    it('getQuery returns parsed search params', () => {
      const { router } = setup();
      router.push('/search?q=hello&page=2');
      expect(router.getQuery()).toEqual({ q: 'hello', page: '2' });
    });

    it('getQuery returns empty object when no search', () => {
      const { router } = setup();
      expect(router.getQuery()).toEqual({});
    });
  });

  // ── getters ───────────────────────────────────────────────────────────

  describe('getters', () => {
    it('getHash returns hash', () => {
      const { router } = setup();
      router.push('/page#section');
      expect(router.getHash()).toBe('#section');
    });

    it('getLocation returns full location', () => {
      const { router } = setup();
      router.push('/about');
      const loc = router.getLocation();
      expect(loc.pathname).toBe('/about');
    });

    it('createHref returns the path', () => {
      const { router } = setup();
      expect(router.createHref('/test')).toBe('/test');
    });
  });
});

// ── Utilities ─────────────────────────────────────────────────────────

describe('parseQueryString', () => {
  it('parses simple query string', () => {
    expect(parseQueryString('?a=1&b=2')).toEqual({ a: '1', b: '2' });
  });

  it('parses without leading ?', () => {
    expect(parseQueryString('a=1&b=2')).toEqual({ a: '1', b: '2' });
  });

  it('returns empty for empty string', () => {
    expect(parseQueryString('')).toEqual({});
  });

  it('handles key without value', () => {
    expect(parseQueryString('?flag')).toEqual({ flag: '' });
  });

  it('decodes URI components', () => {
    expect(parseQueryString('?q=hello%20world')).toEqual({ q: 'hello world' });
  });
});

describe('buildQueryString', () => {
  it('builds query string from params', () => {
    expect(buildQueryString({ a: '1', b: '2' })).toBe('?a=1&b=2');
  });

  it('returns empty string for empty params', () => {
    expect(buildQueryString({})).toBe('');
  });

  it('encodes URI components', () => {
    const result = buildQueryString({ q: 'hello world' });
    expect(result).toBe('?q=hello%20world');
  });
});

// ── Memory Adapter ────────────────────────────────────────────────────

describe('createMemoryRouterAdapter', () => {
  it('starts at initial path', () => {
    const adapter = createMemoryRouterAdapter('/start');
    expect(adapter.getLocation().pathname).toBe('/start');
  });

  it('push updates location', () => {
    const adapter = createMemoryRouterAdapter();
    adapter.push('/new');
    expect(adapter.getLocation().pathname).toBe('/new');
  });

  it('subscribe fires on push', () => {
    const adapter = createMemoryRouterAdapter();
    const locations: RouterLocation[] = [];
    adapter.subscribe((loc) => locations.push(loc));
    adapter.push('/a');
    adapter.push('/b');
    expect(locations).toHaveLength(2);
    expect(locations[0].pathname).toBe('/a');
    expect(locations[1].pathname).toBe('/b');
  });

  it('unsubscribe stops notifications', () => {
    const adapter = createMemoryRouterAdapter();
    const locations: RouterLocation[] = [];
    const unsub = adapter.subscribe((loc) => locations.push(loc));
    adapter.push('/a');
    unsub();
    adapter.push('/b');
    expect(locations).toHaveLength(1);
  });

  it('back goes to previous location', () => {
    const adapter = createMemoryRouterAdapter();
    adapter.push('/a');
    adapter.push('/b');
    adapter.back();
    expect(adapter.getLocation().pathname).toBe('/a');
  });

  it('forward goes to next location', () => {
    const adapter = createMemoryRouterAdapter();
    adapter.push('/a');
    adapter.push('/b');
    adapter.back();
    adapter.forward();
    expect(adapter.getLocation().pathname).toBe('/b');
  });

  it('push after back truncates forward history', () => {
    const adapter = createMemoryRouterAdapter();
    adapter.push('/a');
    adapter.push('/b');
    adapter.back();
    adapter.push('/c');
    adapter.forward(); // no-op — /b was truncated
    expect(adapter.getLocation().pathname).toBe('/c');
  });

  it('replace updates current entry', () => {
    const adapter = createMemoryRouterAdapter();
    adapter.push('/a');
    adapter.replace('/a-replaced');
    expect(adapter.getLocation().pathname).toBe('/a-replaced');
    adapter.back();
    expect(adapter.getLocation().pathname).toBe('/');
  });

  it('createHref returns the path', () => {
    const adapter = createMemoryRouterAdapter();
    expect(adapter.createHref('/test')).toBe('/test');
  });
});
