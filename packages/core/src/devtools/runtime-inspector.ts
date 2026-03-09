// ---------------------------------------------------------------------------
// RuntimeInspector — Standalone inspector that attaches to any runtime
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeEvent } from '../event-bus';
import type { InteractionRuntime } from '../runtime';
import type { DevToolsSnapshot, StateTreeNode } from './types';
import { buildStateTree } from './devtools-module';
import { computeStateHash } from '../governance/state-hash';

/**
 * Standalone runtime inspector — can be used without the DevTools module.
 */
export interface RuntimeInspector {
  /** Get structured tree view of current state */
  getStateTree(): StateTreeNode;
  /** Get per-module state slices (excludes 'version') */
  getModuleStates(): Record<string, unknown>;
  /** Get event history with optional filtering */
  getEventHistory(filter?: { type?: string; since?: number; limit?: number }): RuntimeEvent[];
  /** Get count of registered middleware */
  getMiddlewareCount(): number;
  /** Export a full snapshot */
  exportSnapshot(): DevToolsSnapshot;
}

let inspectorSnapshotId = 0;

/**
 * Create a RuntimeInspector for a given runtime.
 * Lightweight — does not register middleware or track performance.
 */
export function createRuntimeInspector(runtime: InteractionRuntime): RuntimeInspector {
  return {
    getStateTree(): StateTreeNode {
      return buildStateTree('root', runtime.getState());
    },

    getModuleStates(): Record<string, unknown> {
      const state = runtime.getState();
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(state)) {
        if (key !== 'version') {
          result[key] = value;
        }
      }
      return result;
    },

    getEventHistory(filter?) {
      let events = [...runtime.bus.getHistory()];
      if (filter) {
        if (filter.type) {
          events = events.filter((e) => e.type === filter.type);
        }
        if (filter.since !== undefined) {
          events = events.filter((e) => e.timestamp >= filter.since!);
        }
        if (filter.limit !== undefined) {
          events = events.slice(-filter.limit);
        }
      }
      return events;
    },

    getMiddlewareCount(): number {
      // Scheduler doesn't expose middleware count directly, so we return -1 as unknown
      // In a real implementation, Scheduler would expose this; for now return based on bus history
      return -1;
    },

    exportSnapshot(): DevToolsSnapshot {
      const state = runtime.getState();
      return {
        id: `inspector-${++inspectorSnapshotId}-${Date.now()}`,
        label: 'inspector-export',
        timestamp: Date.now(),
        state: { ...state },
        stateHash: computeStateHash(state),
        moduleStatus: runtime.getModuleStatus(),
        eventCount: runtime.bus.getHistory().length,
      };
    },
  };
}
