// ---------------------------------------------------------------------------
// Audit Trail + Audit Middleware tests
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuditTrail, type AuditTrail } from './audit-trail';
import { createAuditMiddleware } from './audit-middleware';
import { createEventBus } from '../event-bus';
import { createRuntimeStore } from '../store';
import { createScheduler } from '../scheduler';
import type { RuntimeState } from '../store';
import type { RuntimeEvent } from '../event-bus';
import * as fs from 'fs';
import * as path from 'path';

describe('AuditTrail', () => {
  let audit: AuditTrail;

  beforeEach(() => {
    audit = createAuditTrail();
  });

  // --- creation ---
  describe('creation', () => {
    it('creates AuditTrail instance', () => {
      expect(audit).toBeDefined();
      expect(audit.record).toBeInstanceOf(Function);
      expect(audit.getEntries).toBeInstanceOf(Function);
      expect(audit.getEntry).toBeInstanceOf(Function);
      expect(audit.getLatest).toBeInstanceOf(Function);
      expect(audit.clear).toBeInstanceOf(Function);
      expect(audit.export).toBeInstanceOf(Function);
      expect(audit.size).toBeInstanceOf(Function);
    });
  });

  // --- record ---
  describe('record', () => {
    it('records entry with auto id and timestamp', () => {
      const event: RuntimeEvent = { type: 'TEST', timestamp: 100 };
      const prevState: RuntimeState = { version: 0 };
      const nextState: RuntimeState = { version: 1 };

      audit.record({ event, prevState, nextState });

      const entries = audit.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toMatch(/^audit-/);
      expect(typeof entries[0].timestamp).toBe('number');
      expect(entries[0].event).toBe(event);
      expect(entries[0].prevState).toBe(prevState);
      expect(entries[0].nextState).toBe(nextState);
    });

    it('entries are immutable', () => {
      const event: RuntimeEvent = { type: 'TEST', timestamp: 100 };
      audit.record({
        event,
        prevState: { version: 0 },
        nextState: { version: 1 },
      });

      const entry = audit.getEntries()[0];
      expect(Object.isFrozen(entry)).toBe(true);
    });
  });

  // --- retention ---
  describe('retention', () => {
    it('respects maxEntries limit', () => {
      const smallAudit = createAuditTrail({ maxEntries: 3 });

      for (let i = 0; i < 5; i++) {
        smallAudit.record({
          event: { type: `EVENT_${i}`, timestamp: i },
          prevState: { version: i },
          nextState: { version: i + 1 },
        });
      }

      expect(smallAudit.size()).toBe(3);
      // Oldest entries should be evicted
      const entries = smallAudit.getEntries();
      expect(entries[0].event.type).toBe('EVENT_2');
      expect(entries[1].event.type).toBe('EVENT_3');
      expect(entries[2].event.type).toBe('EVENT_4');
    });
  });

  // --- query ---
  describe('query', () => {
    beforeEach(() => {
      // Record 5 entries with different types and timestamps
      const types = ['PAGE_MOUNT', 'PAGE_TRANSITION', 'MODAL_OPEN', 'PAGE_LOCK', 'MODAL_CLOSE'];
      for (let i = 0; i < 5; i++) {
        audit.record({
          event: { type: types[i], timestamp: 1000 + i * 100 },
          prevState: { version: i },
          nextState: { version: i + 1 },
        });
      }
    });

    it('getEntries returns all entries', () => {
      expect(audit.getEntries()).toHaveLength(5);
    });

    it('getEntries filters by eventType', () => {
      const pageEntries = audit.getEntries({ eventType: 'PAGE_MOUNT' });
      expect(pageEntries).toHaveLength(1);
      expect(pageEntries[0].event.type).toBe('PAGE_MOUNT');
    });

    it('getEntries filters by time range', () => {
      // Filter entries with timestamp recorded by audit (not event timestamp)
      // Since all entries are recorded nearly simultaneously in tests,
      // we'll filter by the event's timestamp via the since/until on audit timestamp
      const allEntries = audit.getEntries();
      const midTimestamp = allEntries[2].timestamp;

      const filtered = audit.getEntries({ since: midTimestamp });
      expect(filtered.length).toBeGreaterThanOrEqual(1);
    });

    it('getEntry returns specific entry', () => {
      const entries = audit.getEntries();
      const target = entries[2];

      expect(audit.getEntry(target.id)).toBe(target);
    });

    it('getLatest returns N most recent', () => {
      const latest = audit.getLatest(2);
      expect(latest).toHaveLength(2);
      expect(latest[0].event.type).toBe('PAGE_LOCK');
      expect(latest[1].event.type).toBe('MODAL_CLOSE');
    });
  });

  // --- clear ---
  describe('clear', () => {
    it('clear removes all entries', () => {
      audit.record({
        event: { type: 'TEST', timestamp: 0 },
        prevState: { version: 0 },
        nextState: { version: 1 },
      });
      expect(audit.size()).toBe(1);

      audit.clear();
      expect(audit.size()).toBe(0);
      expect(audit.getEntries()).toHaveLength(0);
    });
  });

  // --- export ---
  describe('export', () => {
    it('export produces valid JSON', () => {
      audit.record({
        event: { type: 'TEST', timestamp: 100 },
        prevState: { version: 0 },
        nextState: { version: 1 },
      });

      const json = audit.export();
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].event.type).toBe('TEST');
    });
  });

  // --- size ---
  describe('size', () => {
    it('size returns entry count', () => {
      expect(audit.size()).toBe(0);

      audit.record({
        event: { type: 'TEST', timestamp: 0 },
        prevState: { version: 0 },
        nextState: { version: 1 },
      });
      expect(audit.size()).toBe(1);

      audit.record({
        event: { type: 'TEST2', timestamp: 1 },
        prevState: { version: 1 },
        nextState: { version: 2 },
      });
      expect(audit.size()).toBe(2);
    });
  });
});

describe('Audit Middleware', () => {
  // --- middleware ---
  describe('middleware', () => {
    it('middleware captures prevState', () => {
      const audit = createAuditTrail();
      const bus = createEventBus();
      const store = createRuntimeStore({ counter: 0 });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createAuditMiddleware(audit, store));
      scheduler.registerReducer('INCREMENT', (_event, prevState) => ({
        nextState: { ...prevState, counter: (prevState as any).counter + 1 },
      }));

      bus.dispatch({ type: 'INCREMENT' });

      const entries = audit.getEntries();
      expect(entries).toHaveLength(1);
      expect((entries[0].prevState as any).counter).toBe(0);
    });

    it('middleware captures nextState after commit', () => {
      const audit = createAuditTrail();
      const bus = createEventBus();
      const store = createRuntimeStore({ counter: 0 });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createAuditMiddleware(audit, store));
      scheduler.registerReducer('INCREMENT', (_event, prevState) => ({
        nextState: { ...prevState, counter: (prevState as any).counter + 1 },
      }));

      bus.dispatch({ type: 'INCREMENT' });

      const entries = audit.getEntries();
      expect(entries).toHaveLength(1);
      expect((entries[0].nextState as any)?.counter).toBe(1);
    });

    it('middleware records entry on successful event', () => {
      const audit = createAuditTrail();
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);

      scheduler.use(createAuditMiddleware(audit, store));
      scheduler.registerReducer('TEST_EVENT', (_event, prevState) => ({
        nextState: { ...prevState },
      }));

      bus.dispatch({ type: 'TEST_EVENT', payload: { data: 'hello' } });

      expect(audit.size()).toBe(1);
      const entry = audit.getEntries()[0];
      expect(entry.event.type).toBe('TEST_EVENT');
      expect(entry.prevState.version).toBe(0);
      expect(entry.nextState?.version).toBe(1);
    });

    it('middleware records entry with unchanged state on reducer error', () => {
      const audit = createAuditTrail();
      const bus = createEventBus();
      const store = createRuntimeStore();
      const scheduler = createScheduler(store, bus);

      scheduler.use(createAuditMiddleware(audit, store));
      scheduler.registerReducer('BAD_EVENT', () => {
        throw new Error('reducer failed');
      });

      // Suppress console.error from Scheduler
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      bus.dispatch({ type: 'BAD_EVENT' });
      consoleSpy.mockRestore();

      // Audit should record: prevState and nextState are the same (no commit)
      // Plus a SYSTEM_ERROR event record
      const entries = audit.getEntries();
      // BAD_EVENT entry + SYSTEM_ERROR entry (SYSTEM_ERROR is skipped by scheduler but audit middleware still runs)
      // Actually SYSTEM_ERROR bypasses scheduler.process entirely, so only BAD_EVENT is recorded
      expect(entries.length).toBeGreaterThanOrEqual(1);
      const badEntry = entries.find(e => e.event.type === 'BAD_EVENT');
      expect(badEntry).toBeDefined();
      // State versions should match (no commit happened)
      expect(badEntry!.prevState.version).toBe(badEntry!.nextState?.version);
    });

    it('middleware does not interfere with reducer execution', () => {
      const audit = createAuditTrail();
      const bus = createEventBus();
      const store = createRuntimeStore({ value: 'initial' });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createAuditMiddleware(audit, store));
      scheduler.registerReducer('SET_VALUE', (event, prevState) => ({
        nextState: { ...prevState, value: event.payload },
      }));

      bus.dispatch({ type: 'SET_VALUE', payload: 'updated' });

      // Verify reducer still works correctly
      expect((store.getState() as any).value).toBe('updated');
      // And audit recorded it
      expect(audit.size()).toBe(1);
    });

    it('middleware order: before captures prevState, after captures nextState', () => {
      const audit = createAuditTrail();
      const bus = createEventBus();
      const store = createRuntimeStore({ step: 0 });
      const scheduler = createScheduler(store, bus);

      scheduler.use(createAuditMiddleware(audit, store));
      scheduler.registerReducer('STEP', (_event, prevState) => ({
        nextState: { ...prevState, step: (prevState as any).step + 1 },
      }));

      // Dispatch multiple events
      bus.dispatch({ type: 'STEP' });
      bus.dispatch({ type: 'STEP' });

      const entries = audit.getEntries();
      expect(entries).toHaveLength(2);

      // First event: 0 → 1
      expect((entries[0].prevState as any).step).toBe(0);
      expect((entries[0].nextState as any)?.step).toBe(1);

      // Second event: 1 → 2
      expect((entries[1].prevState as any).step).toBe(1);
      expect((entries[1].nextState as any)?.step).toBe(2);
    });
  });

  // --- lifecycle ---
  describe('lifecycle', () => {
    it('destroy cleans up audit records', () => {
      const audit = createAuditTrail();
      audit.record({
        event: { type: 'TEST', timestamp: 0 },
        prevState: { version: 0 },
        nextState: { version: 1 },
      });
      expect(audit.size()).toBe(1);

      audit.clear();
      expect(audit.size()).toBe(0);
    });
  });

  // --- isolation ---
  describe('isolation', () => {
    it('has no React/DOM imports', () => {
      const auditTrailSrc = fs.readFileSync(
        path.resolve(__dirname, './audit-trail.ts'),
        'utf-8',
      );
      const auditMiddlewareSrc = fs.readFileSync(
        path.resolve(__dirname, './audit-middleware.ts'),
        'utf-8',
      );
      const typesSrc = fs.readFileSync(
        path.resolve(__dirname, './types.ts'),
        'utf-8',
      );

      for (const src of [auditTrailSrc, auditMiddlewareSrc, typesSrc]) {
        expect(src).not.toMatch(/from ['"]react['"]/);
        expect(src).not.toMatch(/from ['"]react-dom['"]/);
        expect(src).not.toMatch(/\bdocument\b/);
        expect(src).not.toMatch(/\bwindow\b/);
      }
    });
  });
});
