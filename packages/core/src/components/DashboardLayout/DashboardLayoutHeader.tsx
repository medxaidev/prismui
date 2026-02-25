'use client';

import React, { forwardRef } from 'react';
import { useDashboardLayoutContext } from './DashboardLayout.context';
import classes from './DashboardLayout.module.css';

export interface DashboardLayoutHeaderProps extends React.ComponentPropsWithoutRef<'header'> {
  children?: React.ReactNode;
  /** Override withBorder from parent. */
  withBorder?: boolean;
}

export const DashboardLayoutHeader = forwardRef<HTMLElement, DashboardLayoutHeaderProps>(
  function DashboardLayoutHeader({ children, className, withBorder, ...others }, ref) {
    const ctx = useDashboardLayoutContext();
    const hasBorder = withBorder ?? ctx.withBorder;
    const rootClassName = [classes.header, className].filter(Boolean).join(' ');

    return (
      <header
        ref={ref}
        className={rootClassName}
        data-with-border={hasBorder || undefined}
        {...others}
      >
        {children}
      </header>
    );
  },
);

DashboardLayoutHeader.displayName = '@prismui/core/DashboardLayoutHeader';
