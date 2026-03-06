// ---------------------------------------------------------------------------
// Policy Engine + Policy Middleware tests
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPolicyEngine, type PolicyEngine, type PolicyRule } from './policy-engine';
import { createPolicyMiddleware } from './policy-middleware';
import { createAuditTrail } from './audit-trail';
import { createEventBus } from '../event-bus';
import { createRuntimeStore } from '../store';
import { createScheduler } from '../scheduler';
import type { RuntimeEvent } from '../event-bus';
import type { RuntimeState } from '../store';
import * as fs from 'fs';
import * as path from 'path';

describe('PolicyEngine', () => {
  let engine: PolicyEngine;

  beforeEach(() => {
    engine = createPolicyEngine();
  });

  // --- creation ---
  describe('creation', () => {
    it('creates PolicyEngine instance', () => {
      expect(engine).toBeDefined();
      expect(engine.addRule).toBeInstanceOf(Function);
      expect(engine.removeRule).toBeInstanceOf(Function);
      expect(engine.getRules).toBeInstanceOf(Function);
      expect(engine.evaluate).toBeInstanceOf(Function);
      expect(engine.clear).toBeInstanceOf(Function);
    });
  });

  // --- rules ---
  describe('rules', () => {
    it('addRule adds a rule', () => {
      engine.addRule({
        name: 'test-rule',
        evaluate: () => ({ verdict: 'allow' }),
      });
      expect(engine.getRules()).toHaveLength(1);
    });

    it('addRule replaces existing rule with same name', () => {
      engine.addRule({
        name: 'test-rule',
        evaluate: () => ({ verdict: 'allow' }),
      });
      engine.addRule({
        name: 'test-rule',
        evaluate: () => ({ verdict: 'deny', reason: 'replaced' }),
      });
      expect(engine.getRules()).toHaveLength(1);
    });

    it('removeRule removes a rule', () => {
      engine.addRule({
        name: 'test-rule',
        evaluate: () => ({ verdict: 'allow' }),
      });
      engine.removeRule('test-rule');
      expect(engine.getRules()).toHaveLength(0);
    });

    it('clear removes all rules', () => {
      engine.addRule({ name: 'r1', evaluate: () => ({ verdict: 'allow' }) });
      engine.addRule({ name: 'r2', evaluate: () => ({ verdict: 'allow' }) });
      engine.clear();
      expect(engine.getRules()).toHaveLength(0);
    });
  });

  // --- evaluate ---
  describe('evaluate', () => {
    it('returns allow when no rules match', () => {
      const result = engine.evaluate(
        { type: 'TEST', timestamp: 100 },
        { version: 0 },
      );
      expect(result.verdict).toBe('allow');
    });

    it('allow rule lets event through', () => {
      engine.addRule({
        name: 'allow-all',
        evaluate: () => ({ verdict: 'allow' }),
      });
      const result = engine.evaluate(
        { type: 'TEST', timestamp: 100 },
        { version: 0 },
      );
      expect(result.verdict).toBe('allow');
    });

    it('deny rule blocks event', () => {
      engine.addRule({
        name: 'deny-all',
        evaluate: () => ({ verdict: 'deny', reason: 'blocked' }),
      });
      const result = engine.evaluate(
        { type: 'TEST', timestamp: 100 },
        { version: 0 },
      );
      expect(result.verdict).toBe('deny');
      expect(result.reason).toBe('blocked');
    });

    it('transform rule modifies event', () => {
      engine.addRule({
        name: 'transform-rule',
        evaluate: (event) => ({
          verdict: 'transform',
          transformedEvent: { ...event, payload: 'transformed' },
        }),
      });
      const result = engine.evaluate(
        { type: 'TEST', timestamp: 100, payload: 'original' },
        { version: 0 },
      );
      expect(result.verdict).toBe('transform');
      expect(result.transformedEvent?.payload).toBe('transformed');
    });

    it('deny takes precedence over transform', () => {
      engine.addRule({
        name: 'transform-rule',
        priority: 0,
        evaluate: (event) => ({
          verdict: 'transform',
          transformedEvent: { ...event, payload: 'transformed' },
        }),
      });
      engine.addRule({
        name: 'deny-rule',
        priority: 1,
        evaluate: () => ({ verdict: 'deny', reason: 'denied after transform' }),
      });
      const result = engine.evaluate(
        { type: 'TEST', timestamp: 100 },
        { version: 0 },
      );
      expect(result.verdict).toBe('deny');
    });

    it('rules are evaluated in priority order', () => {
      const order: string[] = [];
      engine.addRule({
        name: 'low-priority',
        priority: 10,
        evaluate: () => { order.push('low'); return { verdict: 'allow' }; },
      });
      engine.addRule({
        name: 'high-priority',
        priority: 1,
        evaluate: () => { order.push('high'); return { verdict: 'allow' }; },
      });
      engine.evaluate({ type: 'TEST', timestamp: 100 }, { version: 0 });
      expect(order).toEqual(['high', 'low']);
    });

    it('eventTypes filter restricts which rules apply', () => {
      const spy = vi.fn(() => ({ verdict: 'deny' as const, reason: 'blocked' }));
      engine.addRule({
        name: 'page-only',
        eventTypes: ['PAGE_MOUNT', 'PAGE_TRANSITION'],
        evaluate: spy,
      });

      // Should not match
      engine.evaluate({ type: 'MODAL_OPEN', timestamp: 100 }, { version: 0 });
      expect(spy).not.toHaveBeenCalled();

      // Should match
      engine.evaluate({ type: 'PAGE_MOUNT', timestamp: 100 }, { version: 0 });
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('rule receives current state', () => {
      engine.addRule({
        name: 'state-check',
        evaluate: (_event, state) => {
          if ((state as any).locked) {
            return { verdict: 'deny', reason: 'locked' };
          }
          return { verdict: 'allow' };
        },
      });

      const allowed = engine.evaluate(
        { type: 'TEST', timestamp: 100 },
        { version: 0, locked: false },
      );
      expect(allowed.verdict).toBe('allow');

      const denied = engine.evaluate(
        { type: 'TEST', timestamp: 100 },
        { version: 1, locked: true },
      );
      expect(denied.verdict).toBe('deny');
    });
  });
});

describe('Policy Middleware', () => {
  // --- middleware ---
  describe('middleware', () => {
    it('allow verdict lets event proceed to reducer', () => {
      const engine = createPolicyEngine();
      engine.addRule({
        name: 'allow-all',
        evaluate: () => ({ verdict: 'allow' }),
      });

      const bus = createEventBus();
      const store = createRuntimeStore({ value: 'initial' });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPolicyMiddleware(engine, store));
      scheduler.registerReducer('SET', (event, prevState) => ({
        nextState: { ...prevState, value: event.payload },
      }));

      bus.dispatch({ type: 'SET', payload: 'updated' });
      expect((store.getState() as any).value).toBe('updated');
    });

    it('deny verdict blocks event from reaching reducer', () => {
      const engine = createPolicyEngine();
      engine.addRule({
        name: 'deny-all',
        evaluate: () => ({ verdict: 'deny', reason: 'blocked' }),
      });

      const bus = createEventBus();
      const store = createRuntimeStore({ value: 'initial' });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPolicyMiddleware(engine, store));
      scheduler.registerReducer('SET', (event, prevState) => ({
        nextState: { ...prevState, value: event.payload },
      }));

      bus.dispatch({ type: 'SET', payload: 'should-not-apply' });
      expect((store.getState() as any).value).toBe('initial');
    });

    it('transform verdict modifies event before reducer', () => {
      const engine = createPolicyEngine();
      engine.addRule({
        name: 'double-transform',
        evaluate: (event) => ({
          verdict: 'transform',
          transformedEvent: {
            ...event,
            payload: (event.payload as number) * 2,
          },
        }),
      });

      const bus = createEventBus();
      const store = createRuntimeStore({ value: 0 });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPolicyMiddleware(engine, store));
      scheduler.registerReducer('SET', (event, prevState) => ({
        nextState: { ...prevState, value: event.payload },
      }));

      bus.dispatch({ type: 'SET', payload: 5 });
      expect((store.getState() as any).value).toBe(10);
    });

    it('denied event is recorded in audit trail', () => {
      const engine = createPolicyEngine();
      engine.addRule({
        name: 'deny-all',
        evaluate: () => ({ verdict: 'deny', reason: 'policy denied' }),
      });

      const audit = createAuditTrail();
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPolicyMiddleware(engine, store, audit));

      bus.dispatch({ type: 'BLOCKED_EVENT' });

      expect(audit.size()).toBe(1);
      const entry = audit.getEntries()[0];
      expect(entry.event.type).toBe('BLOCKED_EVENT');
      expect(entry.nextState).toBeNull();
      expect(entry.policyResult?.verdict).toBe('deny');
      expect(entry.policyResult?.reason).toBe('policy denied');
    });

    it('state-based policy denies when condition met', () => {
      const engine = createPolicyEngine();
      engine.addRule({
        name: 'rate-limit',
        evaluate: (_event, state) => {
          if (state.version >= 3) {
            return { verdict: 'deny', reason: 'rate limited' };
          }
          return { verdict: 'allow' };
        },
      });

      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPolicyMiddleware(engine, store));
      scheduler.registerReducer('INC', (_event, prevState) => ({
        nextState: { ...prevState, count: (prevState as any).count + 1 },
      }));

      // First 3 events succeed (version 0→1, 1→2, 2→3)
      bus.dispatch({ type: 'INC' });
      bus.dispatch({ type: 'INC' });
      bus.dispatch({ type: 'INC' });
      expect((store.getState() as any).count).toBe(3);

      // 4th event should be denied (version is now 3)
      bus.dispatch({ type: 'INC' });
      expect((store.getState() as any).count).toBe(3);
    });
  });

  // --- isolation ---
  describe('isolation', () => {
    it('has no React/DOM imports', () => {
      const engineSrc = fs.readFileSync(
        path.resolve(__dirname, './policy-engine.ts'),
        'utf-8',
      );
      const middlewareSrc = fs.readFileSync(
        path.resolve(__dirname, './policy-middleware.ts'),
        'utf-8',
      );

      for (const src of [engineSrc, middlewareSrc]) {
        expect(src).not.toMatch(/from ['"]react['"]/);
        expect(src).not.toMatch(/from ['"]react-dom['"]/);
        expect(src).not.toMatch(/\bdocument\b/);
        expect(src).not.toMatch(/\bwindow\b/);
      }
    });
  });
});
