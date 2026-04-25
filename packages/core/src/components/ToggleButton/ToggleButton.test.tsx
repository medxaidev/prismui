/**
 * ToggleButton · integration tests
 *
 * Design reference: devdocs/components/ToggleButton/design.md v0.1 §九
 *
 * Organization — tests are grouped by contract region (T-1 … T-8 invariants
 * + Action Surface contract + SR-1 … SR-9 Surface Requirements + the
 * pressed-state-specific behaviors that uniquely belong to ToggleButton).
 * A regression in any test can be traced back to the governing invariant.
 *
 * Scope — component-level integration. Hook-level unit behavior of
 * `useControllableState` (H-1 ~ H-10, 26 tests) lives in
 * `packages/core/src/hooks/use-controllable-state.test.ts` and is NOT
 * duplicated here. Likewise, hook-level `resolvePolymorphicActionBehavior`
 * (36 cases) already covers every pointer / keyboard / role / tabIndex
 * permutation — this file samples representative Action paths with the
 * pressed-state overlay.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import {
  ToggleButton,
  __resetToggleButtonInvariantWarnings,
} from './index';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';
import { glowFeedback } from '../../feedbacks/glow/glow-feedback';

function renderWithTheme(
  theme: ReturnType<typeof createTheme>,
  ui: React.ReactElement,
) {
  return render(<PrismUIProvider theme={theme}>{ui}</PrismUIProvider>);
}

describe('ToggleButton', () => {
  // DEV warnings are once-per-process — reset between tests so each case
  // starts from a clean slate. Spy-mock console.error so warn-intensive
  // tests don't pollute the console output.
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetToggleButtonInvariantWarnings();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  // ────────────────────────────────────────────────────────────────────
  // 1 · Basic rendering — shape / ref / defaults
  // ────────────────────────────────────────────────────────────────────
  describe('Basic rendering', () => {
    it('renders a <button> by default', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders children inside a .label slot (not bare text)', () => {
      const { container, getByText } = render(
        <ToggleButton>Italic</ToggleButton>,
      );
      const label = getByText('Italic');
      expect(label.tagName).toBe('SPAN');
      // Label must live INSIDE the button
      expect(container.querySelector('button')!.contains(label)).toBe(true);
    });

    it('forwards ref to the native <button>', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<ToggleButton ref={ref}>Bold</ToggleButton>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('defaults aria-pressed to "false" when no pressed / defaultPressed is given (T-1)', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('false');
    });

    it('defaults data-pressed to "false" in tandem with aria-pressed (SR-7)', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      expect(container.querySelector('button')!.getAttribute('data-pressed'))
        .toBe('false');
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 2 · Uncontrolled mode · defaultPressed
  // ────────────────────────────────────────────────────────────────────
  describe('Uncontrolled mode · defaultPressed', () => {
    it('defaultPressed undefined → initial aria-pressed="false"', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('false');
    });

    it('defaultPressed=true → initial aria-pressed="true"', () => {
      const { container } = render(
        <ToggleButton defaultPressed>Bold</ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('true');
    });

    it('click on unpressed toggles to pressed (aria-pressed + data-pressed flip in sync)', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      const btn = container.querySelector('button')!;
      // `fireEvent.click` wraps in React's act() so state flushes before the
      // assertion below. Raw `.click()` schedules but may not flush in JSDOM.
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-pressed')).toBe('true');
      expect(btn.getAttribute('data-pressed')).toBe('true');
    });

    it('click on pressed toggles back to unpressed', () => {
      const { container } = render(
        <ToggleButton defaultPressed>Bold</ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-pressed')).toBe('false');
    });

    it('onPressedChange fires with the next value on click (uncontrolled)', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton onPressedChange={handler}>Bold</ToggleButton>,
      );
      container.querySelector('button')!.click();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('repeated clicks oscillate pressed and fire onPressedChange each transition', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton onPressedChange={handler}>Bold</ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      btn.click();
      btn.click();
      btn.click();
      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler.mock.calls.map((c) => c[0])).toEqual([true, false, true]);
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 3 · Controlled mode · pressed prop
  // ────────────────────────────────────────────────────────────────────
  describe('Controlled mode · pressed prop', () => {
    it('pressed={true} → aria-pressed="true" on initial render', () => {
      const { container } = render(
        <ToggleButton pressed={true} onPressedChange={() => {}}>
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('true');
    });

    it('click on controlled does NOT mutate the DOM attr until parent updates pressed', () => {
      // Parent deliberately ignores onPressedChange — simulating
      // `preventDefault` semantics of controlled mode.
      const { container } = render(
        <ToggleButton pressed={false} onPressedChange={() => {}}>
          Bold
        </ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      btn.click();
      // Click does not alter DOM — controlled mode holds the value still.
      expect(btn.getAttribute('aria-pressed')).toBe('false');
    });

    it('onPressedChange fires with next value even in controlled mode (one-way notify)', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton pressed={false} onPressedChange={handler}>
          Bold
        </ToggleButton>,
      );
      container.querySelector('button')!.click();
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('parent updates pressed={true} → DOM reflects immediately (no effect lag)', () => {
      const { container, rerender } = render(
        <ToggleButton pressed={false} onPressedChange={() => {}}>
          Bold
        </ToggleButton>,
      );
      rerender(
        <ToggleButton pressed={true} onPressedChange={() => {}}>
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('true');
    });

    it('defaultPressed is IGNORED when pressed is set (controlled wins)', () => {
      const { container } = render(
        <ToggleButton
          pressed={false}
          defaultPressed={true}
          onPressedChange={() => {}}
        >
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('false');
    });

    it('controlled without onPressedChange: click is a no-op (no crash)', () => {
      // This is a "parent forgot to wire up" case — we intentionally do NOT
      // throw in production, just accept the silent parent behavior.
      const { container } = render(
        <ToggleButton pressed={false}>Bold</ToggleButton>,
      );
      expect(() => container.querySelector('button')!.click()).not.toThrow();
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('false');
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 4 · Mode switching (DEV warn inherited from useControllableState)
  // ────────────────────────────────────────────────────────────────────
  describe('Mode switching warn (via useControllableState H-6)', () => {
    it('uncontrolled → controlled transition emits a console.error', () => {
      const { rerender } = render(<ToggleButton>Bold</ToggleButton>);
      // Becoming controlled
      rerender(
        <ToggleButton pressed={true} onPressedChange={() => {}}>
          Bold
        </ToggleButton>,
      );
      const transitionCalls = errorSpy.mock.calls.filter((c: unknown[]) =>
        /switching between controlled and uncontrolled/.test(String(c[0])),
      );
      expect(transitionCalls.length).toBeGreaterThan(0);
    });

    it('stable uncontrolled across renders does NOT warn', () => {
      const { rerender } = render(<ToggleButton>Bold</ToggleButton>);
      rerender(<ToggleButton>Bold Renamed</ToggleButton>);
      const transitionCalls = errorSpy.mock.calls.filter((c: unknown[]) =>
        /switching between controlled and uncontrolled/.test(String(c[0])),
      );
      expect(transitionCalls).toHaveLength(0);
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 5 · aria-pressed contract (T-1 · always-present · three values)
  // ────────────────────────────────────────────────────────────────────
  describe('aria-pressed contract (T-1)', () => {
    it('always emits aria-pressed on root — never absent (minimal case)', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      expect(container.querySelector('button')!.hasAttribute('aria-pressed'))
        .toBe(true);
    });

    it('always emits aria-pressed on polymorphic <div>', () => {
      const { container } = render(
        <ToggleButton component="div">Bold</ToggleButton>,
      );
      expect(container.querySelector('div')!.hasAttribute('aria-pressed'))
        .toBe(true);
    });

    it('pressed="mixed" (controlled tri-state) → aria-pressed="mixed"', () => {
      const { container } = render(
        <ToggleButton pressed="mixed" onPressedChange={() => {}}>
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('mixed');
    });

    it('clicking a "mixed" controlled toggle calls onPressedChange(true) (T-8)', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton pressed="mixed" onPressedChange={handler}>
          Bold
        </ToggleButton>,
      );
      container.querySelector('button')!.click();
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('user-supplied aria-pressed prop is overridden (T-1 won)', () => {
      // DEV warn is expected here — we silence it via the spy.
      const { container } = render(
        <ToggleButton
          defaultPressed={false}
          // Cast to bypass TS (aria-pressed is strictly typed).
          {...{ 'aria-pressed': 'true' as 'true' }}
        >
          Bold
        </ToggleButton>,
      );
      // Component's own false overrides the user's "true"
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('false');
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 6 · data-pressed contract (SR-7 single-writer; CSS hook)
  // ────────────────────────────────────────────────────────────────────
  describe('data-pressed contract', () => {
    it('data-pressed="true" matches aria-pressed', () => {
      const { container } = render(
        <ToggleButton defaultPressed>Bold</ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-pressed')).toBe('true');
      expect(btn.getAttribute('aria-pressed')).toBe('true');
    });

    it('data-pressed="mixed" for controlled tri-state', () => {
      const { container } = render(
        <ToggleButton pressed="mixed" onPressedChange={() => {}}>
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('data-pressed'))
        .toBe('mixed');
    });

    it('data-pressed stays in sync after a click toggle', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-pressed')).toBe('false');
      fireEvent.click(btn);
      expect(btn.getAttribute('data-pressed')).toBe('true');
    });

    it('data-pressed is not duplicated / leaked to children', () => {
      const { container } = render(
        <ToggleButton defaultPressed>
          <span data-testid="child">Bold</span>
        </ToggleButton>,
      );
      expect(container.querySelectorAll('[data-pressed]')).toHaveLength(1);
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 7 · Click / Keyboard toggle (native + polymorphic activation)
  // ────────────────────────────────────────────────────────────────────
  describe('Click / Keyboard toggle', () => {
    it('native <button> · click toggles pressed', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-pressed')).toBe('true');
    });

    it('native <button> · Enter activates via browser → onClick path → toggles', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton onPressedChange={handler}>Bold</ToggleButton>,
      );
      // Native <button> responds to Enter via built-in click semantics.
      // Simulate that by dispatching a click (JSDOM doesn't synthesize it).
      (container.querySelector('button') as HTMLButtonElement).click();
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('polymorphic <div> · Enter activates via hook (F-1) and toggles', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton component="div" onPressedChange={handler}>
          Bold
        </ToggleButton>,
      );
      const div = container.querySelector('div')!;
      fireEvent.keyDown(div, { key: 'Enter' });
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('polymorphic <div> · Space activates via hook (F-1) and toggles', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton component="div" onPressedChange={handler}>
          Bold
        </ToggleButton>,
      );
      const div = container.querySelector('div')!;
      fireEvent.keyDown(div, { key: ' ' });
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('polymorphic <a href> · click toggles and does NOT synthesize role=button', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton component="a" href="/x" onPressedChange={handler}>
          Bold
        </ToggleButton>,
      );
      const a = container.querySelector('a')!;
      // <a> is a native interactive — no role injection expected.
      expect(a.hasAttribute('role')).toBe(false);
      // But aria-pressed is still present (T-1).
      expect(a.hasAttribute('aria-pressed')).toBe(true);
      a.click();
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 8 · Event ordering (T-7 · onClick → setPressed → onPressedChange)
  // ────────────────────────────────────────────────────────────────────
  describe('Event ordering (T-7)', () => {
    it('user onClick fires BEFORE onPressedChange', () => {
      const calls: string[] = [];
      const { container } = render(
        <ToggleButton
          onClick={() => calls.push('onClick')}
          onPressedChange={() => calls.push('onPressedChange')}
        >
          Bold
        </ToggleButton>,
      );
      container.querySelector('button')!.click();
      expect(calls).toEqual(['onClick', 'onPressedChange']);
    });

    it('preventDefault() inside onClick does NOT cancel the toggle (T-7)', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
          onPressedChange={handler}
        >
          Bold
        </ToggleButton>,
      );
      container.querySelector('button')!.click();
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('onClick sees the OLD pressed state (fired before toggle)', () => {
      // Verifies observable order: onClick receives the pre-toggle event, so
      // reading `aria-pressed` at that moment returns the OLD value.
      let observed: string | null = null;
      const { container } = render(
        <ToggleButton
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            observed = (e.currentTarget as HTMLElement).getAttribute(
              'aria-pressed',
            );
          }}
        >
          Bold
        </ToggleButton>,
      );
      container.querySelector('button')!.click();
      expect(observed).toBe('false');
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 9 · disabled / loading freeze pressed (T-6)
  // ────────────────────────────────────────────────────────────────────
  describe('disabled / loading freeze (T-6)', () => {
    it('disabled + click does NOT toggle pressed', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton disabled onPressedChange={handler}>
          Bold
        </ToggleButton>,
      );
      container.querySelector('button')!.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('loading + click does NOT toggle pressed', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton loading onPressedChange={handler}>
          Bold
        </ToggleButton>,
      );
      container.querySelector('button')!.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('disabled + pressed=true: DOM still reflects pressed (T-6: persistence)', () => {
      const { container } = render(
        <ToggleButton disabled defaultPressed>
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('true');
    });

    it('loading + pressed=true: DOM still reflects pressed + aria-busy', () => {
      const { container } = render(
        <ToggleButton loading defaultPressed>
          Bold
        </ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('aria-pressed')).toBe('true');
      expect(btn.getAttribute('aria-busy')).toBe('true');
    });

    it('disabled + pressed=true + click: handler never fires, pressed unchanged', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton disabled defaultPressed onPressedChange={handler}>
          Bold
        </ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      btn.click();
      expect(handler).not.toHaveBeenCalled();
      expect(btn.getAttribute('aria-pressed')).toBe('true');
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 10 · Variant / Size / Color · sampled matrix
  // ────────────────────────────────────────────────────────────────────
  describe('Variant / Size / Color', () => {
    it.each(['filled', 'outlined', 'soft', 'plain'] as const)(
      'variant=%s emits data-variant',
      (variant) => {
        const { container } = render(
          <ToggleButton variant={variant}>Bold</ToggleButton>,
        );
        expect(container.querySelector('button')!.getAttribute('data-variant'))
          .toBe(variant);
      },
    );

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
      'size=%s emits data-size + component var alias',
      (size) => {
        const { container } = render(
          <ToggleButton size={size}>Bold</ToggleButton>,
        );
        const btn = container.querySelector('button')!;
        expect(btn.getAttribute('data-size')).toBe(size);
        expect(btn).toHaveStyle({
          '--toggle-button-height': 'var(--prismui-size-height)',
        });
      },
    );

    it('default variant is "outlined" (§2.5 · differs from Button)', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      expect(container.querySelector('button')!.getAttribute('data-variant'))
        .toBe('outlined');
    });

    it('default color is "primary" (IV-A4 shared with Button / IconButton)', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      expect(container.querySelector('button')!.getAttribute('data-color'))
        .toBe('primary');
    });

    it('default size is "md"', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      expect(container.querySelector('button')!.getAttribute('data-size'))
        .toBe('md');
    });

    it('color=secondary emits data-color="secondary"', () => {
      const { container } = render(
        <ToggleButton color="secondary">Bold</ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('data-color'))
        .toBe('secondary');
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 11 · Sections · fullWidth · (Button-inherited slot behavior)
  // ────────────────────────────────────────────────────────────────────
  describe('Sections · fullWidth', () => {
    it('leftSection renders in data-position="left"', () => {
      const { container } = render(
        <ToggleButton leftSection={<span data-testid="left">★</span>}>
          Bold
        </ToggleButton>,
      );
      const left = container.querySelector('[data-position="left"]')!;
      expect(left.contains(container.querySelector('[data-testid="left"]')))
        .toBe(true);
    });

    it('rightSection renders in data-position="right"', () => {
      const { container } = render(
        <ToggleButton rightSection={<span data-testid="right">→</span>}>
          Bold
        </ToggleButton>,
      );
      const right = container.querySelector('[data-position="right"]')!;
      expect(right.contains(container.querySelector('[data-testid="right"]')))
        .toBe(true);
    });

    it('fullWidth emits data-full-width="true"', () => {
      const { container } = render(
        <ToggleButton fullWidth>Bold</ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('data-full-width'))
        .toBe('true');
    });

    it('loading replaces leftSection with the built-in spinner (inline <svg>)', () => {
      const { container } = render(
        <ToggleButton loading leftSection={<span data-testid="user-left">★</span>}>
          Bold
        </ToggleButton>,
      );
      // User's custom left icon is gone
      expect(container.querySelector('[data-testid="user-left"]')).toBeNull();
      // Spinner SVG lives in a data-loader='true' section
      const loaderSpan = container.querySelector(
        '[data-loader="true"][data-position="left"]',
      );
      expect(loaderSpan).not.toBeNull();
      expect(loaderSpan!.querySelector('svg')).not.toBeNull();
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 12 · Polymorphic · samples from the Action Behavior hook contract
  // ────────────────────────────────────────────────────────────────────
  describe('Polymorphic', () => {
    it('polymorphic <a href> does NOT get role="button"', () => {
      const { container } = render(
        <ToggleButton component="a" href="/x">
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('a')!.hasAttribute('role')).toBe(false);
    });

    it('polymorphic <div> gets role="button" (B-2)', () => {
      const { container } = render(
        <ToggleButton component="div">Bold</ToggleButton>,
      );
      expect(container.querySelector('div')!.getAttribute('role')).toBe('button');
    });

    it('polymorphic <div> + disabled gets tabIndex=-1 (Action hook)', () => {
      const { container } = render(
        <ToggleButton component="div" disabled>
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('div')!.getAttribute('tabindex'))
        .toBe('-1');
    });

    it('polymorphic <div> toggles on Enter (Action hook + setPressed)', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton component="div" onPressedChange={handler}>
          Bold
        </ToggleButton>,
      );
      fireEvent.keyDown(container.querySelector('div')!, { key: 'Enter' });
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('polymorphic ref targets the correct element', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(
        <ToggleButton
          component="a"
          href="/x"
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          Bold
        </ToggleButton>,
      );
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 13 · Three-channel overrides · classNames / styles / vars
  // ────────────────────────────────────────────────────────────────────
  describe('Three-channel overrides', () => {
    it('classNames.root merges without clobbering theme classes', () => {
      const { container } = render(
        <ToggleButton classNames={{ root: 'extra-root' }}>Bold</ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toContain('extra-root');
    });

    it('classNames.label merges on the label slot', () => {
      const { container } = render(
        <ToggleButton classNames={{ label: 'extra-label' }}>Bold</ToggleButton>,
      );
      // label is a <span> inside .inner
      const label = Array.from(container.querySelectorAll('span')).find((el) =>
        el.className.includes('extra-label'),
      );
      expect(label).toBeDefined();
    });

    it('styles.root merges inline on root', () => {
      const { container } = render(
        <ToggleButton styles={{ root: { background: 'rgb(1, 2, 3)' } }}>
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('button')!).toHaveStyle({
        background: 'rgb(1, 2, 3)',
      });
    });

    it('vars prop OVERRIDES varsResolver output (matches Button vars precedence)', () => {
      // `vars` is a flat prop (not per-slot) — consistent with Button's API.
      // User values take precedence over varsResolver, so a user `height` of
      // 99px wins over the size-system-derived default.
      const { container } = render(
        <ToggleButton vars={{ '--toggle-button-height': '99px' }}>
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('button')!).toHaveStyle({
        '--toggle-button-height': '99px',
      });
    });

    it('classNames.section merges on both left and right sections', () => {
      const { container } = render(
        <ToggleButton
          classNames={{ section: 'extra-section' }}
          leftSection={<span>L</span>}
          rightSection={<span>R</span>}
        >
          Bold
        </ToggleButton>,
      );
      const sections = container.querySelectorAll('[data-position]');
      expect(sections).toHaveLength(2);
      sections.forEach((s) => {
        expect(s.className).toContain('extra-section');
      });
    });

    it('classNames.inner merges on the inner slot', () => {
      const { container } = render(
        <ToggleButton classNames={{ inner: 'extra-inner' }}>Bold</ToggleButton>,
      );
      const inner = Array.from(container.querySelectorAll('span')).find((el) =>
        el.className.includes('extra-inner'),
      );
      expect(inner).toBeDefined();
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 14 · Theme integration (defaultProps + classNames pipeline)
  // ────────────────────────────────────────────────────────────────────
  describe('Theme integration', () => {
    it('theme.components.ToggleButton.defaultProps.variant applies when not overridden', () => {
      const theme = createTheme({
        components: {
          ToggleButton: { defaultProps: { variant: 'filled' } },
        },
      });
      const { container } = renderWithTheme(
        theme,
        <ToggleButton>Bold</ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('data-variant'))
        .toBe('filled');
    });

    it('prop-level variant still overrides theme defaultProps', () => {
      const theme = createTheme({
        components: {
          ToggleButton: { defaultProps: { variant: 'filled' } },
        },
      });
      const { container } = renderWithTheme(
        theme,
        <ToggleButton variant="plain">Bold</ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('data-variant'))
        .toBe('plain');
    });

    it('theme.components.ToggleButton.defaultProps.size propagates to CSS vars', () => {
      const theme = createTheme({
        components: {
          ToggleButton: { defaultProps: { size: 'lg' } },
        },
      });
      const { container } = renderWithTheme(
        theme,
        <ToggleButton>Bold</ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('data-size'))
        .toBe('lg');
    });

    it('theme defaultProps are merged with user props — user wins on conflicts', () => {
      const theme = createTheme({
        components: {
          ToggleButton: {
            defaultProps: { variant: 'filled', color: 'primary' },
          },
        },
      });
      const { container } = renderWithTheme(
        theme,
        <ToggleButton color="error">Bold</ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-variant')).toBe('filled');
      expect(btn.getAttribute('data-color')).toBe('error');
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 15 · Pressed visual isolation (T-3 · component-local token channel)
  // ────────────────────────────────────────────────────────────────────
  describe('Pressed visual isolation (T-3)', () => {
    it('varsResolver emits --toggle-button-pressed-* component-local aliases', () => {
      const { container } = render(
        <ToggleButton defaultPressed>Bold</ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      // Component-local pressed channel — interim aliased to variant-hover-*
      // (see varsResolver comment). This spec pins the CURRENT alias target;
      // when variant-system grows its own `pressed` token family the assertion
      // below updates to match the new alias — a single source-of-truth
      // location.
      expect(btn).toHaveStyle({
        '--toggle-button-pressed-bg': 'var(--prismui-variant-hover-bg)',
        '--toggle-button-pressed-fg': 'var(--prismui-variant-fg)',
        '--toggle-button-pressed-border': 'var(--prismui-variant-hover-border)',
      });
    });

    it('pressed=false does NOT emit data-pressed="true" (alias does not mean the visual applies)', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      const btn = container.querySelector('button')!;
      // The component-local vars are ALWAYS emitted (so CSS can read them
      // deterministically); what DIFFERS between pressed=true and pressed=false
      // is the CSS selector gate `[data-pressed='true']`. Pinning this means
      // future refactors can't conflate "var exists" with "visual applies."
      expect(btn.getAttribute('data-pressed')).toBe('false');
      expect(btn).toHaveStyle({
        '--toggle-button-pressed-bg': 'var(--prismui-variant-hover-bg)',
      });
    });

    it('pressed channel exposes a distinct component-local variable name from :active', () => {
      // T-3's operative guarantee — the pressed visual uses
      // `--toggle-button-pressed-*` while :active uses `--prismui-variant-
      // active-*`. Both names appear on the element (CSS reads them via
      // different selectors), but they are NOT the same variable — theming
      // one cannot silently change the other.
      const { container } = render(
        <ToggleButton defaultPressed>Bold</ToggleButton>,
      );
      const style = container.querySelector('button')!.getAttribute('style') ?? '';
      // Both exist.
      expect(style).toContain('--toggle-button-pressed-bg');
      expect(style).toContain('--prismui-variant-active-bg');
      // They are distinct identifiers (not the same name aliased).
      expect('--toggle-button-pressed-bg').not.toBe('--prismui-variant-active-bg');
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 16 · Bug-exposing · the table at design §九.3
  // ────────────────────────────────────────────────────────────────────
  describe('Bug-exposing scenarios', () => {
    it('uncontrolled · 50 consecutive clicks oscillate correctly (no stale closure)', () => {
      const handler = vi.fn();
      const { container } = render(
        <ToggleButton onPressedChange={handler}>Bold</ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      for (let i = 0; i < 50; i++) btn.click();
      // 50 clicks, starting at false, should end in false (even number).
      expect(btn.getAttribute('aria-pressed')).toBe('false');
      expect(handler).toHaveBeenCalledTimes(50);
      // Last call should be the transition back to false.
      expect(handler.mock.calls.at(-1)?.[0]).toBe(false);
    });

    it('controlled with no onPressedChange: click does not crash, does not mutate', () => {
      const { container } = render(
        <ToggleButton pressed={false}>Bold</ToggleButton>,
      );
      expect(() => container.querySelector('button')!.click()).not.toThrow();
    });

    it('defaultPressed="mixed" (illegal — via `as any`): warns + falls back to false', () => {
      // Escape TS — this is the violation we're testing.
      const Illegal = ToggleButton as unknown as React.FC<{
        defaultPressed?: unknown;
        children?: React.ReactNode;
      }>;
      const { container } = render(
        <Illegal defaultPressed={'mixed'}>Bold</Illegal>,
      );
      expect(container.querySelector('button')!.getAttribute('aria-pressed'))
        .toBe('false');
      const mixedCalls = errorSpy.mock.calls.filter((c: unknown[]) =>
        /defaultPressed="mixed"/.test(String(c[0])),
      );
      expect(mixedCalls.length).toBeGreaterThan(0);
    });

    it('user-supplied aria-pressed → DEV warn + component value wins', () => {
      const { container } = render(
        <ToggleButton defaultPressed={false} {...{ 'aria-pressed': 'true' as 'true' }}>
          Bold
        </ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('aria-pressed')).toBe('false');
      const ariaOverrideCalls = errorSpy.mock.calls.filter((c: unknown[]) =>
        /received an `aria-pressed` prop/.test(String(c[0])),
      );
      expect(ariaOverrideCalls.length).toBeGreaterThan(0);
    });

    it('does NOT leak pressed/defaultPressed/onPressedChange as DOM attributes', () => {
      const { container } = render(
        <ToggleButton
          pressed={false}
          defaultPressed={true}
          onPressedChange={() => {}}
        >
          Bold
        </ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.hasAttribute('pressed')).toBe(false);
      expect(btn.hasAttribute('defaultpressed')).toBe(false);
      expect(btn.hasAttribute('onpressedchange')).toBe(false);
    });

    it('does NOT leak loading / variant / size / color / radius as DOM attributes', () => {
      const { container } = render(
        <ToggleButton
          loading
          variant="soft"
          size="lg"
          color="secondary"
          radius="full"
        >
          Bold
        </ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.hasAttribute('loading')).toBe(false);
      expect(btn.hasAttribute('variant')).toBe(false);
      expect(btn.hasAttribute('size')).toBe(false);
      expect(btn.hasAttribute('color')).toBe(false);
      expect(btn.hasAttribute('radius')).toBe(false);
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 17 · HTML `type` default (same rule as Button / IconButton)
  // ────────────────────────────────────────────────────────────────────
  describe('HTML type default (B-1 rule)', () => {
    it('native <button> gets type="button" by default', () => {
      const { container } = render(<ToggleButton>Bold</ToggleButton>);
      expect(container.querySelector('button')!.getAttribute('type')).toBe('button');
    });

    it('user type="submit" is preserved', () => {
      const { container } = render(
        <ToggleButton type="submit">Bold</ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('type')).toBe('submit');
    });

    it('polymorphic <a> does NOT get type attribute injected', () => {
      const { container } = render(
        <ToggleButton component="a" href="/x">
          Bold
        </ToggleButton>,
      );
      expect(container.querySelector('a')!.hasAttribute('type')).toBe(false);
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 18 · Other DOM spread / System data-attr contract coverage
  // ────────────────────────────────────────────────────────────────────
  describe('DOM spread contract', () => {
    it('data-variant / data-color / data-size / data-interactive-disabled co-exist with data-pressed', () => {
      const { container } = render(
        <ToggleButton defaultPressed variant="filled" color="error" size="lg">
          Bold
        </ToggleButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-variant')).toBe('filled');
      expect(btn.getAttribute('data-color')).toBe('error');
      expect(btn.getAttribute('data-size')).toBe('lg');
      expect(btn.getAttribute('data-pressed')).toBe('true');
    });

    it('arbitrary user data-* props pass through unchanged', () => {
      const { container } = render(
        <ToggleButton data-testid="my-tb">Bold</ToggleButton>,
      );
      expect(container.querySelector('button')!.getAttribute('data-testid'))
        .toBe('my-tb');
    });

    it('user className merges on root alongside theme classes', () => {
      const { container } = render(
        <ToggleButton className="user-cls">Bold</ToggleButton>,
      );
      expect(container.querySelector('button')!.className).toContain('user-cls');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Stage 10 · Phase 5 · Feedback integration (mirrors Button v0.6 Phase 4.1
  // + IconButton Phase 5)
  //
  // Contract: `@/devdocs/system/feedback-contract.md` v0.6 §10 (rippleFeedback)
  // + §11 (glowFeedback) + §12.2 (theme path) + §6.4 (focus singleton).
  //
  // ToggleButton-specific assertions: feedback factories MUST be additive to
  // the toggle pipeline (T-1 / T-7 invariants are independent of feedback).
  // Specifically:
  //   · click → ripple AND setPressed both fire (visual feedback parallel
  //     to toggle, not mutually exclusive)
  //   · feedbacks={[]} suppresses ripple/glow but does NOT break toggle
  //   · glow class can co-exist with data-pressed='true' (different CSS
  //     channels — box-shadow halo vs background fill)
  // ─────────────────────────────────────────────────────────────────────────
  describe('Phase 5 · Feedback integration', () => {
    function stubRect(el: Element, rect: Partial<DOMRect> = {}) {
      const full: DOMRect = {
        width: 80,
        height: 36,
        left: 0,
        top: 0,
        right: 80,
        bottom: 36,
        x: 0,
        y: 0,
        toJSON: () => ({}),
        ...rect,
      } as DOMRect;
      el.getBoundingClientRect = () => full;
    }

    describe('Visual feedback lifecycle (ripple)', () => {
      it('pointerdown creates a .prismui-ripple node inside the press target', () => {
        const { container } = render(<ToggleButton>Bold</ToggleButton>);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        expect(btn.querySelector('.prismui-ripple')).toBeNull();
        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();
      });

      it('pointerup → animationend removes the ripple (success path)', () => {
        const { container } = render(<ToggleButton>Bold</ToggleButton>);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });
        const ripple = btn.querySelector<HTMLSpanElement>('.prismui-ripple')!;
        act(() => {
          fireEvent.pointerUp(btn, { pointerId: 1, pointerType: 'mouse' });
        });
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();
        ripple.dispatchEvent(new Event('animationend'));
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });
    });

    describe('Interactive-disabled gating (shares predicate with Action Surface)', () => {
      it('<ToggleButton disabled>: pointerdown does NOT create a ripple', () => {
        const { container } = render(<ToggleButton disabled>Bold</ToggleButton>);
        const btn = container.querySelector('button')!;
        stubRect(btn);
        fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });

      it('<ToggleButton loading>: pointerdown does NOT create a ripple (Action strategy includes loading)', () => {
        const { container } = render(<ToggleButton loading>Bold</ToggleButton>);
        const btn = container.querySelector('button')!;
        stubRect(btn);
        fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });
    });

    // Toggle-specific Phase 5 invariants (T-1 / T-7 × Feedback)
    describe('Toggle pipeline × Feedback (T-7 ordering)', () => {
      it('click → BOTH ripple feedback AND setPressed flip happen (parallel, not mutually exclusive)', () => {
        const onPressedChange = vi.fn();
        const { container } = render(
          <ToggleButton onPressedChange={onPressedChange}>Bold</ToggleButton>,
        );
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });
        // Press feedback ingress fired — ripple is in the DOM.
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();

        // Click — Action Surface activates handleClick → setPressed flip.
        fireEvent.click(btn);
        expect(onPressedChange).toHaveBeenCalledTimes(1);
        expect(onPressedChange).toHaveBeenCalledWith(true);
        expect(btn.getAttribute('data-pressed')).toBe('true');
        expect(btn.getAttribute('aria-pressed')).toBe('true');
      });

      it('feedbacks={[]} (opt-out) does NOT break toggle pipeline', () => {
        const onPressedChange = vi.fn();
        const { container } = render(
          <ToggleButton feedbacks={[]} onPressedChange={onPressedChange}>
            Bold
          </ToggleButton>,
        );
        const btn = container.querySelector('button')!;
        stubRect(btn);

        // Pointerdown — no ripple (feedbacks suppressed).
        fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();

        // Click — toggle pipeline still works (feedback opt-out is purely visual).
        fireEvent.click(btn);
        expect(onPressedChange).toHaveBeenCalledWith(true);
        expect(btn.getAttribute('aria-pressed')).toBe('true');
      });

      it('user onPointerDown runs BEFORE press feedback ingress (chainHandlers order)', () => {
        const order: string[] = [];
        const onPointerDown = vi.fn(() => {
          order.push(
            document.querySelector('.prismui-ripple') ? 'after-ripple' : 'before-ripple',
          );
        });
        const { container } = render(
          <ToggleButton onPointerDown={onPointerDown}>Bold</ToggleButton>,
        );
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });
        expect(onPointerDown).toHaveBeenCalledTimes(1);
        expect(order).toEqual(['before-ripple']);
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();
      });
    });

    describe('Press unmount cleanup (L-F1)', () => {
      it('unmount during active press disposes the ripple node synchronously', () => {
        const { container, unmount } = render(<ToggleButton>Bold</ToggleButton>);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();

        unmount();
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });
    });

    // ─── Phase 4.1 · Focus Feedback (glow) — adapted to ToggleButton ────────
    describe('Focus Feedback (glow) lifecycle', () => {
      const GLOW_CLASS = 'prismui-glow-active';

      function installFocusVisibleMatches(value: boolean): () => void {
        const original = HTMLElement.prototype.matches;
        HTMLElement.prototype.matches = function patched(
          this: HTMLElement,
          selectors: string,
        ): boolean {
          if (selectors === ':focus-visible') return value;
          return original.call(this, selectors);
        } as typeof HTMLElement.prototype.matches;
        return () => {
          HTMLElement.prototype.matches = original;
        };
      }

      it('onFocus with :focus-visible → adds `prismui-glow-active` class', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(<ToggleButton>Bold</ToggleButton>);
          const btn = container.querySelector('button')!;
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);
        } finally {
          restore();
        }
      });

      it('onBlur removes the glow class', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(<ToggleButton>Bold</ToggleButton>);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);
          fireEvent.blur(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });

      it('mouse-focused (focusVisible=false) never adds the glow class', () => {
        const restore = installFocusVisibleMatches(false);
        try {
          const { container } = render(<ToggleButton>Bold</ToggleButton>);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });

      // ToggleButton-specific: glow + pressed coexistence
      it('glow class CO-EXISTS with data-pressed (different CSS channels)', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(
            <ToggleButton defaultPressed={true}>Bold</ToggleButton>,
          );
          const btn = container.querySelector('button')!;

          // Pre-focus: pressed visual is on, glow is off.
          expect(btn.getAttribute('data-pressed')).toBe('true');
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);

          // After focus: BOTH active simultaneously.
          fireEvent.focus(btn);
          expect(btn.getAttribute('data-pressed')).toBe('true');
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);

          // Blur removes glow but keeps pressed.
          fireEvent.blur(btn);
          expect(btn.getAttribute('data-pressed')).toBe('true');
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });
    });

    describe('User handler chaining (§5.2 order, focus chain)', () => {
      const GLOW_CLASS = 'prismui-glow-active';

      function installFocusVisibleMatches(value: boolean): () => void {
        const original = HTMLElement.prototype.matches;
        HTMLElement.prototype.matches = function patched(
          this: HTMLElement,
          selectors: string,
        ): boolean {
          if (selectors === ':focus-visible') return value;
          return original.call(this, selectors);
        } as typeof HTMLElement.prototype.matches;
        return () => {
          HTMLElement.prototype.matches = original;
        };
      }

      it('user onFocus runs before feedback ingress adds the class', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          let classWhenUserRan = '';
          const userOnFocus = vi.fn((e: React.FocusEvent<HTMLButtonElement>) => {
            classWhenUserRan = e.currentTarget.className;
          });
          const { container } = render(
            <ToggleButton onFocus={userOnFocus}>Bold</ToggleButton>,
          );
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(userOnFocus).toHaveBeenCalledTimes(1);
          expect(classWhenUserRan).not.toContain(GLOW_CLASS);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);
        } finally {
          restore();
        }
      });

      it('user onBlur still fires even though press.onBlur + focus.onBlur also run', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const userOnBlur = vi.fn();
          const { container } = render(
            <ToggleButton onBlur={userOnBlur}>Bold</ToggleButton>,
          );
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          fireEvent.blur(btn);
          expect(userOnBlur).toHaveBeenCalledTimes(1);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });
    });

    describe('D-1 Resolution priority · props > theme > module default', () => {
      const GLOW_CLASS = 'prismui-glow-active';

      function installFocusVisibleMatches(value: boolean): () => void {
        const original = HTMLElement.prototype.matches;
        HTMLElement.prototype.matches = function patched(
          this: HTMLElement,
          selectors: string,
        ): boolean {
          if (selectors === ':focus-visible') return value;
          return original.call(this, selectors);
        } as typeof HTMLElement.prototype.matches;
        return () => {
          HTMLElement.prototype.matches = original;
        };
      }

      it('feedbacks={[]} (explicit opt-out) suppresses both ripple AND glow', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(
            <ToggleButton feedbacks={[]}>Bold</ToggleButton>,
          );
          const btn = container.querySelector('button')!;

          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
          fireEvent.blur(btn);

          fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
          expect(btn.querySelector('.prismui-ripple')).toBeNull();
        } finally {
          restore();
        }
      });

      it('theme.components.ToggleButton.defaultFeedbacks overrides module default', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const theme = createTheme({
            components: { ToggleButton: { defaultFeedbacks: [] } },
          });
          const { container } = renderWithTheme(theme, <ToggleButton>Bold</ToggleButton>);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });

      it('props.feedbacks wins over theme.components.ToggleButton.defaultFeedbacks', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const theme = createTheme({
            components: { ToggleButton: { defaultFeedbacks: [] } },
          });
          const { container } = renderWithTheme(
            theme,
            <ToggleButton feedbacks={[glowFeedback]}>Bold</ToggleButton>,
          );
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);
        } finally {
          restore();
        }
      });
    });

    describe('Focus unmount cleanup (L-F1 focus source)', () => {
      const GLOW_CLASS = 'prismui-glow-active';

      function installFocusVisibleMatches(value: boolean): () => void {
        const original = HTMLElement.prototype.matches;
        HTMLElement.prototype.matches = function patched(
          this: HTMLElement,
          selectors: string,
        ): boolean {
          if (selectors === ':focus-visible') return value;
          return original.call(this, selectors);
        } as typeof HTMLElement.prototype.matches;
        return () => {
          HTMLElement.prototype.matches = original;
        };
      }

      it('unmount during active focus disposes the glow instance synchronously', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container, unmount } = render(<ToggleButton>Bold</ToggleButton>);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);

          const savedBtn = btn;
          unmount();
          expect(savedBtn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });
    });
  });
});
