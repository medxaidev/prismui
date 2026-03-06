// ---------------------------------------------------------------------------
// PolicyEngine — Rule-based event validation (allow/deny/transform)
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeEvent } from '../event-bus';
import type { RuntimeState } from '../store';
import type { PolicyResult } from './types';

/**
 * A policy rule evaluates an event and returns a verdict.
 */
export interface PolicyRule {
  /** Unique rule identifier */
  name: string;
  /** Optional: only apply to these event types. Empty/undefined = all events. */
  eventTypes?: string[];
  /** Priority: lower number = evaluated first. Default: 0. */
  priority?: number;
  /** Evaluate the event. Return a PolicyResult. */
  evaluate(event: RuntimeEvent, state: Readonly<RuntimeState>): PolicyResult;
}

/**
 * Policy Engine for rule-based event validation.
 */
export interface PolicyEngine {
  /** Add a policy rule. */
  addRule(rule: PolicyRule): void;
  /** Remove a policy rule by name. */
  removeRule(name: string): void;
  /** Get all registered rules. */
  getRules(): readonly PolicyRule[];
  /** Evaluate an event against all matching rules. First deny wins. */
  evaluate(event: RuntimeEvent, state: Readonly<RuntimeState>): PolicyResult;
  /** Remove all rules. */
  clear(): void;
}

/**
 * Create a PolicyEngine instance.
 *
 * Evaluation order:
 * 1. Rules are sorted by priority (lower first).
 * 2. Only rules matching the event type (or with no eventTypes filter) are evaluated.
 * 3. First 'deny' verdict short-circuits and returns immediately.
 * 4. First 'transform' verdict is remembered but evaluation continues (a later deny overrides).
 * 5. If no deny, return the transform result or 'allow'.
 */
export function createPolicyEngine(): PolicyEngine {
  const rules: PolicyRule[] = [];

  function getSortedMatchingRules(eventType: string): PolicyRule[] {
    return rules
      .filter((r) => {
        if (!r.eventTypes || r.eventTypes.length === 0) return true;
        return r.eventTypes.includes(eventType);
      })
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  }

  const engine: PolicyEngine = {
    addRule(rule) {
      // Replace existing rule with same name
      const idx = rules.findIndex((r) => r.name === rule.name);
      if (idx >= 0) {
        rules[idx] = rule;
      } else {
        rules.push(rule);
      }
    },

    removeRule(name) {
      const idx = rules.findIndex((r) => r.name === name);
      if (idx >= 0) {
        rules.splice(idx, 1);
      }
    },

    getRules(): readonly PolicyRule[] {
      return [...rules];
    },

    evaluate(event, state): PolicyResult {
      const matching = getSortedMatchingRules(event.type);

      if (matching.length === 0) {
        return { verdict: 'allow' };
      }

      let transformResult: PolicyResult | null = null;

      for (const rule of matching) {
        const result = rule.evaluate(event, state);

        if (result.verdict === 'deny') {
          return result;
        }

        if (result.verdict === 'transform' && !transformResult) {
          transformResult = result;
        }
      }

      return transformResult ?? { verdict: 'allow' };
    },

    clear() {
      rules.length = 0;
    },
  };

  return engine;
}
