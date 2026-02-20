'use client';

import React from 'react';
import type { ToastData, ToastHandlers } from '../ToastBase/ToastBase.context';
import { Loader } from '../Loader/Loader';
import { ButtonBase } from '../ButtonBase/ButtonBase';
import { CloseIcon } from '../../icons/CloseIcon';
import { InfoIcon } from '../../icons/InfoIcon';
import { SuccessIcon } from '../../icons/SuccessIcon';
import { WarningIcon } from '../../icons/WarningIcon';
import { ErrorIcon } from '../../icons/ErrorIcon';
import classes from './Toast.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastSeverity =
  | 'default'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export interface ToastProps {
  /** Severity variant @default 'default' */
  severity?: ToastSeverity;
  /** Toast title */
  title?: React.ReactNode;
  /** Toast description */
  description?: React.ReactNode;
  /** Custom icon (overrides severity default) */
  icon?: React.ReactNode;
  /** Custom action area (buttons, links) */
  action?: React.ReactNode;
  /** Show close button @default true */
  dismissible?: boolean;
  /** Loading state (for promise toasts) */
  loading?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Additional className */
  className?: string;
  /** Additional style */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Severity → default icon mapping (same icons as Alert)
// ---------------------------------------------------------------------------

const SEVERITY_ICON_MAP: Record<string, React.ReactNode> = {
  primary: <InfoIcon size={24} />,
  info: <InfoIcon size={24} />,
  success: <SuccessIcon size={24} />,
  warning: <WarningIcon size={24} />,
  error: <ErrorIcon size={24} />,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Toast({
  severity = 'default',
  title,
  description,
  icon,
  action,
  dismissible = true,
  loading = false,
  onClose,
  className,
  style,
}: ToastProps) {
  const resolvedIcon = loading
    ? <Loader size={24} color="currentColor" />
    : icon ?? SEVERITY_ICON_MAP[severity] ?? null;

  const showIconArea = resolvedIcon !== null || severity !== 'default';

  return (
    <div
      className={`${classes.root}${className ? ` ${className}` : ''}`}
      data-severity={severity}
      data-loading={loading || undefined}
      style={style}
      role="alert"
    >
      {showIconArea && (
        <div className={classes.iconArea}>
          {resolvedIcon}
        </div>
      )}

      <div className={classes.body}>
        {title && <div className={classes.title}>{title}</div>}
        {description && <div className={classes.description}>{description}</div>}
      </div>

      {action && (
        <div className={classes.action}>
          {action}
        </div>
      )}

      {dismissible && onClose && (
        <ButtonBase
          className={classes.closeWrap}
          onClick={onClose}
          aria-label="Close toast"
          centerRipple
        >
          <CloseIcon size={16} />
        </ButtonBase>
      )}
    </div>
  );
}

Toast.displayName = '@prismui/core/Toast';

// ---------------------------------------------------------------------------
// Helper: create a renderToast function for use with ToastBase
// ---------------------------------------------------------------------------

export interface ToastRenderOptions {
  /** Default severity for all toasts @default 'default' */
  defaultSeverity?: ToastSeverity;
}

/**
 * Creates a `renderToast` function compatible with `ToastBase.renderToast`.
 * Maps `ToastData` fields to `Toast` props.
 */
export function createToastRenderer(options?: ToastRenderOptions) {
  const defaultSeverity = options?.defaultSeverity ?? 'default';

  return function renderToast(data: ToastData, handlers: ToastHandlers): React.ReactNode {
    // Severity is stored in data via a custom field (set by ToastController)
    const severity = (data as ToastData & { severity?: ToastSeverity }).severity ?? defaultSeverity;
    const loading = (data as ToastData & { loading?: boolean }).loading ?? false;

    return (
      <Toast
        severity={severity}
        title={data.title}
        description={data.description}
        icon={data.icon}
        action={data.action}
        dismissible={data.dismissible ?? true}
        loading={loading}
        onClose={handlers.close}
      />
    );
  };
}
