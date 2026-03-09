// ---------------------------------------------------------------------------
// DevTools Module — STAGE-007
// Optional runtime module for inspection, timeline, performance, and agent.
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeModule } from '../module';
import type { EventBus } from '../event-bus';
import type { RuntimeState, RuntimeStore } from '../store';
import type { SchedulerMiddleware } from '../scheduler';
import { computeStateHash } from '../governance/state-hash';
import type {
  DevToolsOptions,
  DevToolsController,
  TimelineEntry,
  TimelineFilter,
  PerformanceMetrics,
  DevToolsSnapshot,
  StateDiff,
  StateTreeNode,
  AgentInterface,
} from './types';

// --- Internal helpers ---

let snapshotIdCounter = 0;
function generateSnapshotId(): string {
  return `snap-${++snapshotIdCounter}-${Date.now()}`;
}

/**
 * Build a StateTreeNode from an arbitrary value.
 */
export function buildStateTree(key: string, value: unknown): StateTreeNode {
  if (value === null) {
    return { key, value, type: 'null' };
  }
  if (value === undefined) {
    return { key, value, type: 'undefined' };
  }
  if (Array.isArray(value)) {
    return {
      key,
      value,
      type: 'array',
      children: value.map((item, i) => buildStateTree(String(i), item)),
    };
  }
  if (typeof value === 'object') {
    return {
      key,
      value,
      type: 'object',
      children: Object.entries(value).map(([k, v]) => buildStateTree(k, v)),
    };
  }
  return { key, value, type: typeof value as 'string' | 'number' | 'boolean' };
}

/**
 * Compare two snapshots and produce a diff.
 */
export function diffSnapshots(a: DevToolsSnapshot, b: DevToolsSnapshot): StateDiff {
  const aKeys = Object.keys(a.state);
  const bKeys = Object.keys(b.state);
  const allKeys = new Set([...aKeys, ...bKeys]);

  const added: string[] = [];
  const removed: string[] = [];
  const changed: Array<{ key: string; before: unknown; after: unknown }> = [];
  const unchanged: string[] = [];

  for (const key of allKeys) {
    const inA = key in a.state;
    const inB = key in b.state;
    if (inA && !inB) {
      removed.push(key);
    } else if (!inA && inB) {
      added.push(key);
    } else {
      const va = a.state[key];
      const vb = b.state[key];
      if (JSON.stringify(va) === JSON.stringify(vb)) {
        unchanged.push(key);
      } else {
        changed.push({ key, before: va, after: vb });
      }
    }
  }

  return { added, removed, changed, unchanged };
}

// --- Module State ---

export interface DevToolsModuleState {
  devtoolsEnabled: boolean;
}

// --- Event constants ---

export const DEVTOOLS_SNAPSHOT_CAPTURED = 'DEVTOOLS_SNAPSHOT_CAPTURED';
export const DEVTOOLS_TIMELINE_CLEARED = 'DEVTOOLS_TIMELINE_CLEARED';
export const DEVTOOLS_METRICS_RESET = 'DEVTOOLS_METRICS_RESET';

// --- Module factory ---

export function createDevToolsModule(options?: DevToolsOptions): RuntimeModule {
  const maxTimeline = options?.maxTimelineEntries ?? 500;
  const enablePerformance = options?.enablePerformance ?? true;
  const enableSnapshots = options?.enableSnapshots ?? true;

  // Timeline storage
  const timeline: TimelineEntry[] = [];

  // Performance tracking
  let totalEvents = 0;
  let totalDuration = 0;
  let maxDuration = 0;
  const eventTypeStats: Record<string, { count: number; totalDuration: number; maxDuration: number }> = {};
  let metricsStartTime = Date.now();

  // Snapshot storage
  const snapshots: Map<string, DevToolsSnapshot> = new Map();

  // References set during createController
  let _bus: EventBus;
  let _store: RuntimeStore;
  let _runtime: { getModuleStatus: () => Record<string, string> } | null = null;

  // --- Timeline middleware ---
  const timelineMiddleware: SchedulerMiddleware = (event, next) => {
    const startTime = Date.now();
    const versionBefore = _store.getState().version;

    next();

    const endTime = Date.now();
    const versionAfter = _store.getState().version;
    const duration = endTime - startTime;
    const reducerHit = versionAfter !== versionBefore;

    const entry: TimelineEntry = {
      event,
      startTime,
      endTime,
      duration,
      stateVersionBefore: versionBefore,
      stateVersionAfter: versionAfter,
      reducerHit,
    };

    timeline.push(entry);

    // Ring buffer
    while (timeline.length > maxTimeline) {
      timeline.shift();
    }

    // Performance tracking
    if (enablePerformance) {
      totalEvents++;
      totalDuration += duration;
      if (duration > maxDuration) {
        maxDuration = duration;
      }

      if (!eventTypeStats[event.type]) {
        eventTypeStats[event.type] = { count: 0, totalDuration: 0, maxDuration: 0 };
      }
      const stats = eventTypeStats[event.type];
      stats.count++;
      stats.totalDuration += duration;
      if (duration > stats.maxDuration) {
        stats.maxDuration = duration;
      }
    }
  };

  // --- Controller ---

  function createSnapshotObj(label?: string): DevToolsSnapshot {
    const state = _store.getState();
    const moduleStatus = _runtime?.getModuleStatus() ?? {};
    const eventCount = _bus.getHistory().length;

    return {
      id: generateSnapshotId(),
      ...(label ? { label } : {}),
      timestamp: Date.now(),
      state: { ...state },
      stateHash: computeStateHash(state),
      moduleStatus,
      eventCount,
    };
  }

  const controller: DevToolsController = {
    // Timeline
    getTimeline(filter?: TimelineFilter): TimelineEntry[] {
      let result = [...timeline];
      if (filter) {
        if (filter.eventType) {
          result = result.filter((e) => e.event.type === filter.eventType);
        }
        if (filter.since !== undefined) {
          result = result.filter((e) => e.startTime >= filter.since!);
        }
        if (filter.until !== undefined) {
          result = result.filter((e) => e.startTime <= filter.until!);
        }
        if (filter.minDuration !== undefined) {
          result = result.filter((e) => e.duration >= filter.minDuration!);
        }
        if (filter.limit !== undefined) {
          result = result.slice(-filter.limit);
        }
      }
      return result;
    },

    getSlowEvents(thresholdMs: number): TimelineEntry[] {
      return timeline.filter((e) => e.duration >= thresholdMs);
    },

    clearTimeline(): void {
      timeline.length = 0;
      _bus.dispatch({ type: DEVTOOLS_TIMELINE_CLEARED });
    },

    // Performance
    getMetrics(): PerformanceMetrics {
      const now = Date.now();
      const uptimeMs = now - metricsStartTime;
      const eventsPerSecond = uptimeMs > 0 ? (totalEvents / uptimeMs) * 1000 : 0;
      const averageDuration = totalEvents > 0 ? totalDuration / totalEvents : 0;

      const eventsByType: Record<string, { count: number; avgDuration: number; maxDuration: number }> = {};
      for (const [type, stats] of Object.entries(eventTypeStats)) {
        eventsByType[type] = {
          count: stats.count,
          avgDuration: stats.count > 0 ? stats.totalDuration / stats.count : 0,
          maxDuration: stats.maxDuration,
        };
      }

      return {
        totalEvents,
        averageDuration,
        maxDuration,
        eventsPerSecond,
        eventsByType,
        startTime: metricsStartTime,
        uptimeMs,
      };
    },

    resetMetrics(): void {
      totalEvents = 0;
      totalDuration = 0;
      maxDuration = 0;
      for (const key of Object.keys(eventTypeStats)) {
        delete eventTypeStats[key];
      }
      metricsStartTime = Date.now();
      _bus.dispatch({ type: DEVTOOLS_METRICS_RESET });
    },

    // Snapshots
    captureSnapshot(label?: string): string {
      if (!enableSnapshots) return '';
      const snap = createSnapshotObj(label);
      snapshots.set(snap.id, snap);
      _bus.dispatch({ type: DEVTOOLS_SNAPSHOT_CAPTURED, payload: { snapshotId: snap.id } });
      return snap.id;
    },

    getSnapshot(id: string): DevToolsSnapshot | undefined {
      return snapshots.get(id);
    },

    getSnapshots(): DevToolsSnapshot[] {
      return [...snapshots.values()];
    },

    compareSnapshots(idA: string, idB: string): StateDiff | undefined {
      const a = snapshots.get(idA);
      const b = snapshots.get(idB);
      if (!a || !b) return undefined;
      return diffSnapshots(a, b);
    },

    clearSnapshots(): void {
      snapshots.clear();
    },

    // Inspector
    getStateTree(): StateTreeNode {
      return buildStateTree('root', _store.getState());
    },

    getModuleStates(): Record<string, unknown> {
      const state = _store.getState();
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(state)) {
        if (key !== 'version') {
          result[key] = value;
        }
      }
      return result;
    },

    exportSnapshot(): DevToolsSnapshot {
      return createSnapshotObj('export');
    },

    // Agent
    agent: null as unknown as AgentInterface, // set below
  };

  // --- Agent Interface ---
  const agent: AgentInterface = {
    dispatch(event) {
      _bus.dispatch(event);
    },

    getState() {
      return _store.getState();
    },

    subscribe(listener) {
      return _store.subscribe(listener);
    },

    async executeSequence(events, intervalMs = 0) {
      for (let i = 0; i < events.length; i++) {
        _bus.dispatch(events[i]);
        if (intervalMs > 0 && i < events.length - 1) {
          await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
        }
      }
    },

    async waitForState(predicate, timeoutMs) {
      // Check immediately
      const current = _store.getState();
      if (predicate(current)) return current;

      return new Promise<RuntimeState>((resolve, reject) => {
        let timer: ReturnType<typeof setTimeout> | null = null;

        const unsub = _store.subscribe((state) => {
          if (predicate(state)) {
            if (timer) clearTimeout(timer);
            unsub();
            resolve(state);
          }
        });

        if (timeoutMs !== undefined && timeoutMs > 0) {
          timer = setTimeout(() => {
            unsub();
            reject(new Error(`waitForState timed out after ${timeoutMs}ms`));
          }, timeoutMs);
        }
      });
    },
  };

  // Wire agent to controller
  (controller as { agent: AgentInterface }).agent = agent;

  // --- Module definition ---
  const mod: RuntimeModule = {
    name: 'devtools',

    initialState: {
      devtoolsEnabled: true,
    } as Partial<RuntimeState>,

    middleware: [timelineMiddleware],

    createController({ bus, store }) {
      _bus = bus;
      _store = store;
      return controller;
    },

    onInit({ bus, store }) {
      _bus = bus;
      _store = store;
    },
  };

  // Attach a way to set runtime reference (called after runtime is created)
  (mod as { _setRuntime?: (r: { getModuleStatus: () => Record<string, string> }) => void })._setRuntime =
    (r) => { _runtime = r; };

  return mod;
}
