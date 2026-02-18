'use client';

import React, { forwardRef } from 'react';
import classes from './Dialog.module.css';

export interface DialogTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const DialogTitle = forwardRef<HTMLDivElement, DialogTitleProps>(
  function DialogTitle({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`${classes.title}${className ? ` ${className}` : ''}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

DialogTitle.displayName = '@prismui/core/DialogTitle';
