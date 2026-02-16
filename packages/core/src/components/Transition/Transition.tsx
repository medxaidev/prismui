import React from 'react';
import { useTransition } from '../../hooks/use-transition';
import { getTransitionStyles } from './get-transition-styles';
import type { PrismuiTransition } from './transitions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TransitionProps {
  /** Whether the element should be mounted/visible */
  mounted: boolean;

  /** Transition preset name or custom transition styles object @default 'fade' */
  transition?: PrismuiTransition;

  /** Enter transition duration in ms @default 225 */
  duration?: number;

  /** Exit transition duration in ms (defaults to duration) */
  exitDuration?: number;

  /** Transition timing function @default 'cubic-bezier(0.4, 0, 0.2, 1)' */
  timingFunction?: string;

  /** Render function receiving computed transition styles */
  children: (styles: React.CSSProperties) => React.JSX.Element;

  /** If true, element is hidden with display:none instead of unmounted @default false */
  keepMounted?: boolean;

  /** Delay before enter transition starts (ms) */
  enterDelay?: number;

  /** Delay before exit transition starts (ms) */
  exitDelay?: number;

  /** Called when enter transition starts */
  onEnter?: () => void;

  /** Called when enter transition ends */
  onEntered?: () => void;

  /** Called when exit transition starts */
  onExit?: () => void;

  /** Called when exit transition ends */
  onExited?: () => void;

  /** If true, skip animation (instant show/hide) */
  reduceMotion?: boolean;
}

export type TransitionOverride = Partial<Omit<TransitionProps, 'mounted'>>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Transition({
  mounted,
  transition = 'fade',
  duration = 225,
  exitDuration,
  timingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)',
  children,
  keepMounted = false,
  enterDelay,
  exitDelay,
  onEnter,
  onEntered,
  onExit,
  onExited,
  reduceMotion = false,
}: TransitionProps) {
  const resolvedExitDuration = exitDuration ?? duration;

  const { transitionDuration, transitionStatus, transitionTimingFunction } =
    useTransition({
      mounted,
      duration,
      exitDuration: resolvedExitDuration,
      timingFunction,
      enterDelay,
      exitDelay,
      onEnter,
      onEntered,
      onExit,
      onExited,
      reduceMotion,
    });

  // Zero duration or test environment: instant show/hide
  if (transitionDuration === 0) {
    return mounted ? (
      <>{children({})}</>
    ) : keepMounted ? (
      children({ display: 'none' })
    ) : null;
  }

  // Normal transition
  if (transitionStatus === 'exited') {
    return keepMounted ? children({ display: 'none' }) : null;
  }

  return (
    <>
      {children(
        getTransitionStyles({
          transition,
          duration: transitionDuration,
          state: transitionStatus,
          timingFunction: transitionTimingFunction,
        }),
      )}
    </>
  );
}

Transition.displayName = '@prismui/core/Transition';
