'use client';

import React, { forwardRef } from 'react';
import classes from './Dialog.module.css';

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`${classes.footer}${className ? ` ${className}` : ''}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

DialogFooter.displayName = '@prismui/core/DialogFooter';
