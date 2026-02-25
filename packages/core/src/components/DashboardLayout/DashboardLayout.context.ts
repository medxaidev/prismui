'use client';

import { createContext, useContext } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardLayoutContextValue {
  /** Desktop sidebar collapsed (mini mode) */
  desktopCollapsed: boolean;
  /** Mobile sidebar drawer opened */
  mobileOpened: boolean;

  /** Toggle desktop collapse */
  toggleDesktopCollapse: () => void;
  /** Toggle mobile drawer */
  toggleMobile: () => void;
  /** Set desktop collapsed state */
  setDesktopCollapsed: (v: boolean) => void;
  /** Set mobile opened state */
  setMobileOpened: (v: boolean) => void;

  /** Navbar expanded width (px) */
  navbarWidth: number;
  /** Navbar mini/collapsed width (px) */
  navbarMiniWidth: number;
  /** Header height (px) */
  headerHeight: number;
  /** Layout mode */
  layout: 'default' | 'alt';
  /** Transition duration (ms) */
  transitionDuration: number;
  /** Whether viewport is below navbar breakpoint */
  isMobile: boolean;
  /** Whether window is currently resizing (disables transitions) */
  isResizing: boolean;
  /** Whether the layout has a border between sections */
  withBorder: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DashboardLayoutContext = createContext<DashboardLayoutContextValue | null>(null);

export const DashboardLayoutProvider = DashboardLayoutContext.Provider;

export function useDashboardLayoutContext(): DashboardLayoutContextValue {
  const ctx = useContext(DashboardLayoutContext);
  if (!ctx) {
    throw new Error(
      '[PrismUI] DashboardLayout compound components must be used within a <DashboardLayout>.',
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Public hook — useNavbarState
// ---------------------------------------------------------------------------

export interface NavbarState {
  /** Whether the desktop sidebar is collapsed (mini mode) */
  collapsed: boolean;
  /** Whether the mobile sidebar drawer is open */
  mobileOpened: boolean;
  /** Whether the viewport is mobile-sized */
  isMobile: boolean;
  /** Toggle desktop collapse */
  toggleCollapse: () => void;
  /** Toggle mobile drawer */
  toggleMobile: () => void;
  /** Set desktop collapsed */
  setCollapsed: (v: boolean) => void;
  /** Set mobile opened */
  setMobileOpened: (v: boolean) => void;
}

/**
 * Access navbar state from anywhere within a `<DashboardLayout>`.
 * Typically used in the Header to render a hamburger/collapse button.
 */
export function useNavbarState(): NavbarState {
  const ctx = useDashboardLayoutContext();
  return {
    collapsed: ctx.desktopCollapsed,
    mobileOpened: ctx.mobileOpened,
    isMobile: ctx.isMobile,
    toggleCollapse: ctx.toggleDesktopCollapse,
    toggleMobile: ctx.toggleMobile,
    setCollapsed: ctx.setDesktopCollapsed,
    setMobileOpened: ctx.setMobileOpened,
  };
}
