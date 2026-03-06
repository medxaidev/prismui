// ---------------------------------------------------------------------------
// PriorityScheduler — Event priority management and conflict resolution
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeEvent } from '../event-bus';
import type { SchedulerMiddleware } from '../scheduler';
import type { EventPriority } from './types';

/**
 * Priority configuration for an event type.
 */
export interface PriorityConfig {
  /** Event type to configure priority for */
  eventType: string;
  /** Priority level */
  priority: EventPriority;
}

/**
 * Priority level numeric values (lower = higher priority).
 */
const PRIORITY_VALUES: Record<EventPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
  idle: 4,
};

/**
 * Conflict resolution strategy.
 * - 'higher-wins': Higher priority event takes precedence.
 * - 'first-wins': First event in a conflict pair takes precedence.
 * - 'last-wins': Last event in a conflict pair takes precedence.
 */
export type ConflictStrategy = 'higher-wins' | 'first-wins' | 'last-wins';

/**
 * A conflict rule defines which event types conflict with each other.
 */
export interface ConflictRule {
  /** Name of this conflict rule */
  name: string;
  /** Event types that conflict with each other */
  eventTypes: string[];
  /** Resolution strategy. Default: 'higher-wins'. */
  strategy?: ConflictStrategy;
}

/**
 * Priority Scheduler for managing event priorities and conflicts.
 */
export interface PriorityScheduler {
  /** Set priority for an event type. */
  setPriority(eventType: string, priority: EventPriority): void;
  /** Get priority for an event type. Default: 'normal'. */
  getPriority(eventType: string): EventPriority;
  /** Add a conflict rule. */
  addConflictRule(rule: ConflictRule): void;
  /** Remove a conflict rule by name. */
  removeConflictRule(name: string): void;
  /** Get all conflict rules. */
  getConflictRules(): readonly ConflictRule[];
  /** Compare two priorities. Returns negative if a > b, 0 if equal, positive if b > a. */
  comparePriority(a: EventPriority, b: EventPriority): number;
  /** Remove all priorities and conflict rules. */
  clear(): void;
}

/**
 * Create a PriorityScheduler instance.
 */
export function createPriorityScheduler(): PriorityScheduler {
  const priorities = new Map<string, EventPriority>();
  const conflictRules: ConflictRule[] = [];

  const scheduler: PriorityScheduler = {
    setPriority(eventType, priority) {
      priorities.set(eventType, priority);
    },

    getPriority(eventType): EventPriority {
      return priorities.get(eventType) ?? 'normal';
    },

    addConflictRule(rule) {
      const idx = conflictRules.findIndex((r) => r.name === rule.name);
      if (idx >= 0) {
        conflictRules[idx] = rule;
      } else {
        conflictRules.push(rule);
      }
    },

    removeConflictRule(name) {
      const idx = conflictRules.findIndex((r) => r.name === name);
      if (idx >= 0) {
        conflictRules.splice(idx, 1);
      }
    },

    getConflictRules(): readonly ConflictRule[] {
      return [...conflictRules];
    },

    comparePriority(a, b): number {
      return PRIORITY_VALUES[a] - PRIORITY_VALUES[b];
    },

    clear() {
      priorities.clear();
      conflictRules.length = 0;
    },
  };

  return scheduler;
}

/**
 * Create priority middleware that manages event ordering based on priority levels.
 *
 * This middleware:
 * 1. Looks up the event's priority from the PriorityScheduler.
 * 2. Checks for conflicts with recently processed events.
 * 3. Drops events that lose conflict resolution.
 * 4. Passes through events that win or have no conflicts.
 */
export function createPriorityMiddleware(
  priorityScheduler: PriorityScheduler,
): SchedulerMiddleware {
  // Track recently processed event types for conflict detection
  const recentEvents = new Map<string, { event: RuntimeEvent; priority: EventPriority; timestamp: number }>();
  const CONFLICT_WINDOW_MS = 100; // Events within 100ms are considered concurrent

  return (event, next) => {
    const priority = priorityScheduler.getPriority(event.type);
    const now = Date.now();

    // Clean up old entries outside the conflict window
    for (const [type, entry] of recentEvents) {
      if (now - entry.timestamp > CONFLICT_WINDOW_MS) {
        recentEvents.delete(type);
      }
    }

    // Check conflict rules
    const conflictRules = priorityScheduler.getConflictRules();
    let shouldProcess = true;

    for (const rule of conflictRules) {
      if (!rule.eventTypes.includes(event.type)) continue;

      // Check if any conflicting event was recently processed
      for (const conflictType of rule.eventTypes) {
        if (conflictType === event.type) continue;

        const recent = recentEvents.get(conflictType);
        if (!recent || now - recent.timestamp > CONFLICT_WINDOW_MS) continue;

        // Conflict detected! Apply resolution strategy.
        const strategy = rule.strategy ?? 'higher-wins';

        if (strategy === 'higher-wins') {
          const cmp = priorityScheduler.comparePriority(priority, recent.priority);
          if (cmp > 0) {
            // Current event has lower priority — drop it
            shouldProcess = false;
            break;
          }
        } else if (strategy === 'first-wins') {
          // Recent event was first — drop current
          shouldProcess = false;
          break;
        } else if (strategy === 'last-wins') {
          // Current event is last — proceed (drop is implicit for previous)
          // Nothing to do, current event wins
        }
      }

      if (!shouldProcess) break;
    }

    if (shouldProcess) {
      // Record this event as recently processed
      recentEvents.set(event.type, { event, priority, timestamp: now });
      next();
    }
  };
}
