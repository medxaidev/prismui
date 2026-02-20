'use client';

import React, { forwardRef } from 'react';
import classes from './Drawer.module.css';

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(
  function DrawerHeader({ className, children, ...props }, ref) {
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

DrawerHeader.displayName = '@prismui/core/DrawerHeader';
