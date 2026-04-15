import { describe, it, expect, vi } from 'vitest';
import { resolveStylesNames } from './resolve-styles-names';
import { defineSlots } from './define-slots';

describe('resolveStylesNames', () => {
  describe('priority path 1: slots + no explicit stylesNames', () => {
    it('derives stylesNames from slot keys', () => {
      const result = resolveStylesNames({
        displayName: 'Test',
        slots: defineSlots({ root: 'div', inner: 'span', label: 'span' }),
      });
      expect(result).toEqual(['root', 'inner', 'label']);
    });

    it('includes root in derived names', () => {
      const result = resolveStylesNames({
        displayName: 'Test',
        slots: defineSlots({ root: 'button' }),
      });
      expect(result).toEqual(['root']);
    });
  });

  describe('priority path 2: slots + explicit stylesNames (subset)', () => {
    it('uses explicit stylesNames when they are a subset of slots', () => {
      const result = resolveStylesNames({
        displayName: 'Test',
        slots: defineSlots({ root: 'button', inner: 'span', label: 'span' }),
        styling: {
          structure: { stylesNames: ['root', 'label'] as const },
        },
      });
      expect(result).toEqual(['root', 'label']);
    });

    it('DEV: warns when stylesNames contains names not in slots', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = resolveStylesNames({
        displayName: 'TestComponent',
        slots: defineSlots({ root: 'button', label: 'span' }),
        styling: {
          structure: { stylesNames: ['root', 'label', 'extra'] as const },
        },
      });

      // Still returns the explicit stylesNames
      expect(result).toEqual(['root', 'label', 'extra']);
      // But warns about the violation
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('TestComponent'),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('extra'),
      );

      errorSpy.mockRestore();
    });
  });

  describe('priority path 3: no slots, explicit stylesNames (legacy)', () => {
    it('returns explicit stylesNames', () => {
      const result = resolveStylesNames({
        displayName: 'Test',
        styling: {
          structure: { stylesNames: ['root', 'inner', 'label'] as const },
        },
      });
      expect(result).toEqual(['root', 'inner', 'label']);
    });
  });

  describe('priority path 4: neither slots nor stylesNames', () => {
    it('returns empty array', () => {
      const result = resolveStylesNames({ displayName: 'Test' });
      expect(result).toEqual([]);
    });
  });
});
