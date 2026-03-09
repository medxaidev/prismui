// ---------------------------------------------------------------------------
// DevTools Module Tests — STAGE-007
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createInteractionRuntime } from '../runtime';
import { createPageModule } from '../modules/page-module';
import { createModalModule } from '../modules/modal-module';
import { createDevToolsModule, buildStateTree, diffSnapshots } from './devtools-module';
import { createRuntimeInspector } from './runtime-inspector';
import type { InteractionRuntime } from '../runtime';
import type { DevToolsController } from './types';
import type { DevToolsSnapshot } from './types';

// Helper to get devtools controller from runtime
function getDevTools(runtime: InteractionRuntime): DevToolsController {
  return runtime.modules.devtools as DevToolsController;
}

describe('DevTools Module', () => {
  let runtime: InteractionRuntime;
  let devtools: DevToolsController;

  beforeEach(() => {
    runtime = createInteractionRuntime({
      modules: [
        createPageModule(),
        createModalModule(),
        createDevToolsModule(),
      ],
    });
    devtools = getDevTools(runtime);
  });

  // ── Timeline ──────────────────────────────────────────

  describe('Timeline', () => {
    it('records events in timeline', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'dashboard' } });
      const timeline = devtools.getTimeline();
      // MODULE_INIT events + our dispatch
      expect(timeline.length).toBeGreaterThanOrEqual(1);

      const pageMount = timeline.find((e) => e.event.type === 'PAGE_MOUNT');
      expect(pageMount).toBeDefined();
      expect(pageMount!.stateVersionBefore).toBeDefined();
      expect(pageMount!.stateVersionAfter).toBeDefined();
      expect(pageMount!.duration).toBeGreaterThanOrEqual(0);
    });

    it('tracks reducer hit correctly', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'dashboard' } });
      const timeline = devtools.getTimeline();
      const pageMount = timeline.find((e) => e.event.type === 'PAGE_MOUNT');
      expect(pageMount).toBeDefined();
      expect(pageMount!.reducerHit).toBe(true);
      expect(pageMount!.stateVersionAfter).toBeGreaterThan(pageMount!.stateVersionBefore);
    });

    it('tracks non-reducer events', () => {
      runtime.dispatch({ type: 'UNKNOWN_EVENT' });
      const timeline = devtools.getTimeline();
      const unknown = timeline.find((e) => e.event.type === 'UNKNOWN_EVENT');
      expect(unknown).toBeDefined();
      expect(unknown!.reducerHit).toBe(false);
    });

    it('filters timeline by event type', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      runtime.dispatch({ type: 'MODAL_OPEN', payload: { modalId: 'b' } });
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'c' } });

      const pageEvents = devtools.getTimeline({ eventType: 'PAGE_MOUNT' });
      expect(pageEvents.every((e) => e.event.type === 'PAGE_MOUNT')).toBe(true);
      expect(pageEvents.length).toBe(2);
    });

    it('filters timeline by minDuration', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      // All events should be fast (<1ms typically)
      const slow = devtools.getTimeline({ minDuration: 10000 });
      expect(slow.length).toBe(0);
    });

    it('filters timeline with limit', () => {
      for (let i = 0; i < 10; i++) {
        runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: `p${i}` } });
      }
      const limited = devtools.getTimeline({ limit: 3 });
      expect(limited.length).toBe(3);
    });

    it('getSlowEvents returns events above threshold', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      // Threshold 0 should catch all events
      const all = devtools.getSlowEvents(0);
      expect(all.length).toBeGreaterThan(0);
      // High threshold should catch none
      const none = devtools.getSlowEvents(999999);
      expect(none.length).toBe(0);
    });

    it('clearTimeline removes all entries', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      expect(devtools.getTimeline().length).toBeGreaterThan(0);
      devtools.clearTimeline();
      // After clear, only the DEVTOOLS_TIMELINE_CLEARED event should be there
      const timeline = devtools.getTimeline();
      expect(timeline.length).toBeLessThanOrEqual(1);
    });

    it('respects maxTimelineEntries option', () => {
      const smallRuntime = createInteractionRuntime({
        modules: [
          createPageModule(),
          createDevToolsModule({ maxTimelineEntries: 5 }),
        ],
      });
      const dt = smallRuntime.modules.devtools as DevToolsController;

      for (let i = 0; i < 20; i++) {
        smallRuntime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: `p${i}` } });
      }
      expect(dt.getTimeline().length).toBeLessThanOrEqual(5);
    });
  });

  // ── Performance Metrics ───────────────────────────────

  describe('Performance Metrics', () => {
    it('tracks totalEvents', () => {
      const initialMetrics = devtools.getMetrics();
      const initialTotal = initialMetrics.totalEvents;
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'b' } });
      const metrics = devtools.getMetrics();
      expect(metrics.totalEvents).toBe(initialTotal + 2);
    });

    it('tracks averageDuration', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      const metrics = devtools.getMetrics();
      expect(metrics.averageDuration).toBeGreaterThanOrEqual(0);
    });

    it('tracks maxDuration', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      const metrics = devtools.getMetrics();
      expect(metrics.maxDuration).toBeGreaterThanOrEqual(0);
    });

    it('tracks eventsByType', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      runtime.dispatch({ type: 'MODAL_OPEN', payload: { modalId: 'b' } });
      const metrics = devtools.getMetrics();
      expect(metrics.eventsByType['PAGE_MOUNT']).toBeDefined();
      expect(metrics.eventsByType['MODAL_OPEN']).toBeDefined();
      expect(metrics.eventsByType['PAGE_MOUNT'].count).toBeGreaterThanOrEqual(1);
    });

    it('tracks eventsPerSecond', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      const metrics = devtools.getMetrics();
      expect(metrics.eventsPerSecond).toBeGreaterThanOrEqual(0);
    });

    it('tracks uptimeMs', () => {
      const metrics = devtools.getMetrics();
      expect(metrics.uptimeMs).toBeGreaterThanOrEqual(0);
      expect(metrics.startTime).toBeGreaterThan(0);
    });

    it('resetMetrics clears all counters', () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      devtools.resetMetrics();
      const metrics = devtools.getMetrics();
      expect(metrics.totalEvents).toBeLessThanOrEqual(1); // reset event itself
      expect(Object.keys(metrics.eventsByType).length).toBeLessThanOrEqual(1);
    });

    it('disablePerformance skips tracking', () => {
      const rt = createInteractionRuntime({
        modules: [
          createPageModule(),
          createDevToolsModule({ enablePerformance: false }),
        ],
      });
      const dt = rt.modules.devtools as DevToolsController;
      rt.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
      const metrics = dt.getMetrics();
      expect(metrics.totalEvents).toBe(0);
    });
  });

  // ── Snapshots ─────────────────────────────────────────

  describe('Snapshots', () => {
    it('captureSnapshot returns an ID', () => {
      const id = devtools.captureSnapshot('test');
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('getSnapshot retrieves captured snapshot', () => {
      const id = devtools.captureSnapshot('my-snapshot');
      const snap = devtools.getSnapshot(id);
      expect(snap).toBeDefined();
      expect(snap!.label).toBe('my-snapshot');
      expect(snap!.state).toBeDefined();
      expect(snap!.stateHash).toBeTruthy();
      expect(snap!.timestamp).toBeGreaterThan(0);
    });

    it('getSnapshots returns all snapshots', () => {
      devtools.captureSnapshot('a');
      devtools.captureSnapshot('b');
      const all = devtools.getSnapshots();
      expect(all.length).toBe(2);
    });

    it('compareSnapshots detects state changes', () => {
      const idA = devtools.captureSnapshot('before');
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'dashboard' } });
      runtime.dispatch({ type: 'PAGE_TRANSITION', payload: { pageId: 'dashboard' } });
      const idB = devtools.captureSnapshot('after');

      const diff = devtools.compareSnapshots(idA, idB);
      expect(diff).toBeDefined();
      expect(diff!.changed.length).toBeGreaterThan(0); // version at least
    });

    it('compareSnapshots returns unchanged for identical snapshots', () => {
      const idA = devtools.captureSnapshot('a');
      const idB = devtools.captureSnapshot('b');
      const diff = devtools.compareSnapshots(idA, idB);
      expect(diff).toBeDefined();
      // Version should differ since captureSnapshot dispatches an event
      // But other fields should be similar
      expect(diff!.added.length).toBe(0);
      expect(diff!.removed.length).toBe(0);
    });

    it('compareSnapshots returns undefined for missing IDs', () => {
      expect(devtools.compareSnapshots('nope', 'nada')).toBeUndefined();
    });

    it('clearSnapshots removes all', () => {
      devtools.captureSnapshot('a');
      devtools.captureSnapshot('b');
      devtools.clearSnapshots();
      expect(devtools.getSnapshots().length).toBe(0);
    });

    it('captureSnapshot with enableSnapshots=false returns empty string', () => {
      const rt = createInteractionRuntime({
        modules: [
          createPageModule(),
          createDevToolsModule({ enableSnapshots: false }),
        ],
      });
      const dt = rt.modules.devtools as DevToolsController;
      const id = dt.captureSnapshot('test');
      expect(id).toBe('');
    });

    it('exportSnapshot returns a snapshot without storing it', () => {
      const snap = devtools.exportSnapshot();
      expect(snap.id).toBeTruthy();
      expect(snap.label).toBe('export');
      expect(snap.state).toBeDefined();
      // Not stored in snapshots map
      expect(devtools.getSnapshot(snap.id)).toBeUndefined();
    });
  });

  // ── Inspector ─────────────────────────────────────────

  describe('Inspector', () => {
    it('getStateTree returns structured tree', () => {
      const tree = devtools.getStateTree();
      expect(tree.key).toBe('root');
      expect(tree.type).toBe('object');
      expect(tree.children).toBeDefined();
      expect(tree.children!.length).toBeGreaterThan(0);

      const versionNode = tree.children!.find((c) => c.key === 'version');
      expect(versionNode).toBeDefined();
      expect(versionNode!.type).toBe('number');
    });

    it('getModuleStates returns state without version', () => {
      const states = devtools.getModuleStates();
      expect(states.version).toBeUndefined();
      expect('currentPage' in states).toBe(true);
      expect('modalStack' in states).toBe(true);
    });
  });

  // ── Agent Interface ───────────────────────────────────

  describe('Agent Interface', () => {
    it('agent.dispatch dispatches events', () => {
      devtools.agent.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'test' } });
      const state = runtime.getState();
      expect((state as Record<string, unknown>).mountedPages).toBeDefined();
    });

    it('agent.getState returns current state', () => {
      const state = devtools.agent.getState();
      expect(state.version).toBeGreaterThanOrEqual(0);
    });

    it('agent.subscribe receives state updates', () => {
      const listener = vi.fn();
      const unsub = devtools.agent.subscribe(listener);
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'x' } });
      expect(listener).toHaveBeenCalled();
      unsub();
    });

    it('agent.executeSequence dispatches multiple events', async () => {
      await devtools.agent.executeSequence([
        { type: 'PAGE_MOUNT', payload: { pageId: 'a' } },
        { type: 'PAGE_MOUNT', payload: { pageId: 'b' } },
        { type: 'PAGE_TRANSITION', payload: { pageId: 'b' } },
      ]);
      const state = runtime.getState() as Record<string, unknown>;
      expect(state.currentPage).toBe('b');
    });

    it('agent.executeSequence with interval', async () => {
      const start = Date.now();
      await devtools.agent.executeSequence(
        [
          { type: 'PAGE_MOUNT', payload: { pageId: 'a' } },
          { type: 'PAGE_MOUNT', payload: { pageId: 'b' } },
        ],
        10,
      );
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(5); // at least some delay
    });

    it('agent.waitForState resolves immediately if predicate matches', async () => {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'x' } });
      runtime.dispatch({ type: 'PAGE_TRANSITION', payload: { pageId: 'x' } });

      const state = await devtools.agent.waitForState(
        (s) => (s as Record<string, unknown>).currentPage === 'x',
      );
      expect((state as Record<string, unknown>).currentPage).toBe('x');
    });

    it('agent.waitForState resolves on future state change', async () => {
      const promise = devtools.agent.waitForState(
        (s) => (s as Record<string, unknown>).currentPage === 'future',
        1000,
      );

      // Dispatch after a small delay
      setTimeout(() => {
        runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'future' } });
        runtime.dispatch({ type: 'PAGE_TRANSITION', payload: { pageId: 'future' } });
      }, 10);

      const state = await promise;
      expect((state as Record<string, unknown>).currentPage).toBe('future');
    });

    it('agent.waitForState rejects on timeout', async () => {
      await expect(
        devtools.agent.waitForState(() => false, 50),
      ).rejects.toThrow('waitForState timed out after 50ms');
    });
  });
});

// ── buildStateTree unit tests ─────────────────────────

describe('buildStateTree', () => {
  it('handles null', () => {
    const node = buildStateTree('test', null);
    expect(node.type).toBe('null');
  });

  it('handles undefined', () => {
    const node = buildStateTree('test', undefined);
    expect(node.type).toBe('undefined');
  });

  it('handles string', () => {
    const node = buildStateTree('test', 'hello');
    expect(node.type).toBe('string');
    expect(node.value).toBe('hello');
  });

  it('handles number', () => {
    const node = buildStateTree('test', 42);
    expect(node.type).toBe('number');
    expect(node.value).toBe(42);
  });

  it('handles boolean', () => {
    const node = buildStateTree('test', true);
    expect(node.type).toBe('boolean');
  });

  it('handles array', () => {
    const node = buildStateTree('test', [1, 2, 3]);
    expect(node.type).toBe('array');
    expect(node.children).toHaveLength(3);
    expect(node.children![0].key).toBe('0');
  });

  it('handles nested object', () => {
    const node = buildStateTree('root', { a: { b: 1 } });
    expect(node.type).toBe('object');
    expect(node.children).toHaveLength(1);
    expect(node.children![0].key).toBe('a');
    expect(node.children![0].type).toBe('object');
    expect(node.children![0].children![0].key).toBe('b');
  });
});

// ── diffSnapshots unit tests ──────────────────────────

describe('diffSnapshots', () => {
  const base: DevToolsSnapshot = {
    id: 'a',
    timestamp: 0,
    state: { version: 1, x: 1, y: 'hello' },
    stateHash: '',
    moduleStatus: {},
    eventCount: 0,
  };

  it('detects added keys', () => {
    const modified: DevToolsSnapshot = {
      ...base,
      id: 'b',
      state: { version: 1, x: 1, y: 'hello', z: true },
    };
    const diff = diffSnapshots(base, modified);
    expect(diff.added).toContain('z');
  });

  it('detects removed keys', () => {
    const modified: DevToolsSnapshot = {
      ...base,
      id: 'b',
      state: { version: 1, x: 1 },
    };
    const diff = diffSnapshots(base, modified);
    expect(diff.removed).toContain('y');
  });

  it('detects changed keys', () => {
    const modified: DevToolsSnapshot = {
      ...base,
      id: 'b',
      state: { version: 2, x: 1, y: 'world' },
    };
    const diff = diffSnapshots(base, modified);
    expect(diff.changed.find((c) => c.key === 'version')).toBeDefined();
    expect(diff.changed.find((c) => c.key === 'y')).toBeDefined();
  });

  it('detects unchanged keys', () => {
    const modified: DevToolsSnapshot = {
      ...base,
      id: 'b',
      state: { version: 1, x: 1, y: 'hello' },
    };
    const diff = diffSnapshots(base, modified);
    expect(diff.unchanged).toContain('x');
    expect(diff.unchanged).toContain('y');
    expect(diff.unchanged).toContain('version');
    expect(diff.changed.length).toBe(0);
    expect(diff.added.length).toBe(0);
    expect(diff.removed.length).toBe(0);
  });
});

// ── RuntimeInspector tests ────────────────────────────

describe('RuntimeInspector', () => {
  let runtime: InteractionRuntime;

  beforeEach(() => {
    runtime = createInteractionRuntime({
      modules: [createPageModule(), createModalModule()],
    });
  });

  it('getStateTree returns structured state', () => {
    const inspector = createRuntimeInspector(runtime);
    const tree = inspector.getStateTree();
    expect(tree.key).toBe('root');
    expect(tree.type).toBe('object');
    expect(tree.children!.length).toBeGreaterThan(0);
  });

  it('getModuleStates excludes version', () => {
    const inspector = createRuntimeInspector(runtime);
    const states = inspector.getModuleStates();
    expect(states.version).toBeUndefined();
    expect('currentPage' in states).toBe(true);
  });

  it('getEventHistory returns all events', () => {
    const inspector = createRuntimeInspector(runtime);
    runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
    const history = inspector.getEventHistory();
    expect(history.length).toBeGreaterThan(0);
  });

  it('getEventHistory filters by type', () => {
    const inspector = createRuntimeInspector(runtime);
    runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
    runtime.dispatch({ type: 'MODAL_OPEN', payload: { modalId: 'b' } });
    const pageEvents = inspector.getEventHistory({ type: 'PAGE_MOUNT' });
    expect(pageEvents.every((e) => e.type === 'PAGE_MOUNT')).toBe(true);
  });

  it('getEventHistory filters with limit', () => {
    const inspector = createRuntimeInspector(runtime);
    for (let i = 0; i < 10; i++) {
      runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: `p${i}` } });
    }
    const limited = inspector.getEventHistory({ limit: 3 });
    expect(limited.length).toBe(3);
  });

  it('exportSnapshot produces valid snapshot', () => {
    const inspector = createRuntimeInspector(runtime);
    runtime.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'a' } });
    const snap = inspector.exportSnapshot();
    expect(snap.id).toBeTruthy();
    expect(snap.state).toBeDefined();
    expect(snap.stateHash).toBeTruthy();
    expect(snap.moduleStatus).toBeDefined();
    expect(snap.eventCount).toBeGreaterThan(0);
  });
});
