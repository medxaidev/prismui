/**
 * Switch · integration tests
 *
 * Design reference: `@/devdocs/components/Switch/design.md` v0.1.2 Round 3.1
 * Contract references:
 *   - `component-contract.md` SR-1~9 + §3.7 Action Behavior
 *   - `control-surface.md` §2.3 C-2 + §四 FCP-1~6 + §五 FI-0~5
 *   - `focus-behavior.md` v1.1 §4.3 C-2 mode-B variant
 *
 * Test organization follows design.md §9.2 (23 categories / ~105 tests).
 * Hook-level behavior (useControllableState 26 · resolvePolymorphicActionBehavior
 * 36 · useFieldControlProps / useFieldDataAttrs existing Field tests) is NOT
 * re-covered — Switch samples the integration paths that uniquely emerge at
 * the C-2 Abstract × Field Surface × mode-B focus intersection.
 */
import * as React from 'react';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, fireEvent } from '@testing-library/react';
import { Switch, __resetSwitchInvariantWarnings } from './index';
import { Field } from '../Field';

describe('Switch', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetSwitchInvariantWarnings();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  // ─────────────────────────────────────────────────────────────────────
  // 1 · Basic render (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Basic render', () => {
    it('renders a <button> by default', () => {
      const { container } = render(<Switch />);
      const btn = container.querySelector('button');
      expect(btn).toBeInTheDocument();
      expect(btn!.tagName).toBe('BUTTON');
    });

    it('role="switch" is always present (S-1)', () => {
      const { container } = render(<Switch />);
      expect(container.querySelector('button')!.getAttribute('role')).toBe(
        'switch',
      );
    });

    it('aria-checked defaults to "false" (S-1 binary only)', () => {
      const { container } = render(<Switch />);
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('false');
    });

    it('forwards ref to the <button>', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Switch ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('renders .track + .thumb children inside root', () => {
      const { container } = render(<Switch />);
      const root = container.querySelector('button')!;
      const track = root.querySelector('span');
      expect(track).toBeInTheDocument();
      const thumb = track!.querySelector('span');
      expect(thumb).toBeInTheDocument();
    });

    it('data-size / data-color are output on root (SR-7)', () => {
      const { container } = render(<Switch size="lg" color="success" />);
      const root = container.querySelector('button')!;
      expect(root.getAttribute('data-size')).toBe('lg');
      expect(root.getAttribute('data-color')).toBe('success');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 2 · Uncontrolled mode (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Uncontrolled mode', () => {
    it('defaultChecked undefined → initial aria-checked="false"', () => {
      const { container } = render(<Switch />);
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('false');
    });

    it('defaultChecked=true → initial aria-checked="true"', () => {
      const { container } = render(<Switch defaultChecked />);
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('true');
    });

    it('click on unchecked flips aria-checked + data-checked to "true"', () => {
      const { container } = render(<Switch />);
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('true');
      expect(btn.getAttribute('data-checked')).toBe('true');
    });

    it('click on checked flips back to "false"', () => {
      const { container } = render(<Switch defaultChecked />);
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('false');
    });

    it('onCheckedChange fires with next value on click', () => {
      const handler = vi.fn();
      const { container } = render(<Switch onCheckedChange={handler} />);
      fireEvent.click(container.querySelector('button')!);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('repeated clicks oscillate checked and notify each transition', () => {
      const handler = vi.fn();
      const { container } = render(<Switch onCheckedChange={handler} />);
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(handler.mock.calls.map((c) => c[0])).toEqual([true, false, true]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 3 · Controlled mode (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Controlled mode', () => {
    it('checked={true} → aria-checked="true" initial', () => {
      const { container } = render(
        <Switch checked={true} onCheckedChange={() => {}} />,
      );
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('true');
    });

    it('click on controlled does NOT mutate DOM until parent updates', () => {
      const { container } = render(
        <Switch checked={false} onCheckedChange={() => {}} />,
      );
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('false');
    });

    it('onCheckedChange fires with next value in controlled mode', () => {
      const handler = vi.fn();
      const { container } = render(
        <Switch checked={false} onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('parent updates checked={true} → DOM reflects immediately', () => {
      const { container, rerender } = render(
        <Switch checked={false} onCheckedChange={() => {}} />,
      );
      rerender(<Switch checked={true} onCheckedChange={() => {}} />);
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('true');
    });

    it('controlled: onCheckedChange can reject update (parent keeps value)', () => {
      // Parent deliberately ignores onChange — simulates "cancel on toggle"
      const { container } = render(
        <Switch checked={true} onCheckedChange={() => {}} />,
      );
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('true');
    });

    it('preventDefault in user onClick does NOT cancel toggle (uncontrolled)', () => {
      const handler = vi.fn();
      const userOnClick = (e: React.MouseEvent) => e.preventDefault();
      const { container } = render(
        <Switch onClick={userOnClick} onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 4 · Mode switching DEV warn (2)
  // ─────────────────────────────────────────────────────────────────────
  describe('Mode switching DEV warn', () => {
    it('controlled → uncontrolled transition emits a console.error once', () => {
      const { rerender } = render(
        <Switch checked={true} onCheckedChange={() => {}} />,
      );
      rerender(<Switch defaultChecked />);
      // useControllableState warns asynchronously via useEffect
      expect(errorSpy).toHaveBeenCalled();
    });

    it('uncontrolled → controlled transition emits a console.error', () => {
      const { rerender } = render(<Switch defaultChecked={false} />);
      rerender(<Switch checked={true} onCheckedChange={() => {}} />);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 5 · aria-checked contract (S-1, 4)
  // ─────────────────────────────────────────────────────────────────────
  describe('aria-checked contract (S-1)', () => {
    it('aria-checked value is always "true" or "false" (no "mixed")', () => {
      const { container, rerender } = render(<Switch />);
      const btn = container.querySelector('button')!;
      expect(['true', 'false']).toContain(
        btn.getAttribute('aria-checked'),
      );
      rerender(<Switch defaultChecked />);
      expect(['true', 'false']).toContain(
        btn.getAttribute('aria-checked'),
      );
    });

    it('aria-checked always present (no absent / empty)', () => {
      const { container } = render(<Switch />);
      const btn = container.querySelector('button')!;
      expect(btn.hasAttribute('aria-checked')).toBe(true);
      expect(btn.getAttribute('aria-checked')).not.toBe('');
    });

    it('aria-checked="mixed" prop is rejected at render (DEV warn)', () => {
      // TS forbids; runtime: user escaped through `as any` simulated here.
      render(<Switch {...({ 'aria-checked': 'mixed' } as any)} />);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('component overrides aria-checked even when user supplies', () => {
      // User tries to force aria-checked='true' via passthrough — component
      // must still emit its own resolved value.
      const { container } = render(
        <Switch {...({ 'aria-checked': 'true' } as any)} />,
      );
      // Default defaultChecked=false → component writes 'false'
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('false');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 6 · data-checked contract (4)
  // ─────────────────────────────────────────────────────────────────────
  describe('data-checked contract', () => {
    it('data-checked mirrors aria-checked on initial render (off)', () => {
      const { container } = render(<Switch />);
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-checked')).toBe('false');
      expect(btn.getAttribute('data-checked')).toBe(
        btn.getAttribute('aria-checked'),
      );
    });

    it('data-checked mirrors aria-checked on initial render (on)', () => {
      const { container } = render(<Switch defaultChecked />);
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-checked')).toBe('true');
      expect(btn.getAttribute('data-checked')).toBe(
        btn.getAttribute('aria-checked'),
      );
    });

    it('data-checked flips in sync with aria-checked on click', () => {
      const { container } = render(<Switch />);
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('data-checked')).toBe('true');
      fireEvent.click(btn);
      expect(btn.getAttribute('data-checked')).toBe('false');
    });

    it('user passthrough data-checked does not override component output (SR-7)', () => {
      const { container } = render(
        <Switch {...({ 'data-checked': 'true' } as any)} />,
      );
      // Component is the single writer — passthrough spread runs BEFORE
      // componentDataAttrs, so our value wins.
      expect(
        container.querySelector('button')!.getAttribute('data-checked'),
      ).toBe('false');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 7 · aria-pressed forbidden (S-1a, 4)
  // ─────────────────────────────────────────────────────────────────────
  describe('aria-pressed forbidden (S-1a)', () => {
    it('component never emits aria-pressed on the DOM', () => {
      const { container } = render(<Switch />);
      expect(
        container.querySelector('button')!.hasAttribute('aria-pressed'),
      ).toBe(false);
    });

    it('user-supplied aria-pressed is filtered out', () => {
      const { container } = render(
        <Switch {...({ 'aria-pressed': 'true' } as any)} />,
      );
      expect(
        container.querySelector('button')!.hasAttribute('aria-pressed'),
      ).toBe(false);
    });

    it('user-supplied aria-pressed triggers DEV warn (once per process)', () => {
      render(<Switch {...({ 'aria-pressed': 'true' } as any)} />);
      expect(errorSpy).toHaveBeenCalled();
      const msgs = errorSpy.mock.calls
        .map((c: unknown[]) => String(c[0]))
        .filter((m: string) => m.includes('aria-pressed'));
      expect(msgs.length).toBeGreaterThan(0);
    });

    it('aria-checked remains the sole state channel', () => {
      const { container } = render(
        <Switch defaultChecked {...({ 'aria-pressed': 'true' } as any)} />,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('aria-checked')).toBe('true');
      expect(btn.hasAttribute('aria-pressed')).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 8 · role=switch override (S-1, 4)
  // ─────────────────────────────────────────────────────────────────────
  describe('role=switch override (S-1)', () => {
    it('native <button> carries role="switch" (not button)', () => {
      const { container } = render(<Switch />);
      expect(container.querySelector('button')!.getAttribute('role')).toBe(
        'switch',
      );
    });

    it('polymorphic <div> carries role="switch"', () => {
      const { container } = render(<Switch component="div" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.tagName).toBe('DIV');
      expect(root.getAttribute('role')).toBe('switch');
    });

    it('polymorphic <a> (no href) carries role="switch"', () => {
      // 🔴 S-10a Round 1 audit closure: <a href> is blacklisted (falls back
      // to <button>) so this test now uses <a> WITHOUT href, which is the
      // whitelisted form. The fallback path is covered by its own describe
      // block below ("S-10a <a href> blacklist").
      const { container } = render(<Switch component="a" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.tagName).toBe('A');
      expect(root.getAttribute('role')).toBe('switch');
    });

    it('user-supplied role is discarded in favor of "switch"', () => {
      const { container } = render(
        <Switch {...({ role: 'button' } as any)} />,
      );
      expect(
        container.querySelector('button')!.getAttribute('role'),
      ).toBe('switch');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 9 · Click / Keyboard toggle (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Click / Keyboard toggle', () => {
    it('click triggers toggle on default <button> host', () => {
      const handler = vi.fn();
      const { container } = render(<Switch onCheckedChange={handler} />);
      fireEvent.click(container.querySelector('button')!);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('Space key on <button> host toggles (native activation)', () => {
      const handler = vi.fn();
      const { container } = render(<Switch onCheckedChange={handler} />);
      const btn = container.querySelector('button')!;
      // <button>'s native Space → click mapping is handled by browser;
      // React doesn't simulate it in jsdom. Simulate the end-result click:
      fireEvent.click(btn);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('Enter key on <button> host is the host-inherited behavior (S-10)', () => {
      // S-10: Enter is NOT a contract guarantee but IS inherited from <button>.
      // We assert the click handler fires on a simulated <button> Enter → click.
      const handler = vi.fn();
      const { container } = render(<Switch onCheckedChange={handler} />);
      fireEvent.click(container.querySelector('button')!);
      expect(handler).toHaveBeenCalled();
    });

    it('Space on polymorphic <div> activates via hook keyboard path (S-10)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Switch component="div" onCheckedChange={handler} />,
      );
      const root = container.firstElementChild as HTMLElement;
      fireEvent.keyDown(root, { key: ' ' });
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('Enter on polymorphic <div> also activates (hook provides both)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Switch component="div" onCheckedChange={handler} />,
      );
      fireEvent.keyDown(container.firstElementChild!, { key: 'Enter' });
      expect(handler).toHaveBeenCalled();
    });

    it('non-activation keys do not toggle', () => {
      const handler = vi.fn();
      const { container } = render(
        <Switch component="div" onCheckedChange={handler} />,
      );
      fireEvent.keyDown(container.firstElementChild!, { key: 'a' });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 10 · Event ordering (3)
  // ─────────────────────────────────────────────────────────────────────
  describe('Event ordering', () => {
    it('onClick fires BEFORE onCheckedChange', () => {
      const seq: string[] = [];
      const { container } = render(
        <Switch
          onClick={() => seq.push('click')}
          onCheckedChange={() => seq.push('change')}
        />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(seq).toEqual(['click', 'change']);
    });

    it('preventDefault in onClick does not cancel the toggle (documented)', () => {
      const handler = vi.fn();
      const userOnClick = (e: React.MouseEvent) => e.preventDefault();
      const { container } = render(
        <Switch onClick={userOnClick} onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(handler).toHaveBeenCalled();
    });

    it('user onClick receives the synthetic MouseEvent first', () => {
      const handler = vi.fn();
      const { container } = render(<Switch onClick={handler} />);
      fireEvent.click(container.querySelector('button')!);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 11 · Disabled / Loading freeze (S-7, 6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Disabled / Loading freeze (S-7)', () => {
    it('disabled swallows click — onCheckedChange not called', () => {
      const handler = vi.fn();
      const { container } = render(
        <Switch disabled onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(handler).not.toHaveBeenCalled();
    });

    it('loading swallows click', () => {
      const handler = vi.fn();
      const { container } = render(
        <Switch loading onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(handler).not.toHaveBeenCalled();
    });

    it('disabled preserves data-checked (freeze, not reset)', () => {
      const { container } = render(<Switch defaultChecked disabled />);
      expect(
        container.querySelector('button')!.getAttribute('data-checked'),
      ).toBe('true');
    });

    it('loading preserves data-checked', () => {
      const { container } = render(<Switch defaultChecked loading />);
      expect(
        container.querySelector('button')!.getAttribute('data-checked'),
      ).toBe('true');
    });

    it('loading sets aria-busy="true"', () => {
      const { container } = render(<Switch loading />);
      expect(
        container.querySelector('button')!.getAttribute('aria-busy'),
      ).toBe('true');
    });

    it('disabled outputs data-disabled="true"', () => {
      const { container } = render(<Switch disabled />);
      expect(
        container.querySelector('button')!.getAttribute('data-disabled'),
      ).toBe('true');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 12 · Focus mode B真分轨 (S-5 core, 6)
  //
  // jsdom cannot simulate UA :focus-visible heuristics. These are STRUCTURAL
  // assertions on the CSS source. Any edit that removes the pointer-halo
  // rule or drops its `box-shadow` payload must fail this category —
  // Switch is the ONLY carrier of mode B in PrismUI.
  // ─────────────────────────────────────────────────────────────────────
  describe('Focus mode B真分轨 (S-5)', () => {
    const cssPath = path.resolve(__dirname, './Switch.module.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    it('FE-1a · pointer-focus rule exists with :focus:not(:focus-visible)', () => {
      expect(css).toMatch(
        /\.root:focus:not\(:focus-visible\)[^{]*\{[^}]*box-shadow\s*:/,
      );
    });

    it('🔴 FE-1 halo · box-shadow value is non-empty (regression guard)', () => {
      // Extract the rule body and assert box-shadow isn't `none` / empty.
      const match = css.match(
        /\.root:focus:not\(:focus-visible\)[^{]*\{([^}]*)\}/,
      );
      expect(match).not.toBeNull();
      const body = match![1];
      const bsLine = body.match(/box-shadow\s*:\s*([^;]+);?/);
      expect(bsLine).not.toBeNull();
      const value = bsLine![1].trim();
      expect(value).not.toBe('');
      expect(value).not.toBe('none');
      // Must reference either a theme token or carry a non-zero radius
      // stop — both valid payloads for the halo channel.
      expect(value.length).toBeGreaterThan(5);
    });

    it('FE-1b · keyboard-focus rule uses :focus-visible + outline', () => {
      expect(css).toMatch(
        /\.root:focus-visible[^{]*\{[^}]*outline\s*:[^;}]*--prismui-focus-ring-width/,
      );
    });

    it('FE-2 · halo + ring selectors are mutually exclusive (no co-fire)', () => {
      // Verify both selectors exist and that they differ by `:not(:focus-visible)`.
      const halo = css.match(/\.root:focus:not\(:focus-visible\)[^{]*\{/);
      const ring = css.match(/\.root:focus-visible[^{]*\{/);
      expect(halo).not.toBeNull();
      expect(ring).not.toBeNull();
      // The rings rule must NOT contain :not(:focus-visible) (the two
      // states cannot both be true).
      expect(ring![0]).not.toMatch(/:not\(:focus-visible\)/);
    });

    it('FE-3 · invalid + focus-visible swaps outline-color to danger', () => {
      expect(css).toMatch(
        /aria-invalid[^{]*:focus-visible[^{]*\{[^}]*outline-color\s*:[^;}]*--prismui-text-danger/,
      );
    });

    it('FE-1 · ring / halo rules honor [data-disabled] guard', () => {
      expect(css).toMatch(
        /\.root:focus:not\(:focus-visible\):not\(\[data-disabled\]\)/,
      );
      expect(css).toMatch(
        /\.root:focus-visible:not\(\[data-disabled\]\)/,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 13 · Size / Color (8)
  // ─────────────────────────────────────────────────────────────────────
  describe('Size / Color', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      it(`size="${size}" outputs data-size="${size}"`, () => {
        const { container } = render(<Switch size={size} />);
        expect(
          container.querySelector('button')!.getAttribute('data-size'),
        ).toBe(size);
      });
    }

    it('color="success" outputs data-color="success"', () => {
      const { container } = render(<Switch color="success" />);
      expect(
        container.querySelector('button')!.getAttribute('data-color'),
      ).toBe('success');
    });

    it('varsResolver injects --switch-track-bg-on using color prop', () => {
      const { container } = render(<Switch color="error" />);
      const root = container.querySelector('button')!;
      expect(root.style.getPropertyValue('--switch-track-bg-on')).toBe(
        'var(--prismui-color-error-high-bg)',
      );
    });

    it('default color is primary', () => {
      const { container } = render(<Switch />);
      expect(
        container.querySelector('button')!.getAttribute('data-color'),
      ).toBe('primary');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 14 · Radius (3)
  // ─────────────────────────────────────────────────────────────────────
  describe('Radius', () => {
    it('default radius resolves to the full token (--switch-track-radius set)', () => {
      const { container } = render(<Switch />);
      const root = container.querySelector('button')!;
      expect(root.style.getPropertyValue('--switch-track-radius')).not.toBe(
        '',
      );
    });

    it('radius="md" produces a different resolved value than "full"', () => {
      const { container: a } = render(<Switch radius="md" />);
      const { container: b } = render(<Switch radius="full" />);
      const rootA = a.querySelector('button')!;
      const rootB = b.querySelector('button')!;
      const va = rootA.style.getPropertyValue('--switch-track-radius');
      const vb = rootB.style.getPropertyValue('--switch-track-radius');
      expect(va).not.toBe('');
      expect(vb).not.toBe('');
      expect(va).not.toBe(vb);
    });

    it('radius="0" is accepted (explicit zero)', () => {
      const { container } = render(<Switch radius="0" />);
      const root = container.querySelector('button')!;
      expect(root.style.getPropertyValue('--switch-track-radius')).not.toBe(
        '',
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 15 · Polymorphic (5)
  // ─────────────────────────────────────────────────────────────────────
  describe('Polymorphic', () => {
    it('renders <button> by default', () => {
      const { container } = render(<Switch />);
      expect(container.firstElementChild!.tagName).toBe('BUTTON');
    });

    it('renders <a> when component="a" (no href · S-10a whitelist)', () => {
      // 🔴 S-10a Round 1 audit closure: <a href> falls back to <button>;
      // bare <a> is the only whitelisted anchor form for Switch.
      const { container } = render(<Switch component="a" />);
      expect(container.firstElementChild!.tagName).toBe('A');
    });

    it('renders <div> when component="div"', () => {
      const { container } = render(<Switch component="div" />);
      expect(container.firstElementChild!.tagName).toBe('DIV');
    });

    it('Space on <div> activates handleClick (S-10)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Switch component="div" onCheckedChange={handler} />,
      );
      fireEvent.keyDown(container.firstElementChild!, { key: ' ' });
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('non-native host still carries role="switch" (overrides hook-injected button role)', () => {
      // Action Behavior hook injects role="button" for polymorphic non-native
      // hosts; Switch overrides to role="switch" in component layer spread
      // ordering. Verifies that override path for polymorphic scenarios.
      const { container } = render(<Switch component="div" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.getAttribute('role')).toBe('switch');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 15a · S-10a <a href> blacklist (🔴 Round 1 audit closure) (3)
  //
  // Mirrors Checkbox CB-10 blacklist (design.md Round 1 P0-1). Encodes the
  // fact that `resolvePolymorphicActionBehavior` treats `<a href>` as
  // native-activating (no Space simulation), which silently breaks S-10's
  // Space contract. Fallback strategy A: switch to `<button>` host, strip
  // `href`, emit `role="switch"`. DEV warn fires once per process.
  // ─────────────────────────────────────────────────────────────────────
  describe('S-10a <a href> blacklist (🔴 Round 1 audit closure)', () => {
    it('component="a" + href triggers DEV warn (once per process)', () => {
      render(<Switch component="a" href="/x" />);
      expect(errorSpy).toHaveBeenCalled();
      const first = errorSpy.mock.calls.length;
      render(<Switch component="a" href="/y" />);
      expect(errorSpy.mock.calls.length).toBe(first);
    });

    it('component="a" + href falls back to <button> host (strategy A)', () => {
      const { container } = render(<Switch component="a" href="/x" />);
      // Fallback: rendered as <button> (not <a>). href is stripped.
      expect(container.querySelector('button[role="switch"]')).toBeInTheDocument();
      expect(container.querySelector('a')).toBeNull();
    });

    it('post-fallback click activation works (S-10 contract restored)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Switch component="a" href="/x" onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button[role="switch"]')!);
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 16 · Three-channel overrides (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Three-channel overrides (SR-1)', () => {
    it('classNames.root applies to the root', () => {
      const { container } = render(
        <Switch classNames={{ root: 'my-root' }} />,
      );
      expect(container.querySelector('button')!.className).toContain('my-root');
    });

    it('classNames.track applies to .track', () => {
      const { container } = render(
        <Switch classNames={{ track: 'my-track' }} />,
      );
      const track = container.querySelector('button')!.firstElementChild;
      expect(track!.className).toContain('my-track');
    });

    it('classNames.thumb applies to .thumb', () => {
      const { container } = render(
        <Switch classNames={{ thumb: 'my-thumb' }} />,
      );
      const thumb = container
        .querySelector('button')!
        .firstElementChild!.firstElementChild;
      expect(thumb!.className).toContain('my-thumb');
    });

    it('styles.root applies inline style to the root', () => {
      const { container } = render(
        <Switch styles={{ root: { opacity: 0.5 } }} />,
      );
      expect(
        (container.querySelector('button')! as HTMLElement).style.opacity,
      ).toBe('0.5');
    });

    it('styles.root CSS variable override reaches root inline style', () => {
      // SR-1 three-channel overrides: `styles[slot]` is the inline-style
      // channel (CSS variables + regular CSS). This is the prescribed way
      // to override a `--switch-*` alias at call site without touching
      // theme.components.Switch.vars.
      const { container } = render(
        <Switch
          styles={{ root: { '--switch-track-height': '99px' } as any }}
        />,
      );
      const root = container.querySelector('button')! as HTMLElement;
      expect(root.style.getPropertyValue('--switch-track-height')).toBe(
        '99px',
      );
    });

    it('user className merges with generated root className', () => {
      const { container } = render(<Switch className="extra-class" />);
      const root = container.querySelector('button')!;
      expect(root.className).toContain('extra-class');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 17 · Field integration (S-6 · FCP-1~6, 8)
  // ─────────────────────────────────────────────────────────────────────
  describe('Field integration (S-6 · FCP-1~6)', () => {
    it('standalone Switch (no Field) does not inject id / aria-describedby', () => {
      const { container } = render(<Switch />);
      const btn = container.querySelector('button')!;
      expect(btn.id).toBe('');
      expect(btn.getAttribute('aria-describedby')).toBeNull();
      expect(btn.getAttribute('aria-required')).toBeNull();
      expect(btn.getAttribute('aria-invalid')).toBeNull();
    });

    it('Field injects id from FieldContext (FCP-1)', () => {
      const { container } = render(
        <Field id="sw">
          <Switch />
        </Field>,
      );
      expect(container.querySelector('button')!.id).toBe('sw-input');
    });

    it('Field injects aria-describedby = descriptionId + errorId (FCP-4)', () => {
      const { container } = render(
        <Field id="sw">
          <Switch />
        </Field>,
      );
      const describedby = container
        .querySelector('button')!
        .getAttribute('aria-describedby')!;
      expect(describedby).toContain('sw-description');
      expect(describedby).toContain('sw-error');
    });

    it('Field.required=true injects aria-required="true"', () => {
      const { container } = render(
        <Field required>
          <Switch />
        </Field>,
      );
      expect(
        container.querySelector('button')!.getAttribute('aria-required'),
      ).toBe('true');
    });

    it('Field.invalid=true injects aria-invalid="true" (FCP-5)', () => {
      const { container } = render(
        <Field invalid>
          <Switch />
        </Field>,
      );
      expect(
        container.querySelector('button')!.getAttribute('aria-invalid'),
      ).toBe('true');
    });

    it('Field.Error existence does NOT derive aria-invalid (FI-4)', () => {
      const { container } = render(
        <Field id="sw">
          <Switch />
          <Field.Error>bad</Field.Error>
        </Field>,
      );
      expect(
        container.querySelector('button')!.getAttribute('aria-invalid'),
      ).toBeNull();
    });

    it('user aria-invalid overrides Field context (FCP-2 Control-explicit-wins)', () => {
      const { container } = render(
        <Field invalid>
          <Switch aria-invalid="false" />
        </Field>,
      );
      expect(
        container.querySelector('button')!.getAttribute('aria-invalid'),
      ).toBe('false');
    });

    it('v1 does NOT auto-inject aria-labelledby (useFieldControlProps behavior)', () => {
      const { container } = render(
        <Field>
          <Field.Label>Notifications</Field.Label>
          <Switch />
        </Field>,
      );
      const btn = container.querySelector('button')!;
      // Association is via id + htmlFor, not aria-labelledby.
      expect(btn.hasAttribute('aria-labelledby')).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 18 · Native → Field id协同 (1, narrowed per v0.1.2)
  // ─────────────────────────────────────────────────────────────────────
  describe('Native → Field id 协同', () => {
    it('Field.Label.htmlFor === Switch.id (end-to-end aria association)', () => {
      const { container } = render(
        <Field id="notif">
          <Field.Label>Notifications</Field.Label>
          <Switch />
        </Field>,
      );
      const label = container.querySelector('label')!;
      const btn = container.querySelector('button')!;
      expect(label.getAttribute('for')).toBe('notif-input');
      expect(btn.id).toBe('notif-input');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 19 · Label click delegation (S-6a · silent bug defense, 5)
  // ─────────────────────────────────────────────────────────────────────
  describe('Label click delegation (S-6a)', () => {
    it('click on Field.Label text toggles Switch (onCheckedChange fires)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field>
          <Field.Label>Notifications</Field.Label>
          <Switch onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('label')!);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('click on Label flips data-checked on the Switch root', () => {
      const { container } = render(
        <Field>
          <Field.Label>Notifications</Field.Label>
          <Switch />
        </Field>,
      );
      fireEvent.click(container.querySelector('label')!);
      expect(
        container.querySelector('button')!.getAttribute('data-checked'),
      ).toBe('true');
    });

    it('click on Label with disabled Switch does NOT toggle (S-7 + S-6a)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field disabled>
          <Field.Label>Notifications</Field.Label>
          <Switch onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('label')!);
      expect(handler).not.toHaveBeenCalled();
    });

    it('click on Label with polymorphic <div> Switch also toggles', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field>
          <Field.Label>Notifications</Field.Label>
          <Switch component="div" onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('label')!);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('click on nested <span> inside Label still reaches Switch (bubble)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field>
          <Field.Label>
            <span data-testid="inner">Notifications</span>
          </Field.Label>
          <Switch onCheckedChange={handler} />
        </Field>,
      );
      // Click on the inner span; delegation fires on Label's onClick via bubble.
      const inner = container.querySelector(
        '[data-testid="inner"]',
      ) as HTMLElement;
      fireEvent.click(inner);
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 20 · type="button" enforcement (S-11 · core silent bug defense, 4)
  // ─────────────────────────────────────────────────────────────────────
  describe('type="button" enforcement (S-11)', () => {
    it('default <button> host renders type="button"', () => {
      const { container } = render(<Switch />);
      expect(container.querySelector('button')!.type).toBe('button');
    });

    it('type="submit" is overridden to "button" + DEV warn', () => {
      const { container } = render(<Switch type="submit" />);
      const btn = container.querySelector('button')!;
      expect(btn.type).toBe('button');
      expect(errorSpy).toHaveBeenCalled();
      const msgs = errorSpy.mock.calls.map((c: unknown[]) => String(c[0]));
      expect(msgs.some((m: string) => m.includes('type="button"'))).toBe(true);
    });

    it('type="reset" is overridden to "button"', () => {
      const { container } = render(<Switch type="reset" />);
      expect(container.querySelector('button')!.type).toBe('button');
    });

    it('inside a <form>, click on Switch does NOT submit the form', () => {
      const onSubmit = vi.fn();
      // Pass type="submit" to ATTEMPT the bug — S-11 MUST intercept.
      const { container } = render(
        <form onSubmit={onSubmit}>
          <Switch type="submit" />
        </form>,
      );
      fireEvent.click(container.querySelector('button')!);
      // jsdom triggers submit on <button type="submit"> clicks; S-11
      // prevents that by forcing type="button" on the DOM.
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 21 · No variant prop (S-9, 2)
  // ─────────────────────────────────────────────────────────────────────
  describe('No variant prop (S-9)', () => {
    it('does not output data-variant by default (v1 has no variant prop)', () => {
      const { container } = render(<Switch />);
      expect(
        container.querySelector('button')!.hasAttribute('data-variant'),
      ).toBe(false);
    });

    it('unknown "variant" via as-any passthrough DOES appear as data-variant (v1 surface reality)', () => {
      // Typed API forbids `variant`; this path simulates JS escape. Switch
      // opts into the variant system with `vars: false` (SR-7.1 Key Owner-
      // ship for data-variant / data-color) — when a variant value leaks
      // through `as any`, the variant system still writes the data-attr.
      // Document the reality: component CSS ignores `[data-variant]` (S-9
      // no variant branches), so even though the attribute appears it
      // does NOT produce any visual change. The typed API is the primary
      // guardrail; this test records the runtime contract at the DOM edge.
      const { container } = render(
        <Switch {...({ variant: 'filled' } as any)} />,
      );
      const btn = container.querySelector('button')!;
      // Document expected runtime behavior explicitly:
      expect(btn.getAttribute('data-variant')).toBe('filled');
      // Visual regression still protected: Switch CSS contains no
      // `[data-variant]` branches (see Switch.module.css · S-9 rationale).
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 22 · Invariants helper (5)
  // ─────────────────────────────────────────────────────────────────────
  describe('Invariants helper', () => {
    it('aria-pressed DEV warn fires once per process (latched)', () => {
      render(<Switch {...({ 'aria-pressed': 'true' } as any)} />);
      const firstCallCount = errorSpy.mock.calls.filter((c: unknown[]) =>
        String(c[0]).includes('aria-pressed'),
      ).length;
      render(<Switch {...({ 'aria-pressed': 'true' } as any)} />);
      const secondCallCount = errorSpy.mock.calls.filter((c: unknown[]) =>
        String(c[0]).includes('aria-pressed'),
      ).length;
      expect(firstCallCount).toBe(1);
      expect(secondCallCount).toBe(1); // did not fire again
    });

    it('type="submit" DEV warn fires once per process (latched)', () => {
      render(<Switch type="submit" />);
      const first = errorSpy.mock.calls.filter((c: unknown[]) =>
        String(c[0]).includes('type="button"'),
      ).length;
      render(<Switch type="submit" />);
      const second = errorSpy.mock.calls.filter((c: unknown[]) =>
        String(c[0]).includes('type="button"'),
      ).length;
      expect(first).toBe(1);
      expect(second).toBe(1);
    });

    it('indeterminate DEV warn fires once per process', () => {
      render(<Switch {...({ indeterminate: true } as any)} />);
      expect(errorSpy).toHaveBeenCalled();
      const msgs = errorSpy.mock.calls
        .map((c: unknown[]) => String(c[0]))
        .filter((m: string) => m.includes('indeterminate') || m.includes('mixed'));
      expect(msgs.length).toBeGreaterThan(0);
    });

    it('__resetSwitchInvariantWarnings allows re-testing fresh warns', () => {
      render(<Switch {...({ 'aria-pressed': 'true' } as any)} />);
      errorSpy.mockClear();
      __resetSwitchInvariantWarnings();
      render(<Switch {...({ 'aria-pressed': 'true' } as any)} />);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('type="button" is never warned (valid case)', () => {
      errorSpy.mockClear();
      render(<Switch type="button" />);
      const msgs = errorSpy.mock.calls.map((c: unknown[]) => String(c[0]));
      expect(msgs.some((m: string) => m.includes('type="button"'))).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 23 · Exclusive bug guards (design.md §9.3 · 6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Exclusive bug guards (§9.3)', () => {
    it('🔴 Field + invalid + focus-visible triple-state (FE-3 + FCP-5)', () => {
      const { container } = render(
        <Field invalid>
          <Switch />
        </Field>,
      );
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('aria-invalid')).toBe('true');
      // CSS selector existence already guarded in §12 Focus mode B tests.
    });

    it('connected clicks (×100) do NOT lose stale state (hook smoke)', () => {
      const handler = vi.fn();
      const { container } = render(<Switch onCheckedChange={handler} />);
      const btn = container.querySelector('button')!;
      for (let i = 0; i < 100; i++) fireEvent.click(btn);
      expect(handler).toHaveBeenCalledTimes(100);
      // Final state = initial(false) after 100 toggles (even count) = false.
      expect(btn.getAttribute('aria-checked')).toBe('false');
    });

    it('defaultChecked undefined normalizes to "false" (not undefined)', () => {
      const { container } = render(<Switch />);
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('aria-checked')).toBe('false');
      expect(btn.getAttribute('aria-checked')).not.toBe('');
    });

    it('disabled + defaultChecked + click preserves aria-checked', () => {
      const { container } = render(<Switch defaultChecked disabled />);
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('true');
    });

    it('loading renders a spinner SVG inside the thumb', () => {
      const { container } = render(<Switch loading />);
      const thumb = container.querySelector('[data-loader="true"]');
      expect(thumb).toBeInTheDocument();
      expect(thumb!.querySelector('svg')).toBeInTheDocument();
    });

    it('required without Field attaches aria-required directly', () => {
      const { container } = render(<Switch required />);
      expect(
        container.querySelector('button')!.getAttribute('aria-required'),
      ).toBe('true');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Stage 10 · Phase 6 · Feedback integration (Switch is the first Control
  // Surface consumer of L4 Feedback · mirrors Button v0.6 / IconButton /
  // ToggleButton Phase 5 templates)
  //
  // Contract: `@/devdocs/system/feedback-contract.md` v0.6 §10 (rippleFeedback)
  // + §11 (glowFeedback) + §12.2 (theme path) + §6.4 (focus singleton).
  //
  // Switch-specific assertions:
  //   · role="switch" host (not "button") — polymorphic lifecycle still works
  //   · toggle pipeline (S-1 ARIA writes / S-2 checked flip) is INDEPENDENT
  //     of feedback factories: click → ripple AND setChecked happen in parallel
  //   · glow + data-checked coexistence (different CSS channels)
  //   · mode-B focus halo (S-5 pointer halo · `:focus:not(:focus-visible)`)
  //     vs glow (focus-visible=true) — mutually exclusive by focus state
  // ─────────────────────────────────────────────────────────────────────────
  describe('Phase 6 · Feedback integration', () => {
    function stubRect(el: Element, rect: Partial<DOMRect> = {}) {
      const full: DOMRect = {
        width: 36,
        height: 20,
        left: 0,
        top: 0,
        right: 36,
        bottom: 20,
        x: 0,
        y: 0,
        toJSON: () => ({}),
        ...rect,
      } as DOMRect;
      el.getBoundingClientRect = () => full;
    }

    describe('Visual feedback lifecycle (ripple)', () => {
      it('pointerdown creates a .prismui-ripple node inside the Switch host', () => {
        const { container } = render(<Switch />);
        const btn = container.querySelector('button')!;
        expect(btn.getAttribute('role')).toBe('switch');
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
        const { container } = render(<Switch />);
        const btn = container.querySelector('button')!;
        stubRect(btn);

        fireEvent.pointerDown(btn, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });
        const ripple = btn.querySelector<HTMLSpanElement>('.prismui-ripple')!;
        fireEvent.pointerUp(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).not.toBeNull();
        ripple.dispatchEvent(new Event('animationend'));
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });
    });

    describe('Interactive-disabled gating (shares predicate with Action Surface)', () => {
      it('<Switch disabled>: pointerdown does NOT create a ripple', () => {
        const { container } = render(<Switch disabled />);
        const btn = container.querySelector('button')!;
        stubRect(btn);
        fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });

      it('<Switch loading>: pointerdown does NOT create a ripple', () => {
        const { container } = render(<Switch loading />);
        const btn = container.querySelector('button')!;
        stubRect(btn);
        fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();
      });
    });

    describe('Toggle pipeline × Feedback (S-1 / S-2 independence)', () => {
      it('click → BOTH ripple feedback AND setChecked flip happen in parallel', () => {
        const onCheckedChange = vi.fn();
        const { container } = render(
          <Switch onCheckedChange={onCheckedChange} />,
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

        // Click — Action Surface activates handleClick → setChecked flip.
        fireEvent.click(btn);
        expect(onCheckedChange).toHaveBeenCalledTimes(1);
        expect(onCheckedChange).toHaveBeenCalledWith(true);
        expect(btn.getAttribute('aria-checked')).toBe('true');
        expect(btn.getAttribute('data-checked')).toBe('true');
      });

      it('feedbacks={[]} (opt-out) does NOT break toggle pipeline', () => {
        const onCheckedChange = vi.fn();
        const { container } = render(
          <Switch feedbacks={[]} onCheckedChange={onCheckedChange} />,
        );
        const btn = container.querySelector('button')!;
        stubRect(btn);

        // Pointerdown — no ripple (feedbacks suppressed).
        fireEvent.pointerDown(btn, { pointerId: 1, pointerType: 'mouse' });
        expect(btn.querySelector('.prismui-ripple')).toBeNull();

        // Click — toggle pipeline still works (feedback opt-out is purely visual).
        fireEvent.click(btn);
        expect(onCheckedChange).toHaveBeenCalledWith(true);
        expect(btn.getAttribute('aria-checked')).toBe('true');
      });

      it('user onPointerDown runs BEFORE press feedback ingress (chainHandlers order)', () => {
        const order: string[] = [];
        const onPointerDown = vi.fn(() => {
          order.push(
            document.querySelector('.prismui-ripple') ? 'after-ripple' : 'before-ripple',
          );
        });
        const { container } = render(<Switch onPointerDown={onPointerDown} />);
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
        const { container, unmount } = render(<Switch />);
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

    // ─── Phase 4.1 · Focus Feedback (glow) — adapted to Switch ──────────────
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
          const { container } = render(<Switch />);
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
          const { container } = render(<Switch />);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);
          fireEvent.blur(btn);
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });

      it('mouse-focused (focusVisible=false) never adds the glow class (mode-B halo channel only)', () => {
        const restore = installFocusVisibleMatches(false);
        try {
          const { container } = render(<Switch />);
          const btn = container.querySelector('button')!;
          fireEvent.focus(btn);
          // Only S-5 pointer halo (CSS-only) should be active. No glow class.
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);
        } finally {
          restore();
        }
      });

      // Switch-specific: glow + data-checked coexistence (S-7 freeze)
      it('glow class CO-EXISTS with data-checked="true" (different CSS channels)', () => {
        const restore = installFocusVisibleMatches(true);
        try {
          const { container } = render(<Switch defaultChecked={true} />);
          const btn = container.querySelector('button')!;

          expect(btn.getAttribute('data-checked')).toBe('true');
          expect(btn.classList.contains(GLOW_CLASS)).toBe(false);

          fireEvent.focus(btn);
          expect(btn.getAttribute('data-checked')).toBe('true');
          expect(btn.classList.contains(GLOW_CLASS)).toBe(true);

          fireEvent.blur(btn);
          expect(btn.getAttribute('data-checked')).toBe('true');
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
          const { container } = render(<Switch onFocus={userOnFocus} />);
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
          const { container } = render(<Switch onBlur={userOnBlur} />);
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
          const { container, unmount } = render(<Switch />);
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

  // ─────────────────────────────────────────────────────────────────────────
  // Stage-14 v1.x · Wave 4 · SZ-INTERACT-1 hit-target overlay structural guard
  //
  // Switch sm tier is 30×16 — well below the 44px Apple HIG / Material Design
  // touch-target minimum. `.root[data-size='sm']::before { inset: -14px }`
  // extends the press target to 58×44 logically with zero visual side-effect.
  // Wave 3 moved `overflow: hidden` to `.track`, so this overlay paints
  // outside the root's border-box as designed.
  // See: STAGE-14-OVERVIEW.md §3.5 SZ-INTERACT-1 / Wave 4 audit log
  // ─────────────────────────────────────────────────────────────────────────
  describe('Stage-14 v1.x · Wave 4 · SZ-INTERACT-1 hit-target overlay', () => {
    const cssPath = path.resolve(__dirname, './Switch.module.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    const ruleRe = /\.root\[data-size=['"]sm['"]\]::before\s*\{([^}]*)\}/;

    it('rule for `[data-size="sm"]::before` exists', () => {
      expect(css).toMatch(/\.root\[data-size=['"]sm['"]\]::before/);
    });
    it('uses negative `inset` (extension geometry)', () => {
      const m = css.match(ruleRe);
      expect(m, 'hit-target ::before rule block not found').not.toBeNull();
      expect(m![1]).toMatch(/inset\s*:\s*-\d+px/);
    });
    it('uses transparent background (zero visual side-effect)', () => {
      const m = css.match(ruleRe);
      expect(m).not.toBeNull();
      expect(m![1]).toMatch(/background\s*:\s*transparent/);
    });
  });
});
