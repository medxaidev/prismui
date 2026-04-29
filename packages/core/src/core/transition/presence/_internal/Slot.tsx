/**
 * Stage-12 · Presence · minimal asChild Slot (OQ-PR-1a Decision B)
 *
 * Radix-style ref-merging + props-merging Slot. Phase 1-local implementation —
 * may be promoted to a shared `core/polymorphic/asChild` location once a
 * second consumer (e.g. another Phase-1 future primitive) lands.
 *
 * Usage:
 *   <Slot data-state={state} ref={mergedRef}>
 *     {child}        // child is a single ReactElement
 *   </Slot>
 *
 * The Slot does NOT render any DOM of its own — it clones `child`, merges
 * the slot's props onto the child's props, and merges refs.
 *
 * Why a local implementation rather than `cloneElement` directly:
 *   · ref-merging needs to handle (a) child.ref being a function ref, an
 *     object ref, or null, AND (b) the slot's incoming ref. Inlining this
 *     into Presence.tsx would couple presence rendering with merge logic.
 *   · keeps OQ-PR-1a Decision B as a single replaceable seam.
 */

import * as React from 'react';

type AnyProps = Record<string, unknown>;

export interface SlotProps {
  children: React.ReactElement;
  [key: string]: unknown;
}

/**
 * Slot · forwards a ref + extra props onto a single ReactElement child.
 *
 * Merge rules (Radix-aligned):
 *   · `ref` — slot ref + child ref both invoked via `mergeRefs`
 *   · `style` — child wins on key collision (consumer authorship is final)
 *   · `className` — concatenated `slot child`
 *   · `on*` event handlers — slot fires first, then child (call order)
 *   · everything else — child wins on key collision
 */
export const Slot = React.forwardRef<unknown, SlotProps>(function Slot(
  props,
  ref,
) {
  const { children, ...slotProps } = props;

  if (!React.isValidElement(children)) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Presence] `<Presence>` requires exactly one ReactElement child. Got:',
        children,
      );
    }
    return null;
  }

  const child = children as React.ReactElement<AnyProps & { ref?: unknown }>;
  const childProps = (child.props ?? {}) as AnyProps;

  // Merge props — slot first, child second. Child wins on collision EXCEPT
  // for handlers and `className`.
  const mergedProps: AnyProps = { ...slotProps };
  for (const key of Object.keys(childProps)) {
    const slotVal = mergedProps[key];
    const childVal = childProps[key];
    if (key === 'className') {
      mergedProps.className = [slotVal, childVal].filter(Boolean).join(' ') || undefined;
    } else if (key === 'style') {
      mergedProps.style = { ...(slotVal as object | undefined), ...(childVal as object | undefined) };
    } else if (
      typeof slotVal === 'function' &&
      typeof childVal === 'function' &&
      key.startsWith('on') &&
      key.length > 2 &&
      key[2] === key[2].toUpperCase()
    ) {
      // Chain event handlers: slot first, child second.
      mergedProps[key] = (...args: unknown[]) => {
        (slotVal as (...a: unknown[]) => unknown)(...args);
        (childVal as (...a: unknown[]) => unknown)(...args);
      };
    } else {
      mergedProps[key] = childVal;
    }
  }

  // ref merge — Slot owner ref + original child ref.
  const childRef = getElementRef(child);
  mergedProps.ref = composeRefs(ref, childRef);

  return React.cloneElement(child, mergedProps);
}) as React.ForwardRefExoticComponent<SlotProps & React.RefAttributes<unknown>>;

Slot.displayName = 'PresenceSlot';

// ── ref helpers ─────────────────────────────────────────────────────────────

type AnyRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: AnyRef<T>, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref != null) {
    // Both `MutableRefObject` and `RefObject` accept assignment in practice;
    // React 18 typings split them but the runtime contract is identical.
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

function composeRefs<T>(...refs: Array<AnyRef<T>>): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) setRef(ref, value);
  };
}

/**
 * Cross-version ref accessor — React 18 keeps `element.ref`; React 19 moves
 * it to `element.props.ref`. We probe both.
 */
function getElementRef(element: React.ReactElement): AnyRef<unknown> {
  // React 19 path
  const propsRef = (element.props as AnyProps & { ref?: unknown }).ref;
  if (propsRef !== undefined) return propsRef as AnyRef<unknown>;
  // React 18 path
  const legacyRef = (element as unknown as { ref?: unknown }).ref;
  return legacyRef as AnyRef<unknown> | undefined;
}
