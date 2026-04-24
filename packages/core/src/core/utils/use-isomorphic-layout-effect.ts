/**
 * Stage-10 · Utility · `useIsomorphicLayoutEffect`
 *
 * Source of truth: `@/devdocs/system/feedback-contract.md` v0.2 §9.2
 *
 * Purpose:
 *   React's `useLayoutEffect` logs a warning on the server because it has
 *   no DOM to synchronously measure against. Feedback infrastructure needs
 *   layout-synchronous mount timing on the client (e.g. to avoid flashing
 *   ripple elements one frame late) but must be SSR-safe.
 *
 * Rule (OQ-FB-7 Round 1 decision · Option C):
 *   · typeof window === 'undefined'  → useEffect   (silent on server)
 *   · typeof window !== 'undefined'  → useLayoutEffect (sync client paint)
 *
 * This hook is the canonical gate for any `useFeedback` / Controller side
 * effect that must not run during server render (FB-ARCH-2 SSR boundary).
 */

import { useEffect, useLayoutEffect } from 'react';

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
