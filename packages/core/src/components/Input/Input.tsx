import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PrismuiSize } from '../../core/size';
import { resolveRadiusToken, type Radius } from '../../core/radius';
import { useFieldControlProps } from '../Field/useFieldControlProps';
import { useFieldDataAttrs } from '../Field/useFieldDataAttrs';
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
  /**
   * Border radius (theme scale or CSS length). @default 'sm'
   * @see Radius System — `core/radius`
   */
  radius?: Radius;
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
    // Radius — resolved via Radius System (`core/radius`). Default 'sm' for
    // Input comes from `payload.defaultProps.radius`; `?? 'sm'` here is a
    // belt-and-suspenders fallback that also preserves v1 behavior when the
    // component is used without factory defaults applied (edge case in tests).
    '--input-radius': resolveRadiusToken(props.radius ?? 'sm'),
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
export const Input = factory<InputOwnProps>(
  {
    displayName: 'Input',
    componentName: 'Input',
    defaultElement: 'div',
    slots: inputSlots,
    componentPropKeys: inputComponentPropKeys,
    // Step 10 · A-2 · single-writer defaults.
    defaultProps: {
      variant: 'outlined',
      size: 'md',
      radius: 'md',
    } satisfies Partial<InputOwnProps>,
    systems: [
      // Step 10 · SR-7.1 rule 1 (Key Ownership): `data-variant` has exactly
      // ONE owning writer — the variant system. Even though Input's variant
      // vocabulary (outlined/filled/unstyled) differs from Button's, Input
      // still declares variant-system participation (`vars: false` opts out
      // of Button's `--prismui-variant-*` auto-injection while keeping the
      // `data-variant` attribute sourced from the single writer). `color`
      // is v1-locked to `neutral` inside `varsResolver`, so the variant
      // system's `data-color` emits nothing (absent → omitted).
      { name: 'variant', vars: false },
      'size',
      // Step 10 §2.7: Control Surface — disabled || readOnly drives data-interactive-disabled.
      { name: 'state', options: { interactiveStrategy: 'control' } },
    ],
    styling: {
      structure: { stylesNames },
      resources: { classes: validatedClasses },
      logic: { varsResolver },
    },
  },
  ({ ref, componentProps, domProps, styles, systemDataAttrs }) => {
    // No render-body defaults (Step 10 · A-2). `variant` / `size` / `radius`
    // come pre-filled from `payload.defaultProps` via the single-writer chain.
    // B-3 · `factory<InputOwnProps>` above types `componentProps` directly.
    const {
      variant,
      leftSection,
      rightSection,
      pointer = false,
    } = componentProps;

    // Merge Field context into <input> props (id / aria-* / disabled / readOnly).
    // Field is optional — without it, merged === domProps (pass-through).
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const mergedInputProps = useFieldControlProps(domProps as any);

    const inputSlotStyles = styles.getStyles('input');
    const sectionSlotStyles = styles.getStyles('section');

    // ── Step 10 §6.4 component-local data-attrs ────────────────────────────
    // SR-7.1 compliance: `data-variant` is owned by the variant system (see
    // `systems` declaration above, `{ name: 'variant', vars: false }`). Input
    // emits ONLY genuinely component-local keys here — `data-pointer` is an
    // interaction-mode escape hatch slated to migrate to a future
    // `interaction` system (§6.4 placeholder).
    const rootDataAttrs: Record<string, string> = {};
    if (pointer) rootDataAttrs['data-pointer'] = 'true';
    // `variant` remains destructured for downstream logic (CSS via data-variant
    // spread after merge, plus future render branches).
    void variant;

    // ── Step 10 · A-1 / A-6 · Field-aware overlay on systemDataAttrs ───────
    // The `state` system produces base `data-disabled` / `data-readonly` /
    // `data-interactive-disabled` from RAW props (factory-time view). Field
    // context merges `disabled` / `readOnly` at render-time, so the final
    // state may differ. `useFieldDataAttrs` is the single authorized overlay
    // provider (§6.5 single-writer hierarchy): spread AFTER systemDataAttrs.
    // `mergedInputProps` already reflects Field merge, so pass it directly.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fieldAwareStateAttrs = useFieldDataAttrs(mergedInputProps as any, {
      interactiveStrategy: 'control',
    });

    return (
      <div
        {...styles.getRootProps()}
        {...rootDataAttrs}
        {...systemDataAttrs}
        {...fieldAwareStateAttrs}
      >
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
