import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { PrismuiProvider } from '../PrismuiProvider/PrismuiProvider';
import { useProps } from './use-props';

// ---------------------------------------------------------------------------
// Helper: wrap with PrismuiProvider + theme components
// ---------------------------------------------------------------------------

function createWrapper(components: Record<string, any> = {}) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PrismuiProvider theme={{ components }}>
        {children}
      </PrismuiProvider>
    );
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useProps', () => {
  // ---- Without provider ----

  it('returns user props when no provider is present', () => {
    const { result } = renderHook(() =>
      useProps<{ size?: string }>('TestComponent', {}, { size: 'lg' }),
    );
    expect(result.current.size).toBe('lg');
  });

  it('returns component defaultProps when no provider and no user props', () => {
    const { result } = renderHook(() =>
      useProps<{ size?: string }>('TestComponent', { size: 'md' }, {}),
    );
    expect(result.current.size).toBe('md');
  });

  // ---- With provider ----

  it('returns theme defaultProps from provider context', () => {
    const wrapper = createWrapper({
      TestComponent: { defaultProps: { size: 'xl' } },
    });
    const { result } = renderHook(
      () => useProps<{ size?: string }>('TestComponent', {}, {}),
      { wrapper },
    );
    expect(result.current.size).toBe('xl');
  });

  it('theme defaultProps override component defaultProps', () => {
    const wrapper = createWrapper({
      TestComponent: { defaultProps: { size: 'xl' } },
    });
    const { result } = renderHook(
      () => useProps<{ size?: string }>('TestComponent', { size: 'sm' }, {}),
      { wrapper },
    );
    expect(result.current.size).toBe('xl');
  });

  it('user props override theme defaultProps', () => {
    const wrapper = createWrapper({
      TestComponent: { defaultProps: { size: 'xl' } },
    });
    const { result } = renderHook(
      () =>
        useProps<{ size?: string }>(
          'TestComponent',
          {},
          { size: 'xs' },
        ),
      { wrapper },
    );
    expect(result.current.size).toBe('xs');
  });

  it('user props override both component and theme defaultProps', () => {
    const wrapper = createWrapper({
      TestComponent: { defaultProps: { size: 'xl' } },
    });
    const { result } = renderHook(
      () =>
        useProps<{ size?: string }>(
          'TestComponent',
          { size: 'sm' },
          { size: 'xs' },
        ),
      { wrapper },
    );
    expect(result.current.size).toBe('xs');
  });

  // ---- undefined filtering ----

  it('filters out undefined user props so they do not shadow defaults', () => {
    const wrapper = createWrapper({
      TestComponent: { defaultProps: { size: 'xl' } },
    });
    const { result } = renderHook(
      () =>
        useProps<{ size?: string }>(
          'TestComponent',
          {},
          { size: undefined } as any,
        ),
      { wrapper },
    );
    expect(result.current.size).toBe('xl');
  });

  it('preserves null, false, and 0 user props', () => {
    const { result } = renderHook(() =>
      useProps<{ a?: any; b?: any; c?: any }>(
        'TestComponent',
        { a: 'default-a', b: 'default-b', c: 'default-c' },
        { a: null, b: false, c: 0 },
      ),
    );
    expect(result.current.a).toBeNull();
    expect(result.current.b).toBe(false);
    expect(result.current.c).toBe(0);
  });

  // ---- function defaultProps ----

  it('supports theme defaultProps as a function (theme) => object', () => {
    const wrapper = createWrapper({
      TestComponent: {
        defaultProps: (theme: any) => ({
          fontFamily: theme.fontFamily,
        }),
      },
    });
    const { result } = renderHook(
      () => useProps<{ fontFamily?: string }>('TestComponent', {}, {}),
      { wrapper },
    );
    // Should get the theme's fontFamily value
    expect(result.current.fontFamily).toBeDefined();
    expect(typeof result.current.fontFamily).toBe('string');
  });

  // ---- component not in theme ----

  it('works when component is not registered in theme.components', () => {
    const wrapper = createWrapper({});
    const { result } = renderHook(
      () =>
        useProps<{ size?: string }>(
          'UnregisteredComponent',
          { size: 'md' },
          {},
        ),
      { wrapper },
    );
    expect(result.current.size).toBe('md');
  });

  // ---- null defaultProps ----

  it('accepts null as defaultProps (no component defaults)', () => {
    const wrapper = createWrapper({
      TestComponent: { defaultProps: { size: 'xl' } },
    });
    const { result } = renderHook(
      () => useProps<{ size?: string }>('TestComponent', null as any, {}),
      { wrapper },
    );
    expect(result.current.size).toBe('xl');
  });
});
