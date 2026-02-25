'use client';

import React, { forwardRef, useState, useCallback, useRef, startTransition } from 'react';
import { useMediaQuery } from '../../hooks/use-media-query';
import { useWindowEvent } from '../../hooks/use-window-event';
import { DashboardLayoutProvider } from './DashboardLayout.context';
import { DashboardLayoutHeader } from './DashboardLayoutHeader';
import { DashboardLayoutNavbar } from './DashboardLayoutNavbar';
import { DashboardLayoutMain } from './DashboardLayoutMain';
import { DashboardLayoutSection } from './DashboardLayoutSection';
import classes from './DashboardLayout.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardLayoutNavbarConfig {
  /** Expanded width in px. @default 280 */
  width?: number;
  /** Mini (collapsed) width in px. @default 88 */
  miniWidth?: number;
  /** Breakpoint below which navbar becomes a mobile drawer.
   *  Provide a px value or media query string. @default 1200 */
  breakpoint?: number | string;
  /** Controlled collapsed state. */
  collapsed?: {
    desktop?: boolean;
    mobile?: boolean;
  };
}

export interface DashboardLayoutHeaderConfig {
  /** Header height in px. @default 64 */
  height?: number;
}

export interface DashboardLayoutProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Navbar configuration. */
  navbar?: DashboardLayoutNavbarConfig;
  /** Header configuration. */
  header?: DashboardLayoutHeaderConfig;
  /** Layout mode.
   *  - `'alt'` (default): Sidebar full height, header beside it (minimals.cc style).
   *  - `'default'`: Header full width, sidebar below it (Mantine style).
   *  @default 'alt'
   */
  layout?: 'default' | 'alt';
  /** Transition duration in ms. @default 200 */
  transitionDuration?: number;
  /** Show borders between layout sections. @default true */
  withBorder?: boolean;
  /** Called when desktop collapsed state changes. */
  onNavbarCollapse?: (collapsed: boolean) => void;
  /** Called when mobile drawer state changes. */
  onNavbarMobileChange?: (opened: boolean) => void;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const DashboardLayout = forwardRef<HTMLDivElement, DashboardLayoutProps>(
  function DashboardLayout(
    {
      navbar,
      header,
      layout = 'alt',
      transitionDuration = 200,
      withBorder = true,
      onNavbarCollapse,
      onNavbarMobileChange,
      children,
      className,
      style,
      ...others
    },
    ref,
  ) {
    const navbarWidth = navbar?.width ?? 280;
    const navbarMiniWidth = navbar?.miniWidth ?? 88;
    const headerHeight = header?.height ?? 64;
    const breakpoint = navbar?.breakpoint ?? 1200;

    // ---- Responsive mobile detection ----
    const mediaQuery =
      typeof breakpoint === 'string' ? breakpoint : `(max-width: ${breakpoint - 0.1}px)`;
    const isMobile = useMediaQuery(mediaQuery);

    // ---- Collapse state (controlled / uncontrolled) ----
    const isDesktopControlled = navbar?.collapsed?.desktop !== undefined;
    const isMobileControlled = navbar?.collapsed?.mobile !== undefined;

    const [internalDesktopCollapsed, setInternalDesktopCollapsed] = useState(false);
    const [internalMobileOpened, setInternalMobileOpened] = useState(false);

    const desktopCollapsed = isDesktopControlled
      ? navbar!.collapsed!.desktop!
      : internalDesktopCollapsed;
    const mobileOpened = isMobileControlled
      ? navbar!.collapsed!.mobile!
      : internalMobileOpened;

    const setDesktopCollapsed = useCallback(
      (v: boolean) => {
        if (!isDesktopControlled) setInternalDesktopCollapsed(v);
        onNavbarCollapse?.(v);
      },
      [isDesktopControlled, onNavbarCollapse],
    );

    const setMobileOpened = useCallback(
      (v: boolean) => {
        if (!isMobileControlled) setInternalMobileOpened(v);
        onNavbarMobileChange?.(v);
      },
      [isMobileControlled, onNavbarMobileChange],
    );

    const toggleDesktopCollapse = useCallback(
      () => setDesktopCollapsed(!desktopCollapsed),
      [desktopCollapsed, setDesktopCollapsed],
    );

    const toggleMobile = useCallback(
      () => setMobileOpened(!mobileOpened),
      [mobileOpened, setMobileOpened],
    );

    // ---- Resize detection (disable transitions during resize) ----
    const [isResizing, setIsResizing] = useState(false);
    const resizeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useWindowEvent('resize', useCallback(() => {
      setIsResizing(true);
      clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(
        () => startTransition(() => setIsResizing(false)),
        200,
      );
    }, []));

    // ---- Compute current navbar width ----
    const currentNavWidth = isMobile ? 0 : desktopCollapsed ? navbarMiniWidth : navbarWidth;

    // ---- CSS variables ----
    const cssVars = {
      '--dl-navbar-width': `${currentNavWidth}px`,
      '--dl-navbar-expanded-width': `${navbarWidth}px`,
      '--dl-navbar-mini-width': `${navbarMiniWidth}px`,
      '--dl-header-height': `${headerHeight}px`,
      '--dl-transition-duration': `${transitionDuration}ms`,
      ...style,
    } as React.CSSProperties;

    const rootClassName = [classes.root, className].filter(Boolean).join(' ');

    return (
      <DashboardLayoutProvider
        value={{
          desktopCollapsed,
          mobileOpened,
          toggleDesktopCollapse,
          toggleMobile,
          setDesktopCollapsed,
          setMobileOpened,
          navbarWidth,
          navbarMiniWidth,
          headerHeight,
          layout,
          transitionDuration,
          isMobile,
          isResizing,
          withBorder,
        }}
      >
        <div
          ref={ref}
          className={rootClassName}
          data-layout={layout}
          data-mobile={isMobile || undefined}
          data-resizing={isResizing || undefined}
          style={cssVars}
          {...others}
        >
          {children}
          {/* Mobile overlay backdrop */}
          <div
            className={classes.overlay}
            data-visible={isMobile && mobileOpened ? true : undefined}
            onClick={() => setMobileOpened(false)}
            aria-hidden="true"
          />
        </div>
      </DashboardLayoutProvider>
    );
  },
) as React.ForwardRefExoticComponent<DashboardLayoutProps & React.RefAttributes<HTMLDivElement>> & {
  Header: typeof DashboardLayoutHeader;
  Navbar: typeof DashboardLayoutNavbar;
  Main: typeof DashboardLayoutMain;
  Section: typeof DashboardLayoutSection;
};

DashboardLayout.displayName = '@prismui/core/DashboardLayout';
(DashboardLayout as any).Header = DashboardLayoutHeader;
(DashboardLayout as any).Navbar = DashboardLayoutNavbar;
(DashboardLayout as any).Main = DashboardLayoutMain;
(DashboardLayout as any).Section = DashboardLayoutSection;
