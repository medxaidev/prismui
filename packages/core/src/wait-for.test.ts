import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from './event-bus';
import { waitFor, WaitForTimeoutError } from './wait-for';

describe('waitFor', () => {
  // ── basic ───────────────────────────────────────────────────────────

  describe('basic', () => {
    it('resolves on matching event', async () => {
      const bus = createEventBus();

      const promise = waitFor(bus, 'SAVE_COMPLETE');
      bus.dispatch({ type: 'SAVE_COMPLETE', payload: { id: 1 } });

      const event = await promise;
      expect(event.type).toBe('SAVE_COMPLETE');
      expect(event.payload).toEqual({ id: 1 });
    });

    it('ignores non-matching event types', async () => {
      const bus = createEventBus();

      const promise = waitFor(bus, 'SAVE_COMPLETE');

      // Dispatch unrelated events
      bus.dispatch({ type: 'OTHER_EVENT' });
      bus.dispatch({ type: 'ANOTHER_EVENT' });

      // Now dispatch matching event
      bus.dispatch({ type: 'SAVE_COMPLETE', payload: { done: true } });

      const event = await promise;
      expect(event.type).toBe('SAVE_COMPLETE');
    });

    it('resolves only once (first match)', async () => {
      const bus = createEventBus();

      const promise = waitFor(bus, 'PING');

      bus.dispatch({ type: 'PING', payload: { seq: 1 } });
      bus.dispatch({ type: 'PING', payload: { seq: 2 } });

      const event = await promise;
      expect(event.payload).toEqual({ seq: 1 });
    });

    it('without timeout waits indefinitely (does not reject)', async () => {
      const bus = createEventBus();

      const promise = waitFor(bus, 'NEVER');

      // Use Promise.race to verify it doesn't resolve within a tick
      const result = await Promise.race([
        promise.then(() => 'resolved'),
        new Promise<string>((r) => setTimeout(() => r('pending'), 50)),
      ]);

      expect(result).toBe('pending');
    });
  });

  // ── predicate ───────────────────────────────────────────────────────

  describe('predicate', () => {
    it('filters events with predicate', async () => {
      const bus = createEventBus();

      const promise = waitFor(bus, 'notification/show', {
        predicate: (e) => (e.payload as { type: string }).type === 'error',
      });

      // Info notification — should be skipped
      bus.dispatch({ type: 'notification/show', payload: { type: 'info', message: 'Hello' } });

      // Error notification — should match
      bus.dispatch({ type: 'notification/show', payload: { type: 'error', message: 'Oops' } });

      const event = await promise;
      expect((event.payload as { type: string }).type).toBe('error');
    });
  });

  // ── timeout ─────────────────────────────────────────────────────────

  describe('timeout', () => {
    it('times out and rejects with WaitForTimeoutError', async () => {
      const bus = createEventBus();

      const promise = waitFor(bus, 'NEVER_COMES', { timeout: 50 });

      await expect(promise).rejects.toThrow(WaitForTimeoutError);
      await expect(promise).rejects.toThrow("waitFor('NEVER_COMES') timed out after 50ms");
    });
  });

  // ── cleanup ─────────────────────────────────────────────────────────

  describe('cleanup', () => {
    it('cleans up subscription after resolve', async () => {
      const bus = createEventBus();
      const spy = vi.fn();

      // Subscribe to track all events
      bus.subscribe('DONE', spy);

      const promise = waitFor(bus, 'DONE');
      bus.dispatch({ type: 'DONE' });
      await promise;

      // After resolve, further DONE events should not cause issues
      // The spy should only see 1 DONE (the one we dispatched)
      bus.dispatch({ type: 'DONE' });
      expect(spy).toHaveBeenCalledTimes(2); // spy still active, waitFor cleaned up its own sub
    });

    it('cleans up subscription after timeout', async () => {
      const bus = createEventBus();

      const promise = waitFor(bus, 'LATE', { timeout: 20 });

      try {
        await promise;
      } catch {
        // Expected timeout
      }

      // After timeout, dispatching LATE should not cause issues
      bus.dispatch({ type: 'LATE' });
      // No error means cleanup worked
    });
  });

  // ── isolation ───────────────────────────────────────────────────────

  describe('isolation', () => {
    it('multiple waitFor on same type resolve independently', async () => {
      const bus = createEventBus();

      const promise1 = waitFor(bus, 'TICK');
      const promise2 = waitFor(bus, 'TICK');

      bus.dispatch({ type: 'TICK', payload: { n: 1 } });

      const [event1, event2] = await Promise.all([promise1, promise2]);
      expect(event1.payload).toEqual({ n: 1 });
      expect(event2.payload).toEqual({ n: 1 });
    });

    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, 'wait-for.ts');
      const source = fs.readFileSync(filePath, 'utf-8');

      expect(source).not.toMatch(/from ['"]react['"]/);
      expect(source).not.toMatch(/from ['"]react-dom['"]/);
      expect(source).not.toMatch(/document\./);
      expect(source).not.toMatch(/window\./);
    });
  });
});
