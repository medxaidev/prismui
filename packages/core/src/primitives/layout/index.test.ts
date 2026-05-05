/**
 * Stage-15 Phase 1 · Layout namespace barrel contract test.
 *
 * Purpose: lock the `@/primitives/layout` public surface to the ADR-006
 * §6.1 whitelist. This is part of the R-1 P0 dissolution condition —
 * the Phase 1 PR diff MUST export exactly the 6 primitives + their
 * associated constants and types, no more, no less.
 *
 * Any future PR that adds a symbol to `./index.ts` will break this test
 * and force a conscious choice: (a) update ADR-006 §6.1 first, or
 * (b) withdraw the addition. That is the intended friction.
 */
import { describe, it, expect } from 'vitest';
import * as LayoutBarrel from './index';

describe('primitives/layout · barrel contract (ADR-006 §6.1 whitelist)', () => {
  it('exports exactly the Phase 1 value-level symbols', () => {
    // Value exports = runtime-visible names. Sorted for stable diffs.
    // Types are erased at runtime and not observable via Object.keys,
    // so they are documented separately (see type-level test below).
    const expected = [
      'Box',
      'Center',
      'DIVIDER_DEFAULT_ORIENTATION',
      'Divider',
      'GRID_DEFAULT_GAP',
      'Grid',
      'INLINE_DEFAULT_GAP',
      'Inline',
      'STACK_DEFAULT_GAP',
      'Stack',
    ].sort();
    const actual = Object.keys(LayoutBarrel).sort();
    expect(actual).toEqual(expected);
  });

  it('exposes all 6 primitives as functions (React forwardRef components)', () => {
    const { Box, Stack, Inline, Center, Grid, Divider } = LayoutBarrel;
    for (const [name, Comp] of [
      ['Box', Box],
      ['Stack', Stack],
      ['Inline', Inline],
      ['Center', Center],
      ['Grid', Grid],
      ['Divider', Divider],
    ] as const) {
      // forwardRef components are objects (`{ $$typeof, render }`) in
      // production but `function` in DEV — accept either.
      const t = typeof Comp;
      expect(
        t === 'function' || (t === 'object' && Comp !== null),
        `${name} must be callable / forwardRef-shaped (got ${t})`,
      ).toBe(true);
    }
  });

  it('exposes default-value constants with the correct SpacingScale values', () => {
    // Honest-default constants — exported so downstream callers / tests
    // can reference the contract without duplicating the literal.
    expect(LayoutBarrel.STACK_DEFAULT_GAP).toBe('md');
    expect(LayoutBarrel.INLINE_DEFAULT_GAP).toBe('md');
    expect(LayoutBarrel.GRID_DEFAULT_GAP).toBe('md');
    expect(LayoutBarrel.DIVIDER_DEFAULT_ORIENTATION).toBe('horizontal');
  });

  it('compile-time: all documented type names are importable (type-level)', () => {
    // This test body is deliberately trivial — the meaningful assertion
    // is that the `import type` statements below compile. If any of the
    // listed type names is removed from the barrel, `tsc --noEmit`
    // fails and the test file stops compiling.
    type _ValueSideEffect =
      | import('./index').BoxOwnProps
      | import('./index').BoxProps
      | import('./index').BoxComponent
      | import('./index').StackOwnProps
      | import('./index').StackProps
      | import('./index').StackComponent
      | import('./index').InlineOwnProps
      | import('./index').InlineProps
      | import('./index').InlineComponent
      | import('./index').CenterOwnProps
      | import('./index').CenterProps
      | import('./index').CenterComponent
      | import('./index').GridOwnProps
      | import('./index').GridProps
      | import('./index').GridComponent
      | import('./index').DividerOwnProps
      | import('./index').DividerProps
      | import('./index').DividerComponent;
    // Touch the type alias so TS doesn't complain about unused-type.
    const _: _ValueSideEffect | undefined = undefined;
    expect(_).toBeUndefined();
  });
});

describe('primitives/layout · forbidden leak audit', () => {
  it('does NOT re-export Scope / Section symbols (§6.1 whitelist)', () => {
    // Phase 2 (Scope) and Phase 3 (Section) land in sibling barrels.
    // The layout barrel must NEVER re-export them — that would break
    // the ADR-006 decision 1 orthogonal-namespace rule.
    const keys = Object.keys(LayoutBarrel);
    const forbidden = [
      'FocusScope',
      'RemoveScroll',
      'Portal',
      'ScopePortal',
      'Section',
      'SectionHeader',
      'SectionContent',
      'SectionFooter',
      'SectionPrimitive',
    ];
    for (const name of forbidden) {
      expect(keys, `${name} must NOT leak into the layout barrel`).not.toContain(name);
    }
  });

  it('does NOT re-export private CSS Module objects or internal helpers', () => {
    const keys = Object.keys(LayoutBarrel);
    // CSS Module default exports would appear as `default` or module
    // keys; internal helpers (e.g. mergeClassName) must not leak.
    expect(keys).not.toContain('default');
    expect(keys).not.toContain('mergeClassName');
    expect(keys).not.toContain('resolveColumnsTemplate');
  });
});
