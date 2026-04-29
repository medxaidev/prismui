/**
 * Stage-12 · Presence · React Context (OQ-PR-1b Decision A escape route)
 *
 * v1 does NOT expose a render-prop API (OQ-PR-1b · ADR-004 §决策 4). Consumers
 * that need to read the current `PresenceState` from a deeper subtree can wrap
 * usage with `<PresenceContext.Provider value={state}>` themselves. The
 * `<Presence>` component does NOT install a Provider by default — it is
 * provided here only so consumers / wrappers can opt into the React-layer
 * read path documented in OVERVIEW §六 OQ-PR-1b.
 *
 * Upgrade trigger (入 backlog):
 *   ≥ 3 浮层组件出现 "state 须在 React 层消费但不便 context/ref" 场景 →
 *   v1.x 议题考虑升 OQ-PR-1b B (render-prop escape hatch).
 */

import { createContext } from 'react';
import type { PresenceState } from './types';

/** `null` outside any Provider — consumers must guard with a fallback. */
export const PresenceContext = createContext<PresenceState | null>(null);
