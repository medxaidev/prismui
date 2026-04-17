import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import { useFieldContext } from './FieldContext';
import classes from './Field.module.css';

const errorSlots = defineSlots({
  root: 'p',
});

export type FieldErrorStylesNames = SlotNames<typeof errorSlots>;

export interface FieldErrorOwnProps
  extends Omit<PolymorphicSystemProps, 'size' | 'variant' | 'color' | 'disabled'> {
  children?: React.ReactNode;
}

export type FieldErrorProps = FieldErrorOwnProps & StylesOverride<FieldErrorStylesNames>;

const errorClassMap = { root: classes.error } as const;
const stylesNames = Object.keys(errorSlots) as (keyof typeof errorSlots)[];
const validatedClasses = ensureClasses(stylesNames, errorClassMap);

/**
 * Field.Error — error message.
 *
 * Reads `errorId` + `disabled` from FieldContext.
 * The existence of Field.Error does NOT derive `invalid` — invalid is always
 * explicit on the Field root (see spec §invalid-triggering).
 *
 * Color comes from semantic (error), NOT from state (invalid).
 */
export const FieldError = factory(
  {
    displayName: 'Field.Error',
    componentName: 'Field.Error',
    defaultElement: 'p',
    slots: errorSlots,
    componentPropKeys: [] as const,
    styling: {
      structure: { stylesNames },
      resources: { classes: validatedClasses },
    },
  },
  ({ Element, ref, domProps, styles }) => {
    const ctx = useFieldContext();
    const dataAttrs: Record<string, string> = {};
    if (ctx?.disabled) dataAttrs['data-disabled'] = 'true';

    return (
      <Element
        ref={ref}
        {...styles.getRootProps()}
        id={ctx?.errorId}
        {...dataAttrs}
        {...domProps}
      />
    );
  },
);

(FieldError as React.FC).displayName = 'Field.Error';
