'use client';

import React, { forwardRef } from 'react';
import { useDashboardLayoutContext } from './DashboardLayout.context';
import classes from './DashboardLayout.module.css';

export interface DashboardLayoutNavbarProps extends React.ComponentPropsWithoutRef<'nav'> {
  children?: React.ReactNode;
  /** Override withBorder from parent. */
  withBorder?: boolean;
}

export const DashboardLayoutNavbar = forwardRef<HTMLElement, DashboardLayoutNavbarProps>(
  function DashboardLayoutNavbar({ children, className, withBorder, ...others }, ref) {
    const ctx = useDashboardLayoutContext();
    const hasBorder = withBorder ?? ctx.withBorder;
    const rootClassName = [classes.navbar, className].filter(Boolean).join(' ');

    return (
      <nav
        ref={ref}
        className={rootClassName}
        data-with-border={hasBorder || undefined}
        data-collapsed={ctx.desktopCollapsed || undefined}
        data-opened={ctx.mobileOpened || undefined}
        {...others}
      >
        {children}
      </nav>
    );
  },
);

DashboardLayoutNavbar.displayName = '@prismui/core/DashboardLayoutNavbar';
