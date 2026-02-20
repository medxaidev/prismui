'use client';

import React, { forwardRef } from 'react';
import classes from './Drawer.module.css';

export interface DrawerTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const DrawerTitle = forwardRef<HTMLDivElement, DrawerTitleProps>(
  function DrawerTitle({ className, children, ...props }, ref) {
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

DrawerTitle.displayName = '@prismui/core/DrawerTitle';
