'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToastBase } from '../../../components/ToastBase/ToastBase';
import type { ToastData, ToastHandlers, ToastPosition } from '../../../components/ToastBase/ToastBase.context';
import { Toast } from '../../../components/Toast/Toast';
import type { ToastSeverity } from '../../../components/Toast/Toast';
import { useToastController } from './useToastController';
import type { ToastInstance } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToastRendererProps {
  /** Default position for toasts @default 'bottom-right' */
  position?: ToastPosition;
  /** Max visible toasts before stacking @default 5 */
  visibleToasts?: number;
  /** Container width @default 356 */
  width?: number | string;
  /** Transition duration in ms @default 300 */
  transitionDuration?: number;
  /** z-index @default 1500 */
  zIndex?: number;
}

// ---------------------------------------------------------------------------
// Internal: map ToastInstance → ToastData
// ---------------------------------------------------------------------------

interface ExtendedToastData extends ToastData {
  severity?: ToastSeverity;
  loading?: boolean;
}

function instanceToData(instance: ToastInstance): ExtendedToastData {
  return {
    id: instance.id,
    title: instance.options.title,
    description: instance.options.description,
    icon: instance.options.icon,
    action: instance.options.action,
    duration: instance.options.duration,
    dismissible: instance.options.dismissible,
    onClose: instance.options.onClose ? () => instance.options.onClose!() : undefined,
    onAutoClose: instance.options.onAutoClose ? () => instance.options.onAutoClose!() : undefined,
    createdAt: instance.createdAt,
    severity: instance.options.severity,
    loading: instance.loading,
  };
}

// ---------------------------------------------------------------------------
// Internal: render a single toast
// ---------------------------------------------------------------------------

function renderToast(data: ToastData, handlers: ToastHandlers): React.ReactNode {
  const ext = data as ExtendedToastData;
  return (
    <Toast
      severity={ext.severity ?? 'default'}
      title={ext.title}
      description={ext.description}
      icon={ext.icon}
      action={ext.action}
      dismissible={ext.dismissible ?? true}
      loading={ext.loading ?? false}
      onClose={handlers.close}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Subscribes to the ToastController and renders active toasts.
 *
 * Place this component once in your app, typically alongside other renderers:
 *
 * @example
 * ```tsx
 * <PrismuiProvider modules={[overlayModule(), toastModule()]}>
 *   <App />
 *   <ToastRenderer position="bottom-right" />
 * </PrismuiProvider>
 * ```
 */
export function ToastRenderer({
  position = 'bottom-right',
  visibleToasts = 5,
  width = 356,
  transitionDuration = 300,
  zIndex = 1500,
}: ToastRendererProps) {
  const controller = useToastController();
  const [instances, setInstances] = useState<ToastInstance[]>([]);

  useEffect(() => {
    // Sync initial state
    setInstances(controller.getToasts());
    // Subscribe to changes
    return controller.subscribe((toasts) => {
      setInstances([...toasts]);
    });
  }, [controller]);

  const handleRemove = useCallback(
    (id: string) => {
      controller.hide(id);
    },
    [controller],
  );

  // Group toasts by position (per-toast position override or default)
  const grouped = useMemo(() => {
    const groups: Record<string, ExtendedToastData[]> = {};
    for (const instance of instances) {
      const pos = instance.options.position ?? position;
      if (!groups[pos]) groups[pos] = [];
      // Newest first (reverse chronological)
      groups[pos].unshift(instanceToData(instance));
    }
    return groups;
  }, [instances, position]);

  // Render a ToastBase for each position that has toasts
  const positions = Object.keys(grouped) as ToastPosition[];

  if (positions.length === 0) {
    return null;
  }

  return (
    <>
      {positions.map((pos) => (
        <ToastBase
          key={pos}
          toasts={grouped[pos]}
          position={pos}
          visibleToasts={visibleToasts}
          width={width}
          transitionDuration={transitionDuration}
          zIndex={zIndex}
          renderToast={renderToast}
          onRemove={handleRemove}
        />
      ))}
    </>
  );
}

ToastRenderer.displayName = '@prismui/core/ToastRenderer';
