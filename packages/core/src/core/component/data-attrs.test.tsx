/**
 * Stage 3 Step 10 · Phase 1 — system data-attrs contract
 *
 * Contract surface under test:
 *   - variantDataAttrs / sizeDataAttrs / stateDataAttrs  (§5.2)
 *   - collectSystemDataAttrs                             (§5.3)
 *   - resolveDisabilityAttrs                             (§2.4 / §5.4)
 *   - InteractiveDisabledStrategy: 'action' / 'control' (§2.7)
 *   - factory → FactoryRenderContext.systemDataAttrs / disabilityAttrs
 */
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

import { factory } from './factory';
import { defineSlots } from './define-slots';
import {
  collectSystemDataAttrs,
  resolveDisabilityAttrs,
  warnSystemDataAttrOverrides,
  __resetSystemDataAttrOverrideWarnings,
} from './collect-system-data-attrs';
import { variantDataAttrs } from '../variant/variant-data-attrs';
import { sizeDataAttrs } from '../size/size-data-attrs';
import { stateDataAttrs } from '../state/state-data-attrs';

// ───────────────────────────────────────────────────────────────────────────
// Pure resolvers
// ───────────────────────────────────────────────────────────────────────────

describe('variantDataAttrs', () => {
  it('emits data-variant when variant is set', () => {
    expect(variantDataAttrs({ variant: 'outlined' })).toEqual({
      'data-variant': 'outlined',
      'data-color': undefined,
    });
  });

  it('emits data-color when color is set (v1 co-managed)', () => {
    expect(variantDataAttrs({ variant: 'filled', color: 'error' })).toEqual({
      'data-variant': 'filled',
      'data-color': 'error',
    });
  });

  it('emits undefined for absent props (pruned by factory)', () => {
    expect(variantDataAttrs({})).toEqual({
      'data-variant': undefined,
      'data-color': undefined,
    });
  });
});

describe('sizeDataAttrs', () => {
  it('emits data-size from props', () => {
    expect(sizeDataAttrs({ size: 'lg' })).toEqual({ 'data-size': 'lg' });
  });

  it('emits undefined when size is absent', () => {
    expect(sizeDataAttrs({})).toEqual({ 'data-size': undefined });
  });
});

describe('stateDataAttrs', () => {
  it('emits presence-true for disabled / loading / readOnly', () => {
    const out = stateDataAttrs(
      { disabled: true, loading: true, readOnly: true },
      { interactiveStrategy: 'action' },
    );
    expect(out['data-disabled']).toBe('true');
    expect(out['data-loading']).toBe('true');
    expect(out['data-readonly']).toBe('true');
  });

  it('omits (undefined) when state is falsy', () => {
    const out = stateDataAttrs({ disabled: false }, { interactiveStrategy: 'disabled' });
    expect(out['data-disabled']).toBeUndefined();
    expect(out['data-interactive-disabled']).toBeUndefined();
  });

  describe('interactiveStrategy', () => {
    it('action: interactive = disabled || loading (readOnly irrelevant)', () => {
      const onlyLoading = stateDataAttrs({ loading: true }, { interactiveStrategy: 'action' });
      expect(onlyLoading['data-interactive-disabled']).toBe('true');

      const onlyReadOnly = stateDataAttrs({ readOnly: true }, { interactiveStrategy: 'action' });
      expect(onlyReadOnly['data-interactive-disabled']).toBeUndefined();
    });

    it('control: interactive = disabled || readOnly (loading irrelevant)', () => {
      const onlyReadOnly = stateDataAttrs({ readOnly: true }, { interactiveStrategy: 'control' });
      expect(onlyReadOnly['data-interactive-disabled']).toBe('true');

      const onlyLoading = stateDataAttrs({ loading: true }, { interactiveStrategy: 'control' });
      expect(onlyLoading['data-interactive-disabled']).toBeUndefined();
    });

    it('disabled (default): interactive = disabled only', () => {
      const out = stateDataAttrs({ loading: true, readOnly: true });
      expect(out['data-interactive-disabled']).toBeUndefined();
    });

    it('function: custom predicate wins', () => {
      const out = stateDataAttrs(
        { foo: 'bar' },
        { interactiveStrategy: (p) => p.foo === 'bar' },
      );
      expect(out['data-interactive-disabled']).toBe('true');
    });
  });
});

// ───────────────────────────────────────────────────────────────────────────
// collectSystemDataAttrs (spread order / strategy pass-through)
// ───────────────────────────────────────────────────────────────────────────

describe('collectSystemDataAttrs', () => {
  it('returns {} when no systems declared', () => {
    expect(collectSystemDataAttrs(undefined, {})).toEqual({});
    expect(collectSystemDataAttrs([], { variant: 'filled' })).toEqual({});
  });

  it('merges all declared system outputs, pruning undefined', () => {
    const out = collectSystemDataAttrs(
      ['variant', 'size', 'state'],
      { variant: 'outlined', color: 'primary', size: 'md', disabled: true },
    );
    expect(out).toEqual({
      'data-variant': 'outlined',
      'data-color': 'primary',
      'data-size': 'md',
      'data-disabled': 'true',
      'data-interactive-disabled': 'true',
    });
  });

  it('passes state options through to its resolver', () => {
    const out = collectSystemDataAttrs(
      [{ name: 'state', options: { interactiveStrategy: 'control' } }],
      { readOnly: true },
    );
    expect(out['data-readonly']).toBe('true');
    expect(out['data-interactive-disabled']).toBe('true');
  });

  it('honors `enabled` predicate (skips whole system)', () => {
    const out = collectSystemDataAttrs(
      [{ name: 'variant', enabled: () => false }],
      { variant: 'filled' },
    );
    expect(out).toEqual({});
  });
});

// ───────────────────────────────────────────────────────────────────────────
// resolveDisabilityAttrs (§2.4 decision table)
// ───────────────────────────────────────────────────────────────────────────

describe('resolveDisabilityAttrs', () => {
  it('native-disableable element: emits native `disabled`, skips aria', () => {
    expect(resolveDisabilityAttrs('button', { disabled: true })).toEqual({ disabled: true });
    expect(resolveDisabilityAttrs('input', { disabled: true })).toEqual({ disabled: true });
  });

  it('polymorphic element: emits `aria-disabled`, skips native', () => {
    expect(resolveDisabilityAttrs('a', { disabled: true })).toEqual({ 'aria-disabled': true });
    expect(resolveDisabilityAttrs('div', { disabled: true })).toEqual({ 'aria-disabled': true });
  });

  it('custom React component: treats as polymorphic (aria-disabled)', () => {
    const Custom = () => null;
    expect(resolveDisabilityAttrs(Custom, { disabled: true })).toEqual({ 'aria-disabled': true });
  });

  it('loading emits aria-busy regardless of element type', () => {
    expect(resolveDisabilityAttrs('button', { loading: true })['aria-busy']).toBe(true);
    expect(resolveDisabilityAttrs('a', { loading: true })['aria-busy']).toBe(true);
  });

  it('disabled + loading: both native disabled AND aria-busy', () => {
    expect(resolveDisabilityAttrs('button', { disabled: true, loading: true })).toEqual({
      disabled: true,
      'aria-busy': true,
    });
  });

  it('neither disabled nor loading: returns {}', () => {
    expect(resolveDisabilityAttrs('button', {})).toEqual({});
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Factory integration
// ───────────────────────────────────────────────────────────────────────────

const TestButton = factory(
  {
    displayName: 'TestButton',
    componentName: 'TestButton',
    defaultElement: 'button',
    slots: defineSlots({ root: 'button' }),
    componentPropKeys: ['variant', 'color', 'size', 'disabled', 'loading'] as const,
    systems: [
      'variant',
      'size',
      { name: 'state', options: { interactiveStrategy: 'action' } },
    ],
    styling: {
      structure: { stylesNames: ['root'] as const },
      resources: { classes: { root: 'root' } },
      logic: { varsResolver: () => ({}) },
    },
  },
  ({ Element, ref, domProps, styles, systemDataAttrs, disabilityAttrs }) => (
    <Element
      ref={ref}
      {...styles.getRootProps()}
      {...domProps}
      {...systemDataAttrs}
      {...disabilityAttrs}
    />
  ),
);

describe('factory · systemDataAttrs auto-injection', () => {
  it('emits data-variant / data-size / data-color on root', () => {
    const { container } = render(
      <TestButton variant="outlined" size="lg" color="error" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('outlined');
    expect(root.getAttribute('data-size')).toBe('lg');
    expect(root.getAttribute('data-color')).toBe('error');
  });

  it('emits state data-attrs + data-interactive-disabled (action)', () => {
    const { container, rerender } = render(<TestButton disabled />);
    let root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-disabled')).toBe('true');
    expect(root.getAttribute('data-interactive-disabled')).toBe('true');

    rerender(<TestButton loading />);
    root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-loading')).toBe('true');
    // action strategy: loading alone also marks non-interactive
    expect(root.getAttribute('data-interactive-disabled')).toBe('true');
    expect(root.getAttribute('data-disabled')).toBeNull();
  });

  it('omits state attrs when props are false/undefined', () => {
    const { container } = render(<TestButton variant="outlined" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.hasAttribute('data-disabled')).toBe(false);
    expect(root.hasAttribute('data-loading')).toBe(false);
    expect(root.hasAttribute('data-readonly')).toBe(false);
    expect(root.hasAttribute('data-interactive-disabled')).toBe(false);
  });
});

describe('factory · disability attrs (§2.4)', () => {
  it('native <button disabled>: sets native `disabled`, skips aria-disabled', () => {
    const { container } = render(<TestButton disabled />);
    const root = container.firstElementChild as HTMLButtonElement;
    expect(root.disabled).toBe(true);
    expect(root.hasAttribute('aria-disabled')).toBe(false);
  });

  it('polymorphic <a disabled>: sets aria-disabled, skips native `disabled`', () => {
    const { container } = render(<TestButton component="a" disabled />);
    const root = container.firstElementChild as HTMLAnchorElement;
    expect(root.hasAttribute('disabled')).toBe(false);
    expect(root.getAttribute('aria-disabled')).toBe('true');
    // CSS contract: data-disabled must still be present regardless of element
    expect(root.getAttribute('data-disabled')).toBe('true');
  });

  it('loading: aria-busy=true on root', () => {
    const { container } = render(<TestButton loading />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('aria-busy')).toBe('true');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Step 10 · A-2 — payload.defaultProps feeds system resolvers (single writer)
// ───────────────────────────────────────────────────────────────────────────

const DefaultedButton = factory(
  {
    displayName: 'DefaultedButton',
    componentName: 'DefaultedButton',
    defaultElement: 'button',
    slots: defineSlots({ root: 'button' }),
    componentPropKeys: ['variant', 'color', 'size', 'disabled'] as const,
    defaultProps: {
      variant: 'filled',
      color: 'primary',
      size: 'md',
    },
    systems: [
      'variant',
      'size',
      { name: 'state', options: { interactiveStrategy: 'action' } },
    ],
    styling: {
      structure: { stylesNames: ['root'] as const },
      resources: { classes: { root: 'root' } },
      logic: { varsResolver: () => ({}) },
    },
  },
  ({ Element, ref, domProps, styles, systemDataAttrs, disabilityAttrs }) => (
    <Element
      ref={ref}
      {...styles.getRootProps()}
      {...domProps}
      {...systemDataAttrs}
      {...disabilityAttrs}
    />
  ),
);

describe('factory · payload.defaultProps → systemDataAttrs (A-2)', () => {
  it('bare component emits data-* from payload.defaultProps (no user props)', () => {
    const { container } = render(<DefaultedButton />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('filled');
    expect(root.getAttribute('data-color')).toBe('primary');
    expect(root.getAttribute('data-size')).toBe('md');
  });

  it('user prop overrides payload default', () => {
    const { container } = render(<DefaultedButton variant="outlined" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('outlined');
    // untouched defaults still apply
    expect(root.getAttribute('data-color')).toBe('primary');
  });

  it('user undefined is treated as "not passed" → default applies', () => {
    const { container } = render(<DefaultedButton variant={undefined as any} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('filled');
  });
});

describe('state system DEV warn', () => {
  it('warns when loading prop seen but strategy absent', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    stateDataAttrs({ loading: true });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('does NOT warn when strategy is explicitly declared', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    stateDataAttrs({ loading: true }, { interactiveStrategy: 'action' });
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('does NOT warn when only disabled is seen (universal prop)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    stateDataAttrs({ disabled: true });
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Phase 3 — SR-7 single-writer DEV warnings (warnSystemDataAttrOverrides)
// ───────────────────────────────────────────────────────────────────────────

describe('warnSystemDataAttrOverrides (Phase 3 · SR-7)', () => {
  beforeEach(() => {
    __resetSystemDataAttrOverrideWarnings();
  });

  it('warns once when user passes explicit data-variant on variant-system component', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSystemDataAttrOverrides('Foo', ['variant'], { 'data-variant': 'x' });
    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy.mock.calls[0][0]).toMatch(/Foo/);
    expect(errSpy.mock.calls[0][0]).toMatch(/data-variant/);
    expect(errSpy.mock.calls[0][0]).toMatch(/SR-7/);
    errSpy.mockRestore();
  });

  it('fingerprints by (component, attr) — no re-warn on same pair', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSystemDataAttrOverrides('Foo', ['variant'], { 'data-variant': 'a' });
    warnSystemDataAttrOverrides('Foo', ['variant'], { 'data-variant': 'b' });
    warnSystemDataAttrOverrides('Foo', ['variant'], { 'data-variant': 'c' });
    expect(errSpy).toHaveBeenCalledTimes(1);
    errSpy.mockRestore();
  });

  it('different components warn independently for the same attr', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSystemDataAttrOverrides('Foo', ['variant'], { 'data-variant': 'x' });
    warnSystemDataAttrOverrides('Bar', ['variant'], { 'data-variant': 'x' });
    expect(errSpy).toHaveBeenCalledTimes(2);
    errSpy.mockRestore();
  });

  it('warns per attr for multi-key violations', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSystemDataAttrOverrides(
      'Foo',
      ['variant', 'state'],
      { 'data-variant': 'x', 'data-disabled': true, 'data-loading': true },
    );
    expect(errSpy).toHaveBeenCalledTimes(3);
    errSpy.mockRestore();
  });

  it('no-op when systems is empty / undefined', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSystemDataAttrOverrides('Foo', undefined, { 'data-variant': 'x' });
    warnSystemDataAttrOverrides('Foo', [], { 'data-variant': 'x' });
    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('no-op when user does NOT pass any managed data-*', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSystemDataAttrOverrides('Foo', ['variant', 'size', 'state'], {
      variant: 'filled',
      size: 'md',
      disabled: true,
    });
    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('does not warn for a managed key whose system is NOT declared', () => {
    // Foo declares only `variant` → data-size is unmanaged for Foo
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSystemDataAttrOverrides('Foo', ['variant'], { 'data-size': 'md' });
    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });
});

// ───────────────────────────────────────────────────────────────────────────
// SR-7.1 · `vars: false` — data-attrs participation without vars middleware
// ───────────────────────────────────────────────────────────────────────────

describe('ComponentSystemEntry · vars: false (SR-7.1 Key Ownership)', () => {
  const CustomVariantBox = factory(
    {
      displayName: 'CustomVariantBox',
      componentName: 'CustomVariantBox',
      defaultElement: 'div',
      slots: defineSlots({ root: 'div' }),
      componentPropKeys: ['variant'] as const,
      defaultProps: { variant: 'alpha' },
      // Variant system declared for data-attr ownership (SR-7.1 rule 1) —
      // vars middleware opted out because 'alpha' is not Button's vocabulary.
      systems: [{ name: 'variant', vars: false }],
      styling: {
        structure: { stylesNames: ['root'] as const },
        resources: { classes: { root: 'root' } },
        logic: {
          varsResolver: (props: any) => ({
            '--box-custom': `box-${props.variant}`,
          }),
        },
      },
    },
    ({ Element, ref, domProps, styles, systemDataAttrs }) => (
      <Element ref={ref} {...styles.getRootProps()} {...domProps} {...systemDataAttrs} />
    ),
  );

  it('emits data-variant from the variant system (single writer)', () => {
    const { container } = render(<CustomVariantBox />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('alpha');
  });

  it('does NOT emit --prismui-variant-* vars (middleware opted out)', () => {
    const { container } = render(<CustomVariantBox />);
    const root = container.firstElementChild as HTMLElement;
    // Component's own var still present (proves varsResolver ran):
    expect(root.style.getPropertyValue('--box-custom')).toBe('box-alpha');
    // Button-world color vars absent (proves withVariantColors did NOT wrap):
    expect(root.style.getPropertyValue('--prismui-variant-bg')).toBe('');
    expect(root.style.getPropertyValue('--prismui-variant-fg')).toBe('');
  });
});

describe('Input · SR-7.1 regression', () => {
  it('data-variant is sourced from the variant system, not self-emitted', async () => {
    // Import lazily to avoid hoisting issues with top-of-file imports.
    const { Input } = await import('../../components/Input/Input');
    const { container } = render(<Input aria-label="x" variant="filled" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('filled');
    // Regression guard: we should NOT be double-emitting (single writer).
    // There is no public API to detect double-emit at DOM level (last wins),
    // so we assert the value still matches the user prop (system saw it).
  });

  it('bare <Input /> still gets data-variant from payload.defaultProps', async () => {
    const { Input } = await import('../../components/Input/Input');
    const { container } = render(<Input aria-label="y" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('outlined');
  });
});

describe('factory · Phase 3 integration (SR-7 DEV warn)', () => {
  beforeEach(() => {
    __resetSystemDataAttrOverrideWarnings();
  });

  it('warns when user spreads data-disabled on a state-system component', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<DefaultedButton {...({ 'data-disabled': true } as any)} />);
    const match = errSpy.mock.calls.find(
      (c) =>
        typeof c[0] === 'string' &&
        c[0].includes('data-disabled') &&
        c[0].includes('SR-7'),
    );
    expect(match).toBeDefined();
    errSpy.mockRestore();
  });

  it('does NOT warn on a well-behaved usage', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<DefaultedButton variant="outlined" disabled />);
    const sr7Calls = errSpy.mock.calls.filter(
      (c) => typeof c[0] === 'string' && c[0].includes('SR-7'),
    );
    expect(sr7Calls).toHaveLength(0);
    errSpy.mockRestore();
  });
});
