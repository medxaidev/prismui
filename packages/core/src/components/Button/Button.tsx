import { factory } from '../../core/component';
import { ensureAllClasses } from '../../core/component';
import type { VarsResolver } from '../../core/styles';
import classes from './Button.module.css';

// 1. 定义 StylesNames
type ButtonStylesNames = 'root' | 'inner' | 'label';

// 2. 定义 Props
export interface ButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline';
  children?: React.ReactNode;
}

// 3. 定义 VarsResolver
const varsResolver: VarsResolver<ButtonProps> = (props) => ({
  '--button-height': props.size === 'lg' ? '48px' : props.size === 'sm' ? '32px' : '40px',
  '--button-bg': props.variant === 'outline' ? 'transparent' : '#007bff',
  '--button-color': props.variant === 'outline' ? '#007bff' : '#ffffff',
});

// 4. 验证 CSS Modules 类型安全
const validatedClasses = ensureAllClasses<ButtonStylesNames, typeof classes>(classes);

// 5. 使用 Factory
export const Button = factory(
  {
    displayName: 'Button',
    defaultElement: 'button',
    componentPropKeys: ['size', 'variant'] as const,
    styling: {
      structure: {
        stylesNames: ['root', 'inner', 'label'] as const,
      },
      resources: {
        classes: validatedClasses,
      },
      logic: {
        varsResolver,
      },
    },
  },
  ({ Element, ref, domProps, styles }) => (
    <Element ref={ref} {...styles.getRootProps()} {...domProps}>
      <span {...styles.getStyles('inner')}>
        <span {...styles.getStyles('label')}>{domProps.children}</span>
      </span>
    </Element>
  ),
);

Button.displayName = 'Button';
