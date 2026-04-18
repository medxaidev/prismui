/**
 * Stage 3 Step 10 · A-2 / B-2 / F-1 — Action Surface polymorphic behavior hook.
 *
 * Test matrix axes:
 *   • Element kind:   native-button | a+href (link) | a (no href) | div | custom component
 *   • Interactive:    false | true
 *   • User overrides: onClick / onKeyDown / tabIndex / role  — passed or omitted
 *
 * Contracts verified:
 *   (1) Pointer swallow:    click blocked iff isInteractiveDisabled
 *   (2) Keyboard two-sided:
 *         (2a) swallow:     Enter/Space blocked iff isInteractiveDisabled
 *         (2b) activate:    Enter/Space → .click() on polymorphic non-native
 *                           elements (F-1 · honors role="button" contract)
 *   (3) Tab-focus parity:   tabIndex=-1 only on polymorphic non-disableable + interactive-disabled
 *   (4) role="button":      injected only for polymorphic non-button non-link when user role absent
 *   (5) isActivationKey:    exported predicate for future Action hooks
 *
 * NOT verified here (deliberately):
 *   • type="button" default (B-1) — migrated back to component layer (see
 *     Button.test.tsx "B-1" block). The hook no longer touches `type`.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  resolvePolymorphicActionBehavior,
  isActivationKey,
} from './resolve-polymorphic-action-behavior';

const CustomComp: React.ComponentType = () => null;

function mkEvent(extra: Partial<Event> = {}): any {
  // `currentTarget.click` stub is provided by default so the F-1 keyboard
  // activation branch (which calls `e.currentTarget.click()` on polymorphic
  // non-native elements) doesn't throw in tests that don't care about it.
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    currentTarget: { click: vi.fn() },
    ...extra,
  };
}

describe('resolvePolymorphicActionBehavior', () => {
  // ────────────────────────────────────────────────────────────────────────
  // (1) Event swallow
  // ────────────────────────────────────────────────────────────────────────
  describe('event swallow (R-D4)', () => {
    it('passes click through to user when not interactive-disabled', () => {
      const onClick = vi.fn();
      const result = resolvePolymorphicActionBehavior('button', {
        isInteractiveDisabled: false,
        onClick,
      });
      const e = mkEvent();
      result.onClick(e);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(e.stopPropagation).not.toHaveBeenCalled();
    });

    it('swallows click (preventDefault + stopPropagation) when interactive-disabled', () => {
      const onClick = vi.fn();
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: true,
        onClick,
      });
      const e = mkEvent();
      result.onClick(e);
      expect(onClick).not.toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalledTimes(1);
      expect(e.stopPropagation).toHaveBeenCalledTimes(1);
    });

    it('swallows Enter keydown when interactive-disabled (preventDefault only — no stopPropagation)', () => {
      const onKeyDown = vi.fn();
      const result = resolvePolymorphicActionBehavior('a', {
        isInteractiveDisabled: true,
        onKeyDown,
      });
      const e = mkEvent({ key: 'Enter' } as any);
      result.onKeyDown(e);
      expect(onKeyDown).not.toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalledTimes(1);
      // Parent dialogs may still want other keys — do NOT stopPropagation.
      expect(e.stopPropagation).not.toHaveBeenCalled();
    });

    it('swallows Space keydown when interactive-disabled', () => {
      const onKeyDown = vi.fn();
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: true,
        onKeyDown,
      });
      const e = mkEvent({ key: ' ' } as any);
      result.onKeyDown(e);
      expect(onKeyDown).not.toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('passes OTHER keys (Escape / Tab / arrows) through even when interactive-disabled', () => {
      const onKeyDown = vi.fn();
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: true,
        onKeyDown,
      });
      for (const key of ['Escape', 'Tab', 'ArrowDown', 'a']) {
        const e = mkEvent({ key } as any);
        result.onKeyDown(e);
        expect(e.preventDefault).not.toHaveBeenCalled();
      }
      expect(onKeyDown).toHaveBeenCalledTimes(4);
    });

    it('tolerates missing user handlers (no throw)', () => {
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
      });
      expect(() => result.onClick(mkEvent())).not.toThrow();
      expect(() => result.onKeyDown(mkEvent({ key: 'Enter' } as any))).not.toThrow();
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // (2) Tab-focus parity (R-D4 part 2)
  // ────────────────────────────────────────────────────────────────────────
  describe('tab-focus parity', () => {
    it('native <button> + interactive-disabled → keeps user tabIndex (browser handles removal)', () => {
      const result = resolvePolymorphicActionBehavior('button', {
        isInteractiveDisabled: true,
        tabIndex: 3,
      });
      expect(result.tabIndex).toBe(3);
    });

    it('native <button> without user tabIndex → omits tabIndex key entirely', () => {
      const result = resolvePolymorphicActionBehavior('button', {
        isInteractiveDisabled: false,
      });
      expect('tabIndex' in result).toBe(false);
    });

    it('polymorphic <div> + interactive-disabled → tabIndex=-1 (overrides user value)', () => {
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: true,
        tabIndex: 5,
      });
      expect(result.tabIndex).toBe(-1);
    });

    it('polymorphic <a> + interactive-disabled → tabIndex=-1', () => {
      const result = resolvePolymorphicActionBehavior('a', {
        isInteractiveDisabled: true,
        href: '/x',
      });
      expect(result.tabIndex).toBe(-1);
    });

    it('polymorphic <div> + NOT interactive-disabled → user tabIndex preserved', () => {
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
        tabIndex: 7,
      });
      expect(result.tabIndex).toBe(7);
    });

    it('custom component + interactive-disabled → tabIndex=-1 (conservative polymorphic)', () => {
      const result = resolvePolymorphicActionBehavior(CustomComp, {
        isInteractiveDisabled: true,
      });
      expect(result.tabIndex).toBe(-1);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // (3) role="button" injection (B-2)
  // ────────────────────────────────────────────────────────────────────────
  describe('role="button" injection (B-2)', () => {
    it('native <button> → role key omitted (has implicit role)', () => {
      const result = resolvePolymorphicActionBehavior('button', {
        isInteractiveDisabled: false,
      });
      expect('role' in result).toBe(false);
    });

    it('<a href> → role key omitted (genuine link)', () => {
      const result = resolvePolymorphicActionBehavior('a', {
        isInteractiveDisabled: false,
        href: '/x',
      });
      expect('role' in result).toBe(false);
    });

    it('<a> WITHOUT href → role="button" (no native link semantics)', () => {
      const result = resolvePolymorphicActionBehavior('a', {
        isInteractiveDisabled: false,
      });
      expect(result.role).toBe('button');
    });

    it('<div> → role="button"', () => {
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
      });
      expect(result.role).toBe('button');
    });

    it('<span> → role="button"', () => {
      const result = resolvePolymorphicActionBehavior('span', {
        isInteractiveDisabled: false,
      });
      expect(result.role).toBe('button');
    });

    it('custom component → role="button" (conservative a11y default)', () => {
      const result = resolvePolymorphicActionBehavior(CustomComp, {
        isInteractiveDisabled: false,
      });
      expect(result.role).toBe('button');
    });

    it('user-supplied role → preserved (even on <div>)', () => {
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
        role: 'menuitem',
      });
      expect(result.role).toBe('menuitem');
    });

    it('user-supplied role="button" → preserved (idempotent)', () => {
      const result = resolvePolymorphicActionBehavior('a', {
        isInteractiveDisabled: false,
        role: 'button',
      });
      expect(result.role).toBe('button');
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // (2b) Keyboard activation parity (R-D4 Phase 3 · F-1)
  //
  // On polymorphic non-native elements (`<div>` / `<span>` / `<a>` without
  // href / custom components) the hook must convert Enter/Space into a
  // `.click()` call so the injected `role="button"` contract is honest.
  // Native `<button>` and `<a href>` are skipped — the browser already
  // handles keyboard activation there; firing `.click()` would double.
  // ────────────────────────────────────────────────────────────────────────
  describe('keyboard activation (R-D4 Phase 3 · F-1)', () => {
    function mkKeyEvent(key: string, click: () => void) {
      return {
        key,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        currentTarget: { click },
      } as any;
    }

    it('<div> + Enter (enabled) → simulates click + preventDefault', () => {
      const click = vi.fn();
      const userOnKeyDown = vi.fn();
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
        onKeyDown: userOnKeyDown,
      });
      const e = mkKeyEvent('Enter', click);
      result.onKeyDown(e);
      expect(click).toHaveBeenCalledTimes(1);
      expect(e.preventDefault).toHaveBeenCalledTimes(1);
      // User keydown still fires — activation is additive, not replacing.
      expect(userOnKeyDown).toHaveBeenCalledTimes(1);
    });

    it('<div> + Space (enabled) → simulates click + preventDefault (scroll guard)', () => {
      const click = vi.fn();
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
      });
      const e = mkKeyEvent(' ', click);
      result.onKeyDown(e);
      expect(click).toHaveBeenCalledTimes(1);
      // Space preventDefault is critical — otherwise the page scrolls.
      expect(e.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('<span> + Enter (enabled) → simulates click', () => {
      const click = vi.fn();
      const result = resolvePolymorphicActionBehavior('span', {
        isInteractiveDisabled: false,
      });
      result.onKeyDown(mkKeyEvent('Enter', click));
      expect(click).toHaveBeenCalledTimes(1);
    });

    it('<a> without href + Enter (enabled) → simulates click', () => {
      const click = vi.fn();
      const result = resolvePolymorphicActionBehavior('a', {
        isInteractiveDisabled: false,
      });
      result.onKeyDown(mkKeyEvent('Enter', click));
      expect(click).toHaveBeenCalledTimes(1);
    });

    it('custom component + Enter (enabled) → simulates click (conservative polymorphic)', () => {
      const click = vi.fn();
      const result = resolvePolymorphicActionBehavior(CustomComp, {
        isInteractiveDisabled: false,
      });
      result.onKeyDown(mkKeyEvent('Enter', click));
      expect(click).toHaveBeenCalledTimes(1);
    });

    it('native <button> + Enter (enabled) → NO simulated click (browser handles it)', () => {
      const click = vi.fn();
      const result = resolvePolymorphicActionBehavior('button', {
        isInteractiveDisabled: false,
      });
      result.onKeyDown(mkKeyEvent('Enter', click));
      expect(click).not.toHaveBeenCalled();
    });

    it('<a href> + Enter (enabled) → NO simulated click (browser navigates)', () => {
      const click = vi.fn();
      const result = resolvePolymorphicActionBehavior('a', {
        isInteractiveDisabled: false,
        href: '/x',
      });
      result.onKeyDown(mkKeyEvent('Enter', click));
      expect(click).not.toHaveBeenCalled();
    });

    it('<div> + Enter (DISABLED) → swallows; no click, no user handler', () => {
      const click = vi.fn();
      const userOnKeyDown = vi.fn();
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: true,
        onKeyDown: userOnKeyDown,
      });
      const e = mkKeyEvent('Enter', click);
      result.onKeyDown(e);
      expect(click).not.toHaveBeenCalled();
      expect(userOnKeyDown).not.toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('<div> + non-activation key (Escape) → no click, user handler fires', () => {
      const click = vi.fn();
      const userOnKeyDown = vi.fn();
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
        onKeyDown: userOnKeyDown,
      });
      const e = mkKeyEvent('Escape', click);
      result.onKeyDown(e);
      expect(click).not.toHaveBeenCalled();
      expect(userOnKeyDown).toHaveBeenCalledTimes(1);
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('<div> activation then user-provided onKeyDown both observe the event', () => {
      const click = vi.fn();
      const userOnKeyDown = vi.fn();
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
        onKeyDown: userOnKeyDown,
      });
      result.onKeyDown(mkKeyEvent(' ', click));
      expect(click).toHaveBeenCalledTimes(1);
      expect(userOnKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // (5) isActivationKey — exported Action-system primitive
  // ────────────────────────────────────────────────────────────────────────
  describe('isActivationKey', () => {
    it('returns true for Enter', () => {
      expect(isActivationKey('Enter')).toBe(true);
    });
    it('returns true for Space (single-char " ")', () => {
      expect(isActivationKey(' ')).toBe(true);
    });
    it('returns false for "Space" string literal (common typo footgun)', () => {
      expect(isActivationKey('Space')).toBe(false);
    });
    it('returns false for other navigation/action keys', () => {
      for (const k of ['Escape', 'Tab', 'ArrowDown', 'ArrowUp', 'a', '', 'Meta']) {
        expect(isActivationKey(k)).toBe(false);
      }
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // Result shape — "only-defined-keys" guarantee
  // ────────────────────────────────────────────────────────────────────────
  describe('result shape', () => {
    it('omits optional keys rather than returning undefined (safe spread)', () => {
      const result = resolvePolymorphicActionBehavior('button', {
        isInteractiveDisabled: false,
      });
      // Only onClick + onKeyDown should be defined for a plain <button>.
      // `type` is NOT in scope for this hook — handled at the component layer.
      expect(Object.keys(result).sort()).toEqual(['onClick', 'onKeyDown'].sort());
    });

    it('<div> fully-unused → onClick + onKeyDown + role (tabIndex omitted)', () => {
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
      });
      expect(Object.keys(result).sort()).toEqual(
        ['onClick', 'onKeyDown', 'role'].sort(),
      );
    });
  });
});
