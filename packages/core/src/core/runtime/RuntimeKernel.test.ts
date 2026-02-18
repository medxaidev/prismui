import { describe, expect, it } from 'vitest';
import { createRuntimeKernel } from './RuntimeKernel';
import type { RuntimeKernel } from './types';

// ---------------------------------------------------------------------------
// createRuntimeKernel — Internal Registry
// ---------------------------------------------------------------------------

describe('createRuntimeKernel', () => {
  it('creates a kernel instance', () => {
    const kernel = createRuntimeKernel();
    expect(kernel).toBeDefined();
    expect(typeof kernel.register).toBe('function');
    expect(typeof kernel.get).toBe('function');
    expect(typeof kernel.has).toBe('function');
    expect(typeof kernel.expose).toBe('function');
    expect(typeof kernel.getExposed).toBe('function');
    expect(typeof kernel.getModules).toBe('function');
    expect(typeof kernel.isReady).toBe('function');
  });
});

describe('Internal registry (register / get / has)', () => {
  let kernel: RuntimeKernel;

  it('registers and retrieves a service', () => {
    kernel = createRuntimeKernel();
    const service = { foo: 'bar' };
    kernel.register('test', service);
    expect(kernel.get('test')).toBe(service);
  });

  it('returns undefined for unregistered service', () => {
    kernel = createRuntimeKernel();
    expect(kernel.get('nonexistent')).toBeUndefined();
  });

  it('has() returns true for registered service', () => {
    kernel = createRuntimeKernel();
    kernel.register('overlay', { stack: [] });
    expect(kernel.has('overlay')).toBe(true);
  });

  it('has() returns false for unregistered service', () => {
    kernel = createRuntimeKernel();
    expect(kernel.has('overlay')).toBe(false);
  });

  it('throws on duplicate registration', () => {
    kernel = createRuntimeKernel();
    kernel.register('overlay', {});
    expect(() => kernel.register('overlay', {})).toThrow(
      'Module "overlay" is already registered',
    );
  });

  it('supports generic type parameter for get()', () => {
    kernel = createRuntimeKernel();
    interface TestService { value: number }
    const svc: TestService = { value: 42 };
    kernel.register('typed', svc);
    const retrieved = kernel.get<TestService>('typed');
    expect(retrieved?.value).toBe(42);
  });

  it('registers multiple independent services', () => {
    kernel = createRuntimeKernel();
    kernel.register('a', { id: 'a' });
    kernel.register('b', { id: 'b' });
    kernel.register('c', { id: 'c' });
    expect(kernel.get<{ id: string }>('a')?.id).toBe('a');
    expect(kernel.get<{ id: string }>('b')?.id).toBe('b');
    expect(kernel.get<{ id: string }>('c')?.id).toBe('c');
  });
});

// ---------------------------------------------------------------------------
// Exposed registry (expose / getExposed)
// ---------------------------------------------------------------------------

describe('Exposed registry (expose / getExposed)', () => {
  it('exposes and retrieves an API', () => {
    const kernel = createRuntimeKernel();
    const api = { confirm: () => true };
    kernel.expose('dialog', api);
    expect(kernel.getExposed('dialog')).toBe(api);
  });

  it('returns undefined for unexposed API', () => {
    const kernel = createRuntimeKernel();
    expect(kernel.getExposed('dialog')).toBeUndefined();
  });

  it('overwrites previously exposed API (no throw)', () => {
    const kernel = createRuntimeKernel();
    const api1 = { version: 1 };
    const api2 = { version: 2 };
    kernel.expose('dialog', api1);
    kernel.expose('dialog', api2);
    expect(kernel.getExposed<{ version: number }>('dialog')?.version).toBe(2);
  });

  it('internal and exposed registries are independent', () => {
    const kernel = createRuntimeKernel();
    kernel.register('overlay', { type: 'internal' });
    kernel.expose('overlay', { type: 'exposed' });
    expect(kernel.get<{ type: string }>('overlay')?.type).toBe('internal');
    expect(kernel.getExposed<{ type: string }>('overlay')?.type).toBe('exposed');
  });
});

// ---------------------------------------------------------------------------
// Introspection (getModules / isReady)
// ---------------------------------------------------------------------------

describe('Introspection (getModules / isReady)', () => {
  it('getModules() returns empty array initially', () => {
    const kernel = createRuntimeKernel();
    expect(kernel.getModules()).toEqual([]);
  });

  it('getModules() returns registered module names', () => {
    const kernel = createRuntimeKernel();
    kernel.register('overlay', {});
    kernel.register('dialog', {});
    expect(kernel.getModules()).toEqual(['overlay', 'dialog']);
  });

  it('isReady() returns false when no modules registered', () => {
    const kernel = createRuntimeKernel();
    expect(kernel.isReady()).toBe(false);
  });

  it('isReady() returns true after registration', () => {
    const kernel = createRuntimeKernel();
    kernel.register('overlay', {});
    expect(kernel.isReady()).toBe(true);
  });
});
