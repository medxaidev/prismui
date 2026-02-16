import { useEffect, useRef, useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TransitionStatus =
  | 'entered'
  | 'exited'
  | 'entering'
  | 'exiting'
  | 'pre-entering'
  | 'pre-exiting';

export interface UseTransitionInput {
  /** Whether the element should be mounted/visible */
  mounted: boolean;
  /** Enter transition duration in ms @default 225 */
  duration?: number;
  /** Exit transition duration in ms @default 195 */
  exitDuration?: number;
  /** Transition timing function @default 'cubic-bezier(0.4, 0, 0.2, 1)' */
  timingFunction?: string;
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
  /** If true, reduce motion (skip animation) */
  reduceMotion?: boolean;
}

export interface UseTransitionOutput {
  transitionStatus: TransitionStatus;
  transitionDuration: number;
  transitionTimingFunction: string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTransition({
  mounted,
  duration = 225,
  exitDuration,
  timingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)',
  enterDelay,
  exitDelay,
  onEnter,
  onEntered,
  onExit,
  onExited,
  reduceMotion = false,
}: UseTransitionInput): UseTransitionOutput {
  const resolvedExitDuration = exitDuration ?? duration;
  const [transitionDuration, setTransitionDuration] = useState(
    reduceMotion ? 0 : duration,
  );
  const [transitionStatus, setStatus] = useState<TransitionStatus>(
    mounted ? 'entered' : 'exited',
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(-1);
  const mountedRef = useRef(mounted);
  const initialRef = useRef(true);

  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (delayRef.current != null) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (rafRef.current !== -1) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = -1;
    }
  }, []);

  const handleStateChange = useCallback(
    (shouldMount: boolean) => {
      clearAllTimeouts();
      const preHandler = shouldMount ? onEnter : onExit;
      const handler = shouldMount ? onEntered : onExited;
      const newDuration = reduceMotion
        ? 0
        : shouldMount
          ? duration
          : resolvedExitDuration;
      setTransitionDuration(newDuration);

      if (newDuration === 0) {
        typeof preHandler === 'function' && preHandler();
        typeof handler === 'function' && handler();
        setStatus(shouldMount ? 'entered' : 'exited');
      } else {
        // Use double-rAF to ensure the browser has painted the "out" state
        // before we transition to "in" (or vice versa).
        rafRef.current = requestAnimationFrame(() => {
          setStatus(shouldMount ? 'pre-entering' : 'pre-exiting');

          rafRef.current = requestAnimationFrame(() => {
            typeof preHandler === 'function' && preHandler();
            setStatus(shouldMount ? 'entering' : 'exiting');

            timeoutRef.current = setTimeout(() => {
              typeof handler === 'function' && handler();
              setStatus(shouldMount ? 'entered' : 'exited');
            }, newDuration);
          });
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      clearAllTimeouts,
      duration,
      resolvedExitDuration,
      reduceMotion,
      onEnter,
      onEntered,
      onExit,
      onExited,
    ],
  );

  const handleTransitionWithDelay = useCallback(
    (shouldMount: boolean) => {
      clearAllTimeouts();
      const delay = shouldMount ? enterDelay : exitDelay;
      if (typeof delay === 'number' && delay > 0) {
        delayRef.current = setTimeout(() => {
          handleStateChange(shouldMount);
        }, delay);
      } else {
        handleStateChange(shouldMount);
      }
    },
    [clearAllTimeouts, enterDelay, exitDelay, handleStateChange],
  );

  // React to `mounted` changes (skip initial render)
  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    if (mounted !== mountedRef.current) {
      mountedRef.current = mounted;
      handleTransitionWithDelay(mounted);
    }
  }, [mounted, handleTransitionWithDelay]);

  // Cleanup on unmount
  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);

  return {
    transitionStatus,
    transitionDuration,
    transitionTimingFunction: timingFunction,
  };
}
