// ---------------------------------------------------------------------------
// DevTools shared types — STAGE-007
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeEvent } from '../event-bus';
import type { RuntimeState } from '../store';

/**
 * A single entry in the event timeline, capturing timing and metadata.
 */
export interface TimelineEntry {
  /** The event that was processed */
  event: RuntimeEvent;
  /** High-resolution start time (Date.now()) */
  startTime: number;
  /** High-resolution end time (Date.now()) */
  endTime: number;
  /** Processing duration in ms */
  duration: number;
  /** State version before processing */
  stateVersionBefore: number;
  /** State version after processing */
  stateVersionAfter: number;
  /** Whether a reducer was hit for this event */
  reducerHit: boolean;
  /** Policy verdict if governance was active */
  policyVerdict?: 'allow' | 'deny';
}

/**
 * Filter criteria for timeline queries.
 */
export interface TimelineFilter {
  /** Filter by event type */
  eventType?: string;
  /** Filter entries after this timestamp */
  since?: number;
  /** Filter entries before this timestamp */
  until?: number;
  /** Only include entries slower than this threshold (ms) */
  minDuration?: number;
  /** Maximum number of entries to return */
  limit?: number;
}

/**
 * Aggregated performance metrics.
 */
export interface PerformanceMetrics {
  /** Total events processed */
  totalEvents: number;
  /** Average processing duration in ms */
  averageDuration: number;
  /** Maximum processing duration in ms */
  maxDuration: number;
  /** Events processed per second */
  eventsPerSecond: number;
  /** Per-type event stats */
  eventsByType: Record<string, { count: number; avgDuration: number; maxDuration: number }>;
  /** When metrics tracking started */
  startTime: number;
  /** How long since tracking started (ms) */
  uptimeMs: number;
}

/**
 * A serializable snapshot of the runtime state.
 */
export interface DevToolsSnapshot {
  /** Unique snapshot ID */
  id: string;
  /** Optional human-readable label */
  label?: string;
  /** When the snapshot was taken */
  timestamp: number;
  /** Full runtime state */
  state: RuntimeState;
  /** State hash for comparison */
  stateHash: string;
  /** Status of all registered modules */
  moduleStatus: Record<string, string>;
  /** Total events dispatched at snapshot time */
  eventCount: number;
}

/**
 * Result of comparing two snapshots.
 */
export interface StateDiff {
  /** Keys present in snapshot B but not A */
  added: string[];
  /** Keys present in snapshot A but not B */
  removed: string[];
  /** Keys present in both but with different values */
  changed: Array<{ key: string; before: unknown; after: unknown }>;
  /** Keys present in both with identical values */
  unchanged: string[];
}

/**
 * Structured view of a state value for tree display.
 */
export interface StateTreeNode {
  /** The property key */
  key: string;
  /** The raw value */
  value: unknown;
  /** JavaScript type name */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined';
  /** Child nodes for objects/arrays */
  children?: StateTreeNode[];
}

/**
 * Options for creating the DevTools module.
 */
export interface DevToolsOptions {
  /** Maximum timeline entries to retain. Default: 500 */
  maxTimelineEntries?: number;
  /** Enable performance metric tracking. Default: true */
  enablePerformance?: boolean;
  /** Enable state snapshot capture. Default: true */
  enableSnapshots?: boolean;
}

/**
 * AI Agent interface for programmatic runtime control.
 */
export interface AgentInterface {
  /** Dispatch an event to the runtime */
  dispatch(event: Omit<RuntimeEvent, 'timestamp'>): void;
  /** Get current runtime state */
  getState(): Readonly<RuntimeState>;
  /** Subscribe to state changes. Returns unsubscribe function. */
  subscribe(listener: (state: RuntimeState) => void): () => void;
  /** Dispatch a sequence of events with optional interval between them */
  executeSequence(
    events: Array<Omit<RuntimeEvent, 'timestamp'>>,
    intervalMs?: number,
  ): Promise<void>;
  /** Wait for state to satisfy a predicate, with optional timeout */
  waitForState(
    predicate: (state: RuntimeState) => boolean,
    timeoutMs?: number,
  ): Promise<RuntimeState>;
}

/**
 * DevTools controller returned by createDevToolsModule.
 */
export interface DevToolsController {
  // Timeline
  /** Get event timeline entries with optional filtering */
  getTimeline(filter?: TimelineFilter): TimelineEntry[];
  /** Get events that took longer than the threshold to process */
  getSlowEvents(thresholdMs: number): TimelineEntry[];
  /** Clear all timeline entries */
  clearTimeline(): void;

  // Performance
  /** Get aggregated performance metrics */
  getMetrics(): PerformanceMetrics;
  /** Reset all performance counters */
  resetMetrics(): void;

  // Snapshots
  /** Capture current state as a named snapshot. Returns snapshot ID. */
  captureSnapshot(label?: string): string;
  /** Get a snapshot by ID */
  getSnapshot(id: string): DevToolsSnapshot | undefined;
  /** Get all captured snapshots */
  getSnapshots(): DevToolsSnapshot[];
  /** Compare two snapshots by ID */
  compareSnapshots(idA: string, idB: string): StateDiff | undefined;
  /** Clear all snapshots */
  clearSnapshots(): void;

  // Inspector
  /** Get structured tree view of current state */
  getStateTree(): StateTreeNode;
  /** Get per-module state slices */
  getModuleStates(): Record<string, unknown>;
  /** Export a full snapshot (same as captureSnapshot but returned directly) */
  exportSnapshot(): DevToolsSnapshot;

  // Agent
  /** AI Agent interface for programmatic control */
  agent: AgentInterface;
}
