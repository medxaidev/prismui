'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { ToastData, ToastHandlers } from './ToastBase.context';
import classes from './ToastBase.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToastBaseItemProps {
  /** Toast data */
  data: ToastData;
  /** Index in the visible list (0 = front/newest) */
  index: number;
  /** Total number of toasts */
  total: number;
  /** Render function for the toast content */
  renderToast: (data: ToastData, handlers: ToastHandlers) => React.ReactNode;
  /** Called when this toast should be removed */
  onRemove: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ToastBaseItem({
  data,
  index,
  total,
  renderToast,
  onRemove,
}: ToastBaseItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef<number>(data.duration ?? 4000);
  const startTimeRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [height, setHeight] = useState(0);

  const duration = data.duration ?? 4000;

  // Measure height after mount
  useEffect(() => {
    if (itemRef.current) {
      setHeight(itemRef.current.offsetHeight);
    }
  }, [data.title, data.description]);

  // Trigger mount animation
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // ---- Auto-dismiss timer ----

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (duration <= 0) return;
    clearTimer();
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      data.onAutoClose?.(data.id);
      setExiting(true);
    }, remainingRef.current);
  }, [duration, clearTimer, data]);

  const pauseTimer = useCallback(() => {
    if (duration <= 0) return;
    clearTimer();
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
  }, [duration, clearTimer]);

  const resumeTimer = useCallback(() => {
    if (duration <= 0) return;
    startTimer();
  }, [duration, startTimer]);

  // Start / restart timer when duration or createdAt changes
  // (createdAt resets on promise resolve/reject to restart the timer)
  useEffect(() => {
    remainingRef.current = duration;
    clearTimer();
    if (duration > 0) {
      startTimer();
    }
    return clearTimer;
  }, [duration, data.createdAt]);

  // Handle exit animation end → remove
  const handleTransitionEnd = useCallback(() => {
    if (exiting) {
      data.onClose?.(data.id);
      onRemove(data.id);
    }
  }, [exiting, data, onRemove]);

  const close = useCallback(() => {
    clearTimer();
    setExiting(true);
  }, [clearTimer]);

  // ---- Enter/exit styles (expand/collapse) ----

  const getAnimationStyles = (): React.CSSProperties => {
    if (exiting) {
      return {
        opacity: 0,
        maxHeight: 0,
        marginBottom: 0,
        marginTop: 0,
        padding: 0,
        overflow: 'hidden',
      };
    }

    if (!mounted) {
      return {
        opacity: 0,
        maxHeight: 0,
        overflow: 'hidden',
      };
    }

    return {
      maxHeight: height > 0 ? height + 20 : 200,
    };
  };

  const handlers: ToastHandlers = {
    close,
    pauseTimer,
    resumeTimer,
  };

  const animStyles = getAnimationStyles();

  return (
    <div
      ref={itemRef}
      className={classes.item}
      data-mounted={mounted}
      data-exiting={exiting}
      data-index={index}
      style={{
        ...animStyles,
        zIndex: total - index,
        '--toast-height': `${height}px`,
      } as React.CSSProperties}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onTransitionEnd={handleTransitionEnd}
    >
      {renderToast(data, handlers)}
    </div>
  );
}

ToastBaseItem.displayName = '@prismui/core/ToastBaseItem';
