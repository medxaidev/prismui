import * as React from 'react';
import type { PrismuiSize } from '../../core/size';
import type { ThemeColor } from '../../core/variant';
import type { FeedbackFactory } from '../../core/feedback';

/**
 * RadioGroup ↔ Radio communication contract.
 *
 * Design reference: `@/devdocs/components/Radio/design.md` v0.2 §四
 * Contract:
 *   - R-2  · group持 state · child 无独立 state（in-group 模式）
 *   - R-7  · disabled / loading 冻结语义（OR 合并 child level）
 *   - R-10 · roving tabindex + orientation-aware arrow-key navigation
 *
 * Provider lives in `RadioGroup.tsx`; consumers are `Radio` children.
 * Component-local — NOT exported to the public surface (design.md §10.1).
 */

/**
 * Item registry record. Carries everything needed by the three closed-loop
 * concerns (roving target computation · arrow-key navigation · skip-disabled),
 * keyed off a stable `id` per child. § 4.2.
 */
export interface RadioGroupItemRecord {
  /** Stable identifier (DOM id or `useId()`). */
  id: string;
  /** Child's `value` prop — used for selection commit. */
  value: string;
  /**
   * Effective disabled (`props.disabled || groupCtx.disabled`). Child re-
   * registers when this flips so the registry stays in sync.
   */
  disabled: boolean;
  /** Focus target. */
  ref: React.RefObject<HTMLElement | null>;
}

/**
 * Snapshot the RadioGroup pushes into context.
 *
 * Generic `T` is reserved for future per-group customisation; the public
 * shape is fixed for v1. The `value` channel is `string | undefined` —
 * `undefined` is the legitimate "全不选" initial state (§4.3).
 */
export interface RadioGroupContextValue {
  // ── Selection state ──────────────────────────────────────────────────
  /** Currently selected value · `undefined` ≡ no selection. */
  value: string | undefined;
  /** Commit a selection. Invoked by child Radio on click / Space / arrow. */
  onSelect: (value: string) => void;

  // ── System props (downstream defaults; child explicit-wins) ──────────
  size: PrismuiSize | undefined;
  color: ThemeColor | undefined;
  disabled: boolean;
  loading: boolean;
  /**
   * L4 feedback factories the group wants children to use. Children may
   * override per-instance via their own `feedbacks` prop (D-1 chain · §5.4).
   */
  feedbacks: FeedbackFactory[] | undefined;

  // ── Keyboard navigation (roving tabindex) ────────────────────────────
  orientation: 'horizontal' | 'vertical';
  /** When true, arrow navigation wraps at boundaries (WAI-ARIA APG default). */
  loop: boolean;
  /**
   * Register this child with the group. Returns an unregister function;
   * children must call it on unmount AND on `disabled` flip (re-register
   * with the new record so list ordering stays consistent).
   */
  registerItem: (record: RadioGroupItemRecord) => () => void;
  /**
   * Read the current ordered registry. Items appear in DOM mount order
   * (first registration wins for a given id).
   */
  getItems: () => ReadonlyArray<RadioGroupItemRecord>;
  /**
   * Move focus to the requested item relative to `currentId`. Implements
   * §4.5 arrow-key navigation with selection-follows-focus (P0-3 A).
   */
  focusItem: (
    direction: 'next' | 'prev' | 'first' | 'last',
    currentId: string,
  ) => void;

  // ── Form integration (v2 hidden input · v1 attribute only) ───────────
  name: string | undefined;
}

/**
 * The context. `null` is the standalone-fallback sentinel (§4.6 · P0-1 A) —
 * a Radio rendered without a RadioGroup parent reads `null` here and
 * degrades to its own controllable `checked` state.
 */
export const RadioGroupContext =
  React.createContext<RadioGroupContextValue | null>(null);

/**
 * Hook accessor with explicit narrowing. Returns `null` when used outside a
 * RadioGroup; consumers branch on this instead of throwing so the standalone
 * path is a first-class mode rather than an error case.
 */
export function useRadioGroupContext(): RadioGroupContextValue | null {
  return React.useContext(RadioGroupContext);
}
