import { forwardRef } from 'react';
import type { ElementType } from '../../core/types';
import { createPolymorphicComponent } from '../../core/types';
import type { BoxProps } from '../Box';
import { Box } from '../Box';

export interface TextProps extends BoxProps { }

interface _TextProps extends TextProps {
  component?: ElementType;
}

const _Text = forwardRef<unknown, _TextProps>(({ component, ...others }, ref) => {
  return <Box ref={ref} component={component || 'span'} {...others} />;
});

export const Text = createPolymorphicComponent<'span', TextProps>(_Text);
Text.displayName = '@prismui/core/Text';
