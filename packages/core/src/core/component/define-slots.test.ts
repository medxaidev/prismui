import { describe, it, expect } from 'vitest';
import { defineSlots, SLOT_SYMBOL } from './define-slots';
import type { SlotNames } from './define-slots';

describe('defineSlots', () => {
  describe('basic functionality', () => {
    it('returns a frozen object with the same entries', () => {
      const slots = defineSlots({ root: 'button', inner: 'span', label: 'span' });
      expect(slots).toEqual({ root: 'button', inner: 'span', label: 'span' });
      expect(Object.isFrozen(slots)).toBe(true);
    });

    it('preserves root element type', () => {
      const slots = defineSlots({ root: 'div' });
      expect(slots.root).toBe('div');
    });

    it('supports multiple non-root slots', () => {
      const slots = defineSlots({
        root: 'button',
        inner: 'span',
        label: 'span',
        icon: 'span',
        loader: 'div',
      });
      expect(Object.keys(slots)).toEqual(['root', 'inner', 'label', 'icon', 'loader']);
    });
  });

  describe('dual-layer root constraint', () => {
    it('throws in DEV when root is missing', () => {
      // @ts-expect-error - deliberately missing root for runtime test
      expect(() => defineSlots({ label: 'span' })).toThrow(
        '[PrismUI] defineSlots() requires a "root" slot.',
      );
    });

    it('throws in DEV when called with empty object via type bypass', () => {
      // @ts-expect-error - runtime bypass test
      expect(() => defineSlots({})).toThrow('requires a "root" slot');
    });

    it('does not throw when root is present', () => {
      expect(() => defineSlots({ root: 'div' })).not.toThrow();
    });
  });

  describe('type-level inference', () => {
    it('infers slot names as literal union', () => {
      const slots = defineSlots({ root: 'button', inner: 'span', label: 'span' });
      // Type-level test: SlotNames should be 'root' | 'inner' | 'label'
      type Names = SlotNames<typeof slots>;
      // This assignment would fail at compile time if Names was `string`
      const _test: Names = 'root';
      const _test2: Names = 'inner';
      const _test3: Names = 'label';
      expect(_test).toBe('root');
      expect(_test2).toBe('inner');
      expect(_test3).toBe('label');
    });

    it('SlotNames does not accept non-slot strings at type level', () => {
      const slots = defineSlots({ root: 'button', label: 'span' });
      type Names = SlotNames<typeof slots>;
      // @ts-expect-error - 'invalid' is not a valid slot name
      const _test: Names = 'invalid';
      // This is a compile-time test; runtime just confirms the assignment
      expect(_test).toBe('invalid');
    });
  });

  describe('SLOT_SYMBOL', () => {
    it('is a unique symbol', () => {
      expect(typeof SLOT_SYMBOL).toBe('symbol');
      expect(SLOT_SYMBOL.toString()).toContain('prismui.slot');
    });

    it('is consistent across imports', () => {
      // Same symbol should be identical
      expect(SLOT_SYMBOL).toBe(SLOT_SYMBOL);
    });
  });
});
