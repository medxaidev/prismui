import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { assignRef, mergeRefs, useMergedRef } from './use-merged-ref';

// ---------------------------------------------------------------------------
// assignRef
// ---------------------------------------------------------------------------

describe('assignRef', () => {
  it('assigns value to object ref', () => {
    const ref = createRef<HTMLDivElement>();
    const div = document.createElement('div');
    assignRef(ref, div);
    expect(ref.current).toBe(div);
  });

  it('calls function ref with value', () => {
    const fn = vi.fn();
    const div = document.createElement('div');
    assignRef(fn, div);
    expect(fn).toHaveBeenCalledWith(div);
  });

  it('does nothing for undefined ref', () => {
    expect(() => assignRef(undefined, document.createElement('div'))).not.toThrow();
  });

  it('does nothing for null ref', () => {
    expect(() => assignRef(null, document.createElement('div'))).not.toThrow();
  });

  it('assigns null to object ref', () => {
    const ref = createRef<HTMLDivElement>();
    const div = document.createElement('div');
    assignRef(ref, div);
    expect(ref.current).toBe(div);
    assignRef(ref, null);
    expect(ref.current).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// mergeRefs
// ---------------------------------------------------------------------------

describe('mergeRefs', () => {
  it('assigns node to all refs', () => {
    const ref1 = createRef<HTMLDivElement>();
    const ref2 = vi.fn();
    const merged = mergeRefs(ref1, ref2);
    const div = document.createElement('div');

    merged(div);

    expect(ref1.current).toBe(div);
    expect(ref2).toHaveBeenCalledWith(div);
  });

  it('handles undefined refs gracefully', () => {
    const ref1 = createRef<HTMLDivElement>();
    const merged = mergeRefs(ref1, undefined);
    const div = document.createElement('div');

    expect(() => merged(div)).not.toThrow();
    expect(ref1.current).toBe(div);
  });

  it('assigns null to all refs on unmount', () => {
    const ref1 = createRef<HTMLDivElement>();
    const fn = vi.fn();
    const merged = mergeRefs(ref1, fn);
    const div = document.createElement('div');

    merged(div);
    expect(ref1.current).toBe(div);
    expect(fn).toHaveBeenCalledWith(div);

    merged(null);
    expect(ref1.current).toBeNull();
    expect(fn).toHaveBeenCalledWith(null);
  });

  it('merges multiple refs of different types', () => {
    const objectRef = createRef<HTMLDivElement>();
    const fnRef = vi.fn();
    const merged = mergeRefs(objectRef, fnRef, undefined);
    const div = document.createElement('div');

    merged(div);

    expect(objectRef.current).toBe(div);
    expect(fnRef).toHaveBeenCalledWith(div);
  });

  it('handles empty refs list', () => {
    const merged = mergeRefs<HTMLDivElement>();
    expect(() => merged(null)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// useMergedRef
// ---------------------------------------------------------------------------

describe('useMergedRef', () => {
  it('returns a callback ref', () => {
    const ref1 = createRef<HTMLDivElement>();
    const { result } = renderHook(() => useMergedRef(ref1));
    expect(typeof result.current).toBe('function');
  });

  it('assigns to all provided refs', () => {
    const ref1 = createRef<HTMLDivElement>();
    const ref2 = vi.fn();
    const { result } = renderHook(() => useMergedRef(ref1, ref2));

    const div = document.createElement('div');
    result.current(div);

    expect(ref1.current).toBe(div);
    expect(ref2).toHaveBeenCalledWith(div);
  });

  it('handles empty refs', () => {
    const { result } = renderHook(() => useMergedRef<HTMLDivElement>());
    expect(typeof result.current).toBe('function');
    expect(() => result.current(null)).not.toThrow();
  });
});
