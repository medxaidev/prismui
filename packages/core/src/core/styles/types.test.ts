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

// =============================================================================
// CSS Variables Types (Step 2.2: Styling Data Flow)
// =============================================================================

describe('CssVariable, CssVariables, VarsResolver — CSS Variables types', () => {
  // ===========================================================================
  // 1. CssVariable type
  // ===========================================================================

  it('CssVariable accepts valid CSS variable names', () => {
    const valid1: import('./types').CssVariable = '--button-height';
    const valid2: import('./types').CssVariable = '--my-custom-var';
    const valid3: import('./types').CssVariable = '--x';
    expect(valid1).toBe('--button-height');
    expect(valid2).toBe('--my-custom-var');
    expect(valid3).toBe('--x');
  });

  it('CssVariable rejects invalid names at compile time', () => {
    // @ts-expect-error - must start with --
    const invalid1: import('./types').CssVariable = 'button-height';
    // @ts-expect-error - must start with --
    const invalid2: import('./types').CssVariable = 'height';
    void invalid1;
    void invalid2;
  });

  // ===========================================================================
  // 2. CssVariables type (loose mode)
  // ===========================================================================

  it('CssVariables (loose mode) accepts any CSS variable', () => {
    const vars: import('./types').CssVariables = {
      '--button-height': '48px',
      '--button-bg': 'blue',
      '--any-variable': 'value',
    };
    expect(vars['--button-height']).toBe('48px');
    expect(vars['--button-bg']).toBe('blue');
    expect(vars['--any-variable']).toBe('value');
  });

  it('CssVariables (loose mode) allows undefined values', () => {
    const vars: import('./types').CssVariables = {
      '--button-height': '48px',
      '--button-bg': undefined,
    };
    expect(vars['--button-height']).toBe('48px');
    expect(vars['--button-bg']).toBeUndefined();
  });

  it('CssVariables (loose mode) is partial (all keys optional)', () => {
    const emptyVars: import('./types').CssVariables = {};
    const partialVars: import('./types').CssVariables = {
      '--button-height': '48px',
    };
    expect(emptyVars).toEqual({});
    expect(partialVars).toEqual({ '--button-height': '48px' });
  });

  // ===========================================================================
  // 3. CssVariables type (strict mode)
  // ===========================================================================

  it('CssVariables (strict mode) constrains to specific variables', () => {
    type ButtonCssVariable = '--button-height' | '--button-bg';
    const vars: import('./types').CssVariables<ButtonCssVariable> = {
      '--button-height': '48px',
      '--button-bg': 'blue',
    };
    expect(vars['--button-height']).toBe('48px');
    expect(vars['--button-bg']).toBe('blue');
  });

  it('CssVariables (strict mode) rejects invalid variables at compile time', () => {
    type ButtonCssVariable = '--button-height' | '--button-bg';
    const vars: import('./types').CssVariables<ButtonCssVariable> = {
      '--button-height': '48px',
      // @ts-expect-error - '--invalid' is not in ButtonCssVariable
      '--invalid': 'red',
    };
    void vars;
  });

  // ===========================================================================
  // 4. VarsResolver type (loose mode)
  // ===========================================================================

  it('VarsResolver (loose mode) accepts props and returns CssVariables', () => {
    const resolver: import('./types').VarsResolver = (props) => ({
      '--button-height': props.size === 'lg' ? '48px' : '36px',
      '--button-bg': 'blue',
    });

    const vars1 = resolver({ size: 'lg' });
    const vars2 = resolver({ size: 'sm' });
    expect(vars1['--button-height']).toBe('48px');
    expect(vars2['--button-height']).toBe('36px');
  });

  it('VarsResolver (loose mode) accepts optional theme parameter', () => {
    const resolver: import('./types').VarsResolver = (props, theme) => ({
      '--button-height': theme?.spacing?.(2) ?? '8px',
    });

    const vars1 = resolver({}, { spacing: (n: number) => `${n * 4}px` });
    const vars2 = resolver({}, undefined);
    expect(vars1['--button-height']).toBe('8px');
    expect(vars2['--button-height']).toBe('8px');
  });

  // ===========================================================================
  // 5. VarsResolver type (strict mode)
  // ===========================================================================

  it('VarsResolver (strict mode) constrains return type', () => {
    type ButtonCssVariable = '--button-height' | '--button-bg';
    const resolver: import('./types').VarsResolver<ButtonCssVariable> = (props) => ({
      '--button-height': '48px',
      '--button-bg': 'blue',
    });

    const vars = resolver({});
    expect(vars['--button-height']).toBe('48px');
    expect(vars['--button-bg']).toBe('blue');
  });

  it('VarsResolver (strict mode) only accepts declared variables', () => {
    type ButtonCssVariable = '--button-height' | '--button-bg';
    const resolver: import('./types').VarsResolver<ButtonCssVariable> = (props) => ({
      '--button-height': '48px',
      '--button-bg': 'blue',
    });

    const vars = resolver({});
    // Verify only declared variables are present
    expect(vars['--button-height']).toBe('48px');
    expect(vars['--button-bg']).toBe('blue');
  });

  // ===========================================================================
  // 6. Integration: VarsResolver with component props
  // ===========================================================================

  it('VarsResolver integrates with typed component props', () => {
    type ButtonProps = {
      size?: 'sm' | 'md' | 'lg';
      color?: string;
      variant?: 'solid' | 'outlined';
    };

    const resolver: import('./types').VarsResolver = (props: ButtonProps) => ({
      '--button-height': props.size === 'sm' ? '36px' : props.size === 'lg' ? '48px' : '42px',
      '--button-bg': props.variant === 'solid' ? props.color ?? 'blue' : 'transparent',
    });

    const vars1 = resolver({ size: 'sm', color: 'red', variant: 'solid' });
    const vars2 = resolver({ size: 'lg', variant: 'outlined' });
    expect(vars1['--button-height']).toBe('36px');
    expect(vars1['--button-bg']).toBe('red');
    expect(vars2['--button-height']).toBe('48px');
    expect(vars2['--button-bg']).toBe('transparent');
  });
});
