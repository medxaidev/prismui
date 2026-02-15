import {
  factory,
  useProps,
  useStyles,
} from '../../core/factory';
import type {
  Factory,
  StylesApiProps,
} from '../../core/factory';
import type { BoxProps, ElementProps } from '../Box';
import { Box } from '../Box';
import type { PrismuiVariant } from '../../core/theme/types/variant';
import classes from './ButtonGroup.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ButtonGroupStylesNames = 'group';

export interface ButtonGroupProps
  extends BoxProps,
  StylesApiProps<ButtonGroupFactory>,
  ElementProps<'div'> {
  /** Flex direction @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';

  /** Variant applied to the group — controls border handling between children @default 'outlined' */
  variant?: PrismuiVariant;
}

export type ButtonGroupFactory = Factory<{
  props: ButtonGroupProps;
  ref: HTMLDivElement;
  stylesNames: ButtonGroupStylesNames;
}>;

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaultProps: Partial<ButtonGroupProps> = {
  orientation: 'horizontal',
  variant: 'outlined',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ButtonGroup = factory<ButtonGroupFactory>((_props, ref) => {
  const props = useProps('ButtonGroup', defaultProps, _props);
  const {
    className,
    style,
    classNames,
    styles,
    unstyled,
    orientation,
    variant,
    vars,
    mod,
    children,
    role: roleProp,
    ...others
  } = props;

  const getStyles = useStyles<ButtonGroupFactory>({
    name: 'ButtonGroup',
    props,
    classes,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    rootSelector: 'group',
  });

  return (
    <Box
      ref={ref}
      {...getStyles('group')}
      mod={[{ orientation, variant }, mod]}
      role={roleProp ?? 'group'}
      {...others}
    >
      {children}
    </Box>
  );
});

ButtonGroup.classes = classes;
ButtonGroup.displayName = '@prismui/core/ButtonGroup';
