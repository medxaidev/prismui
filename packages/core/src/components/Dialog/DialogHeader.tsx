'use client';

import React, { forwardRef } from 'react';
import classes from './Dialog.module.css';

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`${classes.header}${className ? ` ${className}` : ''}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

DialogHeader.displayName = '@prismui/core/DialogHeader';
