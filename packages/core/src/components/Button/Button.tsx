import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import { resolveInteractive } from '../../core/state';
import type { SlotNames } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import classes from './Button.module.css';

// Stage 9: Slot System — structure declaration as source of truth
// `section` is a multi-instance slot: rendered twice (left / right) and
// discriminated by `data-position`. Follows Input's pattern — the auto-generated
// `Button.Section` compound is intentionally not used (single-instance only).
const buttonSlots = defineSlots({
  root: 'button',
  inner: 'span',
  section: 'span',
  label: 'span',
});

export type ButtonStylesNames = SlotNames<typeof buttonSlots>;

export interface ButtonOwnProps extends PolymorphicSystemProps {
  /**
   * Content rendered in the left section slot, typically an icon or spinner.
   * Size driven by `--prismui-size-slot-size` (Size System v3).
   * When `loading` is true, the built-in spinner replaces this slot.
   */
  leftSection?: React.ReactNode;
  /**
   * Content rendered in the right section slot, typically an icon, chevron, or badge.
   * Size driven by `--prismui-size-slot-size` (Size System v3).
   */
  rightSection?: React.ReactNode;
  /**
   * Border radius. Accepts theme scale keys or any CSS length.
   * @default 'md'
   */
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | (string & {});
  /**
   * Stretches the button to fill its container horizontally.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Shows a spinner (in the left section) and sets `aria-busy`.
   * Does NOT auto-disable the button — combine with `disabled` if needed.
   * @default false
   */
  loading?: boolean;
  children?: React.ReactNode;
}

export type ButtonProps = ButtonOwnProps & StylesOverride<ButtonStylesNames>;

function radiusToToken(r: NonNullable<ButtonOwnProps['radius']>): string {
  // Theme scale → CSS var; otherwise pass through as-is (CSS length).
  if (r === 'xs' || r === 'sm' || r === 'md' || r === 'lg' || r === 'xl' || r === 'full') {
    return `var(--prismui-radius-${r})`;
  }
  return r;
}

const varsResolver: VarsResolver<ButtonOwnProps> = (props) => ({
  // External box (Size v2 legacy)
  '--button-height':      'var(--prismui-size-height)',
  '--button-padding-x':   'var(--prismui-size-padding-x)',
  '--button-font-size':   'var(--prismui-size-font-size)',
  // Internal layout (Size v3) — component aliases pointing to system vars
  '--button-slot-size':   'var(--prismui-size-slot-size)',
  '--button-inner-gap':   'var(--prismui-size-inner-gap)',
  // Radius — default 'md' for Button (vs Input's 'sm')
  '--button-radius':      radiusToToken(props.radius ?? 'md'),
});

// stylesNames derived from slots for ensureClasses (compile-time validation)
const stylesNames = Object.keys(buttonSlots) as (keyof typeof buttonSlots)[];

const validatedClasses = ensureClasses(stylesNames, classes);

export const Button = factory(
  {
    displayName: 'Button',
    componentName: 'Button',
    defaultElement: 'button',
    slots: buttonSlots,
    componentPropKeys: [
      'size',
      'variant',
      'color',
      'disabled',
      'leftSection',
      'rightSection',
      'radius',
      'fullWidth',
      'loading',
    ] as const,
    // Step 10 · A-2 · single-writer hierarchy for data-attrs:
    // declaring defaults here (instead of render-body destructuring or hidden
    // inside `withVariantColors`) lets factory's systemDataAttrs see them,
    // so `<Button>` with no props still emits data-variant="filled" /
    // data-color="primary" / data-size="md" on root. `radius` is a CSS-var
    // only default (no corresponding data-attr in v1).
    defaultProps: {
      variant: 'filled',
      color: 'primary',
      size: 'md',
      radius: 'md',
    } satisfies Partial<ButtonOwnProps>,
    systems: [
      'variant',
      'size',
      // Step 10 §2.7: Action Surface — disabled || loading drives data-interactive-disabled.
      { name: 'state', options: { interactiveStrategy: 'action' } },
    ],
    styling: {
      structure: {
        stylesNames,
      },
      resources: {
        classes: validatedClasses,
      },
      logic: {
        varsResolver,
      },
    },
  },
  ({ Element, ref, domProps, componentProps, styles, systemDataAttrs, disabilityAttrs }) => {
    const {
      leftSection,
      rightSection,
      fullWidth,
      loading,
      disabled,
    } = componentProps as ButtonOwnProps;
    // Multi-instance slot: raw span + data-position (mirrors Input pattern).
    // Button.Section compound is intentionally NOT used (single-instance only).
    const sectionSlot = styles.getStyles('section');

    // Root-level data-attrs managed by the component (NOT system-managed).
    // The 7 system keys (data-variant / data-size / data-color / data-disabled
    // / data-loading / data-readonly / data-interactive-disabled) are produced
    // by factory via systemDataAttrs and MUST NOT appear here (SR-7, §6.2).
    // `aria-busy` / native `disabled` / `aria-disabled` come via disabilityAttrs.
    const rootDataAttrs: Record<string, string> = {};
    if (fullWidth) rootDataAttrs['data-full-width'] = 'true';

    // ── Step 10 §2.4 R-D4 · Phase 2 · polymorphic event swallow ───────────
    // When the root element is not native-disableable (polymorphic <a> / <div>
    // / custom component), the browser does NOT block click / keyboard
    // activation on its own — factory only sets `aria-disabled`, which is a
    // visual/a11y flag without behavior. The component layer must swallow
    // click + Enter/Space to avoid "aria-disabled is a visual lie".
    //
    // `loading` is included in the interactive-disabled predicate (Action
    // strategy): a loading button must not double-click while async is in
    // flight, even if the caller didn't pass `disabled`.
    //
    // Rationale for keeping this in the component (not factory): see §5.7.
    // factory's job is attrs; event lifecycle is domain behavior.
    //
    // A-3 · single predicate: `resolveInteractive` is the same function the
    // `state` system uses to produce `data-interactive-disabled`. Reusing it
    // here guarantees CSS visual state and JS event behavior stay in lock-step
    // — no local `disabled || loading` duplication.
    const interactive = resolveInteractive(
      { disabled, loading },
      'action',
    );
    const userOnClick = (domProps as any).onClick as React.MouseEventHandler | undefined;
    const userOnKeyDown = (domProps as any).onKeyDown as React.KeyboardEventHandler | undefined;

    const handleClick: React.MouseEventHandler = (e) => {
      if (interactive) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      userOnClick?.(e);
    };
    const handleKeyDown: React.KeyboardEventHandler = (e) => {
      if (interactive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        // do NOT stop propagation — a parent dialog may still want Escape etc.
        return;
      }
      userOnKeyDown?.(e);
    };

    // Forward all domProps EXCEPT the two handlers we're overriding.
    const { onClick: _oc, onKeyDown: _okd, ...passthroughDomProps } = domProps as any;

    // When loading: render built-in spinner instead of leftSection.
    const leftContent = loading ? <BuiltInSpinner /> : leftSection;
    return (
      <Element
        ref={ref}
        {...styles.getRootProps()}
        {...passthroughDomProps}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rootDataAttrs}
        {...systemDataAttrs}
        {...disabilityAttrs}
      >
        <Button.Inner data-prismui-slot-usage {...styles.getStyles('inner')}>
          {leftContent !== undefined && leftContent !== null && (
            <span
              className={sectionSlot.className}
              style={sectionSlot.style}
              data-position="left"
              {...(loading ? { 'data-loader': 'true' } : {})}
              aria-hidden="true"
            >
              {leftContent}
            </span>
          )}
          <Button.Label data-prismui-slot-usage {...styles.getStyles('label')}>{domProps.children}</Button.Label>
          {rightSection !== undefined && rightSection !== null && (
            <span
              className={sectionSlot.className}
              style={sectionSlot.style}
              data-position="right"
              aria-hidden="true"
            >
              {rightSection}
            </span>
          )}
        </Button.Inner>
      </Element>
    );
  },
);

// Built-in spinner — CSS-animated SVG. Inherits size from `.section`
// (--button-slot-size) and rotation from the `[data-loader="true"]` selector
// in Button.module.css.
function BuiltInSpinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M12 3a9 9 0 0 1 9 9" opacity="1" />
      <path d="M21 12a9 9 0 1 1-9-9" opacity="0.25" />
    </svg>
  );
}

Button.displayName = 'Button';
