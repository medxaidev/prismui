// ---------------------------------------------------------------------------
// Priority Scheduler + Priority Middleware tests
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createPriorityScheduler,
  createPriorityMiddleware,
  type PriorityScheduler,
} from './priority-scheduler';
import { createEventBus } from '../event-bus';
import { createRuntimeStore } from '../store';
import { createScheduler } from '../scheduler';
import type { EventPriority } from './types';
import * as fs from 'fs';
import * as path from 'path';

describe('PriorityScheduler', () => {
  let ps: PriorityScheduler;

  beforeEach(() => {
    ps = createPriorityScheduler();
  });

  // --- creation ---
  describe('creation', () => {
    it('creates PriorityScheduler instance', () => {
      expect(ps).toBeDefined();
      expect(ps.setPriority).toBeInstanceOf(Function);
      expect(ps.getPriority).toBeInstanceOf(Function);
      expect(ps.addConflictRule).toBeInstanceOf(Function);
      expect(ps.removeConflictRule).toBeInstanceOf(Function);
      expect(ps.getConflictRules).toBeInstanceOf(Function);
      expect(ps.comparePriority).toBeInstanceOf(Function);
      expect(ps.clear).toBeInstanceOf(Function);
    });
  });

  // --- priority ---
  describe('priority', () => {
    it('default priority is normal', () => {
      expect(ps.getPriority('UNKNOWN')).toBe('normal');
    });

    it('setPriority sets event priority', () => {
      ps.setPriority('CRITICAL_EVENT', 'critical');
      expect(ps.getPriority('CRITICAL_EVENT')).toBe('critical');
    });

    it('setPriority overwrites existing priority', () => {
      ps.setPriority('EVENT', 'high');
      ps.setPriority('EVENT', 'low');
      expect(ps.getPriority('EVENT')).toBe('low');
    });
  });

  // --- compare ---
  describe('compare', () => {
    it('comparePriority returns negative for higher > lower', () => {
      expect(ps.comparePriority('critical', 'normal')).toBeLessThan(0);
    });

    it('comparePriority returns 0 for equal', () => {
      expect(ps.comparePriority('normal', 'normal')).toBe(0);
    });

    it('comparePriority returns positive for lower < higher', () => {
      expect(ps.comparePriority('idle', 'high')).toBeGreaterThan(0);
    });

    it('full priority ordering', () => {
      const levels: EventPriority[] = ['critical', 'high', 'normal', 'low', 'idle'];
      for (let i = 0; i < levels.length - 1; i++) {
        expect(ps.comparePriority(levels[i], levels[i + 1])).toBeLessThan(0);
      }
    });
  });

  // --- conflict rules ---
  describe('conflict rules', () => {
    it('addConflictRule adds a rule', () => {
      ps.addConflictRule({
        name: 'page-nav',
        eventTypes: ['PAGE_TRANSITION', 'PAGE_LOCK'],
      });
      expect(ps.getConflictRules()).toHaveLength(1);
    });

    it('addConflictRule replaces existing rule with same name', () => {
      ps.addConflictRule({
        name: 'rule-1',
        eventTypes: ['A', 'B'],
      });
      ps.addConflictRule({
        name: 'rule-1',
        eventTypes: ['C', 'D'],
      });
      expect(ps.getConflictRules()).toHaveLength(1);
      expect(ps.getConflictRules()[0].eventTypes).toEqual(['C', 'D']);
    });

    it('removeConflictRule removes a rule', () => {
      ps.addConflictRule({ name: 'test', eventTypes: ['A', 'B'] });
      ps.removeConflictRule('test');
      expect(ps.getConflictRules()).toHaveLength(0);
    });

    it('clear removes all priorities and rules', () => {
      ps.setPriority('A', 'high');
      ps.addConflictRule({ name: 'test', eventTypes: ['A', 'B'] });
      ps.clear();
      expect(ps.getPriority('A')).toBe('normal');
      expect(ps.getConflictRules()).toHaveLength(0);
    });
  });
});

describe('Priority Middleware', () => {
  // --- middleware ---
  describe('middleware', () => {
    it('events without conflicts pass through', () => {
      const ps = createPriorityScheduler();
      ps.setPriority('INCREMENT', 'normal');

      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0 });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPriorityMiddleware(ps));
      scheduler.registerReducer('INCREMENT', (_event, prevState) => ({
        nextState: { ...prevState, count: (prevState as any).count + 1 },
      }));

      bus.dispatch({ type: 'INCREMENT' });
      expect((store.getState() as any).count).toBe(1);
    });

    it('high priority events are not blocked', () => {
      const ps = createPriorityScheduler();
      ps.setPriority('CRITICAL_OP', 'critical');

      const bus = createEventBus();
      const store = createRuntimeStore({ value: '' });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPriorityMiddleware(ps));
      scheduler.registerReducer('CRITICAL_OP', (event, prevState) => ({
        nextState: { ...prevState, value: event.payload },
      }));

      bus.dispatch({ type: 'CRITICAL_OP', payload: 'done' });
      expect((store.getState() as any).value).toBe('done');
    });

    it('conflict resolution with higher-wins strategy', () => {
      const ps = createPriorityScheduler();
      ps.setPriority('SAVE', 'high');
      ps.setPriority('AUTOSAVE', 'low');
      ps.addConflictRule({
        name: 'save-conflict',
        eventTypes: ['SAVE', 'AUTOSAVE'],
        strategy: 'higher-wins',
      });

      const bus = createEventBus();
      const store = createRuntimeStore({ saved: '' });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPriorityMiddleware(ps));
      scheduler.registerReducer('SAVE', (event, prevState) => ({
        nextState: { ...prevState, saved: 'manual' },
      }));
      scheduler.registerReducer('AUTOSAVE', (_event, prevState) => ({
        nextState: { ...prevState, saved: 'auto' },
      }));

      // SAVE first (high priority)
      bus.dispatch({ type: 'SAVE' });
      expect((store.getState() as any).saved).toBe('manual');

      // AUTOSAVE immediately after (low priority) — should be blocked by conflict
      bus.dispatch({ type: 'AUTOSAVE' });
      expect((store.getState() as any).saved).toBe('manual');
    });

    it('conflict resolution with first-wins strategy', () => {
      const ps = createPriorityScheduler();
      ps.addConflictRule({
        name: 'nav-conflict',
        eventTypes: ['NAV_FORWARD', 'NAV_BACK'],
        strategy: 'first-wins',
      });

      const bus = createEventBus();
      const store = createRuntimeStore({ page: 'home' });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPriorityMiddleware(ps));
      scheduler.registerReducer('NAV_FORWARD', (_event, prevState) => ({
        nextState: { ...prevState, page: 'next' },
      }));
      scheduler.registerReducer('NAV_BACK', (_event, prevState) => ({
        nextState: { ...prevState, page: 'prev' },
      }));

      bus.dispatch({ type: 'NAV_FORWARD' });
      expect((store.getState() as any).page).toBe('next');

      // NAV_BACK immediately after — blocked by first-wins
      bus.dispatch({ type: 'NAV_BACK' });
      expect((store.getState() as any).page).toBe('next');
    });

    it('events outside conflict window are not blocked', async () => {
      const ps = createPriorityScheduler();
      ps.setPriority('A', 'high');
      ps.setPriority('B', 'low');
      ps.addConflictRule({
        name: 'ab-conflict',
        eventTypes: ['A', 'B'],
        strategy: 'higher-wins',
      });

      const bus = createEventBus();
      const store = createRuntimeStore({ log: [] as string[] });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPriorityMiddleware(ps));
      scheduler.registerReducer('A', (_event, prevState) => ({
        nextState: { ...prevState, log: [...(prevState as any).log, 'A'] },
      }));
      scheduler.registerReducer('B', (_event, prevState) => ({
        nextState: { ...prevState, log: [...(prevState as any).log, 'B'] },
      }));

      bus.dispatch({ type: 'A' });

      // Wait beyond conflict window (100ms)
      await new Promise((resolve) => setTimeout(resolve, 150));

      bus.dispatch({ type: 'B' });
      expect((store.getState() as any).log).toEqual(['A', 'B']);
    });

    it('non-conflicting event types are independent', () => {
      const ps = createPriorityScheduler();
      ps.addConflictRule({
        name: 'save-conflict',
        eventTypes: ['SAVE', 'AUTOSAVE'],
      });

      const bus = createEventBus();
      const store = createRuntimeStore({ count: 0, saved: false });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createPriorityMiddleware(ps));
      scheduler.registerReducer('SAVE', (_event, prevState) => ({
        nextState: { ...prevState, saved: true },
      }));
      scheduler.registerReducer('INCREMENT', (_event, prevState) => ({
        nextState: { ...prevState, count: (prevState as any).count + 1 },
      }));

      bus.dispatch({ type: 'SAVE' });
      // INCREMENT is not in conflict group — should pass through
      bus.dispatch({ type: 'INCREMENT' });
      expect((store.getState() as any).count).toBe(1);
      expect((store.getState() as any).saved).toBe(true);
    });
  });

  // --- isolation ---
  describe('isolation', () => {
    it('has no React/DOM imports', () => {
      const src = fs.readFileSync(
        path.resolve(__dirname, './priority-scheduler.ts'),
        'utf-8',
      );
      expect(src).not.toMatch(/from ['"]react['"]/);
      expect(src).not.toMatch(/from ['"]react-dom['"]/);
      expect(src).not.toMatch(/\bdocument\b/);
      // Check for window. usage (DOM), not the word "window" in comments
      expect(src).not.toMatch(/\bwindow\./);
    });
  });
});
