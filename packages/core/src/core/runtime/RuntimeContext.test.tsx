import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PrismuiProvider } from '../PrismuiProvider/PrismuiProvider';
import {
  useRuntimeKernel,
  useRuntimeKernelOptional,
  useRuntimeModule,
  useExposedApi,
} from './RuntimeContext';
import type { PrismuiModule } from './types';
import type { RuntimeKernel } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function KernelConsumer({ onCapture }: { onCapture: (k: RuntimeKernel) => void }) {
  const kernel = useRuntimeKernel();
  onCapture(kernel);
  return <div data-testid="kernel">ready</div>;
}

function OptionalKernelConsumer({ onCapture }: { onCapture: (k: RuntimeKernel | null) => void }) {
  const kernel = useRuntimeKernelOptional();
  onCapture(kernel);
  return <div>optional</div>;
}

function ModuleConsumer<T>({ name, onCapture }: { name: string; onCapture: (v: T | undefined) => void }) {
  const value = useRuntimeModule<T>(name);
  onCapture(value);
  return null;
}

function ExposedConsumer<T>({ name, onCapture }: { name: string; onCapture: (v: T | undefined) => void }) {
  const value = useExposedApi<T>(name);
  onCapture(value);
  return null;
}

function createTestModule(name: string, overrides?: Partial<PrismuiModule>): PrismuiModule {
  return {
    name,
    setup: overrides?.setup ?? vi.fn(),
    teardown: overrides?.teardown ?? vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// useRuntimeKernel — context access
// ---------------------------------------------------------------------------

describe('useRuntimeKernel', () => {
  it('returns the kernel from PrismuiProvider', () => {
    let captured: RuntimeKernel | null = null;

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false}>
        <KernelConsumer onCapture={(k) => { captured = k; }} />
      </PrismuiProvider>,
    );

    expect(captured).not.toBeNull();
    expect(typeof captured!.register).toBe('function');
    expect(typeof captured!.get).toBe('function');
  });

  it('throws when used outside PrismuiProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

    expect(() => {
      render(<KernelConsumer onCapture={() => { }} />);
    }).toThrow('useRuntimeKernel must be used within');

    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// useRuntimeKernelOptional
// ---------------------------------------------------------------------------

describe('useRuntimeKernelOptional', () => {
  it('returns kernel when inside provider', () => {
    let captured: RuntimeKernel | null = null;

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false}>
        <OptionalKernelConsumer onCapture={(k) => { captured = k; }} />
      </PrismuiProvider>,
    );

    expect(captured).not.toBeNull();
  });

  it('returns null when outside provider', () => {
    let captured: RuntimeKernel | null = 'sentinel' as any;

    render(
      <OptionalKernelConsumer onCapture={(k) => { captured = k; }} />,
    );

    expect(captured).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Module lifecycle (setup / teardown)
// ---------------------------------------------------------------------------

describe('Module lifecycle', () => {
  it('calls setup() on each module during mount', () => {
    const setupA = vi.fn();
    const setupB = vi.fn();

    const modA = createTestModule('a', { setup: setupA });
    const modB = createTestModule('b', { setup: setupB });

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[modA, modB]}>
        <div />
      </PrismuiProvider>,
    );

    expect(setupA).toHaveBeenCalledTimes(1);
    expect(setupB).toHaveBeenCalledTimes(1);
  });

  it('passes the kernel instance to setup()', () => {
    let receivedKernel: RuntimeKernel | null = null;

    const mod = createTestModule('test', {
      setup: (kernel) => { receivedKernel = kernel; },
    });

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[mod]}>
        <div />
      </PrismuiProvider>,
    );

    expect(receivedKernel).not.toBeNull();
    expect(typeof receivedKernel!.register).toBe('function');
  });

  it('calls teardown() on unmount', () => {
    const teardown = vi.fn();
    const mod = createTestModule('test', { teardown });

    const { unmount } = render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[mod]}>
        <div />
      </PrismuiProvider>,
    );

    expect(teardown).not.toHaveBeenCalled();
    unmount();
    expect(teardown).toHaveBeenCalledTimes(1);
  });

  it('handles modules without teardown gracefully', () => {
    const mod: PrismuiModule = {
      name: 'no-teardown',
      setup: vi.fn(),
      // no teardown
    };

    const { unmount } = render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[mod]}>
        <div />
      </PrismuiProvider>,
    );

    // Should not throw
    expect(() => unmount()).not.toThrow();
  });

  it('works with no modules (empty array)', () => {
    const { container } = render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[]}>
        <div data-testid="child">hello</div>
      </PrismuiProvider>,
    );

    expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
  });

  it('works with no modules prop (undefined)', () => {
    const { container } = render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false}>
        <div data-testid="child">hello</div>
      </PrismuiProvider>,
    );

    expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Module registration via kernel
// ---------------------------------------------------------------------------

describe('Module registration via kernel', () => {
  it('module can register a service accessible to children', () => {
    const overlayManager = { stack: [], push: vi.fn() };

    const mod = createTestModule('overlay', {
      setup: (kernel) => { kernel.register('overlay', overlayManager); },
    });

    let captured: typeof overlayManager | undefined;

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[mod]}>
        <ModuleConsumer<typeof overlayManager>
          name="overlay"
          onCapture={(v) => { captured = v; }}
        />
      </PrismuiProvider>,
    );

    expect(captured).toBe(overlayManager);
  });

  it('module can expose an API accessible to children', () => {
    const dialogApi = { confirm: vi.fn(), alert: vi.fn() };

    const mod = createTestModule('dialog', {
      setup: (kernel) => { kernel.expose('dialog', dialogApi); },
    });

    let captured: typeof dialogApi | undefined;

    render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[mod]}>
        <ExposedConsumer<typeof dialogApi>
          name="dialog"
          onCapture={(v) => { captured = v; }}
        />
      </PrismuiProvider>,
    );

    expect(captured).toBe(dialogApi);
  });
});

// ---------------------------------------------------------------------------
// Kernel stability across re-renders
// ---------------------------------------------------------------------------

describe('Kernel stability', () => {
  it('provides the same kernel instance across re-renders', () => {
    const kernels: RuntimeKernel[] = [];

    function Collector() {
      const kernel = useRuntimeKernel();
      kernels.push(kernel);
      return null;
    }

    const { rerender } = render(
      <PrismuiProvider withCssVars={false} withCssBaseline={false}>
        <Collector />
      </PrismuiProvider>,
    );

    rerender(
      <PrismuiProvider withCssVars={false} withCssBaseline={false}>
        <Collector />
      </PrismuiProvider>,
    );

    expect(kernels.length).toBeGreaterThanOrEqual(2);
    expect(kernels[0]).toBe(kernels[1]);
  });
});
