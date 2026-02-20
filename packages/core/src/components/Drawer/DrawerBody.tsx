'use client';

import React, { forwardRef } from 'react';
import classes from './Drawer.module.css';

export interface DrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const DrawerBody = forwardRef<HTMLDivElement, DrawerBodyProps>(
  function DrawerBody({ className, children, ...props }, ref) {
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

DrawerBody.displayName = '@prismui/core/DrawerBody';
