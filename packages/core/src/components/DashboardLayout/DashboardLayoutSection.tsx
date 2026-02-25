'use client';

import React, { forwardRef } from 'react';
import classes from './DashboardLayout.module.css';

export interface DashboardLayoutSectionProps extends React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode;
  /** If true, section grows to fill remaining navbar space and becomes scrollable. */
  grow?: boolean;
}

export const DashboardLayoutSection = forwardRef<HTMLDivElement, DashboardLayoutSectionProps>(
  function DashboardLayoutSection({ children, className, grow, ...others }, ref) {
    const rootClassName = [classes.section, className].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={rootClassName}
        data-grow={grow || undefined}
        {...others}
      >
        {children}
      </div>
    );
  },
);

DashboardLayoutSection.displayName = '@prismui/core/DashboardLayoutSection';
