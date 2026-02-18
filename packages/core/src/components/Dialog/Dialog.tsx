'use client';

import React, { forwardRef } from 'react';
import { ModalBase } from '../ModalBase/ModalBase';
import type { ModalBaseProps } from '../ModalBase/ModalBase';
import { ModalBaseOverlay } from '../ModalBase/ModalBaseOverlay';
import { ModalBaseContent } from '../ModalBase/ModalBaseContent';
import { ButtonBase } from '../ButtonBase';
import type { ButtonBaseProps } from '../ButtonBase';
import { CloseIcon } from '../../icons/CloseIcon';
import { DialogContext } from './Dialog.context';
import type { DialogContextValue } from './Dialog.context';
import classes from './Dialog.module.css';
import { rem } from '../../utils/rem';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DialogStylesNames = 'root' | 'inner' | 'content' | 'header' | 'title' | 'body' | 'footer' | 'close';

export interface DialogProps extends Omit<ModalBaseProps, 'children'> {
  /** Dialog title rendered in the header. */
  title?: React.ReactNode;

  /** Whether to show a close button in the header. @default true */
  withCloseButton?: boolean;

  /** Props passed to the close button (ButtonBase). */
  closeButtonProps?: Omit<ButtonBaseProps, 'children'>;

  /** Dialog width. Numbers are converted to rem. @default 440 */
  size?: number | string;

  /** Whether to vertically center the dialog. @default false */
  centered?: boolean;

  /** Whether the dialog should take up the full screen. @default false */
  fullScreen?: boolean;

  /** Overlay background opacity. @default 0.48 */
  overlayOpacity?: number;

  /** Dialog content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  function Dialog(props, ref) {
    const {
      title,
      withCloseButton = true,
      closeButtonProps,
      size = 440,
      centered = false,
      fullScreen = false,
      overlayOpacity,
      children,
      className,
      ...others
    } = props;

    const sizeValue = typeof size === 'number' ? rem(size) : size;

    const ctxValue: DialogContextValue = {
      onClose: others.onClose,
      withCloseButton,
    };

    return (
      <DialogContext.Provider value={ctxValue}>
        <ModalBase
          ref={ref}
          className={className}
          overlaySlot={<ModalBaseOverlay backgroundOpacity={overlayOpacity} />}
          {...others}
        >
          <ModalBaseContent
            shadow="dialog"
            radius={fullScreen ? 0 : 'xl'}
            className={classes.content}
            style={{
              '--dialog-size': sizeValue,
            } as React.CSSProperties}
            data-full-screen={fullScreen || undefined}
            data-centered={centered || undefined}
          >
            {(title || withCloseButton) && (
              <div className={classes.header}>
                {title && <div className={classes.title}>{title}</div>}
                {withCloseButton && (
                  <ButtonBase
                    className={classes.close}
                    onClick={others.onClose}
                    aria-label="Close"
                    __staticSelector="Dialog"
                    disableRipple
                    {...closeButtonProps}
                  >
                    <CloseIcon size={20} />
                  </ButtonBase>
                )}
              </div>
            )}
            <div className={classes.body}>{children}</div>
          </ModalBaseContent>
        </ModalBase>
      </DialogContext.Provider>
    );
  },
);

Dialog.displayName = '@prismui/core/Dialog';
