import { factory, ensureClasses } from '../../core/component';
import type { StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import classes from './Badge.module.css';

// Layer 1: StylesNames
export type BadgeStylesNames = 'root';

// Layer 2: OwnProps（系统 props 来自 PolymorphicSystemProps）
export interface BadgeOwnProps extends PolymorphicSystemProps {
  children?: React.ReactNode;
}

// Layer 3: 完整 Props
export type BadgeProps = BadgeOwnProps & StylesOverride<BadgeStylesNames>;

const stylesNames = ['root'] as const;
const validatedClasses = ensureClasses(stylesNames, classes);

// Layer 4: factory（声明式三轴接入，Minimal 类型：无私有变量）
export const Badge = factory({
  displayName: 'Badge',
  defaultElement: 'span',
  componentPropKeys: ['variant', 'color', 'size', 'disabled'] as const,
  systems: ['variant', 'size', 'state'],
  styling: {
    structure: { stylesNames },
    resources: { classes: validatedClasses },
    logic: { varsResolver: () => ({}) },
  },
});

Badge.displayName = 'Badge';
