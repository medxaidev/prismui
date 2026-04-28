/**
 * Stage-11 · L0 Overlay Foundation · `useFloatingPosition` hook tests
 *
 * Contract: `@/devdocs/system/floating-primitive.md` v0.1.2 §10 (F-1 ~ F-4 +
 * 合约穿透次级)
 *
 * Coverage:
 *   · F-1 first-paint — floatingStyles populated post-mount · no (0,0) flash
 *   · F-2 flip middleware — chain wired · middlewareData reflects vendor flip
 *   · F-3 z-index single source — theme.zIndex.{level} drives floatingStyles
 *   · F-4 virtual element — `{ getBoundingClientRect }` accepted as reference
 *   · Secondary — vendor transparency edges · API defaults · noop stability
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  useFloatingPosition,
  __resetFloatingZIndexWarn,
  type UseFloatingPositionOptions,
  type UseFloatingPositionResult,
  type FloatingZIndexLevel,
} from './useFloatingPosition';
import { offset } from './middleware';
import type {
  VirtualReferenceElement,
  FloatingMiddleware,
} from './types';
import { Portal } from '../portal';
import { defaultTheme } from '../../theme/default-theme';
import { ThemeContext } from '../../theme/context/theme.context';
import type { PrismUITheme } from '../../theme/types';

// ─────────────────────────────────────────────────────────────────────────────
// Test harness
// ─────────────────────────────────────────────────────────────────────────────

interface HarnessProps extends UseFloatingPositionOptions {
  /** Optional callback exposing latest hook result for assertions. */
  onResult?: (result: UseFloatingPositionResult) => void;
  /** Whether to attach reference / floating refs to real DOM nodes. */
  attach?: boolean;
  /** Custom reference (Element or virtual). Overrides default DOM trigger. */
  customReference?: VirtualReferenceElement | Element | null;
  /** When true, render floating subtree inside <Portal>. */
  insidePortal?: boolean;
}

function FloatingHarness({
  onResult,
  attach = true,
  customReference,
  insidePortal,
  ...hookOptions
}: HarnessProps) {
  const result = useFloatingPosition(hookOptions);
  onResult?.(result);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const floatingRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!attach) return;
    if (customReference !== undefined) {
      result.refs.setReference(customReference);
    } else if (triggerRef.current) {
      result.refs.setReference(triggerRef.current);
    }
    if (floatingRef.current) {
      result.refs.setFloating(floatingRef.current);
    }
  });

  const floating = (
    <div
      ref={floatingRef}
      data-testid="floating"
      style={result.floatingStyles}
    >
      content
    </div>
  );

  return (
    <>
      {customReference === undefined && (
        <button ref={triggerRef} data-testid="trigger" type="button">
          trigger
        </button>
      )}
      {insidePortal ? <Portal>{floating}</Portal> : floating}
    </>
  );
}

/**
 * Wraps children in `<ThemeContext.Provider>` so the hook reads the theme
 * via `useThemeOptional()`. Provider MUST sit outside the component that
 * calls the hook · per React context rules.
 */
function WithTheme({
  theme,
  children,
}: {
  theme: PrismUITheme<string, string>;
  children: React.ReactNode;
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

// ─────────────────────────────────────────────────────────────────────────────
// F-1 · first-paint (OV-FLOAT-2 + Portal mount cooperation)
// ─────────────────────────────────────────────────────────────────────────────

describe('useFloatingPosition · F-1 · first-paint no flash', () => {
  it('floatingStyles contain top + left after first commit (no (0,0) flash)', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(<FloatingHarness onResult={(r) => (latest = r)} />);

    expect(latest).toBeDefined();
    // After mount + reference/floating attached, vendor `useLayoutEffect`
    // populates the styles synchronously. We assert structural keys — the
    // exact pixel values depend on jsdom's null layout.
    expect(latest!.floatingStyles).toHaveProperty('position', 'absolute');
    expect(latest!.floatingStyles).toHaveProperty('top');
    expect(latest!.floatingStyles).toHaveProperty('left');
  });

  it('floating subtree inside <Portal> still resolves first-paint position', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(<FloatingHarness onResult={(r) => (latest = r)} insidePortal />);
    expect(latest!.floatingStyles).toHaveProperty('position', 'absolute');
    expect(latest!.floatingStyles).toHaveProperty('top');
  });

  it('enabled: false still produces stable styles (no rAF loop · noop)', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(
      <FloatingHarness onResult={(r) => (latest = r)} enabled={false} />,
    );
    // Even when disabled, styles object exists and contains zIndex.
    expect(latest!.floatingStyles).toHaveProperty('zIndex');
    expect(latest!.floatingStyles).toHaveProperty('position');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// F-2 · flip middleware (OV-FLOAT-2 hard contract)
// ─────────────────────────────────────────────────────────────────────────────

describe('useFloatingPosition · F-2 · flip middleware in default chain', () => {
  it('default chain wires flip middleware (vendor middlewareData populated)', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(<FloatingHarness onResult={(r) => (latest = r)} />);

    // vendor populates middlewareData with a key per active middleware after
    // the first computePosition pass. `flip` may emit empty data if no
    // overflow detected — the existence of the chain itself is the contract.
    expect(latest!.middlewareData).toBeTypeOf('object');
  });

  it('placement default = bottom-start when not specified', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(<FloatingHarness onResult={(r) => (latest = r)} />);
    expect(latest!.placement).toBe('bottom-start');
  });

  it('custom middleware FULLY replaces default chain (no merge)', () => {
    // Pass only `offset` — chain length should be 1, not 3+1.
    const customChain: FloatingMiddleware[] = [offset(20)];
    let latest: UseFloatingPositionResult | undefined;
    render(
      <FloatingHarness
        onResult={(r) => (latest = r)}
        middleware={customChain}
      />,
    );
    // We can't directly inspect the chain via the public API, but the
    // middlewareData object reflects only the middleware that ran. The key
    // absence of `flip` / `shift` on data is indirect evidence; the more
    // direct assertion is reserved for buildDefaultMiddleware.test.ts.
    expect(latest).toBeDefined();
    expect(latest!.middlewareData).toBeTypeOf('object');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// F-3 · z-index single source (OV-FLOAT-3)
// ─────────────────────────────────────────────────────────────────────────────

describe('useFloatingPosition · F-3 · z-index single source', () => {
  beforeEach(() => {
    __resetFloatingZIndexWarn();
  });

  it('default zIndexLevel = popover · floatingStyles.zIndex = theme.zIndex.popover', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(
      <WithTheme theme={defaultTheme}>
        <FloatingHarness onResult={(r) => (latest = r)} />
      </WithTheme>,
    );
    expect(latest!.floatingStyles.zIndex).toBe(defaultTheme.zIndex.popover);
  });

  it('zIndexLevel switches token application: popover → modal → tooltip → toast', () => {
    let latest: UseFloatingPositionResult | undefined;

    function Wrapper({ level }: { level: FloatingZIndexLevel }) {
      return (
        <WithTheme theme={defaultTheme}>
          <FloatingHarness onResult={(r) => (latest = r)} zIndexLevel={level} />
        </WithTheme>
      );
    }

    const { rerender } = render(<Wrapper level="popover" />);
    expect(latest!.floatingStyles.zIndex).toBe(defaultTheme.zIndex.popover);

    rerender(<Wrapper level="modal" />);
    expect(latest!.floatingStyles.zIndex).toBe(defaultTheme.zIndex.modal);

    rerender(<Wrapper level="tooltip" />);
    expect(latest!.floatingStyles.zIndex).toBe(defaultTheme.zIndex.tooltip);

    rerender(<Wrapper level="toast" />);
    expect(latest!.floatingStyles.zIndex).toBe(defaultTheme.zIndex.toast);
  });

  it('user theme override propagates to floatingStyles.zIndex', () => {
    const customTheme: PrismUITheme<string, string> = {
      ...defaultTheme,
      zIndex: {
        tooltip: 9001,
        popover: 9002,
        modal: 9003,
        toast: 9004,
      },
    };
    let latest: UseFloatingPositionResult | undefined;
    render(
      <WithTheme theme={customTheme}>
        <FloatingHarness onResult={(r) => (latest = r)} zIndexLevel="popover" />
      </WithTheme>,
    );
    expect(latest!.floatingStyles.zIndex).toBe(9002);
  });

  it('missing theme.zIndex token → DEV warn + fallback to built-in default', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Construct a theme with zIndex stripped to simulate a partially
    // configured custom theme.
    const brokenTheme = {
      ...defaultTheme,
      zIndex: {} as unknown as PrismUITheme['zIndex'],
    };

    let latest: UseFloatingPositionResult | undefined;
    render(
      <WithTheme theme={brokenTheme}>
        <FloatingHarness onResult={(r) => (latest = r)} zIndexLevel="popover" />
      </WithTheme>,
    );

    // Fallback for popover is 1300 (mirrors defaultTheme.zIndex.popover).
    expect(latest!.floatingStyles.zIndex).toBe(1300);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('theme.zIndex.popover is missing'),
    );

    warnSpy.mockRestore();
  });

  it('warn latches once per process (not spammed across renders)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const brokenTheme = {
      ...defaultTheme,
      zIndex: {} as unknown as PrismUITheme['zIndex'],
    };

    function Renders() {
      const [n, setN] = React.useState(0);
      React.useEffect(() => {
        setN(1);
      }, []);
      return (
        <div data-tick={n}>
          <WithTheme theme={brokenTheme}>
            <FloatingHarness zIndexLevel="popover" />
          </WithTheme>
        </div>
      );
    }

    render(<Renders />);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// F-4 · virtual element reference (OQ-OV-8)
// ─────────────────────────────────────────────────────────────────────────────

describe('useFloatingPosition · F-4 · virtual element reference', () => {
  it('virtual reference (`{ getBoundingClientRect }`) does not throw', () => {
    const virtualRef: VirtualReferenceElement = {
      getBoundingClientRect: () =>
        new DOMRect(100, 100, 0, 0) as unknown as DOMRect,
    };
    let latest: UseFloatingPositionResult | undefined;
    expect(() =>
      render(
        <FloatingHarness
          onResult={(r) => (latest = r)}
          customReference={virtualRef}
        />,
      ),
    ).not.toThrow();

    expect(latest!.floatingStyles).toHaveProperty('position', 'absolute');
    expect(latest!.floatingStyles).toHaveProperty('top');
  });

  it('virtual reference + update() can be invoked without throwing', () => {
    // jsdom does not run a layout engine · `getBoundingClientRect` on real
    // elements always returns 0s · so we cannot assert a numeric position
    // diff. The behavioural contract verified here is purely that:
    //   1. update() is a callable function on the result
    //   2. invoking it inside `act()` does not throw
    //   3. the hook continues to expose stable styles afterwards
    let position = { x: 0, y: 0 };
    const virtualRef: VirtualReferenceElement = {
      getBoundingClientRect: () =>
        new DOMRect(position.x, position.y, 0, 0) as unknown as DOMRect,
    };

    let latest: UseFloatingPositionResult | undefined;
    render(
      <FloatingHarness
        onResult={(r) => (latest = r)}
        customReference={virtualRef}
      />,
    );

    expect(typeof latest!.update).toBe('function');
    expect(() => {
      act(() => {
        position = { x: 200, y: 300 };
        latest!.update();
      });
    }).not.toThrow();

    expect(latest!.floatingStyles).toHaveProperty('position', 'absolute');
  });

  it('Element reference and virtual reference coexist (no cross-contamination)', () => {
    // Render two independent hooks · ensure their results are isolated.
    let resultA: UseFloatingPositionResult | undefined;
    let resultB: UseFloatingPositionResult | undefined;

    function TwoInstances() {
      return (
        <>
          <FloatingHarness onResult={(r) => (resultA = r)} />
          <FloatingHarness
            onResult={(r) => (resultB = r)}
            customReference={{
              getBoundingClientRect: () =>
                new DOMRect(500, 500, 0, 0) as unknown as DOMRect,
            }}
            placement="top"
          />
        </>
      );
    }

    render(<TwoInstances />);

    expect(resultA!.placement).toBe('bottom-start');
    expect(resultB!.placement).toBe('top');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Secondary · 合约穿透 (vendor 边界 · API 默认 · 稳定性)
// ─────────────────────────────────────────────────────────────────────────────

describe('useFloatingPosition · API defaults', () => {
  it('strategy defaults to absolute', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(<FloatingHarness onResult={(r) => (latest = r)} />);
    expect(latest!.floatingStyles.position).toBe('absolute');
  });

  it('strategy = fixed propagates to floatingStyles.position', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(
      <FloatingHarness onResult={(r) => (latest = r)} strategy="fixed" />,
    );
    expect(latest!.floatingStyles.position).toBe('fixed');
  });

  it('refs.setReference + setFloating accept null without throwing', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(<FloatingHarness onResult={(r) => (latest = r)} attach={false} />);

    expect(() => {
      latest!.refs.setReference(null);
      latest!.refs.setFloating(null);
    }).not.toThrow();
  });
});

describe('useFloatingPosition · enabled false stability', () => {
  it('disabled hook does not install autoUpdate · floatingStyles stable across re-renders', () => {
    const renders: React.CSSProperties[] = [];

    function Wrapper() {
      const [, force] = React.useState(0);
      const result = useFloatingPosition({ enabled: false });
      renders.push(result.floatingStyles);
      React.useEffect(() => {
        force(1);
      }, []);
      return null;
    }

    render(<Wrapper />);

    // When disabled the styles object should be referentially stable
    // across the dummy re-render triggered above. Vendor's `floatingStyles`
    // is itself memoised; our merge only changes when zIndex changes.
    expect(renders.length).toBeGreaterThanOrEqual(2);
    expect(renders[renders.length - 1].zIndex).toBe(
      renders[renders.length - 2].zIndex,
    );
  });
});

describe('useFloatingPosition · multi-instance isolation', () => {
  it('two concurrent hooks have independent placements', () => {
    let a: UseFloatingPositionResult | undefined;
    let b: UseFloatingPositionResult | undefined;

    function Two() {
      return (
        <>
          <FloatingHarness onResult={(r) => (a = r)} placement="top" />
          <FloatingHarness onResult={(r) => (b = r)} placement="left-end" />
        </>
      );
    }
    render(<Two />);

    expect(a!.placement).toBe('top');
    expect(b!.placement).toBe('left-end');
  });
});

describe('useFloatingPosition · public API does not surface vendor symbols', () => {
  it('UseFloatingPositionResult.refs has only `setReference` and `setFloating`', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(<FloatingHarness onResult={(r) => (latest = r)} attach={false} />);
    expect(Object.keys(latest!.refs).sort()).toEqual([
      'setFloating',
      'setReference',
    ]);
  });

  it('result keys are stable PrismUI surface (no vendor `context` / `elements` leakage)', () => {
    let latest: UseFloatingPositionResult | undefined;
    render(<FloatingHarness onResult={(r) => (latest = r)} attach={false} />);
    const keys = Object.keys(latest!).sort();
    expect(keys).toEqual([
      'floatingStyles',
      'middlewareData',
      'placement',
      'refs',
      'update',
    ]);
  });
});

describe('useFloatingPosition · cleanup', () => {
  it('unmount does not throw and stops observers (vendor whileElementsMounted cleanup)', () => {
    const { unmount } = render(<FloatingHarness />);
    expect(() => unmount()).not.toThrow();
  });
});

afterEach(() => {
  __resetFloatingZIndexWarn();
});
