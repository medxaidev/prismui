/**
 * Stage-10 · L4 Feedback · `useFeedback` React hook
 *
 * Source of truth: `@/devdocs/system/feedback-contract.md` v0.2 §5
 *
 * Contract:
 *   · Returns a stable `FeedbackController` reference across renders
 *     (OQ-FB-4 decision: `useRef` + `updateFactories`, mirrors the L2
 *     `usePress` ref-stability pattern).
 *   · Updates the controller's factory list via `updateFactories`
 *     whenever the `factories` argument changes (§6.6 policy — active
 *     instances keep running, new factories come into effect on the
 *     next source activation).
 *   · Disposes all active instances + detaches matchMedia on unmount
 *     (L-F1 / L-F3).
 *   · SSR-safe: uses `useIsomorphicLayoutEffect` so server-side renders
 *     do not touch `window.matchMedia` or leak subscriptions
 *     (§9.2 · FB-ARCH-2 SSR boundary).
 */

import { useEffect, useRef } from 'react';

import { useIsomorphicLayoutEffect } from '../utils';

import {
  createFeedbackController,
  type CreateFeedbackControllerResult,
} from './FeedbackController';
import type { FeedbackController, FeedbackFactory } from './types';

/**
 * @param factories — the current Feedback factory list (may be empty).
 *   New array identity is fine; only the contents matter.
 *
 * @returns a stable `FeedbackController` reference. Spread
 *   `controller.pressHandlers` onto `usePress({...})` options to wire the
 *   L4 Feedback system into L2 press events.
 */
export function useFeedback(factories: FeedbackFactory[]): FeedbackController {
  // Lazily construct once per hook instance. Controller identity is stable
  // across renders (until the host unmounts).
  const resultRef = useRef<CreateFeedbackControllerResult | null>(null);
  if (resultRef.current === null) {
    resultRef.current = createFeedbackController(factories);
  }

  // Push factory updates into the controller without rebuilding it.
  // Use layout-effect timing so ripple/glow factories are wired BEFORE
  // the first paint in which a new press could fire (§6.6 policy).
  useIsomorphicLayoutEffect(() => {
    resultRef.current?.controller.updateFactories(factories);
  }, [factories]);

  // Unmount cleanup · synchronous dispose (L-F1 / L-F3).
  useEffect(() => {
    return () => {
      resultRef.current?.dispose();
      resultRef.current = null;
    };
  }, []);

  return resultRef.current.controller;
}
