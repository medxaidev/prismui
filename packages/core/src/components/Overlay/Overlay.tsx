import React from 'react';
import {
  polymorphicFactory,
  useProps,
  useStyles,
  createVarsResolver,
} from '../../core/factory';
import type {
  PolymorphicFactory,
  StylesApiProps,
} from '../../core/factory';
import type { BoxProps, ElementProps } from '../Box';
import { Box } from '../Box';
import { getRadius } from '../../core/theme/get-radius';
import { rem } from '../../utils/rem';
import type { PrismuiRadius } from '../../core/theme/types';
import classes from './Overlay.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OverlayStylesNames = 'root';

export type OverlayCssVariables = {
  root:
  | '--overlay-bg'
  | '--overlay-filter'
  | '--overlay-radius'
  | '--overlay-z-index';
};

export interface OverlayProps
  extends BoxProps,
  StylesApiProps<OverlayFactory>,
  ElementProps<'div'> {
  /** Overlay background-color opacity 0–1, ignored when gradient is set @default 0.6 */
  backgroundOpacity?: number;

  /** Overlay background-color @default '#000' */
  color?: React.CSSProperties['backgroundColor'];

  /** Overlay background blur @default 0 */
  blur?: number | string;

  /** Overlay background gradient. If set, color prop is ignored. */
  gradient?: string;

  /** Overlay z-index @default 200 */
  zIndex?: string | number;

  /** Border radius @default 0 */
  radius?: PrismuiRadius;

  /** Content inside overlay */
  children?: React.ReactNode;

  /** Centers content inside the overlay @default false */
  center?: boolean;

  /** Changes position to fixed @default false */
  fixed?: boolean;
}

export type OverlayFactory = PolymorphicFactory<{
  props: OverlayProps;
  defaultRef: HTMLDivElement;
  defaultComponent: 'div';
  stylesNames: OverlayStylesNames;
  vars: OverlayCssVariables;
}>;

// ---------------------------------------------------------------------------
// Defaults & varsResolver
// ---------------------------------------------------------------------------

const defaultProps = {
  zIndex: 200,
  backgroundOpacity: 0.48,
  color: '#1C252E',
  blur: 0,
  radius: 0,
} satisfies Partial<OverlayProps>;

function rgba(color: string, opacity: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');

    // 3-char hex: #abc → #aabbcc
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // 6-char hex: #aabbcc
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  // For rgb/rgba colors, extract values and apply opacity
  if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',').map(s => s.trim());
      if (parts.length >= 3) {
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`;
      }
    }
  }

  // Fallback: use color-mix for other formats (CSS color names, etc.)
  return `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
}

const varsResolver = createVarsResolver<OverlayFactory>(
  (_, { gradient, color, backgroundOpacity, blur, radius, zIndex }) => ({
    root: {
      '--overlay-bg':
        gradient ||
        ((color !== undefined || backgroundOpacity !== undefined) &&
          rgba(color || '#1C252E', backgroundOpacity ?? 0.48)) ||
        undefined,
      '--overlay-filter': blur ? `blur(${rem(blur)})` : undefined,
      '--overlay-radius': radius === undefined ? undefined : getRadius(radius),
      '--overlay-z-index': zIndex?.toString(),
    },
  }),
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Overlay = polymorphicFactory<OverlayFactory>((_props, ref) => {
  const props = useProps('Overlay', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    fixed,
    center,
    children,
    radius,
    zIndex,
    gradient,
    blur,
    color,
    backgroundOpacity,
    mod,
    ...others
  } = props;

  const getStyles = useStyles<OverlayFactory>({
    name: 'Overlay',
    props,
    classes,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  return (
    <Box ref={ref} {...getStyles('root')} mod={[{ center, fixed }, mod]} {...others}>
      {children}
    </Box>
  );
});

Overlay.classes = classes;
Overlay.displayName = '@prismui/core/Overlay';
