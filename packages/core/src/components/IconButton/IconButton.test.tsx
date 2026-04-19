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
import { render } from '@testing-library/react';
import { IconButton, __resetIconButtonInvariantWarnings } from './index';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';

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

    it('applies data-loader="true" on root when loading', () => {
      const { container } = render(
        <IconButton aria-label="x" loading>
          <Icon />
        </IconButton>,
      );
      expect(container.querySelector('button')!.getAttribute('data-loader')).toBe('true');
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
        <IconButton
          aria-label="x"
          vars={{ '--icon-button-size': '48px' } as Record<string, string>}
        >
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
});
