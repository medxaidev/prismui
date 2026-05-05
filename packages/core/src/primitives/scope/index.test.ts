/**
 * Stage-15 Phase 2 · Scope namespace barrel contract test.
 *
 * Locks the `@/primitives/scope` public surface to the ADR-006 §6.1
 * whitelist (same machinery as `primitives/layout/index.test.ts`). At
 * this point only `ScopePortal` is landed — FocusScope / RemoveScroll
 * will be appended as they land in subsequent Phase 2 iterations.
 *
 * Dual-identity guard:
 *   - `ScopePortal === Portal` (runtime reference equality) — LY-SCOPE-3
 *     "no re-implementation" clause. Any wrapper or shim that breaks
 *     reference equality would silently contradict the contract.
 *   - Both symbols are simultaneously reachable from `@prismui/core`
 *     (LY-SCOPE-4 dual-entry honest duplication).
 */
import { describe, it, expect } from 'vitest';
import * as ScopeBarrel from './index';
import { Portal } from '../../core/overlay/portal/Portal';

describe('primitives/scope · barrel contract (ADR-006 §6.1 whitelist)', () => {
  it('exports exactly the landed Phase 2 value-level symbols', () => {
    const expected = ['RemoveScroll', 'ScopePortal'].sort();
    const actual = Object.keys(ScopeBarrel).sort();
    expect(actual).toEqual(expected);
  });

  it('ScopePortal is callable (React component shape)', () => {
    const { ScopePortal } = ScopeBarrel;
    // Portal is a forwardRef-style component: either a function (DEV) or
    // an object with `$$typeof` + `render` (forwardRef object form).
    const t = typeof ScopePortal;
    expect(t === 'function' || (t === 'object' && ScopePortal !== null)).toBe(true);
  });

  it('RemoveScroll is a plain function component', () => {
    expect(typeof ScopeBarrel.RemoveScroll).toBe('function');
  });

  it('compile-time: all documented type names are importable', () => {
    // Touches the `import type` graph so `tsc --noEmit` fails if
    // ScopePortalProps / RemoveScrollProps is ever removed from the
    // barrel.
    type _SideEffect =
      | import('./index').ScopePortalProps
      | import('./index').RemoveScrollProps;
    const _: _SideEffect | undefined = undefined;
    expect(_).toBeUndefined();
  });
});

describe('primitives/scope · LY-SCOPE-3 identity invariant', () => {
  it('ScopePortal === Portal (no wrapper · no re-implementation)', () => {
    // Strict reference equality is the structural witness of LY-SCOPE-3.
    // If a future refactor wraps Portal in a shim (even one that passes
    // behaviour-level tests), this assertion catches the identity drift
    // immediately — which is the whole point of the invariant.
    expect(ScopeBarrel.ScopePortal).toBe(Portal);
  });
});

describe('primitives/scope · forbidden leak audit', () => {
  it('does NOT re-export Layout / Section symbols', () => {
    const keys = Object.keys(ScopeBarrel);
    const forbidden = [
      'Box',
      'Stack',
      'Inline',
      'Center',
      'Grid',
      'Divider',
      'Section',
      'SectionHeader',
      'SectionContent',
      'SectionFooter',
      'SectionPrimitive',
    ];
    for (const name of forbidden) {
      expect(keys, `${name} must NOT leak into the scope barrel`).not.toContain(name);
    }
  });

  it('does NOT re-export overlay system siblings (usePortalContainer / OverlayProvider)', () => {
    // LY-SCOPE-3 scope: re-export ONLY the Portal component itself.
    // Container-lookup hooks and provider helpers remain at the
    // overlay entry (`@/core/overlay/portal`) — they are Stage-11
    // concerns, not Behavior Scope.
    const keys = Object.keys(ScopeBarrel);
    expect(keys).not.toContain('usePortalContainer');
    expect(keys).not.toContain('OverlayProvider');
    expect(keys).not.toContain('Portal'); // original name stays in overlay
  });
});

describe('primitives/scope · LY-SCOPE-4 dual-entry coexistence', () => {
  it('both entry points resolve to the same underlying Portal', async () => {
    // Public surfaces (validated via the root aggregator indirectly):
    //   - overlay path: `@/core/overlay/portal`
    //   - scope path:   `@/primitives/scope`
    // Both paths must deliver the SAME identity so callers who use
    // either entry get the same component, preserving LY-SCOPE-4's
    // "dual entry · no behavioural drift" guarantee.
    const overlayModule = await import('../../core/overlay/portal');
    expect(overlayModule.Portal).toBe(ScopeBarrel.ScopePortal);
  });
});
