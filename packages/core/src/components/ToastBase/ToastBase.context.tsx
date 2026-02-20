'use client';

import React, { createContext, useContext } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Position of the toast container on screen */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Data for a single toast */
export interface ToastData {
  /** Unique identifier */
  id: string;
  /** Toast title */
  title?: React.ReactNode;
  /** Toast description / message body */
  description?: React.ReactNode;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Custom action area (buttons, links) */
  action?: React.ReactNode;
  /** Auto-dismiss duration in ms. 0 = no auto-dismiss. @default 4000 */
  duration?: number;
  /** Whether the close button is shown @default true */
  dismissible?: boolean;
  /** Called when toast is closed (manually or auto) */
  onClose?: (id: string) => void;
  /** Called when toast auto-closes */
  onAutoClose?: (id: string) => void;
  /** Creation timestamp */
  createdAt: number;
}

/** Handlers passed to the toast render function */
export interface ToastHandlers {
  /** Close this toast */
  close: () => void;
  /** Pause auto-dismiss timer */
  pauseTimer: () => void;
  /** Resume auto-dismiss timer */
  resumeTimer: () => void;
}

/** Context value shared within a ToastBase region */
export interface ToastBaseContextValue {
  position: ToastPosition;
  expanded: boolean;
  visibleToasts: number;
  gap: number;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastBaseContext = createContext<ToastBaseContextValue | null>(null);

export function ToastBaseProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ToastBaseContextValue;
}) {
  return (
    <ToastBaseContext.Provider value={value}>
      {children}
    </ToastBaseContext.Provider>
  );
}

export function useToastBaseContext(): ToastBaseContextValue {
  const ctx = useContext(ToastBaseContext);
  if (!ctx) {
    throw new Error(
      '[PrismUI] useToastBaseContext must be used within a <ToastBase>.',
    );
  }
  return ctx;
}
