import { factory, ensureClasses, defineSlots } from '../../core/component';
import type { SlotNames } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import classes from './Button.module.css';

// Stage 9: Slot System — structure declaration as source of truth
const buttonSlots = defineSlots({
  root: 'button',
  inner: 'span',
  label: 'span',
});

export type ButtonStylesNames = SlotNames<typeof buttonSlots>;

export interface ButtonOwnProps extends PolymorphicSystemProps {
  children?: React.ReactNode;
}

export type ButtonProps = ButtonOwnProps & StylesOverride<ButtonStylesNames>;

const fontSizeMap: Record<string, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
};

const varsResolver: VarsResolver<ButtonOwnProps> = (props) => ({
  '--button-height': 'var(--prismui-size-height)',
  '--button-padding-x': 'var(--prismui-size-padding-x)',
  '--button-font-size': fontSizeMap[props.size ?? 'md'],
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
    componentPropKeys: ['size', 'variant', 'color', 'disabled'] as const,
    systems: ['variant', 'size', 'state'],
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
  ({ Element, ref, domProps, componentProps, styles }) => (
    <Element ref={ref} {...styles.getRootProps()} {...domProps} disabled={componentProps.disabled}>
      <Button.Inner data-prismui-slot-usage {...styles.getStyles('inner')}>
        <Button.Label data-prismui-slot-usage {...styles.getStyles('label')}>{domProps.children}</Button.Label>
      </Button.Inner>
    </Element>
  ),
);

Button.displayName = 'Button';
