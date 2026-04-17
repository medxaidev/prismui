import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PrismuiSize } from '../../core/size';
import { useFieldControlProps } from '../Field/useFieldControlProps';
import { variantColorResolver, VARIANT_CSS_VARS } from '../../core/variant';
import type { Variant } from '../../core/variant';
import classes from './Input.module.css';

// ── Slots ───────────────────────────────────────────────────────────────────
const inputSlots = defineSlots({
  root: 'div',
  input: 'input',
  section: 'div',
});

export type InputStylesNames = SlotNames<typeof inputSlots>;

// ── Props ───────────────────────────────────────────────────────────────────

export type InputVariant = 'outlined' | 'filled' | 'unstyled';

export interface InputOwnProps {
  /** Visual size (Size System). @default 'md' */
  size?: PrismuiSize;
  /** Visual variant. @default 'outlined' */
  variant?: InputVariant;
  /** Border radius (theme scale or CSS length). @default 'sm' */
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | (string & {});
  /** Left decoration (icon / prefix). */
  leftSection?: React.ReactNode;
  /** Right decoration (icon / clear button). */
  rightSection?: React.ReactNode;
  /** Width reserved for the left section (avoids layout shift). */
  leftSectionWidth?: React.CSSProperties['width'];
  /** Width reserved for the right section. */
  rightSectionWidth?: React.CSSProperties['width'];
  /** Render as a pointer-trigger (e.g. Select anchor). @default false */
  pointer?: boolean;
}

/**
 * Input props.
 *
 * Extends native `<input>` HTML attributes (value / onChange / type / placeholder / etc.).
 *
 * **Does NOT expose**:
 * - `invalid` — driven via `aria-invalid` (from Field or user).
 * - `label` / `description` / `error` — compose with `<Field>` instead.
 * - `color` — v1 does not participate in Color System.
 *
 * See `devdocs/components/Input/design.md` for the full contract.
 */
export type InputProps = InputOwnProps
  & StylesOverride<InputStylesNames>
  & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

// ── Factory setup ───────────────────────────────────────────────────────────

/**
 * Phase 1 Adapter (see devdocs/components/Input/variant.md §3 Phase 1).
 *
 * Maps Input's public variant names → Button-world variant names, which
 * `variantColorResolver` then routes to the correct VariantRole:
 *   outlined → 'outlined' → VariantRole.bordered
 *   filled   → 'soft'     → VariantRole.low
 *   unstyled → null        → bypass (IV-4: no variant token injection)
 *
 * Phase 2 will replace this adapter with a role-aware resolver overload.
 */
const INPUT_VARIANT_TO_BASE = {
  outlined: 'outlined',
  filled:   'soft',
  unstyled: null,
} as const satisfies Record<InputVariant, Variant | null>;

const varsResolver: VarsResolver<InputOwnProps> = (props) => {
  const vars: Record<string, string> = {
    '--input-height': 'var(--prismui-size-height)',
    '--input-padding-x': 'var(--prismui-size-padding-x)',
    '--input-font-size': 'var(--prismui-size-font-size)',
    '--input-radius': radiusToToken(props.radius ?? 'sm'),
  };
  if (props.leftSectionWidth != null) {
    vars['--input-left-section-width'] = String(props.leftSectionWidth);
  }
  if (props.rightSectionWidth != null) {
    vars['--input-right-section-width'] = String(props.rightSectionWidth);
  }

  // Variant token layer injection — Input IV-1 contract.
  // color is locked to 'neutral' in v1 (Input IV-2).
  const variant = props.variant ?? 'outlined';
  const base = INPUT_VARIANT_TO_BASE[variant];
  if (base !== null) {
    const v = variantColorResolver({ variant: base, color: 'neutral' });
    vars[VARIANT_CSS_VARS.bg] = v.bg;
    vars[VARIANT_CSS_VARS.fg] = v.fg;
    vars[VARIANT_CSS_VARS.hoverBg] = v.hoverBg;
    vars[VARIANT_CSS_VARS.activeBg] = v.activeBg;
    vars[VARIANT_CSS_VARS.border] = v.border;
    vars[VARIANT_CSS_VARS.hoverBorder] = v.hoverBorder;
    vars[VARIANT_CSS_VARS.hoverShadow] = v.hoverShadow;
  }

  return vars;
};

function radiusToToken(r: NonNullable<InputOwnProps['radius']>): string {
  // Theme scale → CSS var; otherwise pass through as-is (CSS length).
  if (r === 'xs' || r === 'sm' || r === 'md' || r === 'lg' || r === 'xl' || r === 'full') {
    return `var(--prismui-radius-${r})`;
  }
  return r;
}

const stylesNames = Object.keys(inputSlots) as (keyof typeof inputSlots)[];
const validatedClasses = ensureClasses(stylesNames, classes);

const inputComponentPropKeys = [
  'size',
  'variant',
  'radius',
  'leftSection',
  'rightSection',
  'leftSectionWidth',
  'rightSectionWidth',
  'pointer',
] as const;

/**
 * Input — single-line text input Control.
 *
 * Consumes Field via `useFieldControlProps` (id / aria-* / disabled / readOnly
 * / aria-describedby merging). Works both standalone and nested in `<Field>`.
 *
 * Structure: `<div.root>` wrapper + `<input.input>` (semantic target, ref target).
 */
export const Input = factory(
  {
    displayName: 'Input',
    componentName: 'Input',
    defaultElement: 'div',
    slots: inputSlots,
    componentPropKeys: inputComponentPropKeys,
    systems: ['size', 'state'],
    styling: {
      structure: { stylesNames },
      resources: { classes: validatedClasses },
      logic: { varsResolver },
    },
  },
  ({ ref, componentProps, domProps, styles }) => {
    const {
      size = 'md',
      variant = 'outlined',
      leftSection,
      rightSection,
      pointer = false,
    } = componentProps as InputOwnProps;

    // Merge Field context into <input> props (id / aria-* / disabled / readOnly).
    // Field is optional — without it, merged === domProps (pass-through).
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const mergedInputProps = useFieldControlProps(domProps as any);

    const inputSlotStyles = styles.getStyles('input');
    const sectionSlotStyles = styles.getStyles('section');

    // Root data-* attributes reflect the MERGED state (Field + user overrides),
    // so CSS selectors on root see the effective state.
    const rootDataAttrs: Record<string, string> = {
      'data-variant': variant,
      'data-size': size,
    };
    if (mergedInputProps.disabled) rootDataAttrs['data-disabled'] = 'true';
    if (mergedInputProps.readOnly) rootDataAttrs['data-readonly'] = 'true';
    if (pointer) rootDataAttrs['data-pointer'] = 'true';

    return (
      <div {...styles.getRootProps()} {...rootDataAttrs}>
        {leftSection != null && (
          <div
            className={sectionSlotStyles.className}
            style={sectionSlotStyles.style}
            data-position="left"
          >
            {leftSection}
          </div>
        )}
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          {...mergedInputProps}
          className={[inputSlotStyles.className, mergedInputProps.className]
            .filter(Boolean)
            .join(' ')}
          style={{ ...inputSlotStyles.style, ...mergedInputProps.style }}
        />
        {rightSection != null && (
          <div
            className={sectionSlotStyles.className}
            style={sectionSlotStyles.style}
            data-position="right"
          >
            {rightSection}
          </div>
        )}
      </div>
    );
  },
);

(Input as React.FC).displayName = 'Input';
