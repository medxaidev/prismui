'use client';

import React, { forwardRef } from 'react';
import classes from './Drawer.module.css';

export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(
  function DrawerFooter({ className, children, ...props }, ref) {
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

DrawerFooter.displayName = '@prismui/core/DrawerFooter';
