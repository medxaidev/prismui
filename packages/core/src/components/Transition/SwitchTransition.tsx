import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  cloneElement,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SwitchTransitionMode = 'out-in' | 'in-out';

export interface SwitchTransitionProps {
  /**
   * Transition mode:
   * - `'out-in'` (default): current element exits, then new element enters
   * - `'in-out'`: new element enters, then current element exits
   */
  mode?: SwitchTransitionMode;

  /**
   * A single child element with a unique `key`.
   * When the key changes, the transition is triggered.
   */
  children: React.ReactElement;
}

// ---------------------------------------------------------------------------
// SwitchTransition
// ---------------------------------------------------------------------------

export function SwitchTransition({
  mode = 'out-in',
  children,
}: SwitchTransitionProps) {
  const currentKeyRef = useRef<string>(String(children.key ?? ''));
  const [state, setState] = useState<{
    current: React.ReactElement;
    previous: React.ReactElement | null;
    phase: 'idle' | 'exiting' | 'entering';
  }>({
    current: children,
    previous: null,
    phase: 'idle',
  });

  const handleOldExited = useCallback(() => {
    setState((prev) => ({
      current: prev.current,
      previous: null,
      phase: 'entering',
    }));
  }, []);

  const handleNewEntered = useCallback(() => {
    setState((prev) => ({
      ...prev,
      previous: null,
      phase: 'idle',
    }));
  }, []);

  useEffect(() => {
    const newKey = String(children.key ?? '');

    if (newKey === currentKeyRef.current) {
      // Same key — just update the element props
      setState((prev) => ({ ...prev, current: children }));
      return;
    }

    currentKeyRef.current = newKey;

    if (mode === 'out-in') {
      // Phase 1: exit old, then enter new
      setState((prev) => ({
        current: children,
        previous: cloneElement(prev.current, { mounted: false } as any),
        phase: 'exiting',
      }));
    } else {
      // in-out: enter new immediately, exit old after new enters
      setState((prev) => ({
        current: children,
        previous: prev.current,
        phase: 'entering',
      }));
    }
  }, [children, mode]);

  if (mode === 'out-in') {
    // out-in: show old (exiting) until it exits, then show new (entering)
    if (state.phase === 'exiting' && state.previous) {
      // Render the old child with mounted=false and onExited callback
      return cloneElement(state.previous, {
        onExited: () => {
          const orig = (state.previous!.props as any).onExited;
          if (typeof orig === 'function') orig();
          handleOldExited();
        },
      } as any);
    }

    if (state.phase === 'entering') {
      // Render the new child with mounted=true
      return cloneElement(state.current, {
        mounted: true,
        onEntered: () => {
          const orig = (state.current.props as any).onEntered;
          if (typeof orig === 'function') orig();
          handleNewEntered();
        },
      } as any);
    }

    // idle — render current as-is
    return state.current;
  }

  // in-out mode
  if (state.phase === 'entering' && state.previous) {
    // Render both: new (entering) + old (still visible)
    return (
      <>
        {cloneElement(state.current, {
          mounted: true,
          onEntered: () => {
            const orig = (state.current.props as any).onEntered;
            if (typeof orig === 'function') orig();
            // After new enters, start exiting old
            setState((prev) => ({
              ...prev,
              previous: prev.previous
                ? cloneElement(prev.previous, { mounted: false } as any)
                : null,
              phase: 'exiting',
            }));
          },
        } as any)}
        {state.previous}
      </>
    );
  }

  if (state.phase === 'exiting' && state.previous) {
    return (
      <>
        {state.current}
        {cloneElement(state.previous, {
          onExited: () => {
            const orig = (state.previous!.props as any).onExited;
            if (typeof orig === 'function') orig();
            handleOldExited();
            handleNewEntered();
          },
        } as any)}
      </>
    );
  }

  return state.current;
}

SwitchTransition.displayName = '@prismui/core/SwitchTransition';
