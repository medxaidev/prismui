'use client';

import { forwardRef } from 'react';
import { ButtonBase } from '../ButtonBase';
import type { ButtonBaseProps } from '../ButtonBase';
import { CloseIcon } from '../../icons/CloseIcon';
import { useDialogContext } from './Dialog.context';
import classes from './Dialog.module.css';

export interface DialogCloseButtonProps extends Omit<ButtonBaseProps, 'children'> {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const DialogCloseButton = forwardRef<HTMLButtonElement, DialogCloseButtonProps>(
  function DialogCloseButton({ className, onClick, ...props }, ref) {
    const ctx = useDialogContext();

    return (
      <ButtonBase
        ref={ref}
        className={`${classes.close}${className ? ` ${className}` : ''}`}
        onClick={(e) => {
          onClick?.(e);
          ctx.onClose();
        }}
        aria-label="Close"
        __staticSelector="Dialog"
        disableRipple
        {...props}
      >
        <CloseIcon size={20} />
      </ButtonBase>
    );
  },
);

DialogCloseButton.displayName = '@prismui/core/DialogCloseButton';
