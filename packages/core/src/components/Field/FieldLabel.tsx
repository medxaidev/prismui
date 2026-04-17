import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import { useFieldContext } from './FieldContext';
import classes from './Field.module.css';

const labelSlots = defineSlots({
  root: 'label',
});

export type FieldLabelStylesNames = SlotNames<typeof labelSlots>;

export interface FieldLabelOwnProps
  extends Omit<PolymorphicSystemProps, 'size' | 'variant' | 'color' | 'disabled'> {
  children?: React.ReactNode;
}

export type FieldLabelProps = FieldLabelOwnProps & StylesOverride<FieldLabelStylesNames>;

// Class map maps the factory's "root" slot to the shared CSS Module's `.label` class,
// so all three compound components can share Field.module.css.
const labelClassMap = { root: classes.label } as const;
const stylesNames = Object.keys(labelSlots) as (keyof typeof labelSlots)[];
const validatedClasses = ensureClasses(stylesNames, labelClassMap);

/**
 * Field.Label — semantic label with automatic `htmlFor` connection.
 *
 * Reads `inputId` / `labelId` / `required` / `disabled` from FieldContext.
 * When used outside Field, falls back gracefully (no htmlFor, no required marker).
 *
 * Required marker (`*`) is rendered via CSS `::after` + `[data-required]`
 * attribute selector — see `Field.module.css`.
 */
export const FieldLabel = factory(
  {
    displayName: 'Field.Label',
    componentName: 'Field.Label',
    defaultElement: 'label',
    slots: labelSlots,
    componentPropKeys: [] as const,
    styling: {
      structure: { stylesNames },
      resources: { classes: validatedClasses },
    },
  },
  ({ Element, ref, domProps, styles }) => {
    const ctx = useFieldContext();
    const dataAttrs: Record<string, string> = {};
    if (ctx?.required) dataAttrs['data-required'] = 'true';
    if (ctx?.disabled) dataAttrs['data-disabled'] = 'true';

    return (
      <Element
        ref={ref}
        {...styles.getRootProps()}
        htmlFor={ctx?.inputId}
        id={ctx?.labelId}
        {...dataAttrs}
        {...domProps}
      />
    );
  },
);

(FieldLabel as React.FC).displayName = 'Field.Label';
