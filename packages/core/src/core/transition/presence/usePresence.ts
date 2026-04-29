/**
 * Stage-12 · L0 Transition Foundation · `usePresence` hook
 *
 * Contract: `@/devdocs/system/presence-primitive.md` v0.1 §2.1 + §三 + §四 + §五
 *
 * Behaviour summary (TR-PRES-1~4 / TR-PROTO-1/2/3 / TR-CROSS-1):
 *   · 4-state machine: closed / entering / open / exiting (TR-PRES-1)
 *   · `closed` ⇒ children unmount unless `forceMount` (TR-PRES-2)
 *   · animation end signal = transitionend / animationend OR
 *     `getComputedStyle.transitionDuration === 0` self-check fallback
 *     (TR-PRES-3 · OQ-PR-2 Decision C double-layer)
 *   · reverse paths (entering↔exiting) do NOT remount children (TR-PRES-4)
 *   · SSR initial state = 'closed' regardless of `open` to avoid hydration
 *     mismatch; client useEffect drives the first transition (TR-PROTO-3)
 *   · Does NOT import or perceive Stage-11 portal/floating/dismissal
 *     (TR-CROSS-1 · ADR-004 §决策 1 显式禁止清单)
 */

import { useEffect, useReducer, useRef } from 'react';

import { subscribeAnimationEnd } from './_internal/animationEnd';
import { readMaxAnimationDuration } from './_internal/getComputedDuration';
import {
  presenceReducer,
  shouldRenderForState,
  type PresenceEvent,
} from './_internal/stateMachine';
import type {
  PresenceState,
  UsePresenceOptions,
  UsePresenceResult,
} from './types';

export function usePresence(options: UsePresenceOptions): UsePresenceResult {
  const { open, nodeRef, forceMount = false } = options;

  // SSR / first-render initial state — always `closed`. The first client
  // effect below drives the open=true initial path through `entering` →
  // `open`, ensuring data-state values are consistent across SSR and client.
  const [state, dispatch] = useReducer(presenceReducer, 'closed' as PresenceState);

  // Track if we have committed at least once on the client. Used to gate
  // the SSR-style early bail in the open-prop driver.
  const mountedRef = useRef(false);

  // Ref to current state for use inside event handlers / RAF callbacks.
  const stateRef = useRef<PresenceState>(state);
  stateRef.current = state;

  // ── open prop edge detection ──────────────────────────────────────────────
  // Drives `open` → entering / exiting via dispatch. Runs after every commit
  // whose `open` changed (or first commit).
  useEffect(() => {
    mountedRef.current = true;
    const event: PresenceEvent = open ? 'open' : 'close';
    dispatch(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── animation end resolution (entering / exiting → terminal) ──────────────
  // For each entry into `entering` or `exiting`, install transitionend +
  // animationend listeners on `nodeRef.current`. If duration === 0 (or node
  // missing), skip directly to terminal via RAF.
  useEffect(() => {
    if (state !== 'entering' && state !== 'exiting') return;

    const node = nodeRef.current;
    if (node == null) {
      // Conservative default — no node ⇒ treat as 0 duration ⇒ jump terminal.
      // Use microtask to avoid synchronous setState-in-render warning.
      let cancelled = false;
      const id = requestAnimationFrame(() => {
        if (cancelled) return;
        if (stateRef.current === 'entering' || stateRef.current === 'exiting') {
          dispatch('end');
        }
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(id);
      };
    }

    // Layer 1 — synchronous self-check (skip listener install when 0).
    const duration = readMaxAnimationDuration(node);
    if (duration === 0) {
      let cancelled = false;
      const id = requestAnimationFrame(() => {
        if (cancelled) return;
        if (stateRef.current === 'entering' || stateRef.current === 'exiting') {
          dispatch('end');
        }
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(id);
      };
    }

    // Layer 2 — install listeners.
    const sub = subscribeAnimationEnd(node, () => {
      if (stateRef.current === 'entering' || stateRef.current === 'exiting') {
        dispatch('end');
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [state, nodeRef]);

  const shouldRender = shouldRenderForState(state, forceMount);

  return { state, shouldRender };
}
