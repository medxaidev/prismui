import * as React from 'react';
import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import { useFieldContext } from './FieldContext';
import classes from './Field.module.css';

const descriptionSlots = defineSlots({
  root: 'p',
});

export type FieldDescriptionStylesNames = SlotNames<typeof descriptionSlots>;

export interface FieldDescriptionOwnProps
  extends Omit<PolymorphicSystemProps, 'size' | 'variant' | 'color' | 'disabled'> {
  children?: React.ReactNode;
}

export type FieldDescriptionProps =
  FieldDescriptionOwnProps & StylesOverride<FieldDescriptionStylesNames>;

const descriptionClassMap = { root: classes.description } as const;
const stylesNames = Object.keys(descriptionSlots) as (keyof typeof descriptionSlots)[];
const validatedClasses = ensureClasses(stylesNames, descriptionClassMap);

/**
 * Field.Description — supplemental help text.
 *
 * Reads `descriptionId` + `disabled` from FieldContext.
 * When used outside Field, renders plain `<p>` (no id injection).
 */
export const FieldDescription = factory(
  {
    displayName: 'Field.Description',
    componentName: 'Field.Description',
    defaultElement: 'p',
    slots: descriptionSlots,
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
        id={ctx?.descriptionId}
        {...dataAttrs}
        {...domProps}
      />
    );
  },
);

(FieldDescription as React.FC).displayName = 'Field.Description';
