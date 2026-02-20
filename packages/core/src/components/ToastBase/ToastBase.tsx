'use client';

import React from 'react';
import { OptionalPortal } from '../Portal/OptionalPortal';
import { ToastBaseProvider } from './ToastBase.context';
import type { ToastPosition, ToastData, ToastHandlers } from './ToastBase.context';
import { ToastBaseItem } from './ToastBaseItem';
import classes from './ToastBase.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToastBaseProps {
  /** Toasts to render (newest first) */
  toasts: ToastData[];

  /** Position on screen @default 'bottom-right' */
  position?: ToastPosition;

  /** Max visible toasts before stacking @default 5 */
  visibleToasts?: number;

  /** Whether toasts are expanded (show all) or collapsed (Sonner-style stack) @default false */
  expanded?: boolean;

  /** Gap between toasts in expanded mode (px) @default 14 */
  gap?: number;

  /** Container width @default 356 */
  width?: number | string;

  /** Transition duration in ms @default 300 */
  transitionDuration?: number;

  /** z-index @default 1500 */
  zIndex?: number;

  /** Render function for each toast */
  renderToast: (data: ToastData, handlers: ToastHandlers) => React.ReactNode;

  /** Called when a toast should be removed */
  onRemove: (id: string) => void;

  /** Whether to render inside a Portal @default true */
  withinPortal?: boolean;

  /** Additional className for the container */
  className?: string;

  /** Additional inline styles for the container */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ToastBase({
  toasts,
  position = 'bottom-right',
  visibleToasts = 5,
  expanded: expandedProp,
  gap = 14,
  width = 356,
  transitionDuration = 300,
  zIndex = 1500,
  renderToast,
  onRemove,
  withinPortal = true,
  className,
  style,
}: ToastBaseProps) {
  // Always expanded — toasts display as a flat list
  const expanded = true;

  const ctxValue = {
    position,
    expanded,
    visibleToasts,
    gap,
  };

  const containerStyle: React.CSSProperties = {
    ...style,
    '--toast-z-index': zIndex,
    '--toast-width': typeof width === 'number' ? `${width}px` : width,
    '--toast-gap': `${gap}px`,
    '--toast-transition-duration': `${transitionDuration}ms`,
  } as React.CSSProperties;

  if (toasts.length === 0) {
    return null;
  }

  return (
    <OptionalPortal withinPortal={withinPortal}>
      <ToastBaseProvider value={ctxValue}>
        <div
          className={`${classes.container}${className ? ` ${className}` : ''}`}
          data-position={position}
          style={containerStyle}
        >
          <div
            className={classes.list}
            data-expanded={expanded}
          >
            {toasts.map((toast, index) => (
              <ToastBaseItem
                key={toast.id}
                data={toast}
                index={index}
                total={toasts.length}
                renderToast={renderToast}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      </ToastBaseProvider>
    </OptionalPortal>
  );
}

ToastBase.displayName = '@prismui/core/ToastBase';
