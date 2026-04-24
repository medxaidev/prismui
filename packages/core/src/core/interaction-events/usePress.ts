/**
 * Stage-10 · L2 Interaction Events · `usePress` React hook
 *
 * Contract: `@/devdocs/system/interaction-events.md` §8 + §9 + §10
 *
 * Architecture:
 *   · One `Map<pointerId, PressState>` per hook instance · supports concurrent pointerIds (C-1).
 *   · Per-pointerId window listeners for outside `pointerup` / `pointercancel`.
 *   · Unmount / disabled-flip side effects synchronously terminate active FSMs.
 *   · Reducer is consulted for every `dispatch` · all semantics are in the pure reducer.
 *
 * Cleanup contract (L-1 ~ L-4):
 *   · L-1 · pointerTarget unmount → FSM silently terminates via unmount effect
 *   · L-2 · no lingering global listeners post-unmount (spy test)
 *   · L-3 · removeChild(pressTarget) still terminates on next lifecycle tick
 *   · L-4 · RAF callbacks post-unmount do not fire (hook does not schedule RAF)
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type FocusEvent as ReactFocusEvent,
} from 'react';

import { pressReducer, INITIAL_PRESS_STATE } from './press-reducer';
import { warnDuplicatePressStart, warnMissingGating } from './press-invariants';
import type {
  InputStreamEvent,
  PointerType,
  PressEvent,
  PressState,
  UsePressOptions,
  UsePressPropsBinding,
  UsePressResult,
} from './types';

/** Synthetic pointerId used for keyboard-initiated presses. */
const KEYBOARD_POINTER_ID = -1;

function normalizePointerType(raw: string): PointerType {
  if (raw === 'mouse' || raw === 'touch' || raw === 'pen') return raw;
  return 'mouse';
}

function resolveTimestamp(stamp: number | undefined): number {
  if (typeof stamp === 'number' && stamp > 0) return stamp;
  // Time source is outside the reducer (IE-CORE-1 is a reducer-only constraint).
  return performance.now();
}

function readComposedPath(nativeEvent: Event): readonly Element[] {
  const fn = (nativeEvent as unknown as { composedPath?: () => EventTarget[] }).composedPath;
  if (typeof fn === 'function') {
    return fn.call(nativeEvent).filter((n): n is Element => n instanceof Element);
  }
  return [];
}

function readRect(el: Element): { width: number; height: number; left: number; top: number } {
  const r = el.getBoundingClientRect();
  return { width: r.width, height: r.height, left: r.left, top: r.top };
}

export function usePress(options: UsePressOptions = {}): UsePressResult {
  // ── Stable refs ──────────────────────────────────────────────
  const statesRef = useRef<Map<number, PressState>>(new Map());
  const globalCleanupsRef = useRef<Map<number, () => void>>(new Map());
  const optionsRef = useRef<UsePressOptions>(options);
  optionsRef.current = options;

  // Track previous gating value for the flip effect.
  const prevGatingRef = useRef<boolean | undefined>(options.isInteractiveDisabled);

  const [isPressed, setIsPressed] = useState(false);

  // DEV warn once · missing gating resolution (R-1).
  if (process.env.NODE_ENV !== 'production' && options.isInteractiveDisabled === undefined) {
    warnMissingGating();
  }

  // ── Dispatch · run reducer + fire callbacks + update state ──
  const dispatch = useCallback((pointerId: number, input: InputStreamEvent) => {
    const prevState = statesRef.current.get(pointerId) ?? INITIAL_PRESS_STATE;
    const { state: nextState, events } = pressReducer(prevState, input);

    if (nextState.kind === 'idle' || nextState.kind === 'terminated') {
      statesRef.current.delete(pointerId);
      // Terminal state · tear down any global listeners tied to this pointerId.
      const cleanup = globalCleanupsRef.current.get(pointerId);
      if (cleanup) {
        cleanup();
        globalCleanupsRef.current.delete(pointerId);
      }
    } else {
      statesRef.current.set(pointerId, nextState);
    }

    for (const event of events) {
      fireCallback(event, optionsRef.current);
    }

    // Recompute active presence for isPressed.
    let anyActive = false;
    for (const s of statesRef.current.values()) {
      if (s.kind === 'active') {
        anyActive = true;
        break;
      }
    }
    setIsPressed(anyActive);
  }, []);

  // ── Global pointer listeners (outside pointerup / pointercancel) ─
  const attachGlobalPointerListeners = useCallback(
    (pointerId: number, pressTarget: Element) => {
      if (globalCleanupsRef.current.has(pointerId)) return;

      const handlePointerUp = (nativeEvent: PointerEvent) => {
        if (nativeEvent.pointerId !== pointerId) return;
        const rawTarget =
          nativeEvent.target instanceof Element ? nativeEvent.target : pressTarget;
        const inside = rawTarget === pressTarget || pressTarget.contains(rawTarget);
        dispatch(pointerId, {
          kind: 'pointerup',
          pointerId,
          pointerType: normalizePointerType(nativeEvent.pointerType),
          timestamp: resolveTimestamp(nativeEvent.timeStamp),
          target: inside ? pressTarget : rawTarget,
          clientX: nativeEvent.clientX,
          clientY: nativeEvent.clientY,
          targetRect: readRect(pressTarget),
          originalTarget: rawTarget,
          path: readComposedPath(nativeEvent),
          modifiers: {
            ctrl: nativeEvent.ctrlKey,
            shift: nativeEvent.shiftKey,
            alt: nativeEvent.altKey,
            meta: nativeEvent.metaKey,
          },
        });
      };

      const handlePointerCancel = (nativeEvent: PointerEvent) => {
        if (nativeEvent.pointerId !== pointerId) return;
        dispatch(pointerId, {
          kind: 'pointercancel',
          pointerId,
          pointerType: normalizePointerType(nativeEvent.pointerType),
          timestamp: resolveTimestamp(nativeEvent.timeStamp),
          target: pressTarget,
        });
      };

      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerCancel);

      globalCleanupsRef.current.set(pointerId, () => {
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerCancel);
      });
    },
    [dispatch],
  );

  // ── C-2 · isInteractiveDisabled flip effect ─────────────────
  useEffect(() => {
    const prev = prevGatingRef.current;
    const now = options.isInteractiveDisabled;
    if (prev !== true && now === true) {
      // Flush disabled-flip to every active/suspended FSM · synchronous presscancel.
      const ts = performance.now();
      const pointerIds = Array.from(statesRef.current.keys());
      for (const pid of pointerIds) {
        dispatch(pid, { kind: 'disabled-flip', timestamp: ts });
      }
    }
    prevGatingRef.current = now;
  }, [options.isInteractiveDisabled, dispatch]);

  // ── Unmount cleanup (C-3 · L-1 · L-2) ───────────────────────
  useEffect(() => {
    return () => {
      // C-3: unmount is highest-priority terminator · NO callbacks fired.
      // We directly clear state & global listeners without going through dispatch
      // (so no `presscancel` callbacks leak).
      statesRef.current.clear();
      for (const cleanup of globalCleanupsRef.current.values()) {
        cleanup();
      }
      globalCleanupsRef.current.clear();
    };
  }, []);

  // ── pressProps bindings (spread onto pressTarget) ───────────
  const pressProps = useMemo<UsePressPropsBinding>(
    () => ({
      onPointerDown: (e: ReactPointerEvent<Element>) => {
        if (optionsRef.current.isInteractiveDisabled === true) return;

        const pressTarget = e.currentTarget;
        const existing = statesRef.current.get(e.pointerId);

        // C-5 · duplicate pressstart on same pointerId → warn + ignore.
        if (existing && (existing.kind === 'active' || existing.kind === 'suspended')) {
          if (process.env.NODE_ENV !== 'production') {
            warnDuplicatePressStart();
          }
          return;
        }

        dispatch(e.pointerId, {
          kind: 'pointerdown',
          pointerId: e.pointerId,
          pointerType: normalizePointerType(e.pointerType),
          timestamp: resolveTimestamp(e.timeStamp),
          target: pressTarget,
          clientX: e.clientX,
          clientY: e.clientY,
          targetRect: readRect(pressTarget),
          originalTarget: e.target instanceof Element ? e.target : pressTarget,
          path: readComposedPath(e.nativeEvent),
          modifiers: {
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey,
            meta: e.metaKey,
          },
        });

        attachGlobalPointerListeners(e.pointerId, pressTarget);
      },

      onPointerEnter: (e: ReactPointerEvent<Element>) => {
        dispatch(e.pointerId, {
          kind: 'pointerenter',
          pointerId: e.pointerId,
          pointerType: normalizePointerType(e.pointerType),
          timestamp: resolveTimestamp(e.timeStamp),
          target: e.currentTarget,
        });
      },

      onPointerLeave: (e: ReactPointerEvent<Element>) => {
        dispatch(e.pointerId, {
          kind: 'pointerleave',
          pointerId: e.pointerId,
          pointerType: normalizePointerType(e.pointerType),
          timestamp: resolveTimestamp(e.timeStamp),
          target: e.currentTarget,
        });
      },

      onKeyDown: (e: ReactKeyboardEvent<Element>) => {
        if (optionsRef.current.isInteractiveDisabled === true) return;
        if (e.key !== ' ' && e.key !== 'Enter') return;

        const pressTarget = e.currentTarget;
        const existing = statesRef.current.get(KEYBOARD_POINTER_ID);

        // OS key-repeat: ignore second keydown while keyboard FSM is active.
        if (existing && (existing.kind === 'active' || existing.kind === 'suspended')) {
          return;
        }

        dispatch(KEYBOARD_POINTER_ID, {
          kind: 'keydown',
          key: e.key,
          pointerId: KEYBOARD_POINTER_ID,
          pointerType: 'keyboard',
          timestamp: resolveTimestamp(e.timeStamp),
          target: pressTarget,
          targetRect: readRect(pressTarget),
          originalTarget: e.target instanceof Element ? e.target : pressTarget,
          path: readComposedPath(e.nativeEvent),
          modifiers: {
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey,
            meta: e.metaKey,
          },
        });
      },

      onKeyUp: (e: ReactKeyboardEvent<Element>) => {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        dispatch(KEYBOARD_POINTER_ID, {
          kind: 'keyup',
          key: e.key,
          pointerId: KEYBOARD_POINTER_ID,
          pointerType: 'keyboard',
          timestamp: resolveTimestamp(e.timeStamp),
          target: e.currentTarget,
        });
      },

      onBlur: (e: ReactFocusEvent<Element>) => {
        // OQ-IE-2 · blur during active press = failure path for every live FSM.
        const ts = resolveTimestamp(e.timeStamp);
        const pointerIds = Array.from(statesRef.current.keys());
        for (const pid of pointerIds) {
          dispatch(pid, { kind: 'blur', timestamp: ts });
        }
      },
    }),
    [dispatch, attachGlobalPointerListeners],
  );

  return { pressProps, isPressed };
}

function fireCallback(event: PressEvent, options: UsePressOptions): void {
  switch (event.type) {
    case 'pressstart':
      options.onPressStart?.(event);
      return;
    case 'pressup':
      options.onPressUp?.(event);
      return;
    case 'pressend':
      options.onPressEnd?.(event);
      return;
    case 'presscancel':
      options.onPressCancel?.(event);
      return;
  }
}
