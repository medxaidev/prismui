/**
 * Stage-10 · Utility · `chainHandlers` tests
 *
 * Contract: `@/devdocs/system/feedback-contract.md` v0.2 §5.3
 */

import { describe, expect, it, vi } from 'vitest';

import { chainHandlers } from './chain-handlers';

describe('chainHandlers', () => {
  it('runs all handlers in the order they are passed', () => {
    const calls: string[] = [];
    const h1 = vi.fn(() => {
      calls.push('h1');
    });
    const h2 = vi.fn(() => {
      calls.push('h2');
    });
    const h3 = vi.fn(() => {
      calls.push('h3');
    });

    chainHandlers<[string]>(h1, h2, h3)('x');

    expect(calls).toEqual(['h1', 'h2', 'h3']);
    expect(h1).toHaveBeenCalledWith('x');
    expect(h2).toHaveBeenCalledWith('x');
    expect(h3).toHaveBeenCalledWith('x');
  });

  it('skips undefined handlers without error', () => {
    const h1 = vi.fn();
    const h3 = vi.fn();

    const composed = chainHandlers<[number]>(h1, undefined, h3);

    expect(() => composed(42)).not.toThrow();
    expect(h1).toHaveBeenCalledWith(42);
    expect(h3).toHaveBeenCalledWith(42);
  });

  it('propagates first throw and stops subsequent handlers', () => {
    const h1 = vi.fn();
    const err = new Error('boom');
    const h2 = vi.fn(() => {
      throw err;
    });
    const h3 = vi.fn();

    const composed = chainHandlers(h1, h2, h3);

    expect(() => composed()).toThrow(err);
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
    expect(h3).not.toHaveBeenCalled();
  });
});
