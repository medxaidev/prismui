import { describe, it, expect } from 'vitest';
import {
  createActionType,
  parseActionType,
  createModuleActions,
  isNamespacedActionType,
} from './action-types';

describe('Action Types', () => {
  // ── createActionType ──────────────────────────────────────────────

  describe('createActionType', () => {
    it('creates namespaced action type', () => {
      expect(createActionType('modal', 'open')).toBe('modal/open');
      expect(createActionType('modal', 'close')).toBe('modal/close');
      expect(createActionType('user-profile', 'updateName')).toBe('user-profile/updateName');
    });

    it('throws on empty module name', () => {
      expect(() => createActionType('', 'open')).toThrow();
    });

    it('throws on empty action name', () => {
      expect(() => createActionType('modal', '')).toThrow();
    });
  });

  // ── parseActionType ───────────────────────────────────────────────

  describe('parseActionType', () => {
    it('parses valid namespaced type', () => {
      expect(parseActionType('modal/open')).toEqual({
        moduleName: 'modal',
        actionName: 'open',
      });
    });

    it('parses multi-word module names', () => {
      expect(parseActionType('user-profile/updateName')).toEqual({
        moduleName: 'user-profile',
        actionName: 'updateName',
      });
    });

    it('returns null for non-namespaced types', () => {
      expect(parseActionType('MODAL_OPEN')).toBeNull();
      expect(parseActionType('open')).toBeNull();
    });

    it('returns null for types with multiple slashes', () => {
      expect(parseActionType('modal/open/extra')).toBeNull();
    });

    it('returns null for leading or trailing slash', () => {
      expect(parseActionType('/open')).toBeNull();
      expect(parseActionType('modal/')).toBeNull();
    });
  });

  // ── createModuleActions ───────────────────────────────────────────

  describe('createModuleActions', () => {
    it('creates a map of namespaced action types', () => {
      const actions = createModuleActions('modal', {
        OPEN: 'open',
        CLOSE: 'close',
        CLOSE_ALL: 'closeAll',
      });

      expect(actions).toEqual({
        OPEN: 'modal/open',
        CLOSE: 'modal/close',
        CLOSE_ALL: 'modal/closeAll',
      });
    });

    it('works with single action', () => {
      const actions = createModuleActions('page', { MOUNT: 'mount' });
      expect(actions.MOUNT).toBe('page/mount');
    });

    it('preserves key names', () => {
      const actions = createModuleActions('form', {
        REGISTER_FIELD: 'registerField',
        SET_VALUE: 'setValue',
      });

      expect(Object.keys(actions)).toEqual(['REGISTER_FIELD', 'SET_VALUE']);
    });
  });

  // ── isNamespacedActionType ────────────────────────────────────────

  describe('isNamespacedActionType', () => {
    it('returns true for valid namespaced types', () => {
      expect(isNamespacedActionType('modal/open')).toBe(true);
      expect(isNamespacedActionType('form/setValue')).toBe(true);
      expect(isNamespacedActionType('user-profile/update')).toBe(true);
    });

    it('returns false for non-namespaced types', () => {
      expect(isNamespacedActionType('MODAL_OPEN')).toBe(false);
      expect(isNamespacedActionType('open')).toBe(false);
      expect(isNamespacedActionType('')).toBe(false);
      expect(isNamespacedActionType('a/b/c')).toBe(false);
    });
  });
});
