import * as React from 'react';
import type { RadioGroupItemRecord } from './RadioGroupContext';

/**
 * Component-local roving-focus registry hook.
 *
 * Design reference: `@/devdocs/components/Radio/design.md` v0.2 §四
 * Closed-loop API for §4.4 / §4.5 / §4.7:
 *
 *   registerItem(record)   →  unregister fn       (mount / disabled flip)
 *   getItems()             →  current ordered list (roving / arrow / skip-disabled)
 *   computeRovingTargetId  →  the single id that holds tabindex=0
 *   focusItem(direction, currentId)  →  next/prev/first/last + skip-disabled
 *
 * NOT a Core abstraction — Radio is its only consumer. Promotion to Core
 * happens when ToggleGroup / Tabs ship and re-use the same loop (deferred
 * design.md §11 OQ-R-X · "external export" decision).
 */

/**
 * Roving target priority (R-10 · §4.4):
 *   1. selected & focusable                         → that child
 *   2. selected absent or disabled → first non-disabled in DOM order
 *   3. all disabled                                 → null  (no roving target)
 */
export function computeRovingTargetId(
  items: ReadonlyArray<RadioGroupItemRecord>,
  selectedValue: string | undefined,
): string | null {
  if (items.length === 0) return null;

  if (selectedValue !== undefined) {
    const selected = items.find((it) => it.value === selectedValue);
    if (selected && !selected.disabled) return selected.id;
  }

  const firstFocusable = items.find((it) => !it.disabled);
  return firstFocusable?.id ?? null;
}

interface UseRovingFocusReturn {
  /** Stable callback — register a record, returns unregister. */
  registerItem: (record: RadioGroupItemRecord) => () => void;
  /** Stable callback — read the live ordered list. */
  getItems: () => ReadonlyArray<RadioGroupItemRecord>;
  /** Stable callback — move focus + emit selection commit (selection follows focus). */
  focusItem: (
    direction: 'next' | 'prev' | 'first' | 'last',
    currentId: string,
    options: { loop: boolean; onSelect: (value: string) => void },
  ) => void;
  /**
   * Monotonic counter bumped on register / unregister. Group consumers
   * (RadioGroup) thread this into their context value so child Radios
   * re-render after the registry mutates — the roving tabIndex assignment
   * computed during the FIRST render uses an empty registry; without a
   * bump-driven re-render every child would stick at `tabIndex={-1}`.
   */
  version: number;
}

/**
 * Internal hook: holds a mutable ordered map of registered items + provides
 * the three stable callbacks the context exposes.
 *
 * Implementation notes:
 *  - Storage is a `Map<id, RadioGroupItemRecord>` keyed by id; insertion
 *    order is preserved by the JS Map spec. DOM-mount order ≡ registration
 *    order in normal React renders, which matches the visual order users
 *    perceive — sufficient for §4.5 navigation semantics.
 *  - All callbacks are `useCallback([])` + ref-backed → stable for the
 *    lifetime of the hook. Children depending on them (in `useEffect`
 *    deps) won't loop.
 *  - `registerItem` overwrites any prior record with the same id, so
 *    re-registration (e.g. on `disabled` flip) is idempotent.
 */
export function useRovingFocus(): UseRovingFocusReturn {
  // Mutation-only Map — never set into React state. Items list is read on
  // demand by `getItems()` so navigation always sees the latest snapshot.
  const itemsRef = React.useRef<Map<string, RadioGroupItemRecord>>(
    new Map<string, RadioGroupItemRecord>(),
  );

  // Re-render trigger: bump on register / unregister. Hosts thread this
  // value into the context so child consumers re-render once the registry
  // is populated and recompute their roving tabIndex against the full set.
  const [version, setVersion] = React.useState(0);
  const bumpVersion = React.useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const registerItem = React.useCallback<UseRovingFocusReturn['registerItem']>(
    (record) => {
      itemsRef.current.set(record.id, record);
      bumpVersion();
      return () => {
        // Defensive: only delete if the current record under this id is
        // still the one we registered. Prevents an out-of-order unmount
        // from clobbering a re-registration that happened in between.
        const current = itemsRef.current.get(record.id);
        if (current === record) {
          itemsRef.current.delete(record.id);
          bumpVersion();
        }
      };
    },
    [bumpVersion],
  );

  const getItems = React.useCallback<UseRovingFocusReturn['getItems']>(
    () => Array.from(itemsRef.current.values()),
    [],
  );

  const focusItem = React.useCallback<UseRovingFocusReturn['focusItem']>(
    (direction, currentId, { loop, onSelect }) => {
      const items = Array.from(itemsRef.current.values()).filter(
        (it) => !it.disabled,
      );
      if (items.length === 0) return;

      let targetIndex: number;
      if (direction === 'first') {
        targetIndex = 0;
      } else if (direction === 'last') {
        targetIndex = items.length - 1;
      } else {
        const currentIndex = items.findIndex((it) => it.id === currentId);
        if (currentIndex === -1) {
          targetIndex = 0;
        } else if (direction === 'next') {
          targetIndex = currentIndex + 1;
          if (targetIndex >= items.length)
            targetIndex = loop ? 0 : items.length - 1;
        } else {
          // prev
          targetIndex = currentIndex - 1;
          if (targetIndex < 0)
            targetIndex = loop ? items.length - 1 : 0;
        }
      }

      const target = items[targetIndex];
      target.ref.current?.focus();
      // P0-3 A · selection FOLLOWS focus — commit happens in the same tick
      // as focus motion. The setter is the group's controllable state setter
      // (idempotent if value unchanged via H-9).
      onSelect(target.value);
    },
    [],
  );

  return { registerItem, getItems, focusItem, version };
}
