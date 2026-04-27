/**
 * useAutosizeMeasure · hook algorithm tests.
 *
 * Why a separate file: jsdom does not perform layout, so `scrollHeight` and
 * computed typography metrics must be stubbed. The Textarea component test
 * file keeps DOM / data-attr / variant contracts; this file owns the measure
 * closure math (clamp to minH / maxH, overflow-y switch, cleanup on toggle).
 *
 * Contract: devdocs/components/Textarea/design.md §9.2 (dual-path closure).
 */

import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, act } from '@testing-library/react';
import { useAutosizeMeasure } from './useAutosizeMeasure';

// ── Test harness ────────────────────────────────────────────────────────────
//
// Minimal host that mounts a <textarea>, wires the hook, and exposes `measure`
// so tests can invoke the onChange path directly.

interface HarnessProps {
  autosize: boolean;
  minRows: number;
  maxRows: number;
  value?: unknown;
}

interface HarnessHandle {
  el: HTMLTextAreaElement;
  measure: () => void;
}

const Harness = React.forwardRef<HarnessHandle, HarnessProps>((props, ref) => {
  const taRef = React.useRef<HTMLTextAreaElement | null>(null);
  const measure = useAutosizeMeasure({
    ref: taRef,
    autosize: props.autosize,
    minRows: props.minRows,
    maxRows: props.maxRows,
    size: 'md',
    value: props.value,
  });

  React.useImperativeHandle(ref, () => ({
    // Tests read `.el` after mount — ref callback below assigns it.
    get el() {
      return taRef.current as HTMLTextAreaElement;
    },
    measure,
  }));

  return <textarea ref={taRef} />;
});
Harness.displayName = 'Harness';

// ── Layout stubs (jsdom has no layout) ──────────────────────────────────────
//
// `getComputedStyle` is spied on to return controlled typography metrics.
// `scrollHeight` is installed via defineProperty on HTMLTextAreaElement so all
// instances read from a shared slot we can mutate per-test.

let stubbedScrollHeight = 0;
const scrollHeightDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollHeight',
);
const stubMetrics = {
  lineHeight: '20px',
  paddingTop: '8px',
  paddingBottom: '8px',
  borderTopWidth: '1px',
  borderBottomWidth: '1px',
};

beforeEach(() => {
  stubbedScrollHeight = 0;
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => stubbedScrollHeight,
  });

  vi.spyOn(window, 'getComputedStyle').mockImplementation(
    () =>
      ({
        lineHeight: stubMetrics.lineHeight,
        paddingTop: stubMetrics.paddingTop,
        paddingBottom: stubMetrics.paddingBottom,
        borderTopWidth: stubMetrics.borderTopWidth,
        borderBottomWidth: stubMetrics.borderBottomWidth,
      }) as unknown as CSSStyleDeclaration,
  );
});

afterEach(() => {
  // Restore scrollHeight; null descriptor means the platform default had no
  // explicit descriptor (jsdom) — re-install a stub returning 0 to be safe.
  if (scrollHeightDescriptor) {
    Object.defineProperty(
      HTMLElement.prototype,
      'scrollHeight',
      scrollHeightDescriptor,
    );
  } else {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => 0,
    });
  }
  vi.restoreAllMocks();
});

// ── Tests ───────────────────────────────────────────────────────────────────
describe('useAutosizeMeasure', () => {
  it('autosize=false · does NOT write inline height on mount', () => {
    stubbedScrollHeight = 200;
    const ref = React.createRef<HarnessHandle>();
    render(<Harness ref={ref} autosize={false} minRows={1} maxRows={10} />);
    expect(ref.current!.el.style.height).toBe('');
  });

  it('autosize=true · mount writes clamped height (natural inside bounds)', () => {
    // metrics: lineHeight=20, paddingY=16, borderY=2
    // minRows=1 → minH = ceil(20*1 + 16) = 36
    // maxRows=10 → maxH = ceil(20*10 + 16) = 216
    // natural = 100 (inside bounds) → clamped = 100; final = 100 + 2 = 102px
    stubbedScrollHeight = 100;
    const ref = React.createRef<HarnessHandle>();
    render(<Harness ref={ref} autosize minRows={1} maxRows={10} />);
    expect(ref.current!.el.style.height).toBe('102px');
    expect(ref.current!.el.style.overflowY).toBe('hidden');
  });

  it('autosize=true · natural below minH · clamps UP to minH + borderY', () => {
    // natural = 10 (below minH=36) → clamped = 36; final = 36 + 2 = 38px
    stubbedScrollHeight = 10;
    const ref = React.createRef<HarnessHandle>();
    render(<Harness ref={ref} autosize minRows={1} maxRows={10} />);
    expect(ref.current!.el.style.height).toBe('38px');
    expect(ref.current!.el.style.overflowY).toBe('hidden');
  });

  it('autosize=true · natural above maxH · clamps DOWN to maxH + borderY · overflow=auto', () => {
    // maxRows=3 → maxH = ceil(20*3 + 16) = 76
    // natural = 500 (above) → clamped = 76; final = 76 + 2 = 78px
    stubbedScrollHeight = 500;
    const ref = React.createRef<HarnessHandle>();
    render(<Harness ref={ref} autosize minRows={1} maxRows={3} />);
    expect(ref.current!.el.style.height).toBe('78px');
    expect(ref.current!.el.style.overflowY).toBe('auto');
  });

  it('maxRows=Infinity · never caps height · overflow stays hidden', () => {
    stubbedScrollHeight = 9999;
    const ref = React.createRef<HarnessHandle>();
    render(<Harness ref={ref} autosize minRows={1} maxRows={Infinity} />);
    // natural 9999 > minH=36 → clamped=9999; final = 9999 + 2 = 10001px
    expect(ref.current!.el.style.height).toBe('10001px');
    expect(ref.current!.el.style.overflowY).toBe('hidden');
  });

  it('onChange path (Path 2) re-runs measure on uncontrolled typing', () => {
    // Simulate: mount writes initial height from scrollHeight=50 · then user
    // types (scrollHeight grows to 150) · invoking the returned measure
    // should write the new clamped height even though no deps changed.
    stubbedScrollHeight = 50;
    const ref = React.createRef<HarnessHandle>();
    render(<Harness ref={ref} autosize minRows={1} maxRows={10} />);
    const el = ref.current!.el;
    // initial: natural 50 (inside [36, 216]) → 50 + 2 = 52
    expect(el.style.height).toBe('52px');

    // Typing extends content — Path 2 (onChange) fires measure:
    stubbedScrollHeight = 150;
    act(() => {
      ref.current!.measure();
    });
    expect(el.style.height).toBe('152px');
  });

  it('autosize true → false transition strips inline height + overflow-y', () => {
    stubbedScrollHeight = 100;
    const ref = React.createRef<HarnessHandle>();
    const { rerender } = render(
      <Harness ref={ref} autosize minRows={1} maxRows={10} />,
    );
    expect(ref.current!.el.style.height).toBe('102px');
    expect(ref.current!.el.style.overflowY).toBe('hidden');

    // Disable autosize — cleanup effect fires and strips inline styles.
    rerender(<Harness ref={ref} autosize={false} minRows={1} maxRows={10} />);
    expect(ref.current!.el.style.height).toBe('');
    expect(ref.current!.el.style.overflowY).toBe('');
  });

  it('measure early-returns when autosize=false (Path 2 also no-ops)', () => {
    const ref = React.createRef<HarnessHandle>();
    render(<Harness ref={ref} autosize={false} minRows={1} maxRows={10} />);
    stubbedScrollHeight = 200;
    // Invoke returned measure manually — should NOT write height because
    // the internal latch says autosize=false.
    act(() => {
      ref.current!.measure();
    });
    expect(ref.current!.el.style.height).toBe('');
  });

  it('size / value change (Path 1 deps) re-runs measure', () => {
    // Controlled value change: Path 1 fires on every keystroke.
    stubbedScrollHeight = 50;
    const ref = React.createRef<HarnessHandle>();
    const { rerender } = render(
      <Harness ref={ref} autosize minRows={1} maxRows={10} value="a" />,
    );
    expect(ref.current!.el.style.height).toBe('52px');

    // Next render: scrollHeight grew (content added) and value changed.
    stubbedScrollHeight = 120;
    rerender(
      <Harness ref={ref} autosize minRows={1} maxRows={10} value="ab" />,
    );
    expect(ref.current!.el.style.height).toBe('122px');
  });
});
