'use client';

import { forwardRef } from 'react';
import { ButtonBase } from '../ButtonBase';
import type { ButtonBaseProps } from '../ButtonBase';
import { CloseIcon } from '../../icons/CloseIcon';
import { useDrawerContext } from './Drawer.context';
import classes from './Drawer.module.css';

export interface DrawerCloseButtonProps extends Omit<ButtonBaseProps, 'children'> {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const DrawerCloseButton = forwardRef<HTMLButtonElement, DrawerCloseButtonProps>(
  function DrawerCloseButton({ className, onClick, ...props }, ref) {
    const ctx = useDrawerContext();

    return (
      <ButtonBase
        ref={ref}
        className={`${classes.close}${className ? ` ${className}` : ''}`}
        onClick={(e) => {
          onClick?.(e);
          ctx.onClose();
        }}
        aria-label="Close"
        __staticSelector="Drawer"
        disableRipple
        {...props}
      >
        <CloseIcon size={20} />
      </ButtonBase>
    );
  },
);

DrawerCloseButton.displayName = '@prismui/core/DrawerCloseButton';
