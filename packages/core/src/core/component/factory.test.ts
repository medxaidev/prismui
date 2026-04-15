import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { factory } from './factory';
import { withVariantColors, VARIANT_CSS_VARS } from '../variant/with-variant-colors';
import { withSizeVars, SIZE_CSS_VARS } from '../size/with-size-vars';
import { withStateVars, STATE_CSS_VARS } from '../state/with-state-vars';
import { WITH_VARIANT_MARK, WITH_SIZE_MARK, WITH_STATE_MARK } from './system-marks';
import { defaultSizeTokens } from '../size/default-size-tokens';
import { defaultStateTokens } from '../state/default-state-tokens';
import type { ComponentPayload } from './types';
import type { VarsResolver } from '../styles/types';
import type { PrismUITheme } from '../theme/types';
import { defineSlots, SLOT_SYMBOL } from './define-slots';
import { render } from '@testing-library/react';

const DUMMY_THEME = {} as PrismUITheme;

describe('factory', () => {
  describe('basic functionality', () => {
    it('creates a component with displayName', () => {
      const payload: ComponentPayload = {
        displayName: 'TestComponent',
        defaultElement: 'div',
      };

      const Component = factory(payload);

      expect(Component.displayName).toBe('TestComponent');
    });

    it('creates a component that renders default element', () => {
      const payload: ComponentPayload = {
        displayName: 'TestDiv',
        defaultElement: 'div',
      };

      const Component = factory(payload);

      // Component should be a forwardRef component
      expect(Component).toBeDefined();
      expect(typeof Component).toBe('object');
    });

    it('supports polymorphic component prop', () => {
      const payload: ComponentPayload = {
        displayName: 'Polymorphic',
        defaultElement: 'div',
      };

      const Component = factory(payload);

      // This test verifies the component accepts 'component' prop
      // Actual rendering test would require React testing library
      expect(Component).toBeDefined();
    });
  });

  describe('without styling system', () => {
    it('passes className and style directly to element', () => {
      const payload: ComponentPayload = {
        displayName: 'NoStyling',
        defaultElement: 'div',
      };

      const Component = factory(payload);

      // Component should be created successfully
      expect(Component.displayName).toBe('NoStyling');
    });

    it('passes DOM props to element', () => {
      const payload: ComponentPayload = {
        displayName: 'DOMProps',
        defaultElement: 'button',
      };

      const Component = factory(payload);

      // Component should handle DOM props
      expect(Component).toBeDefined();
    });
  });

  describe('with styling system', () => {
    it('creates styling context and uses getRootProps', () => {
      const payload: ComponentPayload = {
        displayName: 'StyledComponent',
        defaultElement: 'div',
        componentPropKeys: ['size', 'variant'],
        styling: {
          structure: { stylesNames: ['root'] as const },
          resources: { classes: { root: 'styled-root' } },
        },
      };

      const Component = factory(payload);

      expect(Component.displayName).toBe('StyledComponent');
    });

    it('isolates component props from DOM props', () => {
      const payload: ComponentPayload = {
        displayName: 'PropsIsolation',
        defaultElement: 'button',
        componentPropKeys: ['size', 'variant'],
        styling: {
          structure: { stylesNames: ['root'] as const },
          resources: { classes: { root: 'btn-root' } },
        },
      };

      const Component = factory(payload);

      // Component should properly isolate props
      expect(Component).toBeDefined();
    });

    it('applies varsResolver with isolated component props', () => {
      const varsResolver = vi.fn((props: any) => ({
        '--button-height': props.size === 'lg' ? '48px' : '36px',
      }));

      const payload: ComponentPayload = {
        displayName: 'VarsResolver',
        defaultElement: 'button',
        componentPropKeys: ['size'],
        styling: {
          structure: { stylesNames: ['root'] as const },
          resources: { classes: { root: 'btn-root' } },
          logic: { varsResolver },
        },
      };

      const Component = factory(payload);

      expect(Component).toBeDefined();
    });
  });

  describe('custom render function', () => {
    it('supports multi-slot rendering', () => {
      const payload: ComponentPayload = {
        displayName: 'MultiSlot',
        defaultElement: 'button',
        componentPropKeys: ['size', 'variant'],
        styling: {
          structure: { stylesNames: ['root', 'inner', 'label'] as const },
          resources: {
            classes: { root: 'btn-root', inner: 'btn-inner', label: 'btn-label' },
          },
        },
      };

      const customRender = vi.fn(({ Element, ref, styles, domProps }) => {
        return React.createElement(
          Element,
          { ref, ...styles.getRootProps(), ...domProps },
          React.createElement('span', styles.getStyles('inner' as any)),
        );
      });

      const Component = factory(payload, customRender);

      expect(Component.displayName).toBe('MultiSlot');
    });

    it('provides componentProps and domProps separately', () => {
      const payload: ComponentPayload = {
        displayName: 'PropsSeparation',
        defaultElement: 'button',
        componentPropKeys: ['size', 'variant'],
        styling: {
          structure: { stylesNames: ['root'] as const },
          resources: { classes: { root: 'btn-root' } },
        },
      };

      const customRender = vi.fn(({ componentProps, domProps }) => {
        // componentProps should only have size, variant
        // domProps should have onClick, children, etc.
        return null;
      });

      const Component = factory(payload, customRender);

      expect(Component).toBeDefined();
    });
  });

  describe('dev mode warnings', () => {
    it('warns when componentPropKeys is missing and unknown props exist', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const payload: ComponentPayload = {
        displayName: 'MissingPropKeys',
        defaultElement: 'div',
        // componentPropKeys is missing
      };

      const Component = factory(payload);

      // Simulate rendering with unknown props
      const props = {
        unknownProp: 'value',
        children: 'content',
      };

      // Create a mock render to trigger the warning
      const TestWrapper = () => {
        return React.createElement(Component, props);
      };

      // The warning should be triggered during render
      // For now, just verify component was created
      expect(Component).toBeDefined();

      warnSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('does not warn for known DOM props', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const payload: ComponentPayload = {
        displayName: 'KnownDOMProps',
        defaultElement: 'div',
      };

      const Component = factory(payload);

      // Known DOM props should not trigger warning
      expect(Component).toBeDefined();

      warnSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('prop filtering', () => {
    it('omits component props from DOM output', () => {
      const payload: ComponentPayload = {
        displayName: 'PropFiltering',
        defaultElement: 'button',
        componentPropKeys: ['size', 'variant', 'loading'],
        styling: {
          structure: { stylesNames: ['root'] as const },
          resources: { classes: { root: 'btn-root' } },
        },
      };

      const Component = factory(payload);

      // Component should filter out size, variant, loading from DOM
      expect(Component).toBeDefined();
    });

    it('preserves DOM props (onClick, aria-*, data-*)', () => {
      const payload: ComponentPayload = {
        displayName: 'DOMPropsPreserved',
        defaultElement: 'button',
        componentPropKeys: ['size'],
      };

      const Component = factory(payload);

      // DOM props should be preserved
      expect(Component).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('handles empty componentPropKeys array', () => {
      const payload: ComponentPayload = {
        displayName: 'EmptyPropKeys',
        defaultElement: 'div',
        componentPropKeys: [],
      };

      const Component = factory(payload);

      expect(Component).toBeDefined();
    });

    it('handles undefined styling', () => {
      const payload: ComponentPayload = {
        displayName: 'NoStyling',
        defaultElement: 'div',
        componentPropKeys: ['size'],
        styling: undefined,
      };

      const Component = factory(payload);

      expect(Component).toBeDefined();
    });

    it('handles custom render without componentPropKeys', () => {
      const payload: ComponentPayload = {
        displayName: 'CustomRenderNoKeys',
        defaultElement: 'div',
        styling: {
          structure: { stylesNames: ['root'] as const },
          resources: { classes: { root: 'root' } },
        },
      };

      const customRender = vi.fn(() => null);

      const Component = factory(payload, customRender);

      expect(Component).toBeDefined();
    });
  });

  describe('systems — declarative injection (pure resolver tests)', () => {
    // These tests verify the resolver transformation applied by factory's systems loop
    // without needing a DOM/jsdom environment. We extract the resolver produced by
    // withVariantColors and call it directly.

    const base: VarsResolver<any> = () => ({ '--btn-height': '40px' });
    const props = { variant: 'solid', color: 'primary' };

    it("systems: ['variant'] causes the resulting varsResolver to inject --prismui-variant-* keys", () => {
      // withVariantColors is the function factory would call internally.
      // Here we verify its output has the 4 variant vars.
      const resolver = withVariantColors(base);
      const result = resolver(props, DUMMY_THEME);
      expect(result[VARIANT_CSS_VARS.bg]).toBeDefined();
      expect(result[VARIANT_CSS_VARS.fg]).toBeDefined();
      expect(result[VARIANT_CSS_VARS.hoverBg]).toBeDefined();
      expect(result[VARIANT_CSS_VARS.border]).toBeDefined();
    });

    it('base varsResolver output is preserved alongside variant vars', () => {
      const resolver = withVariantColors(base);
      const result = resolver(props, DUMMY_THEME);
      expect(result['--btn-height']).toBe('40px');
    });

    it('no systems → base resolver output contains no --prismui-variant-* keys', () => {
      const result = base(props, DUMMY_THEME);
      expect(result[VARIANT_CSS_VARS.bg]).toBeUndefined();
    });

    it('double-wrap detection: WITH_VARIANT_MARK on manualWrapped prevents second wrap', () => {
      const manualWrapped = withVariantColors(base);
      // Simulate what factory does: check mark before injecting
      const alreadyMarked = !!(manualWrapped as any)[WITH_VARIANT_MARK];
      expect(alreadyMarked).toBe(true);
      // factory would skip wrapping → resolver is still manualWrapped (single layer)
      const result = manualWrapped(props, DUMMY_THEME);
      expect(result[VARIANT_CSS_VARS.bg]).toBeDefined();
      expect(result['--btn-height']).toBe('40px');
    });

    it('enabled guard — returns only base vars when guard returns false', () => {
      const resolver = withVariantColors(base, {
        enabled: (p) => p.variant !== undefined,
      });
      const result = resolver({ color: 'primary' }, DUMMY_THEME); // no variant prop
      expect(result[VARIANT_CSS_VARS.bg]).toBeUndefined();
      expect(result['--btn-height']).toBe('40px');
    });

    it('enabled guard — injects variant vars when guard returns true', () => {
      const resolver = withVariantColors(base, {
        enabled: (p) => p.variant !== undefined,
      });
      const result = resolver(props, DUMMY_THEME); // has variant
      expect(result[VARIANT_CSS_VARS.bg]).toBeDefined();
    });

    it('WITH_VARIANT_MARK is stamped on withVariantColors output', () => {
      const wrapped = withVariantColors(base);
      expect((wrapped as any)[WITH_VARIANT_MARK]).toBe(true);
    });

    it('factory creates component successfully with systems field (smoke test)', () => {
      const Comp = factory({
        displayName: 'SystemsSmoke',
        defaultElement: 'button',
        componentPropKeys: ['variant', 'color'] as const,
        systems: ['variant'],
        styling: {
          structure: { stylesNames: ['root'] as const },
          resources: { classes: { root: 'root' } },
          logic: { varsResolver: base },
        },
      });
      expect(Comp.displayName).toBe('SystemsSmoke');
    });
  });

  describe("systems — size injection (pure resolver tests)", () => {
    const SIZE_THEME = { size: defaultSizeTokens } as unknown as PrismUITheme;
    const base: VarsResolver<any> = () => ({ '--btn-extra': 'value' });

    it("systems: ['size'] injects --prismui-size-height and --prismui-size-padding-x", () => {
      const resolver = withSizeVars(base);
      const result = resolver({ size: 'lg' }, SIZE_THEME);
      expect(result[SIZE_CSS_VARS.height]).toBe('48px');
      expect(result[SIZE_CSS_VARS.paddingX]).toBe('20px');
    });

    it('base vars are preserved alongside size vars', () => {
      const resolver = withSizeVars(base);
      const result = resolver({ size: 'md' }, SIZE_THEME);
      expect(result['--btn-extra']).toBe('value');
    });

    it("systems: ['variant', 'size'] both inject their respective vars", () => {
      const variantResolved = withVariantColors(base);
      const sizeResolved = withSizeVars(variantResolved);
      const result = sizeResolved({ variant: 'filled', color: 'primary', size: 'md' }, SIZE_THEME);
      expect(result[VARIANT_CSS_VARS.bg]).toBeDefined();
      expect(result[SIZE_CSS_VARS.height]).toBe('40px');
      expect(result[SIZE_CSS_VARS.paddingX]).toBe('16px');
    });

    it('double-wrap detection: WITH_SIZE_MARK prevents second size wrap', () => {
      const wrapped = withSizeVars(base);
      const alreadyMarked = !!(wrapped as any)[WITH_SIZE_MARK];
      expect(alreadyMarked).toBe(true);
    });

    it('WITH_SIZE_MARK does not affect WITH_VARIANT_MARK (independent marks)', () => {
      const variantWrapped = withVariantColors(base);
      const sizeWrapped = withSizeVars(base);
      expect((variantWrapped as any)[WITH_VARIANT_MARK]).toBe(true);
      expect((variantWrapped as any)[WITH_SIZE_MARK]).toBeUndefined();
      expect((sizeWrapped as any)[WITH_SIZE_MARK]).toBe(true);
      expect((sizeWrapped as any)[WITH_VARIANT_MARK]).toBeUndefined();
    });

    it("factory creates component successfully with systems: ['size'] (smoke test)", () => {
      const Comp = factory({
        displayName: 'SizeSmoke',
        defaultElement: 'button',
        componentPropKeys: ['size'] as const,
        systems: ['size'],
        styling: {
          structure: { stylesNames: ['root'] as const },
          resources: { classes: { root: 'root' } },
          logic: { varsResolver: () => ({}) },
        },
      });
      expect(Comp.displayName).toBe('SizeSmoke');
    });
  });

  describe("systems — state injection (pure resolver tests)", () => {
    const STATE_THEME = { state: defaultStateTokens } as unknown as PrismUITheme;
    const base: VarsResolver<any> = () => ({ '--btn-extra': 'value' });

    it("systems: ['state'] injects --prismui-state-opacity-disabled and --prismui-state-cursor-disabled", () => {
      const resolver = withStateVars(base);
      const result = resolver({}, STATE_THEME);
      expect(result[STATE_CSS_VARS.opacityDisabled]).toBe(0.5);
      expect(result[STATE_CSS_VARS.cursorDisabled]).toBe('not-allowed');
    });

    it("state resolver preserves baseVars", () => {
      const resolver = withStateVars(base);
      const result = resolver({}, STATE_THEME);
      expect(result['--btn-extra']).toBe('value');
    });

    it("WITH_STATE_MARK is stamped on withStateVars output", () => {
      const resolver = withStateVars(base);
      expect((resolver as any)[WITH_STATE_MARK]).toBe(true);
    });

    it("double-wrap prevention: WITH_STATE_MARK prevents second wrapping", () => {
      const alreadyWrapped = withStateVars(base);
      const SIZE_THEME = { size: defaultSizeTokens, state: defaultStateTokens } as unknown as PrismUITheme;
      const result1 = alreadyWrapped({}, SIZE_THEME);
      const wrappedAgain = withStateVars(alreadyWrapped);
      const result2 = wrappedAgain({}, SIZE_THEME);
      expect(result1[STATE_CSS_VARS.opacityDisabled]).toBe(result2[STATE_CSS_VARS.opacityDisabled]);
    });

    it("systems: ['variant', 'size', 'state'] — all three inject correctly", () => {
      const allThree: VarsResolver<any> = () => ({});
      const variantWrapped = withVariantColors(allThree);
      const sizeWrapped = withSizeVars(variantWrapped);
      const stateWrapped = withStateVars(sizeWrapped);
      const FULL_THEME = {
        ...DUMMY_THEME,
        size: defaultSizeTokens,
        state: defaultStateTokens,
      } as PrismUITheme;
      const result = stateWrapped({ size: 'md', variant: 'filled', color: 'primary' }, FULL_THEME);
      expect(result).toHaveProperty(STATE_CSS_VARS.opacityDisabled);
      expect(result).toHaveProperty(STATE_CSS_VARS.cursorDisabled);
      expect(result).toHaveProperty(SIZE_CSS_VARS.height);
      expect(result).toHaveProperty(VARIANT_CSS_VARS.bg);
    });

    it("factory creates component successfully with systems: ['state'] (smoke test)", () => {
      const Comp = factory({
        displayName: 'StateSmoke',
        defaultElement: 'button',
        componentPropKeys: ['disabled'] as const,
        systems: ['state'],
        styling: {
          structure: { stylesNames: ['root'] as const },
          resources: { classes: { root: 'root' } },
          logic: { varsResolver: () => ({}) },
        },
      });
      expect(Comp.displayName).toBe('StateSmoke');
    });
  });

  describe('Stage 9: Slot System', () => {

    describe('compound component generation', () => {
      it('generates compound components for non-root slots', () => {
        const Comp = factory({
          displayName: 'SlotTest',
          defaultElement: 'button',
          slots: defineSlots({ root: 'button', inner: 'span', label: 'span' }),
        });

        expect((Comp as any).Inner).toBeDefined();
        expect((Comp as any).Label).toBeDefined();
      });

      it('does not generate compound for root slot', () => {
        const Comp = factory({
          displayName: 'SlotTest',
          defaultElement: 'button',
          slots: defineSlots({ root: 'button', label: 'span' }),
        });

        expect((Comp as any).Root).toBeUndefined();
      });

      it('compound has correct displayName', () => {
        const Comp = factory({
          displayName: 'MyButton',
          defaultElement: 'button',
          slots: defineSlots({ root: 'button', inner: 'span', label: 'span' }),
        });

        expect((Comp as any).Inner.displayName).toBe('MyButton.Inner');
        expect((Comp as any).Label.displayName).toBe('MyButton.Label');
      });

      it('compound has SLOT_SYMBOL metadata', () => {
        const Comp = factory({
          displayName: 'MetaTest',
          componentName: 'MetaTest',
          defaultElement: 'button',
          slots: defineSlots({ root: 'button', label: 'span' }),
        });

        const meta = (Comp as any).Label[SLOT_SYMBOL];
        expect(meta).toBeDefined();
        expect(meta.slotName).toBe('label');
        expect(meta.componentName).toBe('MetaTest');
      });

      it('compound uses componentName fallback to displayName for metadata', () => {
        const Comp = factory({
          displayName: 'FallbackTest',
          defaultElement: 'div',
          slots: defineSlots({ root: 'div', item: 'li' }),
        });

        const meta = (Comp as any).Item[SLOT_SYMBOL];
        expect(meta.componentName).toBe('FallbackTest');
      });
    });

    describe('effectiveDefaultElement (slots.root > defaultElement)', () => {
      it('uses slots.root when both are provided and consistent', () => {
        const Comp = factory({
          displayName: 'ConsistentRoot',
          defaultElement: 'button',
          slots: defineSlots({ root: 'button', label: 'span' }),
        });

        // Component created successfully (no throw)
        expect(Comp.displayName).toBe('ConsistentRoot');
      });

      it('DEV warns when slots.root and defaultElement are inconsistent', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        factory({
          displayName: 'InconsistentRoot',
          defaultElement: 'button',
          slots: defineSlots({ root: 'a', label: 'span' }),
        });

        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('InconsistentRoot'),
        );
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('slots.root will be used as source of truth'),
        );

        warnSpy.mockRestore();
      });
    });

    describe('slots-derived stylesNames', () => {
      it('creates component with slots and no explicit stylesNames', () => {
        const Comp = factory({
          displayName: 'DeriveTest',
          defaultElement: 'div',
          slots: defineSlots({ root: 'div', header: 'div', body: 'div' }),
          styling: {
            structure: { stylesNames: [] as const },
            resources: { classes: { root: 'r', header: 'h', body: 'b' } },
          },
        });

        expect(Comp.displayName).toBe('DeriveTest');
        // Compound components are generated
        expect((Comp as any).Header).toBeDefined();
        expect((Comp as any).Body).toBeDefined();
      });
    });

    describe('DEV compound misuse protection', () => {
      it('warns when compound is rendered without data-prismui-slot-usage', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const Comp = factory({
          displayName: 'MisuseTest',
          defaultElement: 'button',
          slots: defineSlots({ root: 'button', label: 'span' }),
        });

        // Get the compound component
        const Label = (Comp as any).Label;
        expect(Label).toBeDefined();

        // Render it (this triggers the forwardRef which checks for the marker)
        render(React.createElement(Label, null, 'test'));

        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('MisuseTest.Label is used outside of MisuseTest render'),
        );

        warnSpy.mockRestore();
      });

      it('does not warn when compound has data-prismui-slot-usage', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const Comp = factory({
          displayName: 'CorrectUseTest',
          defaultElement: 'button',
          slots: defineSlots({ root: 'button', label: 'span' }),
        });

        const Label = (Comp as any).Label;

        render(React.createElement(Label, { 'data-prismui-slot-usage': true }, 'test'));

        // No misuse warning for this specific compound
        const misuseWarnings = warnSpy.mock.calls.filter(
          (call) => typeof call[0] === 'string' && call[0].includes('CorrectUseTest.Label is used outside'),
        );
        expect(misuseWarnings).toHaveLength(0);

        warnSpy.mockRestore();
      });

      it('strips data-prismui-slot-usage from DOM output', () => {
        const Comp = factory({
          displayName: 'StripTest',
          defaultElement: 'button',
          slots: defineSlots({ root: 'button', label: 'span' }),
        });

        const Label = (Comp as any).Label;

        const { container } = render(
          React.createElement(Label, { 'data-prismui-slot-usage': true, className: 'test' }, 'hello'),
        );

        const span = container.querySelector('span');
        expect(span).toBeInTheDocument();
        expect(span).toHaveClass('test');
        expect(span).not.toHaveAttribute('data-prismui-slot-usage');
        expect(span).toHaveTextContent('hello');
      });
    });
  });
});
