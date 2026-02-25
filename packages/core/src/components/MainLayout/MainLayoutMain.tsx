'use client';

import React, { forwardRef } from 'react';
import classes from './MainLayout.module.css';

export interface MainLayoutMainProps extends React.ComponentPropsWithoutRef<'main'> {
  children?: React.ReactNode;
}

export const MainLayoutMain = forwardRef<HTMLElement, MainLayoutMainProps>(
  function MainLayoutMain({ children, className, ...others }, ref) {
    const rootClassName = [classes.main, className].filter(Boolean).join(' ');

    return (
      <main ref={ref} className={rootClassName} {...others}>
        {children}
      </main>
    );
  },
);

MainLayoutMain.displayName = '@prismui/core/MainLayoutMain';
