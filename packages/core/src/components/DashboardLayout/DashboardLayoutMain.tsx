'use client';

import React, { forwardRef } from 'react';
import classes from './DashboardLayout.module.css';

export interface DashboardLayoutMainProps extends React.ComponentPropsWithoutRef<'main'> {
  children?: React.ReactNode;
}

export const DashboardLayoutMain = forwardRef<HTMLElement, DashboardLayoutMainProps>(
  function DashboardLayoutMain({ children, className, ...others }, ref) {
    const rootClassName = [classes.main, className].filter(Boolean).join(' ');

    return (
      <main ref={ref} className={rootClassName} {...others}>
        {children}
      </main>
    );
  },
);

DashboardLayoutMain.displayName = '@prismui/core/DashboardLayoutMain';
