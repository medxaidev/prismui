import { factory, ensureClasses } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import classes from './Button.module.css';

export type ButtonStylesNames = 'root' | 'inner' | 'label';

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

const stylesNames = ['root', 'inner', 'label'] as const;

const validatedClasses = ensureClasses(stylesNames, classes);

export const Button = factory(
  {
    displayName: 'Button',
    componentName: 'Button',
    defaultElement: 'button',
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
      <span {...styles.getStyles('inner')}>
        <span {...styles.getStyles('label')}>{domProps.children}</span>
      </span>
    </Element>
  ),
);

Button.displayName = 'Button';
