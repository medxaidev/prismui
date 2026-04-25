/**
 * IconButton · integration tests
 *
 * Coverage — the design-doc §八 test plan targets ~69 cases; this file
 * implements that plan. Organized by contract region so a regression can
 * be traced directly back to the governing invariant (D-1…D-8 / SR-1…9).
 *
 * Hook-level polymorphic behavior (36 cases in core/action) and Button's
 * own 23 F-1 integration cases are NOT duplicated — IconButton relies on
 * the same `resolvePolymorphicActionBehavior` hook, so component-level
 * tests here sample the critical paths rather than re-covering them.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { IconButton, __resetIconButtonInvariantWarnings } from './index';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';
import { glowFeedback } from '../../feedbacks/glow/glow-feedback';

// Shared icon fixture — decorative SVG used across rendering tests.
const Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="icon" viewBox="0 0 24 24" {...props}>
    <path d="M0 0h24v24H0z" />
  </svg>
);

function renderWithTheme(
  theme: ReturnType<typeof createTheme>,
  ui: React.ReactElement,
) {
  return render(<PrismUIProvider theme={theme}>{ui}</PrismUIProvider>);
}

describe('IconButton', () => {
  // DEV warnings are once-per-process — reset between tests so each case
  // starts from a clean slate. We also silence `console.error` on tests
  // that intentionally trigger warnings (D-3, D-7) to keep output clean.
  beforeEach(() => {
    __resetIconButtonInvariantWarnings();
  });

  // ───────────────────────────────────────────────────────────────────────
  // Basic rendering — shape / ref forwarding / default element
  // ───────────────────────────────────────────────────────────────────────
  describe('Basic Rendering', () => {
    it('renders a <button> by default', () => {
      const { container } = render(
        <IconButton aria-label="save">
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders the icon child inside root', () => {
      const { getByTestId, container } = render(
        <IconButton aria-label="save">
          <Icon />
        </IconButton>,
      );
      const btn = container.querySelector('button');
      expect(getByTestId('icon').parentElement).toBe(btn);
    });

    it('does NOT wrap children in .inner / .label (slot tree is root-only)', () => {
      const { container } = render(
        <IconButton aria-label="save">
          <Icon />
        </IconButton>,
      );
      // No inner/label/section slots exist on IconButton.
      expect(container.querySelector('[data-position]')).toBeNull();
    });

    it('forwards ref to the native <button>', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <IconButton aria-label="save" ref={ref}>
          <Icon />
        </IconButton>,
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('forwards ref to polymorphic <a>', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(
        <IconButton
          aria-label="open"
          component="a"
          href="/x"
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          <Icon />
        </IconButton>,
      );
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });

    it('forwards ref to polymorphic <div>', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <IconButton
          aria-label="save"
          component="div"
          ref={ref as React.Ref<HTMLDivElement>}
        >
          <Icon />
        </IconButton>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('passes aria-label through to the DOM', () => {
      const { container } = render(
        <IconButton aria-label="save">
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('save');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // Variants · Sizes · Colors — sampled matrix (full matrix already covered
  // by Button; IconButton just needs to confirm it enters the same systems).
  // ───────────────────────────────────────────────────────────────────────
  describe('Variant / Size / Color', () => {
    it.each(['filled', 'outlined', 'soft', 'plain'] as const)(
      'variant=%s emits data-variant',
      (variant) => {
        const { container } = render(
          <IconButton aria-label="x" variant={variant}>
            <Icon />
          </IconButton>,
        );
        expect(container.querySelector('button')!.getAttribute('data-variant')).toBe(variant);
      },
    );

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
      'size=%s emits data-size and maps --icon-button-size',
      (size) => {
        const { container } = render(
          <IconButton aria-label="x" size={size}>
            <Icon />
          </IconButton>,
        );
        const btn = container.querySelector('button')!;
        expect(btn.getAttribute('data-size')).toBe(size);
        expect(btn).toHaveStyle({
          '--icon-button-size': 'var(--prismui-size-height)',
        });
      },
    );

    it('default color=primary emits data-color="primary"', () => {
      const { container } = render(
        <IconButton aria-label="x">
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!.getAttribute('data-color')).toBe('primary');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // Disabled / Loading — data-attrs, aria-busy, pointer handling
  // ───────────────────────────────────────────────────────────────────────
  describe('Disabled / Loading', () => {
    it('disabled emits data-disabled + native disabled on <button>', () => {
      const { container } = render(
        <IconButton aria-label="x" disabled>
          <Icon />
        </IconButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-disabled')).toBe('true');
      expect(btn.hasAttribute('disabled')).toBe(true);
    });

    it('loading emits data-loading + aria-busy="true" on <button>', () => {
      const { container } = render(
        <IconButton aria-label="x" loading>
          <Icon />
        </IconButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-loading')).toBe('true');
      expect(btn.getAttribute('aria-busy')).toBe('true');
    });

    it('loading emits data-interactive-disabled="true" (Action strategy)', () => {
      const { container } = render(
        <IconButton aria-label="x" loading>
          <Icon />
        </IconButton>,
      );
      expect(
        container.querySelector('button')!.getAttribute('data-interactive-disabled'),
      ).toBe('true');
    });

    it('disabled native <button>: browser blocks onClick', () => {
      const onClick = vi.fn();
      const { container } = render(
        <IconButton aria-label="x" disabled onClick={onClick}>
          <Icon />
        </IconButton>,
      );
      (container.querySelector('button') as HTMLButtonElement).click();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('loading native <button>: JS-level click swallow (Action strategy)', () => {
      const onClick = vi.fn();
      const { container } = render(
        <IconButton aria-label="x" loading onClick={onClick}>
          <Icon />
        </IconButton>,
      );
      (container.querySelector('button') as HTMLButtonElement).click();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does NOT leak `loading` as a DOM attribute', () => {
      const { container } = render(
        <IconButton aria-label="x" loading>
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!.hasAttribute('loading')).toBe(false);
    });

    it('does NOT leak `variant` / `size` / `color` / `radius` as DOM attributes', () => {
      const { container } = render(
        <IconButton aria-label="x" variant="soft" size="lg" color="secondary" radius="full">
          <Icon />
        </IconButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.hasAttribute('variant')).toBe(false);
      expect(btn.hasAttribute('size')).toBe(false);
      expect(btn.hasAttribute('color')).toBe(false);
      expect(btn.hasAttribute('radius')).toBe(false);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // Polymorphic · samples from the hook's full coverage
  // ───────────────────────────────────────────────────────────────────────
  describe('Polymorphic', () => {
    it('renders <a href> without role="button" (native activating)', () => {
      const { container } = render(
        <IconButton aria-label="open" component="a" href="/x">
          <Icon />
        </IconButton>,
      );
      const a = container.querySelector('a')!;
      expect(a.hasAttribute('role')).toBe(false);
    });

    it('renders polymorphic <div> with injected role="button" (B-2)', () => {
      const { container } = render(
        <IconButton aria-label="x" component="div">
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('div')!.getAttribute('role')).toBe('button');
    });

    it('renders polymorphic <span> with role="button" (B-2 injection)', () => {
      // Consistent with the hook's enabled-branch contract: role is injected
      // so AT announces 'button', but tabIndex is NOT force-set to 0 — the
      // hook only touches tabIndex on the disabled branch (to move polymorphic
      // focus off a non-interactive element). Authors opting into
      // component="span" should still provide their own tabIndex=0.
      const { container } = render(
        <IconButton aria-label="x" component="span">
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('span[role="button"]')).not.toBeNull();
    });

    it('polymorphic <a disabled>: aria-disabled="true", no native disabled', () => {
      const { container } = render(
        <IconButton aria-label="x" component="a" href="/x" disabled>
          <Icon />
        </IconButton>,
      );
      const a = container.querySelector('a')!;
      expect(a.getAttribute('aria-disabled')).toBe('true');
      expect(a.hasAttribute('disabled')).toBe(false);
    });

    it('polymorphic <div disabled>: tabIndex=-1 (focus parity)', () => {
      const { container } = render(
        <IconButton aria-label="x" component="div" disabled>
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('div')!.getAttribute('tabindex')).toBe('-1');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // Action Behavior integration — sample keyboard activation & swallow
  // (F-1 contract; hook has full coverage elsewhere).
  // ───────────────────────────────────────────────────────────────────────
  describe('Action Behavior integration (§3.7)', () => {
    it('polymorphic <div> Enter → onClick fires (F-1 auto-benefit)', () => {
      const onClick = vi.fn();
      const { container } = render(
        <IconButton aria-label="x" component="div" onClick={onClick}>
          <Icon />
        </IconButton>,
      );
      const el = container.querySelector('div') as HTMLDivElement;
      el.focus();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('polymorphic <div> Space → onClick fires', () => {
      const onClick = vi.fn();
      const { container } = render(
        <IconButton aria-label="x" component="div" onClick={onClick}>
          <Icon />
        </IconButton>,
      );
      container
        .querySelector('div')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('polymorphic <div disabled> Enter → onClick swallowed', () => {
      const onClick = vi.fn();
      const { container } = render(
        <IconButton aria-label="x" component="div" disabled onClick={onClick}>
          <Icon />
        </IconButton>,
      );
      container
        .querySelector('div')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('polymorphic <a disabled> click → onClick swallowed', () => {
      const onClick = vi.fn();
      const { container } = render(
        <IconButton aria-label="x" component="a" href="/x" disabled onClick={onClick}>
          <Icon />
        </IconButton>,
      );
      (container.querySelector('a') as HTMLAnchorElement).click();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('native <button> enabled Enter: no double-fire (≤ 1 onClick call)', () => {
      const onClick = vi.fn();
      const { container } = render(
        <IconButton aria-label="x" onClick={onClick}>
          <Icon />
        </IconButton>,
      );
      (container.querySelector('button') as HTMLButtonElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      expect(onClick.mock.calls.length).toBeLessThanOrEqual(1);
    });

    it('default type="button" on native <button> (prevents form submit footgun)', () => {
      const { container } = render(
        <IconButton aria-label="x">
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!.getAttribute('type')).toBe('button');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // D-3 · aria-label enforcement (DEV-only)
  // ───────────────────────────────────────────────────────────────────────
  describe('D-3 · aria-label DEV invariant', () => {
    let spy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
      spy.mockRestore();
    });

    it('warns when both aria-label and aria-labelledby are missing', () => {
      render(
        <IconButton>
          <Icon />
        </IconButton>,
      );
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toMatch(/aria-label/);
    });

    it('does NOT warn when aria-label is provided', () => {
      render(
        <IconButton aria-label="save">
          <Icon />
        </IconButton>,
      );
      const ariaLabelWarnings = spy.mock.calls.filter((c: unknown[]) =>
        /requires an accessible name/.test(String(c[0])),
      );
      expect(ariaLabelWarnings).toHaveLength(0);
    });

    it('does NOT warn when aria-labelledby is provided', () => {
      render(
        <IconButton aria-labelledby="external-label">
          <Icon />
        </IconButton>,
      );
      const ariaLabelWarnings = spy.mock.calls.filter((c: unknown[]) =>
        /requires an accessible name/.test(String(c[0])),
      );
      expect(ariaLabelWarnings).toHaveLength(0);
    });

    it('STILL warns when only `title` is provided (title does NOT satisfy D-3)', () => {
      // Locks the IconButton-specific decision: unlike Button (where visible
      // text children naturally supply the accessible name and `title` can
      // act as a tooltip fallback), IconButton requires an EXPLICIT
      // aria-label / aria-labelledby. `title` is a hover-only affordance
      // and is not reliably announced by every screen reader — accepting
      // it would weaken D-3. This test prevents a well-intentioned "parity
      // with Button" refactor from silently relaxing the contract.
      render(
        <IconButton title="save">
          <Icon />
        </IconButton>,
      );
      const ariaLabelWarnings = spy.mock.calls.filter((c: unknown[]) =>
        /requires an accessible name/.test(String(c[0])),
      );
      expect(ariaLabelWarnings.length).toBeGreaterThan(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // D-7 · children single-element invariant (DEV-only)
  // ───────────────────────────────────────────────────────────────────────
  describe('D-7 · children invariant (DEV)', () => {
    let spy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
      spy.mockRestore();
    });

    it('warns on multiple children', () => {
      render(
        <IconButton aria-label="x">
          <Icon />
          <Icon />
        </IconButton>,
      );
      const countWarns = spy.mock.calls.filter((c: unknown[]) =>
        /expects exactly one child/.test(String(c[0])),
      );
      expect(countWarns.length).toBeGreaterThan(0);
    });

    it('warns on string child', () => {
      render(<IconButton aria-label="x">X</IconButton>);
      const stringWarns = spy.mock.calls.filter((c: unknown[]) =>
        /must be an icon element, not text/.test(String(c[0])),
      );
      expect(stringWarns.length).toBeGreaterThan(0);
    });

    it('warns on zero children', () => {
      render(<IconButton aria-label="x">{null}</IconButton>);
      const countWarns = spy.mock.calls.filter((c: unknown[]) =>
        /expects exactly one child/.test(String(c[0])),
      );
      expect(countWarns.length).toBeGreaterThan(0);
    });

    it('does NOT throw in production mode (graceful degradation)', () => {
      // We cannot toggle NODE_ENV at test runtime (vitest fixes it up front),
      // but we can at least verify that violating renders DO complete without
      // throwing — the warn path is non-fatal by design.
      expect(() =>
        render(
          <IconButton aria-label="x">
            <Icon />
            <Icon />
          </IconButton>,
        ),
      ).not.toThrow();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // D-8 · Loading visual consistency (layout / dimensions)
  // ───────────────────────────────────────────────────────────────────────
  describe('D-8 · Loading visual consistency', () => {
    it('children are NOT rendered while loading (replaced by spinner)', () => {
      const { container, queryByTestId } = render(
        <IconButton aria-label="x" loading>
          <Icon />
        </IconButton>,
      );
      // The user's Icon is gone; only the built-in spinner SVG remains.
      expect(queryByTestId('icon')).toBeNull();
      expect(container.querySelector('button > svg')).not.toBeNull();
    });

    it('does NOT emit a separate data-loader attr (uses single-writer data-loading only)', () => {
      // M-1 consolidation: the rotation animation CSS is scoped to
      // `.root[data-loading='true'] > svg`, so IconButton relies on the
      // state-system's single-writer `data-loading` (SR-7). Emitting an
      // extra `data-loader` would be redundant and drift from SR-7.
      const { container } = render(
        <IconButton aria-label="x" loading>
          <Icon />
        </IconButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-loading')).toBe('true');
      expect(btn.hasAttribute('data-loader')).toBe(false);
    });

    it('root preserves --icon-button-size across loading toggle (no layout shift)', () => {
      const { container, rerender } = render(
        <IconButton aria-label="x">
          <Icon />
        </IconButton>,
      );
      const beforeSize = container
        .querySelector('button')!
        .style.getPropertyValue('--icon-button-size');
      rerender(
        <IconButton aria-label="x" loading>
          <Icon />
        </IconButton>,
      );
      const afterSize = container
        .querySelector('button')!
        .style.getPropertyValue('--icon-button-size');
      expect(afterSize).toBe(beforeSize);
      expect(afterSize).not.toBe('');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // D-6 · Typography zero-consumption
  // ───────────────────────────────────────────────────────────────────────
  describe('D-6 · Typography zero-consumption', () => {
    it('varsResolver does NOT inject --icon-button-font-size or similar typography alias', () => {
      const { container } = render(
        <IconButton aria-label="x">
          <Icon />
        </IconButton>,
      );
      const btn = container.querySelector('button')!;
      // The inline-style var map from varsResolver must not include any
      // typography-channel alias. We assert on explicit names to catch
      // a regression where someone re-introduces font-size borrowing.
      expect(btn.style.getPropertyValue('--icon-button-font-size')).toBe('');
      expect(btn.style.getPropertyValue('--icon-button-font-weight')).toBe('');
      expect(btn.style.getPropertyValue('--icon-button-line-height')).toBe('');
    });

    it('injects --icon-button-icon-size via Size System (not font-size)', () => {
      const { container } = render(
        <IconButton aria-label="x">
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!).toHaveStyle({
        '--icon-button-icon-size': 'var(--prismui-size-slot-size)',
      });
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // Three-channel styles overrides
  // ───────────────────────────────────────────────────────────────────────
  describe('Three-channel overrides (SR-1)', () => {
    it('classNames.root merges into root className', () => {
      const { container } = render(
        <IconButton aria-label="x" classNames={{ root: 'user-root' }}>
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!.className).toContain('user-root');
    });

    it('styles.root merges into root inline style', () => {
      const { container } = render(
        <IconButton aria-label="x" styles={{ root: { opacity: 0.5 } }}>
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!.style.opacity).toBe('0.5');
    });

    it('vars prop merges custom CSS var into root (flat record — matches Button)', () => {
      // StylesOverride.vars is a flat `Record<string, string>` (shared with
      // Button's public shape). Not slot-keyed — the root is the only target
      // and the factory writes the merged map onto it. This asserts the
      // user's override wins over the varsResolver default for the same key.
      const { container } = render(
        <IconButton aria-label="x" vars={{ '--icon-button-size': '48px' }}>
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!.style.getPropertyValue('--icon-button-size')).toBe(
        '48px',
      );
    });

    it('does NOT emit section/inner/label slot classes on DOM (slot tree = root only)', () => {
      const { container } = render(
        <IconButton aria-label="x">
          <Icon />
        </IconButton>,
      );
      // Crude but effective: no descendant of root should carry a slot-ish
      // class name from IconButton (no .inner / .label / .section in the
      // CSS module at all — nothing to leak).
      expect(container.querySelectorAll('.inner, .label, .section').length).toBe(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // Theme integration — defaultProps overrides via theme.components.IconButton
  // ───────────────────────────────────────────────────────────────────────
  describe('Theme integration', () => {
    it('theme.components.IconButton.defaultProps overrides built-in defaults', () => {
      const theme = createTheme({
        components: {
          IconButton: { defaultProps: { variant: 'soft', size: 'lg' } },
        },
      });
      const { container } = renderWithTheme(
        theme,
        <IconButton aria-label="x">
          <Icon />
        </IconButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-variant')).toBe('soft');
      expect(btn.getAttribute('data-size')).toBe('lg');
    });

    it('explicit props still beat theme defaultProps', () => {
      const theme = createTheme({
        components: {
          IconButton: { defaultProps: { variant: 'soft' } },
        },
      });
      const { container } = renderWithTheme(
        theme,
        <IconButton aria-label="x" variant="outlined">
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!.getAttribute('data-variant')).toBe('outlined');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // Radius — scale / CSSLength / 'full'
  // ───────────────────────────────────────────────────────────────────────
  describe('Radius', () => {
    it('default radius="md" resolves to --prismui-radius-md', () => {
      const { container } = render(
        <IconButton aria-label="x">
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!).toHaveStyle({
        '--icon-button-radius': 'var(--prismui-radius-md)',
      });
    });

    it('radius="full" resolves to --prismui-radius-full (circle form)', () => {
      const { container } = render(
        <IconButton aria-label="x" radius="full">
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!).toHaveStyle({
        '--icon-button-radius': 'var(--prismui-radius-full)',
      });
    });

    it('radius accepts raw CSS length escape hatch', () => {
      const { container } = render(
        <IconButton aria-label="x" radius={'7px' as unknown as 'md'}>
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!).toHaveStyle({
        '--icon-button-radius': '7px',
      });
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // CSS var namespace isolation (SR-5 / SR-8)
  // ───────────────────────────────────────────────────────────────────────
  describe('CSS var namespace isolation', () => {
    it('exposes --icon-button-* vars on root (not --iconbutton-* / not --button-*)', () => {
      const { container } = render(
        <IconButton aria-label="x">
          <Icon />
        </IconButton>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.style.getPropertyValue('--icon-button-size')).not.toBe('');
      expect(btn.style.getPropertyValue('--icon-button-icon-size')).not.toBe('');
      expect(btn.style.getPropertyValue('--icon-button-radius')).not.toBe('');
      // Negative — confirm we did not accidentally consume Button's alias.
      expect(btn.style.getPropertyValue('--button-height')).toBe('');
      expect(btn.style.getPropertyValue('--button-slot-size')).toBe('');
      // Negative — confirm the old non-kebab candidate was not reintroduced.
      expect(btn.style.getPropertyValue('--iconbutton-size')).toBe('');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Stage 10 · Phase 5 · Feedback integration (mirrors Button v0.6 Phase 4.1)
  //
  // Contract: `@/devdocs/system/feedback-contract.md` v0.6 §10 (rippleFeedback)
  // + §11 (glowFeedback) + §12.2 (theme path) + §6.4 (focus singleton) + L-F5
  // (identity guard).
  //
  // These tests prove the IconButton wires together L2 `usePress` (press
  // ingress) + L4 `useFeedback([rippleFeedback, glowFeedback])` (instance
  // lifecycle) + L3 Action Surface (semantic activation) without collapsing
  // any of the three contracts into another. The test plan is a 1:1 port of
  // Button.test.tsx Phase 3 + Phase 4.1 — same 26 cases, adapted to
  // IconButton's single-slot tree (root + child icon, no inner / label /
  // section). Passing this matrix proves `COMPONENT_DEFAULT_FEEDBACKS` is a
  // re-usable pattern, not a Button-specific recipe (Phase 5 acceptance).
  // ─────────────────────────────────────────────────────────────────────────
  describe('Phase 5 · Feedback integration', () => {
    /**
     * Helper: ripple factory reads `event.width` / `event.height` from the
     * PressEvent (L2 derives via `getBoundingClientRect()`). jsdom returns
     * zeros by default, so we stub a fixed rect for deterministic
     * `--ripple-size` values across test runs.
     */
    function stubRect(el: Element, rect: Partial<DOMRect> = {}) {
      const full: DOMRect = {
        width: 40,
        height: 40,
        left: 0,
        top: 0,
        right: 40,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: () => ({}),
        ...rect,
      } as DOMRect;
      el.getBoundingClientRect = () => full;
    }

    describe('Visual feedback lifecycle (ripple)', () => {
      it('pointerdown creates a .prismui-ripple node inside the press target', () => {
        const { container } = render(
          <IconButton aria-label="x"><Icon /></IconButton>,
        );
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
        const { container } = render(
          <IconButton aria-label="x"><Icon /></IconButton>,
        );
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

      it('presscancel path (pointer leaves, outside pointerup) removes ripple immediately', () => {
        const { container } = render(
          <IconButton aria-label="x"><Icon /></IconButton>,
        );
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();

        fireEvent.pointerLeave(btn, { pointerId: 1, pointerType: 'mouse' });
        act(() => {
          const evt = new PointerEvent('pointerup', { pointerId: 1, bubbles: true });
          window.dispatchEvent(evt);
        });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });
    });

    describe('Interactive-disabled gating (shares predicate with Action Surface)', () => {
      it('<IconButton disabled>: pointerdown does NOT create a ripple', () => {
        const { container } = render(
          <IconButton aria-label="x" disabled><Icon /></IconButton>,
        );
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });

      it('<IconButton loading>: pointerdown does NOT create a ripple (Action strategy includes loading)', () => {
        const { container } = render(
          <IconButton aria-label="x" loading><Icon /></IconButton>,
        );
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });

      it('polymorphic <div disabled>: pointerdown does NOT create a ripple', () => {
        const { container } = render(
          <IconButton aria-label="x" component="div" disabled><Icon /></IconButton>,
        );
        const el = container.querySelector('div')!;
        stubRect(el);

        fireEvent.pointerDown(el, { pointerId: 1, pointerType: 'mouse' });
        expect(el.querySelector('.prismui-ripple')).toBeNull();
      });
    });

    describe('FB-1 Polymorphic lifecycle trace (§7.2)', () => {
      function captureRippleShape(el: HTMLElement) {
        const ripple = el.querySelector<HTMLSpanElement>('.prismui-ripple');
        if (!ripple) return { exists: false };
        return {
          exists: true,
          class: ripple.className,
          x: ripple.style.getPropertyValue('--ripple-x'),
          y: ripple.style.getPropertyValue('--ripple-y'),
          size: ripple.style.getPropertyValue('--ripple-size'),
        };
      }

      function traceHost(
        ui: React.ReactElement,
        query: string,
      ): ReturnType<typeof captureRippleShape> {
        const { container, unmount } = render(ui);
        const el = container.querySelector<HTMLElement>(query)!;
        stubRect(el, { width: 40, height: 40 });
        fireEvent.pointerDown(el, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });
        const shape = captureRippleShape(el);
        act(() => {
          fireEvent.pointerUp(el, { pointerId: 1, pointerType: 'mouse' });
        });
        const ripple = el.querySelector<HTMLSpanElement>('.prismui-ripple');
        ripple?.dispatchEvent(new Event('animationend'));
        unmount();
        return shape;
      }

      it('native <button>: baseline lifecycle trace', () => {
        const shape = traceHost(<IconButton aria-label="x"><Icon /></IconButton>, 'button');
        expect(shape).toEqual({
          exists: true,
          class: 'prismui-ripple',
          x: '10px',
          y: '10px',
          size: '80px',
        });
      });

      it('<a href>: lifecycle trace equals <button> baseline (field-level diff empty)', () => {
        const baseline = traceHost(<IconButton aria-label="x"><Icon /></IconButton>, 'button');
        const anchor = traceHost(
          <IconButton aria-label="x" component="a" href="/x"><Icon /></IconButton>,
          'a',
        );
        expect(anchor).toEqual(baseline);
      });

      it('<div role="button">: lifecycle trace equals <button> baseline (field-level diff empty)', () => {
        const baseline = traceHost(<IconButton aria-label="x"><Icon /></IconButton>, 'button');
        const div = traceHost(
          <IconButton aria-label="x" component="div"><Icon /></IconButton>,
          'div',
        );
        expect(div).toEqual(baseline);
      });
    });

    describe('Parallel wiring with Action Surface', () => {
      it('click → both onClick (Action Surface) and ripple feedback fire', () => {
        const onClick = vi.fn();
        const { container } = render(
          <IconButton aria-label="x" onClick={onClick}><Icon /></IconButton>,
        );
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();

        fireEvent.click(btn);
        expect(onClick).toHaveBeenCalledTimes(1);
      });

      it('user onPointerDown runs BEFORE the press feedback ingress (chainHandlers order)', () => {
        const order: string[] = [];
        const onPointerDown = vi.fn(() => {
          order.push(
            document.querySelector('.prismui-ripple') ? 'after-ripple' : 'before-ripple',
          );
        });
        const { container } = render(
          <IconButton aria-label="x" onPointerDown={onPointerDown}><Icon /></IconButton>,
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

      it('polymorphic <div> keyboard activation: press.onKeyDown runs before actionBehavior.onKeyDown', () => {
        const onClick = vi.fn();
        const { container } = render(
          <IconButton aria-label="x" component="div" onClick={onClick}><Icon /></IconButton>,
        );
        const el = container.querySelector('div') as HTMLDivElement;
        el.focus();
        act(() => {
          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        });
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });

    describe('Press unmount cleanup (L-F1)', () => {
      it('unmount during active press disposes the ripple node synchronously', () => {
        const { container, unmount } = render(
          <IconButton aria-label="x"><Icon /></IconButton>,
        );
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

    // ─── Phase 4.1 · Focus Feedback (glow) — adapted to IconButton ───────
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
          const { container } = render(
            <IconButton aria-label="x"><Icon /></IconButton>,
          );
          const btn = container.querySelector('button')!;

          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);
        } finally {
          restore();
        }
      });

      it('onBlur removes the glow class (via finish → transition trigger)', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(
            <IconButton aria-label="x"><Icon /></IconButton>,
          );
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
          const { container } = render(
            <IconButton aria-label="x"><Icon /></IconButton>,
          );
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });

      it('disabled IconButton: data-disabled=true gates the visual via host CSS', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(
            <IconButton aria-label="x" disabled><Icon /></IconButton>,
          );
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.getAttribute('data-disabled')).toBe('true');
        } finally {
          restore();
        }
      });

      it('loading IconButton: data-loading=true gates the visual via host CSS', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(
            <IconButton aria-label="x" loading><Icon /></IconButton>,
          );
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.getAttribute('data-loading')).toBe('true');
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
            <IconButton aria-label="x" onFocus={userOnFocus}><Icon /></IconButton>,
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
            <IconButton aria-label="x" onBlur={userOnBlur}><Icon /></IconButton>,
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
            <IconButton aria-label="x" feedbacks={[]}><Icon /></IconButton>,
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

      it('theme.components.IconButton.defaultFeedbacks overrides module default', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const theme = createTheme({
            components: { IconButton: { defaultFeedbacks: [] } },
          });
          const { container } = renderWithTheme(
            theme,
            <IconButton aria-label="x"><Icon /></IconButton>,
          );
          const btn = container.querySelector('button')!;

          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });

      it('props.feedbacks wins over theme.components.IconButton.defaultFeedbacks', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const theme = createTheme({
            components: { IconButton: { defaultFeedbacks: [] } },
          });
          const { container } = renderWithTheme(
            theme,
            <IconButton aria-label="x" feedbacks={[glowFeedback]}><Icon /></IconButton>,
          );
          const btn = container.querySelector('button')!;

          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);
        } finally {
          restore();
        }
      });
    });

    describe('L-F5 blur-refocus identity guard (§6.5 P0-2)', () => {
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

      it('blur → immediate refocus keeps the glow class visible (no stale clear)', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(
            <IconButton aria-label="x"><Icon /></IconButton>,
          );
          const btn = container.querySelector('button')!;

          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);

          fireEvent.blur(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);

          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);
        } finally {
          restore();
        }
      });
    });

    describe('Dual-source coexistence (press ⨯ focus)', () => {
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

      it('pressing a focused IconButton keeps the glow class while the ripple plays', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(
            <IconButton aria-label="x"><Icon /></IconButton>,
          );
          const btn = container.querySelector('button')!;

          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);

          fireEvent.pointerDown(btn, {
            pointerId: 1,
            pointerType: 'mouse',
            clientX: 5,
            clientY: 5,
          });
          expect(btn.querySelector('.prismui-ripple')).not.toBeNull();
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
          const { container, unmount } = render(
            <IconButton aria-label="x"><Icon /></IconButton>,
          );
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
