import React, { useCallback, useRef } from 'react';
import {
  polymorphicFactory,
  useProps,
  useStyles,
} from '../../core/factory';
import type {
  PolymorphicFactory,
  StylesApiProps,
} from '../../core/factory';
import { Box } from '../Box';
import type { BoxProps } from '../Box';
import { TouchRipple } from './TouchRipple';
import type { TouchRippleActions, TouchRippleProps } from './TouchRipple';
import classes from './ButtonBase.module.css';

export type ButtonBaseStylesNames = 'root';

export interface ButtonBaseProps
  extends BoxProps,
  StylesApiProps<ButtonBaseFactory> {
  /**
   * Static selector name used for theme class name lookups.
   * Parent components (e.g. Button) can override this to use
   * their own theme component name for classNames/styles resolution.
   * @default 'ButtonBase'
   */
  __staticSelector?: string;

  /**
   * If `true`, the ripple effect is disabled entirely.
   * @default false
   */
  disableRipple?: boolean;

  /**
   * If `true`, the touch ripple effect is disabled (mouse ripple still works).
   * @default false
   */
  disableTouchRipple?: boolean;

  /**
   * If `true`, the ripple starts at the center of the component
   * rather than at the point of interaction.
   * @default false
   */
  centerRipple?: boolean;

  /**
   * If `true`, the component shows a pulsating ripple when focused
   * via keyboard (focus-visible).
   * @default false
   */
  focusRipple?: boolean;

  /**
   * Props applied to the internal `TouchRipple` element.
   */
  TouchRippleProps?: Partial<TouchRippleProps>;

  /**
   * Ref to the internal `TouchRipple` actions (start/stop/pulsate).
   */
  touchRippleRef?: React.Ref<TouchRippleActions>;
}

export type ButtonBaseFactory = PolymorphicFactory<{
  props: ButtonBaseProps;
  defaultRef: HTMLButtonElement;
  defaultComponent: 'button';
  stylesNames: ButtonBaseStylesNames;
}>;

const defaultProps = {
  __staticSelector: 'ButtonBase',
} satisfies Partial<ButtonBaseProps>;

export type { TouchRippleActions, TouchRippleProps };

/** DOM event handlers extracted from the polymorphic props rest spread. */
interface RippleEventHandlers {
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  onTouchStart?: React.TouchEventHandler;
  onTouchEnd?: React.TouchEventHandler;
  onTouchMove?: React.TouchEventHandler;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
  onDragLeave?: React.DragEventHandler;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ButtonBase = polymorphicFactory<ButtonBaseFactory>(
  (_props: ButtonBaseProps & { component?: any }, ref) => {
    const props = useProps('ButtonBase', defaultProps, _props) as
      ButtonBaseProps & RippleEventHandlers & { __staticSelector: string; component?: any };
    const {
      className,
      component = 'button',
      __staticSelector,
      unstyled,
      classNames,
      styles,
      style,
      variant,
      disableRipple = false,
      disableTouchRipple = false,
      centerRipple = false,
      focusRipple = false,
      TouchRippleProps: touchRippleProps,
      touchRippleRef,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchEnd,
      onTouchMove,
      onFocus,
      onBlur,
      onDragLeave,
      disabled,
      children,
      ...others
    } = props;

    const getStyles = useStyles<ButtonBaseFactory>({
      name: __staticSelector!,
      props,
      classes,
      className,
      style,
      classNames,
      styles,
      unstyled,
    });

    const rippleRef = useRef<TouchRippleActions>(null);

    const enableRipple = !disableRipple && !disabled;
    const enableTouchRipple = enableRipple && !disableTouchRipple;

    // ---- Ripple event handlers ----

    const handleMouseDown = useCallback(
      (event: React.MouseEvent) => {
        onMouseDown?.(event as any);
        if (enableRipple) {
          rippleRef.current?.start(event);
        }
      },
      [onMouseDown, enableRipple],
    );

    const handleMouseUp = useCallback(
      (event: React.MouseEvent) => {
        onMouseUp?.(event as any);
        if (enableRipple) {
          rippleRef.current?.stop(event);
        }
      },
      [onMouseUp, enableRipple],
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent) => {
        onMouseLeave?.(event as any);
        if (enableRipple) {
          rippleRef.current?.stop(event);
        }
      },
      [onMouseLeave, enableRipple],
    );

    const handleTouchStart = useCallback(
      (event: React.TouchEvent) => {
        onTouchStart?.(event as any);
        if (enableTouchRipple) {
          rippleRef.current?.start(event);
        }
      },
      [onTouchStart, enableTouchRipple],
    );

    const handleTouchEnd = useCallback(
      (event: React.TouchEvent) => {
        onTouchEnd?.(event as any);
        if (enableTouchRipple) {
          rippleRef.current?.stop(event);
        }
      },
      [onTouchEnd, enableTouchRipple],
    );

    const handleTouchMove = useCallback(
      (event: React.TouchEvent) => {
        onTouchMove?.(event as any);
        if (enableTouchRipple) {
          rippleRef.current?.stop(event);
        }
      },
      [onTouchMove, enableTouchRipple],
    );

    const handleDragLeave = useCallback(
      (event: React.DragEvent) => {
        onDragLeave?.(event as any);
        if (enableRipple) {
          rippleRef.current?.stop(event);
        }
      },
      [onDragLeave, enableRipple],
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent) => {
        onFocus?.(event as any);
        if (enableRipple && focusRipple) {
          rippleRef.current?.pulsate();
        }
      },
      [onFocus, enableRipple, focusRipple],
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent) => {
        onBlur?.(event as any);
        if (enableRipple && focusRipple) {
          rippleRef.current?.stop(event);
        }
      },
      [onBlur, enableRipple, focusRipple],
    );

    // Merge refs for touchRippleRef
    const setRippleRef = useCallback(
      (instance: TouchRippleActions | null) => {
        (rippleRef as React.MutableRefObject<TouchRippleActions | null>).current = instance;
        if (typeof touchRippleRef === 'function') {
          touchRippleRef(instance);
        } else if (touchRippleRef && typeof touchRippleRef === 'object') {
          (touchRippleRef as React.MutableRefObject<TouchRippleActions | null>).current = instance;
        }
      },
      [touchRippleRef],
    );

    return (
      <Box
        {...getStyles('root')}
        component={component}
        ref={ref}
        type={component === 'button' ? 'button' : undefined}
        variant={variant}
        disabled={disabled}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onDragLeave={handleDragLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...others}
      >
        {children}
        {enableRipple ? (
          <TouchRipple
            ref={setRippleRef}
            center={centerRipple}
            {...touchRippleProps}
          />
        ) : null}
      </Box>
    );
  },
);

ButtonBase.classes = classes;
ButtonBase.displayName = '@prismui/core/ButtonBase';
