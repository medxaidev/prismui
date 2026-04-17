import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import { FieldContext, type FieldContextValue } from './FieldContext';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { FieldError } from './FieldError';
import classes from './Field.module.css';

// ── Slot structure ──────────────────────────────────────────────────────────
const fieldSlots = defineSlots({
  root: 'div',
});

export type FieldStylesNames = SlotNames<typeof fieldSlots>;

/**
 * Field-specific props.
 *
 * Contract (devdocs/components/Field/spec.md §Props):
 * - All four state props default to `false`.
 * - `invalid` is NEVER derived from <Field.Error> existence.
 * - `id` is optional; when omitted, a stable id is generated via `React.useId()`.
 * - Field does NOT expose size / variant / color / layout.
 */
export interface FieldOwnProps extends Omit<PolymorphicSystemProps, 'size' | 'variant' | 'color' | 'disabled'> {
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  children?: React.ReactNode;
}

export type FieldProps = FieldOwnProps & StylesOverride<FieldStylesNames>;

const stylesNames = Object.keys(fieldSlots) as (keyof typeof fieldSlots)[];
const validatedClasses = ensureClasses(stylesNames, classes);

/**
 * Field — Headless semantic container for form controls.
 *
 * Renders a `<div>` + FieldContext.Provider. No visual beyond layout (flex column + gap).
 *
 * ⚠️ Field root does NOT enter the state system (`systems: []`).
 * If `systems: ['state']` were declared, `.root[data-disabled]` would give Field
 * a visual state, breaking its Headless positioning.
 */
export const Field = factory(
  {
    displayName: 'Field',
    componentName: 'Field',
    defaultElement: 'div',
    slots: fieldSlots,
    componentPropKeys: ['invalid', 'required', 'disabled', 'readOnly', 'id'] as const,
    // systems intentionally empty — Field is Headless.
    styling: {
      structure: { stylesNames },
      resources: { classes: validatedClasses },
    },
  },
  ({ Element, ref, componentProps, domProps, styles }) => {
    const {
      invalid = false,
      required = false,
      disabled = false,
      readOnly = false,
      id: providedId,
    } = componentProps as FieldOwnProps;

    // Stable auto id; user-provided id always wins.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const autoId = React.useId();
    const baseId = providedId ?? autoId;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const contextValue = React.useMemo<FieldContextValue>(
      () => ({
        baseId,
        inputId: `${baseId}-input`,
        labelId: `${baseId}-label`,
        descriptionId: `${baseId}-description`,
        errorId: `${baseId}-error`,
        disabled,
        readOnly,
        invalid,
        required,
      }),
      [baseId, disabled, readOnly, invalid, required],
    );

    return (
      <FieldContext.Provider value={contextValue}>
        <Element ref={ref} {...styles.getRootProps()} {...domProps} />
      </FieldContext.Provider>
    );
  },
);

(Field as React.FC).displayName = 'Field';

// ── Attach compound components ──────────────────────────────────────────────
// Each compound is an independent factory-created component that reads
// FieldContext. Attachment is done here (not in index.ts) so that consumers
// importing `Field` from this module get the full compound API.
(Field as any).Label = FieldLabel;
(Field as any).Description = FieldDescription;
(Field as any).Error = FieldError;
