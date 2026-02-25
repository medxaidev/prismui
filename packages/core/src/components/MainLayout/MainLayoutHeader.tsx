'use client';

import React, { forwardRef } from 'react';
import { useMainLayoutContext } from './MainLayout.context';
import classes from './MainLayout.module.css';

export interface MainLayoutHeaderProps extends React.ComponentPropsWithoutRef<'header'> {
  children?: React.ReactNode;
  withBorder?: boolean;
}

export const MainLayoutHeader = forwardRef<HTMLElement, MainLayoutHeaderProps>(
  function MainLayoutHeader({ children, className, withBorder, ...others }, ref) {
    const ctx = useMainLayoutContext();
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

MainLayoutHeader.displayName = '@prismui/core/MainLayoutHeader';
