/**
 * Stage-11 Phase 7c · `useStackingContextWarning` test suite
 *
 * Coverage (ADR-007 决策 20 PR-INTEROP-4 V2 path):
 *   · 8 trigger-factor detection table (transform / filter / opacity / isolation
 *     / contain / will-change / mix-blend-mode / backdrop-filter)
 *   · DOM walk semantics — first-hit stops, body / html skipped, no false
 *     positive when chain is clean
 *   · Latch — single warn per open cycle, re-warns after close→open
 *   · `active=false` is a no-op (closed Modal does not check)
 *   · Production guard — `NODE_ENV='production'` short-circuits before walk
 *   · Warning payload — references CSS property name + ADR doc anchor
 *
 * The hook is exercised both directly (renderHook) for unit-level assertions
 * and indirectly through `<Modal>` for one integration smoke (parity with
 * useFocusTrap.test.tsx pattern).
 */

import * as React from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { render, renderHook } from '@testing-library/react';

import {
  detectStackingContextProperty,
  useStackingContextWarning,
} from './useStackingContextWarning';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  warnSpy.mockRestore();
});

/**
 * Build a DOM tree:
 *   document.body
 *     └─ ancestor (configurable inline styles)
 *         └─ modalContent (the simulated Modal.Content target)
 * and return the inner ref so we can hand it to `useStackingContextWarning`.
 */
function buildTree(ancestorStyles: Partial<CSSStyleDeclaration>): {
  ancestor: HTMLDivElement;
  contentRef: React.RefObject<HTMLElement | null>;
  cleanup: () => void;
} {
  const ancestor = document.createElement('div');
  Object.assign(ancestor.style, ancestorStyles);
  const content = document.createElement('div');
  ancestor.appendChild(content);
  document.body.appendChild(ancestor);

  const contentRef: React.RefObject<HTMLElement | null> = { current: content };
  return {
    ancestor,
    contentRef,
    cleanup: () => {
      document.body.removeChild(ancestor);
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// detectStackingContextProperty — pure unit
// ─────────────────────────────────────────────────────────────────────────────

describe('detectStackingContextProperty · 8-factor detection table', () => {
  function withStyle(styles: Partial<CSSStyleDeclaration>): Element {
    const el = document.createElement('div');
    Object.assign(el.style, styles);
    document.body.appendChild(el);
    return el;
  }

  it('returns null when element has no stacking-context-creating CSS', () => {
    const el = withStyle({ color: 'red' });
    expect(detectStackingContextProperty(el)).toBeNull();
  });

  it('detects #1 transform (any non-none value)', () => {
    const el = withStyle({ transform: 'scale(1)' });
    expect(detectStackingContextProperty(el)).toBe('transform');
  });

  it('detects #2 filter (any non-none value)', () => {
    const el = withStyle({ filter: 'blur(2px)' });
    expect(detectStackingContextProperty(el)).toBe('filter');
  });

  it('detects #3 opacity < 1', () => {
    const el = withStyle({ opacity: '0.99' });
    expect(detectStackingContextProperty(el)).toBe('opacity');
  });

  it('does NOT flag opacity === 1 (the only "safe" value)', () => {
    const el = withStyle({ opacity: '1' });
    expect(detectStackingContextProperty(el)).toBeNull();
  });

  it('detects #4 isolation: isolate', () => {
    const el = withStyle({ isolation: 'isolate' });
    expect(detectStackingContextProperty(el)).toBe('isolation');
  });

  it('detects #5 contain — flags layout / paint / strict / content', () => {
    for (const value of ['layout', 'paint', 'strict', 'content']) {
      const el = withStyle({ contain: value });
      expect(detectStackingContextProperty(el), `contain: ${value}`).toBe(
        'contain',
      );
    }
  });

  it('detects #6 will-change when listing transform / filter / opacity / perspective', () => {
    for (const value of ['transform', 'filter', 'opacity', 'perspective']) {
      const el = withStyle({ willChange: value });
      expect(detectStackingContextProperty(el), `will-change: ${value}`).toBe(
        'will-change',
      );
    }
  });

  it('detects #6 will-change with multi-value list (e.g. "transform, opacity")', () => {
    const el = withStyle({ willChange: 'transform, opacity' });
    expect(detectStackingContextProperty(el)).toBe('will-change');
  });

  it('does NOT flag will-change: scroll-position (does not promote stacking)', () => {
    const el = withStyle({ willChange: 'scroll-position' });
    expect(detectStackingContextProperty(el)).toBeNull();
  });

  it('detects #7 mix-blend-mode (any non-normal value)', () => {
    const el = withStyle({ mixBlendMode: 'multiply' });
    expect(detectStackingContextProperty(el)).toBe('mix-blend-mode');
  });

  it('detects #8 backdrop-filter (any non-none value)', () => {
    const el = withStyle({ backdropFilter: 'blur(4px)' } as Partial<CSSStyleDeclaration>);
    expect(detectStackingContextProperty(el)).toBe('backdrop-filter');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useStackingContextWarning · effect-level integration
// ─────────────────────────────────────────────────────────────────────────────

describe('useStackingContextWarning · effect behavior', () => {
  it('does NOT warn when Modal is closed (active=false)', () => {
    const { contentRef, cleanup } = buildTree({ transform: 'scale(1)' });
    renderHook(() => useStackingContextWarning({ active: false, contentRef }));
    expect(warnSpy).not.toHaveBeenCalled();
    cleanup();
  });

  it('does NOT warn when contentRef is null (defensive guard)', () => {
    const contentRef: React.RefObject<HTMLElement | null> = { current: null };
    renderHook(() => useStackingContextWarning({ active: true, contentRef }));
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when ancestor chain is clean (Modal mounted directly under body)', () => {
    // Build a tree where the only ancestor is <body> · the walk should skip
    // body and reach null without finding a stacking ctx.
    const content = document.createElement('div');
    document.body.appendChild(content);
    const contentRef: React.RefObject<HTMLElement | null> = { current: content };

    renderHook(() => useStackingContextWarning({ active: true, contentRef }));
    expect(warnSpy).not.toHaveBeenCalled();
    document.body.removeChild(content);
  });

  it('warns when an ancestor has transform != none (canonical PR-INTEROP-4 case)', () => {
    const { contentRef, cleanup } = buildTree({ transform: 'scale(1)' });
    renderHook(() => useStackingContextWarning({ active: true, contentRef }));
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const message = String(warnSpy.mock.calls[0]?.[0] ?? '');
    expect(message).toContain('transform');
    expect(message).toContain('PR-INTEROP-4');
    cleanup();
  });

  it('warning payload identifies the offending element selector', () => {
    const { ancestor, contentRef, cleanup } = buildTree({ filter: 'blur(2px)' });
    ancestor.id = 'offender';
    renderHook(() => useStackingContextWarning({ active: true, contentRef }));
    const message = String(warnSpy.mock.calls[0]?.[0] ?? '');
    expect(message).toContain('id="offender"');
    expect(message).toContain('filter');
    // The offending DOM node is also passed as a second arg for inspection.
    expect(warnSpy.mock.calls[0]?.[1]).toBe(ancestor);
    cleanup();
  });

  it('warning references the ADR doc anchor (PR-INTEROP-4 · 决策 20)', () => {
    const { contentRef, cleanup } = buildTree({ opacity: '0.5' });
    renderHook(() => useStackingContextWarning({ active: true, contentRef }));
    const message = String(warnSpy.mock.calls[0]?.[0] ?? '');
    expect(message).toContain('@/devdocs/components/Modal/design.md');
    expect(message).toContain('决策 20');
    cleanup();
  });

  it('emits a SINGLE warning even when multiple ancestors violate (first-hit stops walk)', () => {
    // outer: transform · middle: filter · inner: clean.  Walk from inner.parent
    // should stop at `middle` (filter) and not also report `outer`.
    const outer = document.createElement('div');
    outer.style.transform = 'scale(1)';
    const middle = document.createElement('div');
    middle.style.filter = 'blur(2px)';
    const inner = document.createElement('div');
    outer.appendChild(middle);
    middle.appendChild(inner);
    document.body.appendChild(outer);

    const contentRef: React.RefObject<HTMLElement | null> = { current: inner };
    renderHook(() => useStackingContextWarning({ active: true, contentRef }));

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(String(warnSpy.mock.calls[0]?.[0] ?? '')).toContain('filter');
    document.body.removeChild(outer);
  });

  it('latches — does not re-warn on re-render within the same open cycle', () => {
    const { contentRef, cleanup } = buildTree({ transform: 'scale(1)' });
    const { rerender } = renderHook(
      ({ active }) => useStackingContextWarning({ active, contentRef }),
      { initialProps: { active: true } },
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    rerender({ active: true });
    rerender({ active: true });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('un-latches on close → re-warns on next open if violation persists', () => {
    const { contentRef, cleanup } = buildTree({ isolation: 'isolate' });
    const { rerender } = renderHook(
      ({ active }) => useStackingContextWarning({ active, contentRef }),
      { initialProps: { active: true } },
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    rerender({ active: false });    // close · resets latch
    rerender({ active: true });     // re-open · should re-warn
    expect(warnSpy).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it('production guard — NODE_ENV=production short-circuits before walk', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { contentRef, cleanup } = buildTree({ transform: 'scale(1)' });
      renderHook(() =>
        useStackingContextWarning({ active: true, contentRef }),
      );
      expect(warnSpy).not.toHaveBeenCalled();
      cleanup();
    } finally {
      process.env.NODE_ENV = original;
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration · Modal compound mounts the hook (smoke)
// ─────────────────────────────────────────────────────────────────────────────

describe('useStackingContextWarning · Modal integration smoke', () => {
  it('warns when <Modal.Content> renders inside a transformed ancestor (forceMount path)', async () => {
    // Set up: a transformed wrapper is the Portal container. Modal portals
    // INTO it, so the panel inherits the parent stacking context.
    const portalHost = document.createElement('div');
    portalHost.id = 'modal-host';
    portalHost.style.transform = 'translateZ(0)';
    document.body.appendChild(portalHost);

    // Lazy import to avoid Modal pulling in test-runner-time setup before
    // the spies above are installed.
    const { Modal } = await import('../Modal');

    render(
      <Modal.Root defaultOpen>
        <Modal.Content container={portalHost}>
          <Modal.Title>Title</Modal.Title>
          <p>body</p>
        </Modal.Content>
      </Modal.Root>,
    );

    // Presence transitions on first commit → effect runs after content paints.
    // The warn spy may receive an unrelated focus-trap warning under jsdom;
    // assert only that OUR warning is present.
    const stackingWarnings = warnSpy.mock.calls.filter(
      (args: unknown[]) => String(args[0] ?? '').includes('PR-INTEROP-4'),
    );
    expect(stackingWarnings.length).toBeGreaterThanOrEqual(1);
    expect(String(stackingWarnings[0]?.[0] ?? '')).toContain('transform');

    document.body.removeChild(portalHost);
  });
});
