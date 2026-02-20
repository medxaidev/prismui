'use client';

import React, { forwardRef } from 'react';
import { DrawerBase } from '../DrawerBase/DrawerBase';
import type { DrawerBaseProps } from '../DrawerBase/DrawerBase';
import { ButtonBase } from '../ButtonBase';
import type { ButtonBaseProps } from '../ButtonBase';
import { CloseIcon } from '../../icons/CloseIcon';
import { DrawerContext } from './Drawer.context';
import type { DrawerContextValue } from './Drawer.context';
import classes from './Drawer.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DrawerStylesNames = 'root' | 'content' | 'header' | 'title' | 'body' | 'footer' | 'close';

export interface DrawerProps extends Omit<DrawerBaseProps, 'children'> {
  /** Drawer title rendered in the header. */
  title?: React.ReactNode;

  /** Whether to show a close button in the header. @default true */
  withCloseButton?: boolean;

  /** Props passed to the close button (ButtonBase). */
  closeButtonProps?: Omit<ButtonBaseProps, 'children'>;

  /** Drawer content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  function Drawer(props, ref) {
    const {
      title,
      withCloseButton = true,
      closeButtonProps,
      children,
      ...others
    } = props;

    const ctxValue: DrawerContextValue = {
      onClose: others.onClose,
      withCloseButton,
    };

    return (
      <DrawerContext.Provider value={ctxValue}>
        <DrawerBase ref={ref} {...others}>
          {(title || withCloseButton) && (
            <div className={classes.header}>
              {title && <div className={classes.title}>{title}</div>}
              {withCloseButton && (
                <ButtonBase
                  className={classes.close}
                  onClick={others.onClose}
                  aria-label="Close"
                  __staticSelector="Drawer"
                  disableRipple
                  {...closeButtonProps}
                >
                  <CloseIcon size={20} />
                </ButtonBase>
              )}
            </div>
          )}
          <div className={classes.body}>{children}</div>
        </DrawerBase>
      </DrawerContext.Provider>
    );
  },
);

Drawer.displayName = '@prismui/core/Drawer';
