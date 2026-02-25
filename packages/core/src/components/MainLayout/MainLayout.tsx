'use client';

import React, { forwardRef } from 'react';
import { MainLayoutProvider } from './MainLayout.context';
import { MainLayoutHeader } from './MainLayoutHeader';
import { MainLayoutMain } from './MainLayoutMain';
import classes from './MainLayout.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MainLayoutProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Header configuration. */
  header?: { height?: number };
  /** Show border below header. @default true */
  withBorder?: boolean;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MainLayout = forwardRef<HTMLDivElement, MainLayoutProps>(
  function MainLayout(
    { header, withBorder = true, children, className, style, ...others },
    ref,
  ) {
    const headerHeight = header?.height ?? 64;
    const rootClassName = [classes.root, className].filter(Boolean).join(' ');

    const cssVars = {
      '--ml-header-height': `${headerHeight}px`,
      ...style,
    } as React.CSSProperties;

    return (
      <MainLayoutProvider value={{ headerHeight, withBorder }}>
        <div ref={ref} className={rootClassName} style={cssVars} {...others}>
          {children}
        </div>
      </MainLayoutProvider>
    );
  },
) as React.ForwardRefExoticComponent<MainLayoutProps & React.RefAttributes<HTMLDivElement>> & {
  Header: typeof MainLayoutHeader;
  Main: typeof MainLayoutMain;
};

MainLayout.displayName = '@prismui/core/MainLayout';
(MainLayout as any).Header = MainLayoutHeader;
(MainLayout as any).Main = MainLayoutMain;
