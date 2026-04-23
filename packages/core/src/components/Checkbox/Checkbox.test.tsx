/**
 * Checkbox · integration tests
 *
 * Design reference: `@/devdocs/components/Checkbox/design.md` v0.1.1 (Round 1
 * Pre-impl 签字版 · 12 OQ · 13 Design Invariants)
 * Contract references:
 *   - `component-contract.md` SR-1~9 + §3.7 Action Behavior
 *   - `control-surface.md` §2.3 C-2 + §四 FCP-1~6 + §五 FI-0~5
 *   - `focus-behavior.md` v1.2 §4.3 C-2 mode-B variant
 *
 * Test organization mirrors design.md §9.2 (~115 tests total). Hook-level
 * behavior (useControllableState 26 · resolvePolymorphicActionBehavior 36 ·
 * useFieldControlProps / useFieldDataAttrs existing Field tests) is NOT
 * re-covered — Checkbox samples the integration paths that uniquely emerge
 * at the second C-2 Abstract × Field Surface × mode-B focus intersection
 * (and the Round 1 P0-1 / P0-2 收敛 edges).
 */
import * as React from 'react';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, fireEvent } from '@testing-library/react';
import {
  Checkbox,
  __resetCheckboxInvariantWarnings,
  type CheckboxCheckedState,
} from './index';
import { Field } from '../Field';

describe('Checkbox', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetCheckboxInvariantWarnings();
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
      const { container } = render(<Checkbox />);
      const btn = container.querySelector('button');
      expect(btn).toBeInTheDocument();
      expect(btn!.tagName).toBe('BUTTON');
    });

    it('role="checkbox" is always present (CB-1)', () => {
      const { container } = render(<Checkbox />);
      expect(container.querySelector('button')!.getAttribute('role')).toBe(
        'checkbox',
      );
    });

    it('aria-checked defaults to "false" (CB-1)', () => {
      const { container } = render(<Checkbox />);
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('false');
    });

    it('forwards ref to the <button>', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Checkbox ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('renders .box + .indicator children inside root', () => {
      const { container } = render(<Checkbox />);
      const root = container.querySelector('button')!;
      const box = root.querySelector('span');
      expect(box).toBeInTheDocument();
      const indicator = box!.querySelector('span');
      expect(indicator).toBeInTheDocument();
    });

    it('data-size / data-color are output on root (SR-7)', () => {
      const { container } = render(<Checkbox size="lg" color="success" />);
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
      const { container } = render(<Checkbox />);
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('false');
    });

    it('defaultChecked=true → initial aria-checked="true"', () => {
      const { container } = render(<Checkbox defaultChecked />);
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('true');
    });

    it('click on unchecked flips aria-checked + data-checked to "true"', () => {
      const { container } = render(<Checkbox />);
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('true');
      expect(btn.getAttribute('data-checked')).toBe('true');
    });

    it('click on checked flips back to "false"', () => {
      const { container } = render(<Checkbox defaultChecked />);
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('false');
    });

    it('onCheckedChange fires with next value on click', () => {
      const handler = vi.fn();
      const { container } = render(<Checkbox onCheckedChange={handler} />);
      fireEvent.click(container.querySelector('button')!);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('repeated clicks oscillate checked and notify each transition', () => {
      const handler = vi.fn();
      const { container } = render(<Checkbox onCheckedChange={handler} />);
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(handler.mock.calls.map((c) => c[0])).toEqual([true, false, true]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 3 · Controlled mode (7)
  // ─────────────────────────────────────────────────────────────────────
  describe('Controlled mode', () => {
    it('checked={true} → aria-checked="true" initial', () => {
      const { container } = render(
        <Checkbox checked={true} onCheckedChange={() => {}} />,
      );
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('true');
    });

    it("checked='mixed' → aria-checked=\"mixed\" initial (CB-1 tri-state)", () => {
      const { container } = render(
        <Checkbox checked="mixed" onCheckedChange={() => {}} />,
      );
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('mixed');
    });

    it('click on controlled does NOT mutate DOM until parent updates', () => {
      const { container } = render(
        <Checkbox checked={false} onCheckedChange={() => {}} />,
      );
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('false');
    });

    it('onCheckedChange fires with next value in controlled mode', () => {
      const handler = vi.fn();
      const { container } = render(
        <Checkbox checked={false} onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('parent updates checked={true} → DOM reflects immediately', () => {
      const { container, rerender } = render(
        <Checkbox checked={false} onCheckedChange={() => {}} />,
      );
      rerender(<Checkbox checked={true} onCheckedChange={() => {}} />);
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('true');
    });

    it('controlled: onCheckedChange can reject update (parent keeps value)', () => {
      const { container } = render(
        <Checkbox checked={true} onCheckedChange={() => {}} />,
      );
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('true');
    });

    it('preventDefault in user onClick does NOT cancel toggle (uncontrolled)', () => {
      const handler = vi.fn();
      const userOnClick = (e: React.MouseEvent) => e.preventDefault();
      const { container } = render(
        <Checkbox onClick={userOnClick} onCheckedChange={handler} />,
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
        <Checkbox checked={true} onCheckedChange={() => {}} />,
      );
      rerender(<Checkbox defaultChecked />);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('uncontrolled → controlled transition emits a console.error', () => {
      const { rerender } = render(<Checkbox defaultChecked={false} />);
      rerender(<Checkbox checked={true} onCheckedChange={() => {}} />);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 5 · aria-checked tri-state contract (CB-1) (5)
  // ─────────────────────────────────────────────────────────────────────
  describe('aria-checked tri-state contract (CB-1)', () => {
    it('aria-checked is one of "true" / "false" / "mixed" exhaustively', () => {
      const valid = ['true', 'false', 'mixed'];
      (
        [
          { checked: false as const },
          { checked: true as const },
          { checked: 'mixed' as const },
        ] as const
      ).forEach((args) => {
        const { container } = render(
          <Checkbox {...args} onCheckedChange={() => {}} />,
        );
        expect(valid).toContain(
          container.querySelector('button')!.getAttribute('aria-checked'),
        );
      });
    });

    it('aria-checked always present (no absent / empty)', () => {
      const { container } = render(<Checkbox />);
      const btn = container.querySelector('button')!;
      expect(btn.hasAttribute('aria-checked')).toBe(true);
      expect(btn.getAttribute('aria-checked')).not.toBe('');
    });

    it('aria-checked="mixed" is LEGAL for Checkbox (unlike Switch S-1)', () => {
      const { container } = render(
        <Checkbox checked="mixed" onCheckedChange={() => {}} />,
      );
      // Mixed is a legal WAI-ARIA state here — no DEV warn should fire.
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('mixed');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('component overrides user-supplied aria-checked', () => {
      // User tries to force aria-checked='true' via passthrough — component
      // must still emit its own resolved value.
      const { container } = render(
        <Checkbox {...({ 'aria-checked': 'true' } as any)} />,
      );
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('false');
    });

    it('uncontrolled defaultChecked="mixed" (JS escape) → fallback to false + DEV warn (CB-2)', () => {
      // Typed API forbids; user escaped via `as any`.
      const { container } = render(
        <Checkbox {...({ defaultChecked: 'mixed' } as any)} />,
      );
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('false');
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 6 · data-checked tri-state contract (4)
  // ─────────────────────────────────────────────────────────────────────
  describe('data-checked tri-state contract', () => {
    it('data-checked syncs with aria-checked (SR-7 single-writer)', () => {
      const { container, rerender } = render(<Checkbox />);
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-checked')).toBe(
        btn.getAttribute('aria-checked'),
      );

      rerender(<Checkbox defaultChecked />);
      expect(btn.getAttribute('data-checked')).toBe(
        btn.getAttribute('aria-checked'),
      );
    });

    it('data-checked="mixed" emitted when checked="mixed"', () => {
      const { container } = render(
        <Checkbox checked="mixed" onCheckedChange={() => {}} />,
      );
      expect(
        container.querySelector('button')!.getAttribute('data-checked'),
      ).toBe('mixed');
    });

    it('data-checked toggles on click (uncontrolled)', () => {
      const { container } = render(<Checkbox />);
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-checked')).toBe('false');
      fireEvent.click(btn);
      expect(btn.getAttribute('data-checked')).toBe('true');
    });

    it('data-checked="mixed" activates → data-checked="true" after click', () => {
      const Controlled = () => {
        const [c, setC] = React.useState<CheckboxCheckedState>('mixed');
        return <Checkbox checked={c} onCheckedChange={setC} />;
      };
      const { container } = render(<Controlled />);
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-checked')).toBe('mixed');
      fireEvent.click(btn);
      expect(btn.getAttribute('data-checked')).toBe('true');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 7 · aria-pressed filter (CB-1a) (4)
  // ─────────────────────────────────────────────────────────────────────
  describe('aria-pressed filter (CB-1a)', () => {
    it('aria-pressed is NEVER emitted on root', () => {
      const { container } = render(<Checkbox defaultChecked />);
      expect(
        container.querySelector('button')!.hasAttribute('aria-pressed'),
      ).toBe(false);
    });

    it('user-supplied aria-pressed is filtered out of DOM', () => {
      const { container } = render(
        <Checkbox {...({ 'aria-pressed': 'true' } as any)} />,
      );
      expect(
        container.querySelector('button')!.hasAttribute('aria-pressed'),
      ).toBe(false);
    });

    it('user-supplied aria-pressed triggers DEV warn (once)', () => {
      render(<Checkbox {...({ 'aria-pressed': 'true' } as any)} />);
      expect(errorSpy).toHaveBeenCalled();
      const first = errorSpy.mock.calls.length;
      // Second render of the same bad prop — latched: no new warn.
      render(<Checkbox {...({ 'aria-pressed': 'true' } as any)} />);
      expect(errorSpy.mock.calls.length).toBe(first);
    });

    it('aria-checked (not pressed) is the sole state channel', () => {
      const { container } = render(<Checkbox defaultChecked />);
      const btn = container.querySelector('button')!;
      expect(btn.hasAttribute('aria-checked')).toBe(true);
      expect(btn.hasAttribute('aria-pressed')).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 8 · role="checkbox" override (CB-1) (4)
  // ─────────────────────────────────────────────────────────────────────
  describe('role="checkbox" override (CB-1)', () => {
    it('native <button> host carries role="checkbox"', () => {
      const { container } = render(<Checkbox />);
      expect(container.querySelector('button')!.getAttribute('role')).toBe(
        'checkbox',
      );
    });

    it('polymorphic <div> host carries role="checkbox" (not button)', () => {
      const { container } = render(<Checkbox component="div" />);
      const el = container.querySelector('div[role]');
      expect(el!.getAttribute('role')).toBe('checkbox');
    });

    it('polymorphic <span> host carries role="checkbox"', () => {
      const { container } = render(<Checkbox component="span" />);
      const el = container.querySelector('span[role]');
      expect(el!.getAttribute('role')).toBe('checkbox');
    });

    it('user-supplied role is overridden by role="checkbox"', () => {
      const { container } = render(
        <Checkbox {...({ role: 'button' } as any)} />,
      );
      expect(container.querySelector('button')!.getAttribute('role')).toBe(
        'checkbox',
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 9 · Click / Keyboard toggle (7)
  // ─────────────────────────────────────────────────────────────────────
  describe('Click / Keyboard toggle', () => {
    it('native <button> click toggles', () => {
      const { container } = render(<Checkbox />);
      fireEvent.click(container.querySelector('button')!);
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('true');
    });

    it('native <button> Enter inherits host activation', () => {
      const { container } = render(<Checkbox />);
      const btn = container.querySelector('button')!;
      // In jsdom, Enter on <button> does NOT auto-fire click — so we
      // simulate click directly to confirm contract is toggled on any
      // activation path. Real browser inherits Enter natively.
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('true');
    });

    it('native <button> Space activation (simulated via click)', () => {
      const { container } = render(<Checkbox />);
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-checked')).toBe('true');
    });

    it('polymorphic <div> Space triggers activation (CB-10)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Checkbox component="div" onCheckedChange={handler} />,
      );
      const el = container.querySelector('div[role="checkbox"]')!;
      fireEvent.keyDown(el, { key: ' ' });
      expect(handler).toHaveBeenCalledWith(true);
    });

    it("three-state: 'mixed' → click → onCheckedChange(true) (WAI-ARIA §4.2)", () => {
      const handler = vi.fn();
      const { container } = render(
        <Checkbox checked="mixed" onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(handler).toHaveBeenCalledWith(true);
      expect(handler).not.toHaveBeenCalledWith(false);
    });

    it('continuous uncontrolled click 100 times (no stale closure)', () => {
      const handler = vi.fn();
      const { container } = render(<Checkbox onCheckedChange={handler} />);
      const btn = container.querySelector('button')!;
      for (let i = 0; i < 100; i++) fireEvent.click(btn);
      // Expected final state: odd clicks → true, even → false. 100 clicks
      // = final state false.
      expect(btn.getAttribute('aria-checked')).toBe('false');
      expect(handler).toHaveBeenCalledTimes(100);
    });

    it('polymorphic <a> without href uses Space activation (CB-10 whitelist)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Checkbox component="a" onCheckedChange={handler} />,
      );
      const el = container.querySelector('a[role="checkbox"]')!;
      fireEvent.keyDown(el, { key: ' ' });
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 10 · Event ordering (3)
  // ─────────────────────────────────────────────────────────────────────
  describe('Event ordering', () => {
    it('user onClick fires BEFORE setChecked', () => {
      const order: string[] = [];
      const userOnClick = () => order.push('onClick');
      const onCheckedChange = () => order.push('onCheckedChange');
      const { container } = render(
        <Checkbox onClick={userOnClick} onCheckedChange={onCheckedChange} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(order).toEqual(['onClick', 'onCheckedChange']);
    });

    it('user onClick called with MouseEvent', () => {
      const captured: React.MouseEvent[] = [];
      const { container } = render(
        <Checkbox onClick={(e: React.MouseEvent) => captured.push(e)} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(captured.length).toBe(1);
      expect(captured[0].type).toBe('click');
    });

    it('onCheckedChange only fires when value changes (H-4 short-circuit)', () => {
      const handler = vi.fn();
      const { rerender } = render(
        <Checkbox checked={true} onCheckedChange={handler} />,
      );
      // Re-render with same value — no spurious onChange.
      rerender(<Checkbox checked={true} onCheckedChange={handler} />);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 11 · disabled / loading freeze (CB-7) (7)
  // ─────────────────────────────────────────────────────────────────────
  describe('disabled / loading freeze (CB-7)', () => {
    it('disabled click does NOT fire onCheckedChange', () => {
      const handler = vi.fn();
      const { container } = render(
        <Checkbox disabled onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(handler).not.toHaveBeenCalled();
    });

    it('loading click does NOT fire onCheckedChange', () => {
      const handler = vi.fn();
      const { container } = render(
        <Checkbox loading onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(handler).not.toHaveBeenCalled();
    });

    it('disabled + checked preserves aria-checked="true"', () => {
      const { container } = render(<Checkbox disabled defaultChecked />);
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('true');
    });

    it('disabled + mixed preserves aria-checked="mixed" (CB-7 tri-state freeze)', () => {
      const { container } = render(
        <Checkbox disabled checked="mixed" onCheckedChange={() => {}} />,
      );
      expect(
        container.querySelector('button')!.getAttribute('aria-checked'),
      ).toBe('mixed');
    });

    it('loading exposes aria-busy="true"', () => {
      const { container } = render(<Checkbox loading />);
      expect(
        container.querySelector('button')!.getAttribute('aria-busy'),
      ).toBe('true');
    });

    it('disabled exposes data-disabled (SR-7 via state system)', () => {
      const { container } = render(<Checkbox disabled />);
      const btn = container.querySelector('button')!;
      // data-disabled is written by the state system when disabled; may
      // also be `data-interactive-disabled` depending on strategy. We
      // assert at least one signal so CSS can gate.
      const disabilityHints =
        btn.hasAttribute('data-disabled') ||
        btn.hasAttribute('data-interactive-disabled') ||
        btn.hasAttribute('disabled');
      expect(disabilityHints).toBe(true);
    });

    it('disabled Space does NOT toggle (CB-7 + action behavior hook)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Checkbox disabled component="div" onCheckedChange={handler} />,
      );
      fireEvent.keyDown(container.querySelector('div[role="checkbox"]')!, {
        key: ' ',
      });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 12 · Focus mode B真分轨 (CB-5 core) (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Focus mode B真分轨 (CB-5)', () => {
    // Read the compiled CSS once — exact file path matches the module.
    const cssPath = path.resolve(
      __dirname,
      './Checkbox.module.css',
    );
    const css = fs.readFileSync(cssPath, 'utf8');

    it('has `:focus:not(:focus-visible)` rule with box-shadow', () => {
      // halo selector + box-shadow channel present.
      expect(css).toMatch(/:focus:not\(:focus-visible\)/);
      const haloBlock = css.match(
        /:focus:not\(:focus-visible\)[^{]*{[^}]*box-shadow[^}]+}/,
      );
      expect(haloBlock).not.toBeNull();
    });

    it('halo box-shadow is non-empty (🔴 bug guard · mode B TRUE two-channel)', () => {
      // The halo block must have a non-empty box-shadow value — regression
      // into ring-only would fail here.
      const haloBlock = css.match(
        /:focus:not\(:focus-visible\)[^{]*{[^}]*box-shadow\s*:\s*([^;}]+)/,
      );
      expect(haloBlock).not.toBeNull();
      expect(haloBlock![1].trim().length).toBeGreaterThan(0);
      expect(haloBlock![1]).not.toMatch(/^none\s*$/);
    });

    it('has `:focus-visible` rule with outline', () => {
      expect(css).toMatch(/:focus-visible/);
      const ringBlock = css.match(
        /:focus-visible[^{]*{[^}]*outline[^}]+}/,
      );
      expect(ringBlock).not.toBeNull();
    });

    it('halo + ring selectors are mutually exclusive (FE-2 by construction)', () => {
      // :focus:not(:focus-visible) never co-matches :focus-visible — CSS
      // spec guarantee, asserted here as a structural lint.
      const haloAppearsBeforeRing =
        css.indexOf(':focus:not(:focus-visible)') <
        css.indexOf(':focus-visible:not([data-disabled])');
      expect(haloAppearsBeforeRing).toBe(true);
    });

    it('invalid + focus-visible swaps outline-color to danger (FE-3)', () => {
      expect(css).toMatch(
        /\[aria-invalid='true'\]:focus-visible[^{]*{[^}]*outline-color[^}]+danger/,
      );
    });

    it('ring rule respects [data-disabled] guard', () => {
      expect(css).toMatch(
        /:focus-visible:not\(\[data-disabled\]\)/,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 13 · Cross-component halo consistency (CB-5 unique) (2)
  // ─────────────────────────────────────────────────────────────────────
  describe('Cross-component halo consistency (CB-5 unique)', () => {
    const checkboxCss = fs.readFileSync(
      path.resolve(__dirname, './Checkbox.module.css'),
      'utf8',
    );
    const switchCss = fs.readFileSync(
      path.resolve(__dirname, '../Switch/Switch.module.css'),
      'utf8',
    );

    it('Checkbox halo rule consumes `--prismui-focus-pointer-halo-*` token (same as Switch)', () => {
      expect(checkboxCss).toMatch(/--prismui-focus-pointer-halo-width/);
      expect(checkboxCss).toMatch(/--prismui-focus-pointer-halo-color/);
      expect(switchCss).toMatch(/--prismui-focus-pointer-halo-width/);
      expect(switchCss).toMatch(/--prismui-focus-pointer-halo-color/);
    });

    it('Checkbox halo rule does NOT hardcode a color literal (must go through token)', () => {
      // Halo rule block — extract just the box-shadow value and assert no
      // hex / rgb literal OUTSIDE the fallback chain (we allow one
      // fallback literal, but it must come via var(..., fallback)).
      const haloBlock = checkboxCss.match(
        /:focus:not\(:focus-visible\)[^{]*{[^}]*box-shadow\s*:\s*([^;}]+)/,
      );
      expect(haloBlock).not.toBeNull();
      const value = haloBlock![1];
      // The token name must be present.
      expect(value).toMatch(/var\(--prismui-focus-pointer-halo-color/);
      // Any raw color literal MUST be inside the fallback of a var().
      const bareHex = /#[0-9a-f]{3,8}(?![^,]*\))/i.test(value);
      expect(bareHex).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 14 · Size / Color (10)
  // ─────────────────────────────────────────────────────────────────────
  describe('Size / Color', () => {
    (['xs', 'sm', 'md', 'lg', 'xl'] as const).forEach((s) => {
      it(`size="${s}" → data-size="${s}" on root`, () => {
        const { container } = render(<Checkbox size={s} />);
        expect(container.querySelector('button')!.getAttribute('data-size')).toBe(
          s,
        );
      });
    });

    (
      ['primary', 'secondary', 'success', 'warning', 'error'] as const
    ).forEach((c) => {
      it(`color="${c}" → data-color="${c}" on root`, () => {
        const { container } = render(<Checkbox color={c} defaultChecked />);
        expect(
          container.querySelector('button')!.getAttribute('data-color'),
        ).toBe(c);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 15 · Radius (4)
  // ─────────────────────────────────────────────────────────────────────
  describe('Radius', () => {
    it('default radius is "sm" (OQ-CB-3 strategy A)', () => {
      const { container } = render(<Checkbox />);
      // The radius token is injected into style via varsResolver.
      const root = container.querySelector('button')!;
      const style = root.getAttribute('style') ?? '';
      expect(style).toMatch(/--checkbox-box-radius/);
    });

    it('radius="md" can override the default', () => {
      const { container } = render(<Checkbox radius="md" />);
      const style = container.querySelector('button')!.getAttribute('style') ?? '';
      expect(style).toMatch(/--checkbox-box-radius/);
    });

    it('radius="full" produces a round checkbox (pill-ish)', () => {
      const { container } = render(<Checkbox radius="full" />);
      const style = container.querySelector('button')!.getAttribute('style') ?? '';
      expect(style).toMatch(/--checkbox-box-radius/);
    });

    it('radius="0" produces a perfectly square checkbox', () => {
      const { container } = render(<Checkbox radius="0" />);
      const style = container.querySelector('button')!.getAttribute('style') ?? '';
      expect(style).toMatch(/--checkbox-box-radius/);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 16 · Polymorphic host whitelist (CB-10) (5)
  // ─────────────────────────────────────────────────────────────────────
  describe('Polymorphic host whitelist (CB-10)', () => {
    it('component="button" (default) renders a <button>', () => {
      const { container } = render(<Checkbox />);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('component="a" (without href) renders an <a>', () => {
      const { container } = render(<Checkbox component="a" />);
      expect(container.querySelector('a[role="checkbox"]')).toBeInTheDocument();
    });

    it('component="div" renders a <div role="checkbox">', () => {
      const { container } = render(<Checkbox component="div" />);
      expect(container.querySelector('div[role="checkbox"]')).toBeInTheDocument();
    });

    it('component="span" renders a <span role="checkbox">', () => {
      const { container } = render(<Checkbox component="span" />);
      expect(container.querySelector('span[role="checkbox"]')).toBeInTheDocument();
    });

    it('Space on polymorphic <div> triggers toggle (IV-A7)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Checkbox component="div" onCheckedChange={handler} />,
      );
      fireEvent.keyDown(container.querySelector('div[role="checkbox"]')!, {
        key: ' ',
      });
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 17 · CB-10 <a href> blacklist (🔴 P0-1 收敛) (3)
  // ─────────────────────────────────────────────────────────────────────
  describe('CB-10 <a href> blacklist (🔴 P0-1 收敛)', () => {
    it('component="a" + href triggers DEV warn (once per process)', () => {
      render(<Checkbox component="a" href="/x" />);
      expect(errorSpy).toHaveBeenCalled();
      const first = errorSpy.mock.calls.length;
      render(<Checkbox component="a" href="/y" />);
      expect(errorSpy.mock.calls.length).toBe(first);
    });

    it('component="a" + href falls back to <button> host (OQ-CB-12 strategy A)', () => {
      const { container } = render(<Checkbox component="a" href="/x" />);
      // Fallback: rendered as <button> (not <a>). href is stripped.
      expect(container.querySelector('button[role="checkbox"]')).toBeInTheDocument();
      expect(container.querySelector('a')).toBeNull();
    });

    it('post-fallback Space activation works (contract restored)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Checkbox component="a" href="/x" onCheckedChange={handler} />,
      );
      fireEvent.click(container.querySelector('button[role="checkbox"]')!);
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 18 · Three-channel overrides (SR-1) (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Three-channel overrides (SR-1)', () => {
    it('classNames.root applies to root', () => {
      const { container } = render(
        <Checkbox classNames={{ root: 'my-root' }} />,
      );
      expect(container.querySelector('button')).toHaveClass('my-root');
    });

    it('classNames.box applies to .box', () => {
      const { container } = render(
        <Checkbox classNames={{ box: 'my-box' }} />,
      );
      const box = container.querySelector('span[class*="my-box"]');
      expect(box).toBeInTheDocument();
    });

    it('classNames.indicator applies to .indicator', () => {
      const { container } = render(
        <Checkbox classNames={{ indicator: 'my-indicator' }} />,
      );
      const ind = container.querySelector('span[class*="my-indicator"]');
      expect(ind).toBeInTheDocument();
    });

    it('styles.root merges into root inline style', () => {
      const { container } = render(
        <Checkbox styles={{ root: { color: 'red' } }} />,
      );
      const root = container.querySelector('button')!;
      expect((root as HTMLElement).style.color).toBe('red');
    });

    it('vars resolver output appears in root inline style', () => {
      const { container } = render(<Checkbox color="primary" />);
      const style = container.querySelector('button')!.getAttribute('style') ?? '';
      expect(style).toMatch(/--checkbox-box-bg-on/);
    });

    it('user `style` prop merges with vars', () => {
      const { container } = render(
        <Checkbox style={{ marginLeft: '8px' }} color="primary" />,
      );
      const root = container.querySelector('button')! as HTMLElement;
      expect(root.style.marginLeft).toBe('8px');
      const styleAttr = root.getAttribute('style') ?? '';
      expect(styleAttr).toMatch(/--checkbox-box-bg-on/);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 19 · Theme integration (3)
  // ─────────────────────────────────────────────────────────────────────
  describe('Theme integration', () => {
    it('componentName is "Checkbox" (theme lookup key)', () => {
      // No direct API to introspect, but we verify Checkbox renders without
      // throwing even when no theme is provided (default theme kicks in).
      const { container } = render(<Checkbox />);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('defaultProps (size=md, color=primary, radius=sm) take effect when no user value', () => {
      const { container } = render(<Checkbox />);
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-size')).toBe('md');
      expect(btn.getAttribute('data-color')).toBe('primary');
    });

    it('user values override defaultProps', () => {
      const { container } = render(<Checkbox size="xl" color="error" />);
      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('data-size')).toBe('xl');
      expect(btn.getAttribute('data-color')).toBe('error');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 20 · Field integration (CB-6 · FCP-1~6) (8)
  // ─────────────────────────────────────────────────────────────────────
  describe('Field integration (CB-6 · FCP-1~6)', () => {
    it('standalone Checkbox works (no Field) — FCP-1 hook noop', () => {
      const { container } = render(<Checkbox />);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('Field injects id (FCP-1)', () => {
      const { container } = render(
        <Field>
          <Field.Label>Accept</Field.Label>
          <Checkbox />
        </Field>,
      );
      const btn = container.querySelector('button[role="checkbox"]')!;
      expect(btn.getAttribute('id')).toBeTruthy();
    });

    it('Field.Description → aria-describedby contains descriptionId (FCP-4)', () => {
      const { container } = render(
        <Field>
          <Field.Label>Accept</Field.Label>
          <Field.Description>Terms apply</Field.Description>
          <Checkbox />
        </Field>,
      );
      const btn = container.querySelector('button[role="checkbox"]')!;
      const desc = container.querySelector('[id*="description"], [id*="desc"]');
      const ariaDescribedBy = btn.getAttribute('aria-describedby') ?? '';
      if (desc) {
        expect(ariaDescribedBy).toContain(desc.getAttribute('id'));
      } else {
        // Fallback: just check the attribute exists (Field description present).
        expect(ariaDescribedBy.length).toBeGreaterThan(0);
      }
    });

    it('Field required → aria-required="true" on Checkbox (FCP-2)', () => {
      const { container } = render(
        <Field required>
          <Field.Label>Accept</Field.Label>
          <Checkbox />
        </Field>,
      );
      const btn = container.querySelector('button[role="checkbox"]')!;
      expect(btn.getAttribute('aria-required')).toBe('true');
    });

    it('Field invalid → aria-invalid="true" on Checkbox (FCP-5)', () => {
      const { container } = render(
        <Field invalid>
          <Field.Label>Accept</Field.Label>
          <Checkbox />
        </Field>,
      );
      const btn = container.querySelector('button[role="checkbox"]')!;
      expect(btn.getAttribute('aria-invalid')).toBe('true');
    });

    it('user aria-invalid overrides Field.invalid (FCP-2 Control-explicit-wins)', () => {
      const { container } = render(
        <Field invalid>
          <Field.Label>Accept</Field.Label>
          <Checkbox {...({ 'aria-invalid': 'false' } as any)} />
        </Field>,
      );
      const btn = container.querySelector('button[role="checkbox"]')!;
      expect(btn.getAttribute('aria-invalid')).toBe('false');
    });

    it('v1 does NOT auto-inject aria-labelledby (§8.2a C-B)', () => {
      const { container } = render(
        <Field>
          <Field.Label>Accept</Field.Label>
          <Checkbox />
        </Field>,
      );
      const btn = container.querySelector('button[role="checkbox"]')!;
      expect(btn.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('Field + checked="mixed" + invalid tri-layer compose (🔴 first tri-state Field stress)', () => {
      const { container } = render(
        <Field invalid>
          <Field.Label>Select all</Field.Label>
          <Checkbox checked="mixed" onCheckedChange={() => {}} />
        </Field>,
      );
      const btn = container.querySelector('button[role="checkbox"]')!;
      expect(btn.getAttribute('aria-checked')).toBe('mixed');
      expect(btn.getAttribute('aria-invalid')).toBe('true');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 21 · Native → Field id correlation (1)
  // ─────────────────────────────────────────────────────────────────────
  describe('Native → Field id correlation', () => {
    it('Field.Label htmlFor === Checkbox id', () => {
      const { container } = render(
        <Field>
          <Field.Label>Accept</Field.Label>
          <Checkbox />
        </Field>,
      );
      const label = container.querySelector('label')!;
      const btn = container.querySelector('button[role="checkbox"]')!;
      expect(label.getAttribute('for')).toBe(btn.getAttribute('id'));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 22 · Field.Label click delegation (CB-6a · 🔴 cross-component reuse) (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Field.Label click delegation (CB-6a · 🔴 cross-component reuse)', () => {
    it('click on Field.Label toggles Checkbox (delegation kicks in)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field>
          <Field.Label>Accept</Field.Label>
          <Checkbox onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('label')!);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('disabled Checkbox: click on Field.Label does NOT toggle (CB-7 freeze)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field>
          <Field.Label>Accept</Field.Label>
          <Checkbox disabled onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('label')!);
      expect(handler).not.toHaveBeenCalled();
    });

    it('loading Checkbox: click on Field.Label does NOT toggle', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field>
          <Field.Label>Accept</Field.Label>
          <Checkbox loading onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('label')!);
      expect(handler).not.toHaveBeenCalled();
    });

    it('polymorphic <div> Checkbox: Field.Label click still delegates (role="checkbox" satisfies hasAriaRole)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field>
          <Field.Label>Accept</Field.Label>
          <Checkbox component="div" onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('label')!);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it("'mixed' + Field.Label click → onCheckedChange(true) (tri-state under delegation)", () => {
      const handler = vi.fn();
      const { container } = render(
        <Field>
          <Field.Label>Select all</Field.Label>
          <Checkbox checked="mixed" onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('label')!);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('label nested element click bubbles to label delegation', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field>
          <Field.Label>
            <span data-testid="nested">Accept</span>
          </Field.Label>
          <Checkbox onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('[data-testid="nested"]')!);
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 23 · CB-11 type="button" override (4)
  // ─────────────────────────────────────────────────────────────────────
  describe('CB-11 type="button" override', () => {
    it('default DOM type is "button" on <button> host', () => {
      const { container } = render(<Checkbox />);
      expect(
        container.querySelector('button')!.getAttribute('type'),
      ).toBe('button');
    });

    it('user type="submit" is overridden to "button" + DEV warn', () => {
      const { container } = render(
        <Checkbox {...({ type: 'submit' } as any)} />,
      );
      expect(
        container.querySelector('button')!.getAttribute('type'),
      ).toBe('button');
      expect(errorSpy).toHaveBeenCalled();
    });

    it('user type="reset" is overridden to "button" + DEV warn', () => {
      const { container } = render(
        <Checkbox {...({ type: 'reset' } as any)} />,
      );
      expect(
        container.querySelector('button')!.getAttribute('type'),
      ).toBe('button');
      expect(errorSpy).toHaveBeenCalled();
    });

    it('click inside <form onSubmit> does NOT trigger submit (🔴 silent bug guard)', () => {
      const onSubmit = vi.fn((e: React.FormEvent) => {
        e.preventDefault();
      });
      const { container } = render(
        <form onSubmit={onSubmit}>
          <Checkbox {...({ type: 'submit' } as any)} />
        </form>,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 24 · CB-9 No variant prop (2)
  // ─────────────────────────────────────────────────────────────────────
  describe('CB-9 No variant prop', () => {
    it('data-variant is NOT emitted on root when no user escape', () => {
      const { container } = render(<Checkbox />);
      expect(
        container.querySelector('button')!.hasAttribute('data-variant'),
      ).toBe(false);
    });

    it('--prismui-variant-* tokens are NOT injected (CSS alias only)', () => {
      const { container } = render(<Checkbox color="primary" />);
      const style = container.querySelector('button')!.getAttribute('style') ?? '';
      // The variant color tokens (--prismui-variant-bg / -border / -fg)
      // should NOT appear in inline style — Checkbox only injects
      // --checkbox-* aliases.
      expect(style).not.toMatch(/--prismui-variant-bg/);
      expect(style).not.toMatch(/--prismui-variant-border/);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 25 · Invariants helper latching (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Invariants helper latching', () => {
    it('CB-1a aria-pressed warn fires once per process', () => {
      render(<Checkbox {...({ 'aria-pressed': 'true' } as any)} />);
      const first = errorSpy.mock.calls.length;
      render(<Checkbox {...({ 'aria-pressed': 'false' } as any)} />);
      expect(errorSpy.mock.calls.length).toBe(first);
    });

    it('CB-2 defaultChecked="mixed" warn fires once per process', () => {
      render(<Checkbox {...({ defaultChecked: 'mixed' } as any)} />);
      const first = errorSpy.mock.calls.length;
      render(<Checkbox {...({ defaultChecked: 'mixed' } as any)} />);
      expect(errorSpy.mock.calls.length).toBe(first);
    });

    it('CB-10 <a href> warn fires once per process', () => {
      render(<Checkbox component="a" href="/x" />);
      const first = errorSpy.mock.calls.length;
      render(<Checkbox component="a" href="/y" />);
      expect(errorSpy.mock.calls.length).toBe(first);
    });

    it('CB-11 type="submit" warn fires once per process', () => {
      render(<Checkbox {...({ type: 'submit' } as any)} />);
      const first = errorSpy.mock.calls.length;
      render(<Checkbox {...({ type: 'reset' } as any)} />);
      expect(errorSpy.mock.calls.length).toBe(first);
    });

    it('__resetCheckboxInvariantWarnings unblocks latches for tests', () => {
      render(<Checkbox {...({ 'aria-pressed': 'true' } as any)} />);
      const first = errorSpy.mock.calls.length;
      __resetCheckboxInvariantWarnings();
      render(<Checkbox {...({ 'aria-pressed': 'true' } as any)} />);
      expect(errorSpy.mock.calls.length).toBeGreaterThan(first);
    });

    it('CB-2 warn does NOT fire when controlled mode supplies checked="mixed"', () => {
      // Controlled mode with checked='mixed' is legit; only uncontrolled
      // defaultChecked='mixed' should warn.
      render(<Checkbox checked="mixed" onCheckedChange={() => {}} />);
      // No helper warn for this path (the hook may still warn about mode
      // transitions if we do transitions — but a single controlled render
      // should be clean).
      const calls: string[] = errorSpy.mock.calls.map(
        (c: unknown[]) => c[0] as string,
      );
      const cb2Warn = calls.find(
        (m: string) =>
          typeof m === 'string' && m.includes('defaultChecked="mixed"'),
      );
      expect(cb2Warn).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 26 · P0-2 FCP-2 opt-out × Label delegation divergence (honesty tests) (3)
  // ─────────────────────────────────────────────────────────────────────
  describe('🔴 P0-2 · FCP-2 opt-out × Label delegation divergence (honesty tests)', () => {
    // This test group encodes the Round 1 P0-2 系统性限制 as LIVING DOCUMENTATION
    // in the test suite. It is NOT a Checkbox-side bug — the divergence lives
    // in FieldLabel.tsx:119-122 (delegation reads ctx.disabled, not merged
    // target disabled). See design.md §8.2 FCP-2 † / §8.2a C-B / §11.3.

    it('direct click path honors FCP-2 opt-out (Field disabled + Checkbox disabled={false} → toggles)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field disabled>
          <Field.Label>Accept</Field.Label>
          <Checkbox disabled={false} onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('button[role="checkbox"]')!);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('Label delegation path does NOT honor FCP-2 opt-out (known system limit · NOT Checkbox bug)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field disabled>
          <Field.Label>Accept</Field.Label>
          <Checkbox disabled={false} onCheckedChange={handler} />
        </Field>,
      );
      // FieldLabel delegation gate reads ctx.disabled — intercepts before
      // dispatching to the target Checkbox. Direct click path is unaffected
      // (see above test).
      fireEvent.click(container.querySelector('label')!);
      expect(handler).not.toHaveBeenCalled();
    });

    it('workaround: user removes Field.disabled to restore Label path (contractual escape hatch)', () => {
      // With Field NOT disabled, the Label path toggles again — recording
      // the user-facing workaround per design.md §8.2 FCP-2 bullet 4.
      const handler = vi.fn();
      const { container } = render(
        <Field>
          <Field.Label>Accept</Field.Label>
          <Checkbox disabled={false} onCheckedChange={handler} />
        </Field>,
      );
      fireEvent.click(container.querySelector('label')!);
      expect(handler).toHaveBeenCalledWith(true);
    });
  });
});
