/**
 * Type tests for the Styling Unit (StylesNames) type system.
 *
 * These tests verify compile-time type safety and inference for the base StylesNames type.
 * Runtime assertions confirm the type-level contracts hold at runtime too.
 *
 * Note: Component-specific StylesNames (e.g., ButtonStylesNames) are defined in component
 * files, not in the core styles module. This test file uses inline example types to
 * demonstrate the pattern.
 *
 * Validates:
 * - StylesNames base type accepts any string
 * - Component-specific types can extend StylesNames
 * - Invalid names are rejected at compile time
 * - Naming convention rules are enforceable
 */

import { describe, it, expect } from 'vitest';
import type { StylesNames } from './types';

// =============================================================================
// Example component types (for testing purposes only)
// In real code, these would be defined in component files
// =============================================================================

type ExampleButtonStylesNames = 'root' | 'inner' | 'section' | 'label';
type ExampleInputStylesNames = 'root' | 'label' | 'wrapper' | 'section' | 'input';
type ExampleCardStylesNames = 'root' | 'header' | 'body' | 'footer';

// =============================================================================
// Helper: compile-time assertion type
// =============================================================================

/**
 * Compile-time assertion that T is exactly `true`.
 * Usage: `type _check = AssertTrue<SomeConditionalType>;`
 */
type AssertTrue<T extends true> = T;

describe('StylesNames — Styling Unit types', () => {
  // ===========================================================================
  // 1. StylesNames base type
  // ===========================================================================

  it('base type accepts any string', () => {
    const anyName: StylesNames = 'anything';
    const rootName: StylesNames = 'root';
    expect(anyName).toBe('anything');
    expect(rootName).toBe('root');
  });

  it('component types are assignable to base type', () => {
    const buttonToBase: StylesNames = 'root' satisfies ExampleButtonStylesNames;
    const inputToBase: StylesNames = 'input' satisfies ExampleInputStylesNames;
    const cardToBase: StylesNames = 'header' satisfies ExampleCardStylesNames;
    expect(buttonToBase).toBe('root');
    expect(inputToBase).toBe('input');
    expect(cardToBase).toBe('header');
  });

  // ===========================================================================
  // 2. Component-specific types (example pattern)
  // ===========================================================================

  it('component types accept declared names', () => {
    const root: ExampleButtonStylesNames = 'root';
    const inner: ExampleButtonStylesNames = 'inner';
    const section: ExampleButtonStylesNames = 'section';
    const label: ExampleButtonStylesNames = 'label';
    expect([root, inner, section, label]).toEqual([
      'root', 'inner', 'section', 'label',
    ]);
  });

  it('component types reject invalid names at compile time', () => {
    // @ts-expect-error - 'invalid' is not a valid ExampleButtonStylesNames
    const invalid: ExampleButtonStylesNames = 'invalid';

    // @ts-expect-error - 'wrapper' belongs to Input, not Button
    const wrapper: ExampleButtonStylesNames = 'wrapper';

    void invalid;
    void wrapper;
  });

  // ===========================================================================
  // 3. Naming convention: root is always present
  // ===========================================================================

  it('root is a valid member of every component StylesNames', () => {
    const btnRoot: ExampleButtonStylesNames = 'root';
    const inputRoot: ExampleInputStylesNames = 'root';
    const cardRoot: ExampleCardStylesNames = 'root';
    expect(btnRoot).toBe('root');
    expect(inputRoot).toBe('root');
    expect(cardRoot).toBe('root');
  });

  // ===========================================================================
  // 4. Naming convention: consistency across similar components
  // ===========================================================================

  it('similar components share common names (label, section)', () => {
    const btnLabel: ExampleButtonStylesNames = 'label';
    const inputLabel: ExampleInputStylesNames = 'label';
    expect(btnLabel).toBe(inputLabel);

    const btnSection: ExampleButtonStylesNames = 'section';
    const inputSection: ExampleInputStylesNames = 'section';
    expect(btnSection).toBe(inputSection);
  });

  // ===========================================================================
  // 5. Naming convention: no state or variant names
  // ===========================================================================

  it('rejects state names (disabled, loading, active)', () => {
    // @ts-expect-error - 'disabled' is a state, not a structural name
    const disabled: ExampleButtonStylesNames = 'disabled';
    // @ts-expect-error - 'loading' is a state, not a structural name
    const loading: ExampleButtonStylesNames = 'loading';
    void disabled;
    void loading;
  });

  it('rejects variant names (outlined, solid)', () => {
    // @ts-expect-error - 'outlined' is a variant, not a structural name
    const outlined: ExampleButtonStylesNames = 'outlined';
    void outlined;
  });

  // ===========================================================================
  // 6. Generic utility with StylesNames constraint
  // ===========================================================================

  it('generic function accepts any component StylesNames', () => {
    function isRoot<T extends StylesNames>(name: T): boolean {
      return name === 'root';
    }

    expect(isRoot<ExampleButtonStylesNames>('root')).toBe(true);
    expect(isRoot<ExampleInputStylesNames>('wrapper')).toBe(false);
    expect(isRoot<ExampleCardStylesNames>('footer')).toBe(false);
  });
});
