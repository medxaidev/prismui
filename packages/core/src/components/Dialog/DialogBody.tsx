'use client';

import React, { forwardRef } from 'react';
import classes from './Dialog.module.css';

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  function DialogBody({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`${classes.body}${className ? ` ${className}` : ''}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

DialogBody.displayName = '@prismui/core/DialogBody';
