/**
 * Stage-12 · L0 Transition Foundation · `<Presence>` component
 *
 * Contract: `@/devdocs/system/presence-primitive.md` v0.1 §2.2 + §六
 *
 * Thin wrapper around `usePresence` + the local `Slot` (asChild slot mode ·
 * OQ-PR-1a Decision B). Does NOT render any DOM of its own — instead it
 * clones the single ReactElement child and merges:
 *   · `data-state` attribute (TR-PROTO-1)
 *   · a forwarded ref into the child's existing ref (Slot internal merge)
 *
 * When `shouldRender` is false, returns `null` (TR-PRES-2 / OQ-PR-4 default).
 */

import * as React from 'react';

import { Slot } from './_internal/Slot';
import { usePresence } from './usePresence';
import type { PresenceProps } from './types';

export const Presence = React.forwardRef<unknown, PresenceProps>(function Presence(
  props,
  forwardedRef,
) {
  const { open, forceMount = false, children } = props;

  // Internal ref to the rendered DOM node — merged with any consumer ref
  // via the Slot. Used by `usePresence` to read getComputedStyle + attach
  // transitionend / animationend listeners.
  const nodeRef = React.useRef<Element | null>(null);

  const { state, shouldRender } = usePresence({
    open,
    nodeRef,
    forceMount,
  });

  // DEV — single ReactElement child guard. Production omits the check for
  // perf / parity with React.Children.only.
  if (process.env.NODE_ENV !== 'production') {
    if (typeof children === 'function') {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Presence] Function children are not supported in v1 ' +
          '(OQ-PR-1b Decision A). Use `<PresenceContext.Provider>` to read ' +
          'state from descendants.',
      );
    }
  }

  if (!shouldRender) return null;

  // Compose the consumer's forwarded ref with the internal nodeRef. The Slot
  // additionally merges these with the child element's own ref.
  const composedRef = composeRefs<Element>(nodeRef, forwardedRef as React.Ref<Element> | undefined);

  return (
    <Slot data-state={state} ref={composedRef}>
      {children}
    </Slot>
  );
}) as React.ForwardRefExoticComponent<PresenceProps & React.RefAttributes<unknown>>;

Presence.displayName = 'Presence';

// ── ref helper (duplicated from Slot to keep Slot independent) ──────────────

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}
