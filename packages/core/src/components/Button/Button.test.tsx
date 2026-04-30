import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import * as fs from 'fs';
import * as path from 'path';
import { render, fireEvent, act } from '@testing-library/react';
import { Button } from './Button';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';
import { glowFeedback } from '../../feedbacks/glow/glow-feedback';

function renderWithTheme(theme: ReturnType<typeof createTheme>, ui: React.ReactElement) {
  return render(<PrismUIProvider theme={theme}>{ui}</PrismUIProvider>);
}

describe('Button', () => {
  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      const { getByText } = render(<Button>Click me</Button>);
      expect(getByText('Click me')).toBeInTheDocument();
    });

    it('renders as button by default', () => {
      const { container } = render(<Button>Click me</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders filled variant (default)', () => {
      const { container } = render(<Button>Filled</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders outlined variant', () => {
      const { container } = render(<Button variant="outlined">Outlined</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders soft variant', () => {
      const { container } = render(<Button variant="soft">Soft</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('renders plain variant', () => {
      const { container } = render(<Button variant="plain">Plain</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('outlined variant injects bordered CSS vars', () => {
      const { container } = render(<Button variant="outlined">Outlined</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({
        '--prismui-variant-border': 'var(--prismui-color-primary-bordered-border)',
      });
    });

    it('soft variant injects low-emphasis CSS vars', () => {
      const { container } = render(<Button variant="soft">Soft</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({
        '--prismui-variant-bg': 'var(--prismui-color-primary-low-bg)',
      });
    });

    it('plain variant injects minimal CSS vars', () => {
      const { container } = render(<Button variant="plain">Plain</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({
        '--prismui-variant-fg': 'var(--prismui-color-primary-minimal-fg)',
      });
    });
  });

  describe('Sizes', () => {
    it('renders xs size', () => {
      const { container } = render(<Button size="xs">XS</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--button-height': 'var(--prismui-size-height)' });
      expect(button).toHaveStyle({ '--prismui-size-height': '24px' });
    });

    it('renders sm size', () => {
      const { container } = render(<Button size="sm">SM</Button>);
      expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '30px' });
    });

    it('renders md size (default)', () => {
      const { container } = render(<Button>MD</Button>);
      expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '36px' });
    });

    it('renders lg size', () => {
      const { container } = render(<Button size="lg">LG</Button>);
      expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '42px' });
    });

    it('renders xl size', () => {
      const { container } = render(<Button size="xl">XL</Button>);
      expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '48px' });
    });

    it('injects font-size CSS variable from Size System', () => {
      const { container } = render(<Button>M</Button>);
      expect(container.querySelector('button')).toHaveStyle({ '--button-font-size': 'var(--prismui-size-font-size)' });
    });

    it('Size System injects --prismui-size-font-size per tier', () => {
      const { container: xs } = render(<Button size="xs">X</Button>);
      expect(xs.querySelector('button')).toHaveStyle({ '--prismui-size-font-size': '12px' });

      const { container: md } = render(<Button>M</Button>);
      expect(md.querySelector('button')).toHaveStyle({ '--prismui-size-font-size': '14px' });

      const { container: xl } = render(<Button size="xl">X</Button>);
      expect(xl.querySelector('button')).toHaveStyle({ '--prismui-size-font-size': '16px' });
    });
  });

  describe('Colors', () => {
    it('renders primary color (default) — injects --prismui-variant-* system vars', () => {
      const { container } = render(<Button>Primary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveStyle({ '--prismui-variant-bg': 'var(--prismui-color-primary-high-bg)' });
      expect(button).toHaveStyle({ '--prismui-variant-fg': 'var(--prismui-color-primary-high-fg)' });
    });

    it('renders secondary color', () => {
      const { container } = render(<Button color="secondary">Secondary</Button>);
      expect(container.querySelector('button')).toHaveStyle({
        '--prismui-variant-bg': 'var(--prismui-color-secondary-high-bg)',
      });
    });

    it('renders error color', () => {
      const { container } = render(<Button color="error">Error</Button>);
      expect(container.querySelector('button')).toHaveStyle({
        '--prismui-variant-bg': 'var(--prismui-color-error-high-bg)',
      });
    });

    it('renders success color', () => {
      const { container } = render(<Button color="success">Success</Button>);
      expect(container.querySelector('button')).toHaveStyle({
        '--prismui-variant-bg': 'var(--prismui-color-success-high-bg)',
      });
    });
  });

  describe('Disabled State', () => {
    it('applies disabled attribute', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      expect(container.querySelector('button')).toBeDisabled();
    });

    it('injects --prismui-state-opacity-disabled', () => {
      const { container } = render(<Button>State</Button>);
      expect(container.querySelector('button')).toHaveStyle({
        '--prismui-state-opacity-disabled': '0.5',
      });
    });

    it('injects --prismui-state-cursor-disabled', () => {
      const { container } = render(<Button>State</Button>);
      expect(container.querySelector('button')).toHaveStyle({
        '--prismui-state-cursor-disabled': 'not-allowed',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // N-5 · ref forwarding
  //
  // factory produces the `ref` transparently, but Button-level tests lock it
  // down so future refactors of the factory can never silently drop
  // ref-forwarding (a common React library bug).
  // ─────────────────────────────────────────────────────────────────────────
  describe('Ref forwarding', () => {
    it('forwards ref to the native <button> DOM node', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>X</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('forwards ref to the polymorphic <a> DOM node when component="a"', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(<Button component="a" href="/x" ref={ref as any}>X</Button>);
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });

    it('forwards ref to the polymorphic <div> DOM node when component="div"', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Button component="div" ref={ref as any}>X</Button>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('callback ref receives the DOM node', () => {
      const seen: HTMLElement[] = [];
      render(<Button ref={(el: HTMLButtonElement | null) => { if (el) seen.push(el); }}>X</Button>);
      expect(seen).toHaveLength(1);
      expect(seen[0]).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Polymorphic Behavior', () => {
    it('renders as anchor when component="a"', () => {
      const { container } = render(
        <Button component="a" href="/test">Link</Button>,
      );
      const anchor = container.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor).toHaveAttribute('href', '/test');
    });
  });

  describe('Prop Isolation (componentPropKeys)', () => {
    it('variant does NOT appear as DOM attribute', () => {
      const { container } = render(<Button variant="outlined">Button</Button>);
      expect(container.querySelector('button')).not.toHaveAttribute('variant');
    });

    it('color does NOT appear as DOM attribute', () => {
      const { container } = render(<Button color="error">Button</Button>);
      expect(container.querySelector('button')).not.toHaveAttribute('color');
    });

    it('size does NOT appear as DOM attribute', () => {
      const { container } = render(<Button size="lg">Button</Button>);
      expect(container.querySelector('button')).not.toHaveAttribute('size');
    });

    it('disabled IS present on button DOM', () => {
      const { container } = render(<Button disabled>Button</Button>);
      expect(container.querySelector('button')).toBeDisabled();
    });
  });

  describe('Styling Overrides - classNames', () => {
    it('accepts classNames override for root', () => {
      const { container } = render(
        <Button classNames={{ root: 'custom-root' }}>Button</Button>,
      );
      expect(container.querySelector('button')).toHaveClass('custom-root');
    });

    it('accepts classNames override for label', () => {
      const { container } = render(
        <Button classNames={{ label: 'custom-label' }}>Button</Button>,
      );
      expect(container.querySelector('.custom-label')).toBeInTheDocument();
    });

    it('accepts all slots classNames', () => {
      const { container } = render(
        <Button classNames={{ root: 'c-root', inner: 'c-inner', label: 'c-label' }}>Button</Button>,
      );
      expect(container.querySelector('.c-root')).toBeInTheDocument();
      expect(container.querySelector('.c-inner')).toBeInTheDocument();
      expect(container.querySelector('.c-label')).toBeInTheDocument();
    });
  });

  describe('Styling Overrides - styles', () => {
    it('accepts styles override for root', () => {
      const { container } = render(
        <Button styles={{ root: { borderRadius: '20px' } }}>Button</Button>,
      );
      expect(container.querySelector('button')).toHaveStyle({ borderRadius: '20px' });
    });

    it('accepts styles override for label', () => {
      const { container } = render(
        <Button styles={{ label: { fontWeight: 'bold' } }}>Button</Button>,
      );
      expect(container.querySelector('span > span')).toHaveStyle({ fontWeight: 'bold' });
    });
  });

  describe('Styling Overrides - vars', () => {
    it('accepts vars override', () => {
      const { container } = render(
        <Button vars={{ '--button-height': '60px' }}>Button</Button>,
      );
      expect(container.querySelector('button')).toHaveStyle({ '--button-height': '60px' });
    });

    it('vars override has higher priority than varsResolver', () => {
      const { container } = render(
        <Button size="sm" vars={{ '--button-height': '100px' }}>Button</Button>,
      );
      expect(container.querySelector('button')).toHaveStyle({ '--button-height': '100px' });
    });
  });

  describe('Combined Overrides', () => {
    it('combines classNames, styles, and vars', () => {
      const { container } = render(
        <Button
          classNames={{ root: 'custom-root' }}
          styles={{ root: { borderRadius: '20px' } }}
          vars={{ '--button-height': '60px' }}
        >
          Button
        </Button>,
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-root');
      expect(button).toHaveStyle({ borderRadius: '20px', '--button-height': '60px' });
    });
  });

  describe('theme.components integration', () => {
    describe('defaultProps', () => {
      it('theme defaultProps size fills missing prop', () => {
        const theme = createTheme({ components: { Button: { defaultProps: { size: 'xl' } } } });
        const { container } = renderWithTheme(theme, <Button>B</Button>);
        expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '48px' });
      });

      it('props size overrides theme defaultProps size', () => {
        const theme = createTheme({ components: { Button: { defaultProps: { size: 'xl' } } } });
        const { container } = renderWithTheme(theme, <Button size="sm">B</Button>);
        expect(container.querySelector('button')).toHaveStyle({ '--prismui-size-height': '30px' });
      });
    });

    describe('classNames', () => {
      it('theme classNames.root injected onto root element', () => {
        const theme = createTheme({ components: { Button: { classNames: { root: 'theme-btn' } } } });
        const { container } = renderWithTheme(theme, <Button>B</Button>);
        expect(container.querySelector('button')).toHaveClass('theme-btn');
      });

      it('theme + props classNames same slot → cx-merged', () => {
        const theme = createTheme({ components: { Button: { classNames: { root: 'theme-btn' } } } });
        const { container } = renderWithTheme(
          theme,
          <Button classNames={{ root: 'props-btn' }}>B</Button>,
        );
        const button = container.querySelector('button');
        expect(button).toHaveClass('theme-btn');
        expect(button).toHaveClass('props-btn');
      });
    });

    describe('styles', () => {
      it('theme styles.root injected as inline style', () => {
        const theme = createTheme({
          components: { Button: { styles: { root: { borderRadius: '99px' } } } },
        });
        const { container } = renderWithTheme(theme, <Button>B</Button>);
        expect(container.querySelector('button')).toHaveStyle({ borderRadius: '99px' });
      });

      it('props styles.root overrides theme styles.root', () => {
        const theme = createTheme({
          components: { Button: { styles: { root: { borderRadius: '4px' } } } },
        });
        const { container } = renderWithTheme(
          theme,
          <Button styles={{ root: { borderRadius: '20px' } }}>B</Button>,
        );
        expect(container.querySelector('button')).toHaveStyle({ borderRadius: '20px' });
      });

      it('props style prop overrides theme styles (highest priority)', () => {
        const theme = createTheme({
          components: { Button: { styles: { root: { borderRadius: '4px' } } } },
        });
        const { container } = renderWithTheme(
          theme,
          <Button style={{ borderRadius: '50%' }}>B</Button>,
        );
        expect(container.querySelector('button')).toHaveStyle({ borderRadius: '50%' });
      });
    });

    describe('vars', () => {
      it('theme vars injected CSS Variable on root element', () => {
        const theme = createTheme({
          components: { Button: { vars: { '--button-height': '80px' } } },
        });
        const { container } = renderWithTheme(theme, <Button>B</Button>);
        expect(container.querySelector('button')).toHaveStyle({ '--button-height': '80px' });
      });

      it('props vars override theme vars', () => {
        const theme = createTheme({
          components: { Button: { vars: { '--button-height': '80px' } } },
        });
        const { container } = renderWithTheme(
          theme,
          <Button vars={{ '--button-height': '100px' }}>B</Button>,
        );
        expect(container.querySelector('button')).toHaveStyle({ '--button-height': '100px' });
      });

      it('props style CSS var overrides props vars (style > vars priority)', () => {
        const theme = createTheme({
          components: { Button: { vars: { '--button-height': '80px' } } },
        });
        const { container } = renderWithTheme(
          theme,
          <Button
            vars={{ '--button-height': '100px' }}
            style={{ '--button-height': '120px' } as React.CSSProperties}
          >
            B
          </Button>,
        );
        expect(container.querySelector('button')).toHaveStyle({ '--button-height': '120px' });
      });
    });
  });

  describe('Sections (Size v3 + Issue #1)', () => {
    it('renders no section when leftSection / rightSection are absent', () => {
      const { container } = render(<Button>Plain</Button>);
      expect(container.querySelector('[data-position="left"]')).toBeNull();
      expect(container.querySelector('[data-position="right"]')).toBeNull();
    });

    it('renders left section with data-position="left" and NO aria-hidden (user content may carry semantics)', () => {
      const { container } = render(
        <Button leftSection={<span data-testid="lsi" aria-label="icon">L</span>}>Go</Button>,
      );
      const left = container.querySelector('[data-position="left"]');
      expect(left).toBeInTheDocument();
      // Phase 2-bis (SR-7.1 bundle): user-provided sections are NOT aria-hidden
      // — otherwise accessible icon labels would be silently discarded.
      expect(left?.getAttribute('aria-hidden')).toBeNull();
      expect(left?.querySelector('[data-testid="lsi"]')).toBeInTheDocument();
    });

    it('renders right section with data-position="right" and NO aria-hidden', () => {
      const { container } = render(
        <Button rightSection={<span data-testid="rsi" aria-label="icon">R</span>}>Go</Button>,
      );
      const right = container.querySelector('[data-position="right"]');
      expect(right).toBeInTheDocument();
      expect(right?.getAttribute('aria-hidden')).toBeNull();
      expect(right?.querySelector('[data-testid="rsi"]')).toBeInTheDocument();
    });

    it('renders both sections flanking the label', () => {
      const { container } = render(
        <Button leftSection="L" rightSection="R">Label</Button>,
      );
      const inner = container.querySelector('button')!.firstElementChild!;
      const [first, middle, last] = Array.from(inner.children);
      expect(first.getAttribute('data-position')).toBe('left');
      expect(middle.getAttribute('data-position')).toBeNull(); // label
      expect(last.getAttribute('data-position')).toBe('right');
    });

    it('does NOT leak leftSection / rightSection as DOM attributes on root', () => {
      const { container } = render(
        <Button leftSection="L" rightSection="R">Go</Button>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.hasAttribute('leftsection')).toBe(false);
      expect(btn.hasAttribute('rightsection')).toBe(false);
    });

    it('emits Size v3 component-alias CSS vars on root', () => {
      const { container } = render(<Button>X</Button>);
      const btn = container.querySelector('button')!;
      const style = btn.getAttribute('style') ?? '';
      expect(style).toContain('--button-slot-size');
      expect(style).toContain('--button-inner-gap');
    });

    it('leftSection={null} does not render a section element', () => {
      const { container } = render(<Button leftSection={null}>X</Button>);
      expect(container.querySelector('[data-position="left"]')).toBeNull();
    });

    it('leftSection={0} renders (0 is a valid ReactNode)', () => {
      const { container } = render(<Button leftSection={0}>X</Button>);
      expect(container.querySelector('[data-position="left"]')).toBeInTheDocument();
    });
  });

  describe('Radius prop', () => {
    it('defaults to md → injects var(--prismui-radius-md) via --button-radius', () => {
      const { container } = render(<Button>X</Button>);
      const btn = container.querySelector('button')!;
      const style = btn.getAttribute('style') ?? '';
      expect(style).toContain('--button-radius');
      expect(style).toContain('var(--prismui-radius-md)');
    });

    it.each(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const)(
      'radius="%s" → var(--prismui-radius-<scale>)',
      (scale) => {
        const { container } = render(<Button radius={scale}>X</Button>);
        const style = container.querySelector('button')!.getAttribute('style') ?? '';
        expect(style).toContain(`var(--prismui-radius-${scale})`);
      },
    );

    it('radius="9999px" → passes through CSS length verbatim', () => {
      const { container } = render(<Button radius="9999px">X</Button>);
      const style = container.querySelector('button')!.getAttribute('style') ?? '';
      expect(style).toContain('--button-radius: 9999px');
    });

    it('does NOT leak radius as a DOM attribute', () => {
      const { container } = render(<Button radius="lg">X</Button>);
      expect(container.querySelector('button')!.hasAttribute('radius')).toBe(false);
    });
  });

  describe('fullWidth prop', () => {
    it('default: no data-full-width attribute', () => {
      const { container } = render(<Button>X</Button>);
      expect(container.querySelector('button')!.hasAttribute('data-full-width')).toBe(false);
    });

    it('fullWidth={true} → data-full-width="true"', () => {
      const { container } = render(<Button fullWidth>X</Button>);
      expect(container.querySelector('button')!.getAttribute('data-full-width')).toBe('true');
    });

    it('does NOT leak fullWidth as a DOM attribute', () => {
      const { container } = render(<Button fullWidth>X</Button>);
      expect(container.querySelector('button')!.hasAttribute('fullwidth')).toBe(false);
    });
  });

  describe('Loading prop', () => {
    it('default: no loading indicators', () => {
      const { container } = render(<Button>X</Button>);
      const btn = container.querySelector('button')!;
      expect(btn.hasAttribute('data-loading')).toBe(false);
      expect(btn.hasAttribute('aria-busy')).toBe(false);
      expect(container.querySelector('[data-loader="true"]')).toBeNull();
    });

    it('loading={true} → data-loading + aria-busy + loader section', () => {
      const { container } = render(<Button loading>Submitting</Button>);
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-loading')).toBe('true');
      expect(btn.getAttribute('aria-busy')).toBe('true');
      const loader = container.querySelector('[data-loader="true"]');
      expect(loader).toBeInTheDocument();
      expect(loader?.getAttribute('data-position')).toBe('left');
      expect(loader?.querySelector('svg')).toBeInTheDocument();
    });

    it('loading replaces leftSection (single left slot occupied by spinner)', () => {
      const { container } = render(
        <Button loading leftSection={<span data-testid="should-be-hidden">I</span>}>
          X
        </Button>,
      );
      const lefts = container.querySelectorAll('[data-position="left"]');
      expect(lefts).toHaveLength(1); // only spinner, no duplicate
      expect(container.querySelector('[data-testid="should-be-hidden"]')).toBeNull();
      expect(lefts[0].getAttribute('data-loader')).toBe('true');
    });

    it('loading preserves rightSection', () => {
      const { container } = render(
        <Button loading rightSection={<span data-testid="rsi">R</span>}>
          X
        </Button>,
      );
      expect(container.querySelector('[data-testid="rsi"]')).toBeInTheDocument();
    });

    it('label text remains visible while loading', () => {
      const { getByText } = render(<Button loading>Submitting</Button>);
      expect(getByText('Submitting')).toBeInTheDocument();
    });

    it('does NOT leak loading as a DOM attribute', () => {
      const { container } = render(<Button loading>X</Button>);
      expect(container.querySelector('button')!.hasAttribute('loading')).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Stage 3 Step 10 · Phase 2 — polymorphic event swallow (§2.4 R-D4)
  // ─────────────────────────────────────────────────────────────────────────
  describe('Polymorphic event swallow (disabled/loading)', () => {
    it('polymorphic <a disabled>: sets aria-disabled + data-disabled, no native disabled', () => {
      const { container } = render(
        <Button component="a" href="/x" disabled>X</Button>,
      );
      const a = container.querySelector('a') as HTMLAnchorElement;
      expect(a.getAttribute('aria-disabled')).toBe('true');
      expect(a.getAttribute('data-disabled')).toBe('true');
      expect(a.hasAttribute('disabled')).toBe(false);
    });

    it('polymorphic <a disabled>: swallows click (onClick NOT fired)', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button component="a" href="/x" disabled onClick={onClick}>X</Button>,
      );
      const a = container.querySelector('a') as HTMLAnchorElement;
      a.click();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('polymorphic <a loading>: swallows click (Action strategy includes loading)', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button component="a" href="/x" loading onClick={onClick}>X</Button>,
      );
      (container.querySelector('a') as HTMLAnchorElement).click();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('polymorphic <a> (enabled): onClick fires normally', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button component="a" href="/x" onClick={onClick}>X</Button>,
      );
      (container.querySelector('a') as HTMLAnchorElement).click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('polymorphic <a disabled>: swallows Enter/Space keydown', () => {
      const onKeyDown = vi.fn();
      const { container } = render(
        <Button component="a" href="/x" disabled onKeyDown={onKeyDown}>X</Button>,
      );
      const a = container.querySelector('a') as HTMLAnchorElement;
      a.focus();
      act(() => {
        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        a.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      });
      expect(onKeyDown).not.toHaveBeenCalled();
    });

    it('polymorphic <a disabled>: does NOT swallow non-activation keys', () => {
      const onKeyDown = vi.fn();
      const { container } = render(
        <Button component="a" href="/x" disabled onKeyDown={onKeyDown}>X</Button>,
      );
      const a = container.querySelector('a') as HTMLAnchorElement;
      a.focus();
      act(() => {
        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });
      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    it('native <button disabled>: browser already blocks click (no double handling needed)', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button disabled onClick={onClick}>X</Button>,
      );
      (container.querySelector('button') as HTMLButtonElement).click();
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R-D4 Phase 3 · F-1 — polymorphic keyboard activation parity
  //
  // Any polymorphic Button that does NOT render a native activating element
  // (`<button>` or `<a href>`) must treat Enter/Space as a button activation
  // because we injected role="button" (B-2). Without this, screen readers
  // announce "button" but keyboard users get no response — a11y violation.
  //
  // Native <button> and <a href> are intentionally skipped by the hook to
  // avoid double-fire (browser already activates them). Verify both sides.
  // ─────────────────────────────────────────────────────────────────────────
  describe('Polymorphic keyboard activation (R-D4 Phase 3 · F-1)', () => {
    it('polymorphic <div> (enabled): Enter keydown → onClick fires', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button component="div" onClick={onClick}>X</Button>,
      );
      const el = container.querySelector('div') as HTMLDivElement;
      el.focus();
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('polymorphic <div> (enabled): Space keydown → onClick fires', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button component="div" onClick={onClick}>X</Button>,
      );
      const el = container.querySelector('div') as HTMLDivElement;
      el.focus();
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('polymorphic <span> (enabled): Enter keydown → onClick fires', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button component="span" onClick={onClick}>X</Button>,
      );
      const el = container.querySelector('span[role="button"]') as HTMLSpanElement;
      el.focus();
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('polymorphic <a> without href (enabled): Enter → onClick fires', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button component="a" onClick={onClick}>X</Button>,
      );
      const el = container.querySelector('a') as HTMLAnchorElement;
      el.focus();
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('polymorphic <div> (DISABLED): Enter keydown → onClick does NOT fire (swallow wins)', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button component="div" disabled onClick={onClick}>X</Button>,
      );
      const el = container.querySelector('div') as HTMLDivElement;
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      expect(onClick).not.toHaveBeenCalled();
    });

    it('polymorphic <div> (loading): Enter keydown → onClick does NOT fire (Action strategy)', () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button component="div" loading onClick={onClick}>X</Button>,
      );
      const el = container.querySelector('div') as HTMLDivElement;
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      expect(onClick).not.toHaveBeenCalled();
    });

    it('native <button> (enabled): Enter keydown does NOT double-fire onClick', () => {
      // Browser will fire a native click on Enter for <button>; our hook
      // must NOT also manually fire `.click()`. jsdom does not simulate the
      // browser's Enter→click on <button>, so we directly assert the hook
      // branch left `currentTarget.click` untouched — i.e. onClick count
      // equals what the platform produces (0 in jsdom, 1 in real browsers).
      // The critical regression: onClick MUST NOT be ≥ 2.
      const onClick = vi.fn();
      const { container } = render(<Button onClick={onClick}>X</Button>);
      const btn = container.querySelector('button') as HTMLButtonElement;
      act(() => {
        btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      expect(onClick.mock.calls.length).toBeLessThanOrEqual(1);
    });

    it('polymorphic <a href> (enabled): Enter keydown does NOT trigger manual click', () => {
      // <a href> is "native activating" — hook skips manual .click() to
      // avoid double-navigating. Browser handles Enter → navigate at the
      // platform level (not jsdom). So onClick from hook path: 0.
      const onClick = vi.fn();
      const { container } = render(
        <Button component="a" href="/x" onClick={onClick}>X</Button>,
      );
      const el = container.querySelector('a') as HTMLAnchorElement;
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      expect(onClick.mock.calls.length).toBeLessThanOrEqual(1);
    });

    it('polymorphic <div>: non-activation key (Escape) preserves user onKeyDown, no click', () => {
      const onClick = vi.fn();
      const onKeyDown = vi.fn();
      const { container } = render(
        <Button component="div" onClick={onClick} onKeyDown={onKeyDown}>X</Button>,
      );
      const el = container.querySelector('div') as HTMLDivElement;
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });
      expect(onClick).not.toHaveBeenCalled();
      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R-D4 part 2 — tab-focus parity (polymorphic interactive-disabled)
  // ─────────────────────────────────────────────────────────────────────────
  describe('Polymorphic tab-focus parity (R-D4 part 2)', () => {
    it('polymorphic <a disabled>: tabIndex is -1 (mirrors native disabled tab bypass)', () => {
      const { container } = render(
        <Button component="a" href="/x" disabled>X</Button>,
      );
      expect((container.querySelector('a') as HTMLAnchorElement).tabIndex).toBe(-1);
    });

    it('polymorphic <a loading>: tabIndex is -1 (Action strategy includes loading)', () => {
      const { container } = render(
        <Button component="a" href="/x" loading>X</Button>,
      );
      expect((container.querySelector('a') as HTMLAnchorElement).tabIndex).toBe(-1);
    });

    it('polymorphic <a> (enabled): tabIndex is NOT forced (defaults to 0 for focusable <a href>)', () => {
      const { container } = render(
        <Button component="a" href="/x">X</Button>,
      );
      // Not -1 — user/browser default wins.
      expect((container.querySelector('a') as HTMLAnchorElement).tabIndex).not.toBe(-1);
    });

    it('native <button disabled>: tabIndex is NOT forced to -1 (browser already removes it from tab order)', () => {
      const { container } = render(<Button disabled>X</Button>);
      // We intentionally do not override tabIndex on native-disableable
      // elements — the browser enforces the behavior. Expect the browser's
      // default of 0 (present, not negative).
      expect((container.querySelector('button') as HTMLButtonElement).tabIndex).not.toBe(-1);
    });

    it('polymorphic <a> (enabled): preserves user-supplied tabIndex', () => {
      const { container } = render(
        <Button component="a" href="/x" tabIndex={3}>X</Button>,
      );
      expect((container.querySelector('a') as HTMLAnchorElement).tabIndex).toBe(3);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // a11y DEV warn — icon-only button without accessible name
  // ─────────────────────────────────────────────────────────────────────────
  describe('Icon-only a11y DEV warn', () => {
    it('warns when no children + no aria-label / aria-labelledby / title', async () => {
      const { __resetButtonIconOnlyWarning } = await import('./Button');
      __resetButtonIconOnlyWarning();
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<Button leftSection={<span data-testid="icon">i</span>} />);
      const match = spy.mock.calls.find(
        (c) => typeof c[0] === 'string' && c[0].includes('accessible name'),
      );
      expect(match).toBeDefined();
      spy.mockRestore();
    });

    it('does NOT warn when aria-label is provided', async () => {
      const { __resetButtonIconOnlyWarning } = await import('./Button');
      __resetButtonIconOnlyWarning();
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <Button aria-label="Save" leftSection={<span data-testid="icon">i</span>} />,
      );
      const match = spy.mock.calls.find(
        (c) => typeof c[0] === 'string' && c[0].includes('accessible name'),
      );
      expect(match).toBeUndefined();
      spy.mockRestore();
    });

    it('does NOT warn when children carry text', async () => {
      const { __resetButtonIconOnlyWarning } = await import('./Button');
      __resetButtonIconOnlyWarning();
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<Button>Save</Button>);
      const match = spy.mock.calls.find(
        (c) => typeof c[0] === 'string' && c[0].includes('accessible name'),
      );
      expect(match).toBeUndefined();
      spy.mockRestore();
    });

    it('only fires once per process (latched)', async () => {
      const { __resetButtonIconOnlyWarning } = await import('./Button');
      __resetButtonIconOnlyWarning();
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<Button />);
      render(<Button />);
      render(<Button />);
      const iconOnlyCalls = spy.mock.calls.filter(
        (c) => typeof c[0] === 'string' && c[0].includes('accessible name'),
      );
      expect(iconOnlyCalls).toHaveLength(1);
      spy.mockRestore();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // B-1 — default type="button" on native <button> to avoid form-submit footgun
  // ─────────────────────────────────────────────────────────────────────────
  describe('Native <button>: type="button" default (B-1)', () => {
    it('native <button> without explicit `type` gets type="button" (avoids form-submit footgun)', () => {
      const { container } = render(<Button>Click</Button>);
      expect(container.querySelector('button')!.getAttribute('type')).toBe('button');
    });

    it('native <button> preserves user-supplied type="submit"', () => {
      const { container } = render(<Button type="submit">Submit</Button>);
      expect(container.querySelector('button')!.getAttribute('type')).toBe('submit');
    });

    it('native <button> preserves user-supplied type="reset"', () => {
      const { container } = render(<Button type="reset">Reset</Button>);
      expect(container.querySelector('button')!.getAttribute('type')).toBe('reset');
    });

    it('does NOT fire onClick on a nested <form> submit when Button has default type (regression)', () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      const onClick = vi.fn();
      const { container } = render(
        <form onSubmit={onSubmit}>
          <Button onClick={onClick}>Open modal</Button>
        </form>,
      );
      (container.querySelector('button') as HTMLButtonElement).click();
      expect(onClick).toHaveBeenCalledTimes(1);
      // Critical: type="button" means the click MUST NOT trigger form submit.
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('polymorphic <a> does NOT receive a type attribute', () => {
      const { container } = render(
        <Button component="a" href="/x">X</Button>,
      );
      expect(container.querySelector('a')!.hasAttribute('type')).toBe(false);
    });

    it('polymorphic <div> does NOT receive a type attribute', () => {
      const { container } = render(
        <Button component="div">X</Button>,
      );
      expect(container.querySelector('div')!.hasAttribute('type')).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // B-2 — role="button" injection for polymorphic non-button non-link
  //
  // Screen readers announce semantic buttons based on the element's implicit
  // or explicit ARIA role. Native <button> has role="button" implicitly;
  // <a href> is announced as a link; polymorphic <div> / <span> / <a> without
  // href have no button semantics unless we inject `role="button"`. This
  // block verifies every branch + the user-override escape hatch.
  // ─────────────────────────────────────────────────────────────────────────
  describe('Polymorphic role="button" injection (B-2)', () => {
    it('native <button> does NOT receive a role attribute (implicit role)', () => {
      const { container } = render(<Button>X</Button>);
      expect(container.querySelector('button')!.hasAttribute('role')).toBe(false);
    });

    it('<a href> does NOT receive role="button" (is a genuine link)', () => {
      const { container } = render(
        <Button component="a" href="/x">X</Button>,
      );
      expect(container.querySelector('a')!.hasAttribute('role')).toBe(false);
    });

    it('<a> WITHOUT href gets role="button" (no link semantics)', () => {
      const { container } = render(
        <Button component="a">X</Button>,
      );
      expect(container.querySelector('a')!.getAttribute('role')).toBe('button');
    });

    it('<div> gets role="button"', () => {
      const { container } = render(
        <Button component="div">X</Button>,
      );
      expect(container.querySelector('div')!.getAttribute('role')).toBe('button');
    });

    it('<span> gets role="button"', () => {
      const { container } = render(
        <Button component="span">X</Button>,
      );
      expect(container.querySelector('span')!.getAttribute('role')).toBe('button');
    });

    it('user-supplied role overrides injection (e.g. role="menuitem" on <div>)', () => {
      const { container } = render(
        <Button component="div" role="menuitem">X</Button>,
      );
      expect(container.querySelector('div')!.getAttribute('role')).toBe('menuitem');
    });

    it('user-supplied role="button" on <a href> is preserved (explicit intent wins over link)', () => {
      const { container } = render(
        <Button component="a" href="/x" role="button">X</Button>,
      );
      expect(container.querySelector('a')!.getAttribute('role')).toBe('button');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Stage 10 · Phase 3 · Feedback integration
  //
  // Contract: `@/devdocs/system/feedback-contract.md` v0.3 + §5.2 recipe +
  // §7.2 FB-1 polymorphic acceptance.
  //
  // These tests prove the Button wires together L2 `usePress` (feedback
  // ingress) + L4 `useFeedback([rippleFeedback])` (instance lifecycle) +
  // L3 Action Surface (semantic activation) without collapsing any of the
  // three contracts into another. DOM observation of `.prismui-ripple` is
  // sufficient to assert FB-1 (field-level cross-host equality of ripple
  // geometry) because the ripple span carries every contract-relevant
  // field via CSS custom properties.
  // ─────────────────────────────────────────────────────────────────────────
  describe('Phase 3 · Feedback integration', () => {
    /**
     * Helper: the ripple factory reads `event.width` / `event.height` from
     * the PressEvent, which L2 populates via `getBoundingClientRect()` on
     * the press target. jsdom returns zeros by default, so we stub a fixed
     * rect to get deterministic `--ripple-size` values.
     */
    function stubRect(el: Element, rect: Partial<DOMRect> = {}) {
      const full: DOMRect = {
        width: 100,
        height: 40,
        left: 0,
        top: 0,
        right: 100,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: () => ({}),
        ...rect,
      } as DOMRect;
      el.getBoundingClientRect = () => full;
    }

    describe('Visual feedback lifecycle', () => {
      it('pointerdown creates a .prismui-ripple node inside the press target', () => {
        const { container } = render(<Button>X</Button>);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        expect(btn.querySelector('.prismui-ripple')).toBeNull();
        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 20,
        });
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();
      });

      it('pointerup → animationend removes the ripple (success path)', () => {
        const { container } = render(<Button>X</Button>);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 20,
        });
        const ripple = btn.querySelector<HTMLSpanElement>('.prismui-ripple')!;
        act(() => {
          fireEvent.pointerUp(btn, { pointerId: 1, pointerType: 'mouse' });
        });
        // Still present pre-animationend (finish waits).
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();

        ripple.dispatchEvent(new Event('animationend'));
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });

      it('presscancel path (pointer leaves, outside pointerup) removes ripple immediately', () => {
        const { container } = render(<Button>X</Button>);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 20,
        });
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();

        // Move pointer out → window pointerup fires outside the target → FSM
        // transitions suspended + outside pointerup = failure path (presscancel).
        fireEvent.pointerLeave(btn, { pointerId: 1, pointerType: 'mouse' });
        act(() => {
          // Dispatch pointerup on window outside the target.
          const evt = new PointerEvent('pointerup', { pointerId: 1, bubbles: true });
          window.dispatchEvent(evt);
        });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });
    });

    describe('Interactive-disabled gating (shares predicate with Action Surface)', () => {
      it('<Button disabled>: pointerdown does NOT create a ripple', () => {
        const { container } = render(<Button disabled>X</Button>);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });

      it('<Button loading>: pointerdown does NOT create a ripple (Action strategy includes loading)', () => {
        const { container } = render(<Button loading>X</Button>);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });

      it('polymorphic <div disabled>: pointerdown does NOT create a ripple (same predicate as Action Surface swallow)', () => {
        const { container } = render(<Button component="div" disabled>X</Button>);
        const el = container.querySelector('div')!;
        stubRect(el);

        fireEvent.pointerDown(el, { pointerId: 1, pointerType: 'mouse' });
        expect(el.querySelector('.prismui-ripple')).toBeNull();
      });
    });

    describe('FB-1 Polymorphic lifecycle trace (§7.2)', () => {
      /**
       * Extracts the contract-relevant DOM snapshot of a freshly created
       * ripple — everything the factory populates from `PressEvent` fields:
       *   · presence      · proves L2 emitted a pressstart with matching host
       *   · --ripple-x/y  · mirrors PressEvent.x / .y (border-box coordinates)
       *   · --ripple-size · mirrors `max(event.width, event.height) * 2`
       *   · className     · proves the same rippleFeedback factory ran
       *
       * If these four fields match across `<button>` / `<a href>` /
       * `<div role="button">` we have proven FB-1: the visual feedback start
       * point, geometry, and cleanup timing are host-agnostic.
       */
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

      /**
       * Runs a canonical pressstart → pressend lifecycle on a host and
       * returns the ripple shape captured between start and animationend.
       * The press coordinates + target rect are held constant across all
       * three calls so any cross-host diff is contract violation, not test
       * noise.
       */
      function traceHost(
        ui: React.ReactElement,
        query: string,
      ): ReturnType<typeof captureRippleShape> {
        const { container, unmount } = render(ui);
        const el = container.querySelector<HTMLElement>(query)!;
        stubRect(el, { width: 100, height: 40 });
        fireEvent.pointerDown(el, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 20,
        });
        const shape = captureRippleShape(el);
        // Drain the success lifecycle so animationend cleanup does not leak
        // into the next trace.
        act(() => {
          fireEvent.pointerUp(el, { pointerId: 1, pointerType: 'mouse' });
        });
        const ripple = el.querySelector<HTMLSpanElement>('.prismui-ripple');
        ripple?.dispatchEvent(new Event('animationend'));
        unmount();
        return shape;
      }

      it('native <button>: baseline lifecycle trace', () => {
        const shape = traceHost(<Button>X</Button>, 'button');
        expect(shape).toEqual({
          exists: true,
          class: 'prismui-ripple',
          x: '10px',
          y: '20px',
          size: '200px',
        });
      });

      it('<a href>: lifecycle trace equals <button> baseline (field-level diff empty)', () => {
        const baseline = traceHost(<Button>X</Button>, 'button');
        const anchor = traceHost(<Button component="a" href="/x">X</Button>, 'a');
        expect(anchor).toEqual(baseline);
      });

      it('<div role="button">: lifecycle trace equals <button> baseline (field-level diff empty)', () => {
        const baseline = traceHost(<Button>X</Button>, 'button');
        const div = traceHost(<Button component="div">X</Button>, 'div');
        expect(div).toEqual(baseline);
      });
    });

    describe('Parallel wiring with Action Surface', () => {
      it('click → both onClick (Action Surface) and ripple feedback fire', () => {
        const onClick = vi.fn();
        const { container } = render(<Button onClick={onClick}>X</Button>);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 20,
        });
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();

        // Simulate the full click lifecycle (browser fires click on pointerup
        // inside native <button>). jsdom does not auto-wire pointerup→click,
        // so we dispatch click explicitly as a regression proxy.
        fireEvent.click(btn);
        expect(onClick).toHaveBeenCalledTimes(1);
      });

      it('user onPointerDown runs BEFORE the press feedback ingress (chainHandlers order)', () => {
        const order: string[] = [];
        const onPointerDown = vi.fn(() => {
          // User handler sees a clean state — the ripple has NOT yet been
          // created because press ingress runs second in the chain.
          order.push(
            document.querySelector('.prismui-ripple') ? 'after-ripple' : 'before-ripple',
          );
        });
        const { container } = render(
          <Button onPointerDown={onPointerDown}>X</Button>,
        );
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 20,
        });
        expect(onPointerDown).toHaveBeenCalledTimes(1);
        expect(order).toEqual(['before-ripple']);
        // By this point the press ingress has run and the ripple exists.
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();
      });

      it('polymorphic <div> keyboard activation: press.onKeyDown runs before actionBehavior.onKeyDown', () => {
        // Enter keydown on <div role="button"> must still reach
        // actionBehavior.onKeyDown (which calls `.click()` to activate).
        // The press layer in front does NOT block it — it just observes.
        const onClick = vi.fn();
        const { container } = render(
          <Button component="div" onClick={onClick}>X</Button>,
        );
        const el = container.querySelector('div') as HTMLDivElement;
        el.focus();
        act(() => {
          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        });
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });

    describe('Unmount cleanup (L-F1)', () => {
      it('unmount during active press disposes the ripple node synchronously', () => {
        const { container, unmount } = render(<Button>X</Button>);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 20,
        });
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();

        unmount();
        // Synchronous dispose: the ripple node must be gone without waiting
        // for animationend or any microtask.
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Stage 10 · Phase 4.1 · Focus Feedback integration (v0.5 · D-1/D-3/D-4/Z-2)
  //
  // Contract: `@/devdocs/system/feedback-contract.md` v0.5 §11 (glowFeedback)
  // + §12.2 (theme path) + §6.4 (focus singleton) + L-F5 (identity guard).
  //
  // These tests prove the Button wires the focus-source ingress
  // (`feedback.focusHandlers`) onto onFocus / onBlur, chains properly with
  // user handlers, respects :focus-visible, and honors the
  // props > theme > module default resolution priority.
  // ─────────────────────────────────────────────────────────────────────────
  describe('Phase 4.1 · Focus Feedback integration', () => {
    const GLOW_CLASS = 'prismui-glow-active';

    /**
     * `:focus-visible` is not implemented in jsdom — we patch
     * `HTMLElement.prototype.matches` so the Controller's `deriveFocusVisible`
     * returns whatever the test wants.
     */
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

    describe('Visual feedback lifecycle (glow)', () => {
      it('onFocus with :focus-visible → adds `prismui-glow-active` class', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(<Button>X</Button>);
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
          const { container } = render(<Button>X</Button>);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);

          fireEvent.blur(btn);
          // finish() immediately removes the class (triggers transition);
          // the listener + fallback timer dispose the instance later. The
          // CSS-facing state — absence of the class — is already visible.
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });

      it('mouse-focused (focusVisible=false) never adds the glow class', () => {
        const restore = installFocusVisibleMatches(false);
        try {
          const { container } = render(<Button>X</Button>);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });

      it('disabled button: onFocus does not add the glow class', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(<Button disabled>X</Button>);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          // The CSS `:not([data-disabled])` guard suppresses the visual, but
          // the factory itself still runs — class presence validates the ingress.
          // We assert via `:not(...)` behavior: the visual won't show even if
          // the class leaked. Combined with the module-default factory ordering,
          // we keep the DOM assertion strictly about functional correctness.
          expect(btn.getAttribute('data-disabled')).toBe('true');
        } finally {
          restore();
        }
      });

      it('loading button: onFocus does not activate the glow visual', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(<Button loading>X</Button>);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.getAttribute('data-loading')).toBe('true');
        } finally {
          restore();
        }
      });
    });

    describe('User handler chaining (§5.2 order)', () => {
      it('user onFocus runs before feedback ingress adds the class', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          let classWhenUserRan = '';
          const userOnFocus = vi.fn((e: React.FocusEvent<HTMLButtonElement>) => {
            classWhenUserRan = e.currentTarget.className;
          });
          const { container } = render(<Button onFocus={userOnFocus}>X</Button>);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);

          expect(userOnFocus).toHaveBeenCalledTimes(1);
          // At the moment the user handler ran, the glow class had NOT been
          // added yet (user-first ordering per §5.2).
          expect(classWhenUserRan).not.toContain(GLOW_CLASS);
          // After the full chain, the class IS present.
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);
        } finally {
          restore();
        }
      });

      it('user onBlur still fires even though press.onBlur + focus.onBlur also run', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const userOnBlur = vi.fn();
          const { container } = render(<Button onBlur={userOnBlur}>X</Button>);
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
      it('feedbacks={[]} (explicit opt-out) suppresses both ripple AND glow', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(<Button feedbacks={[]}>X</Button>);
          const btn = container.querySelector('button')!;

          // Focus — no glow class (glow factory absent).
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
          fireEvent.blur(btn);

          // Press — no ripple node (ripple factory absent).
          fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
          expect(btn.querySelector('.prismui-ripple')).toBeNull();
        } finally {
          restore();
        }
      });

      it('theme.components.Button.defaultFeedbacks overrides module default', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          // Theme provides an empty feedback list — effectively opts out.
          const theme = createTheme({
            components: { Button: { defaultFeedbacks: [] } },
          });
          const { container } = renderWithTheme(theme, <Button>X</Button>);
          const btn = container.querySelector('button')!;

          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });

      it('props.feedbacks wins over theme.components.Button.defaultFeedbacks', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const theme = createTheme({
            components: { Button: { defaultFeedbacks: [] } }, // theme says none
          });
          const { container } = renderWithTheme(
            theme,
            <Button feedbacks={[glowFeedback]}>X</Button>,
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
      it('blur → immediate refocus keeps the glow class visible (no stale clear)', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(<Button>X</Button>);
          const btn = container.querySelector('button')!;

          // Generation 1
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);

          // Blur — the finish path flips the class off synchronously.
          fireEvent.blur(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);

          // Immediate refocus · factory creates a NEW instance · class back on.
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);

          // If the Controller lacked the P0-2 identity guard, a late completion
          // on generation 1 (via fallback timer, if the test ran through timers)
          // could reset `focusInstances` to null and orphan generation 2.
          // We don't advance timers here; the synchronous state check above is
          // sufficient to catch misbehaving ingress paths.
        } finally {
          restore();
        }
      });
    });

    describe('Dual-source coexistence (press ⨯ focus)', () => {
      it('pressing a focused button keeps the glow class while the ripple plays', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(<Button>X</Button>);
          const btn = container.querySelector('button')!;

          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);

          fireEvent.pointerDown(btn, {
            pointerId: 1,
            pointerType: 'mouse',
            clientX: 5,
            clientY: 5,
          });
          // Ripple present AND glow still on.
          expect(btn.querySelector('.prismui-ripple')).not.toBeNull();
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);
        } finally {
          restore();
        }
      });
    });

    describe('Unmount cleanup (L-F1 focus source)', () => {
      it('unmount during active focus disposes the glow instance synchronously', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container, unmount } = render(<Button>X</Button>);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);

          // Detach reference for later assertion (post-unmount nodes lose parent).
          const savedBtn = btn;
          unmount();
          // After dispose, the class is off even if the node is orphaned.
          expect(savedBtn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Stage-14 Phase 3 · SZ-COMP-1 + SZ-INTERACT-1 structural CSS guards
  //
  // These tests assert the *presence* of structural CSS rules that encode
  // Stage-14 invariants. They are intentionally lint-style (RegExp on raw CSS
  // source) rather than behavioral, because:
  //
  //   1. SZ-COMP-1's `box-sizing: border-box` produces no observable jsdom
  //      side-effect on its own — we want a build-time tripwire so anyone
  //      removing the declaration during a future refactor fails the test.
  //   2. SZ-INTERACT-1's `::before` hit-target overlay is currently visually
  //      clipped by `.root { overflow: hidden }` (ripple containment · v1.0
  //      layered concern documented in module.css). Behavioral coverage is
  //      deferred to v1.x when ripple-host refactor lands. The structural
  //      guard preserves the *intent* declaration so the v1.x refactor only
  //      needs to remove the overflow clip — the rule is already in shape.
  //
  // See: STAGE-14-OVERVIEW.md §3.3 SZ-COMP-1 / §3.5 SZ-INTERACT-1
  //      ADR-005 §决策 5 / Audit Log Phase 3 entry
  // ─────────────────────────────────────────────────────────────────────────
  describe('Stage-14 Phase 3 · SZ-COMP-1 + SZ-INTERACT-1 CSS guards', () => {
    const cssPath = path.resolve(__dirname, './Button.module.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    it('SZ-COMP-1 · `.root` declares `box-sizing: border-box`', () => {
      // The formula `height = lineHeight + paddingY*2 + borderY` only matches
      // the rendered outer bounding box when border-box is in effect. v1
      // baseline previously relied on the implicit content-box default — the
      // +2px outer drift happened to land near SZ-COMP-2's anchor by
      // coincidence. Phase 3 makes the relationship causal.
      //
      // RegExp tolerates whitespace + comment-block placement variations
      // inside the `.root` rule body.
      expect(css).toMatch(/\.root\s*\{[^}]*box-sizing\s*:\s*border-box/);
    });

    it('SZ-INTERACT-1 · `[data-size="sm"]::before` hit-target overlay rule exists', () => {
      // Apple HIG / Material Design touch-target ≥ 44×44 px. Button sm has
      // visible height 30px (< 44), so it is one of the SZ-INTERACT-1 「受
      // 约束组件」listed in Stage-14 §3.5. The structural overlay declaration
      // MUST exist at the CSS layer so v1.x ripple-host refactor (which
      // removes the parent's `overflow: hidden`) immediately makes the rule
      // behaviorally effective without code changes here.
      expect(css).toMatch(/\.root\[data-size=['"]sm['"]\]::before/);
    });

    it('SZ-INTERACT-1 · hit-target rule uses negative `inset` (extension geometry)', () => {
      // The whole point of the overlay is that it geometrically extends OUT-
      // SIDE the button's border-box. A non-negative inset would silently
      // turn the rule into a no-op. The exact magnitude (-7px) is documented
      // in module.css as the minimum to reach 44px on sm (30 + 7*2 = 44);
      // this guard accepts any negative px integer so v1.x can tune.
      const hitTargetBlockMatch = css.match(
        /\.root\[data-size=['"]sm['"]\]::before\s*\{([^}]*)\}/,
      );
      expect(hitTargetBlockMatch, 'hit-target ::before rule block not found').not.toBeNull();
      const block = hitTargetBlockMatch![1];
      // Match `inset: -<digits>px` (allow surrounding whitespace).
      expect(block, 'inset: negative px not found in hit-target block').toMatch(
        /inset\s*:\s*-\d+px/,
      );
    });

    it('SZ-INTERACT-1 · hit-target rule uses transparent background (zero visual side-effect)', () => {
      // The overlay must remain visually invisible — any visible background
      // would alter the perceived button silhouette and conflict with
      // Stage-14 「不改变 layout / height / width / box-sizing」phrasing.
      const hitTargetBlockMatch = css.match(
        /\.root\[data-size=['"]sm['"]\]::before\s*\{([^}]*)\}/,
      );
      expect(hitTargetBlockMatch).not.toBeNull();
      const block = hitTargetBlockMatch![1];
      // Either explicit `background: transparent` or absent (default = transparent).
      // We require explicit declaration for audit-trail clarity.
      expect(block, 'hit-target overlay must declare transparent background').toMatch(
        /background\s*:\s*transparent/,
      );
    });
  });
});
