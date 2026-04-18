/**
 * Stage 3 Step 10 · A-2 / B-1 / B-2 — Action Surface polymorphic behavior hook.
 *
 * Test matrix axes:
 *   • Element kind:   native-button | a+href (link) | a (no href) | div | custom component
 *   • Interactive:    false | true
 *   • User overrides: onClick / onKeyDown / tabIndex / type / role  — passed or omitted
 *
 * Contracts verified:
 *   (1) Event swallow:     click + Enter/Space blocked iff isInteractiveDisabled
 *   (2) Tab-focus parity:  tabIndex=-1 only on polymorphic non-disableable + interactive-disabled
 *   (3) type="button":     injected only for literal <button> when user type absent
 *   (4) role="button":     injected only for polymorphic non-button non-link when user role absent
 */
import { describe, it, expect, vi } from 'vitest';
import { resolvePolymorphicActionBehavior } from './resolve-polymorphic-action-behavior';

const CustomComp: React.ComponentType = () => null;

function mkEvent(extra: Partial<Event> = {}): any {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
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
  // (3) type="button" default (B-1)
  // ────────────────────────────────────────────────────────────────────────
  describe('type="button" default (B-1)', () => {
    it('native <button> without user type → injects type="button"', () => {
      const result = resolvePolymorphicActionBehavior('button', {
        isInteractiveDisabled: false,
      });
      expect(result.type).toBe('button');
    });

    it('native <button> with user type="submit" → preserved', () => {
      const result = resolvePolymorphicActionBehavior('button', {
        isInteractiveDisabled: false,
        type: 'submit',
      });
      expect(result.type).toBe('submit');
    });

    it('native <button> with user type="reset" → preserved', () => {
      const result = resolvePolymorphicActionBehavior('button', {
        isInteractiveDisabled: false,
        type: 'reset',
      });
      expect(result.type).toBe('reset');
    });

    it('polymorphic <a> → type key omitted', () => {
      const result = resolvePolymorphicActionBehavior('a', {
        isInteractiveDisabled: false,
        href: '/x',
      });
      expect('type' in result).toBe(false);
    });

    it('polymorphic <div> → type key omitted', () => {
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
      });
      expect('type' in result).toBe(false);
    });

    it('custom component → type key omitted', () => {
      const result = resolvePolymorphicActionBehavior(CustomComp, {
        isInteractiveDisabled: false,
      });
      expect('type' in result).toBe(false);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // (4) role="button" injection (B-2)
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
  // Result shape — "only-defined-keys" guarantee
  // ────────────────────────────────────────────────────────────────────────
  describe('result shape', () => {
    it('omits optional keys rather than returning undefined (safe spread)', () => {
      const result = resolvePolymorphicActionBehavior('button', {
        isInteractiveDisabled: false,
      });
      // Only onClick + onKeyDown + type should be defined for a plain <button>.
      expect(Object.keys(result).sort()).toEqual(['onClick', 'onKeyDown', 'type'].sort());
    });

    it('<div> fully-unused → onClick + onKeyDown + role (tabIndex/type omitted)', () => {
      const result = resolvePolymorphicActionBehavior('div', {
        isInteractiveDisabled: false,
      });
      expect(Object.keys(result).sort()).toEqual(
        ['onClick', 'onKeyDown', 'role'].sort(),
      );
    });
  });
});
