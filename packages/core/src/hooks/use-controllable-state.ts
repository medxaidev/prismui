import * as React from 'react';

/**
 * `useControllableState` · PrismUI's first component-level React hook abstraction.
 *
 * Design reference: `@/devdocs/hooks/use-controllable-state.md` v0.2
 * Contract: HR-1 ~ HR-8 (first hook contract in PrismUI)
 *
 * Unifies controlled / uncontrolled state patterns behind a `useState`-shaped
 * tuple API, so every PrismUI component that exposes a state prop
 * (ToggleButton `pressed`, Switch `checked`, Dialog `open`, Select `value`, …)
 * can delegate the mode routing to one place.
 *
 * ── Key guarantees ──────────────────────────────────────────────────────────
 *   H-1 · `value === undefined` is the uncontrolled sentinel (React-canonical).
 *   H-2 · `defaultValue` is required (type-level). Also supports lazy `() => T`.
 *   H-3 · Returned setter is stable across renders (can live in effect deps).
 *   H-4 · `onChange` fires ONLY when `shouldUpdate(prev, next)` is true —
 *         aligned with DOM `input.onChange` semantics (not "setter-called").
 *   H-5 · Functional updates `setValue(prev => next)` supported.
 *   H-6 · Controlled ↔ uncontrolled transitions emit a DEV `console.error`.
 *   H-7 · Zero external dependencies — only React.
 *   H-8 · `onChange` callback is ref-latched (inline lambdas don't cause
 *         stale-closure bugs).
 *   H-9 · `shouldUpdate` equality shortcut — defaults to `!Object.is(prev,next)`;
 *         returning false makes the setter a complete no-op (no setState /
 *         no onChange).
 *  H-10 · `defaultValue` accepts `T | (() => T)` (lazy init, like useState).
 */

/**
 * Setter signature · matches `React.useState`'s setter (supports H-5
 * functional updates).
 */
export type ControllableSetter<T> = (next: T | ((prev: T) => T)) => void;

/**
 * Configuration for `useControllableState<T>`.
 */
export interface UseControllableStateOptions<T> {
  /**
   * Controlled value. If `undefined`, the hook enters **uncontrolled mode**
   * and uses the internal `useState` backed by `defaultValue`.
   *
   * H-1: `undefined` is the uncontrolled sentinel and cannot be overridden.
   * If your `T` legitimately includes `undefined`, wrap with `null` or a
   * sentinel of your own.
   */
  value?: T | undefined;

  /**
   * Initial value for uncontrolled mode. **Required** — even if you only
   * intend to operate in controlled mode, this is needed as the fallback
   * for the internal `useState` call.
   *
   * H-10: Lazy function form `() => T` supported (identical semantics to
   * `useState(() => heavy())`). Runs exactly once on first render.
   */
  defaultValue: T | (() => T);

  /**
   * Fires when a setter call **actually changes** the value, per
   * `shouldUpdate`. In controlled mode this is the parent's only
   * notification channel; in uncontrolled mode it fires in the same frame
   * as the internal `setState`. If `shouldUpdate` returns false, onChange
   * does NOT fire.
   *
   * H-4 (v0.2): DOM-event semantics — unchanged value is not a state change.
   */
  onChange?: (next: T) => void;

  /**
   * Custom equality predicate. Return `true` to signal "value has changed,
   * proceed with update"; return `false` to make the setter a complete
   * no-op (no internal setState, no onChange).
   *
   * Default: `(prev, next) => !Object.is(prev, next)`.
   *
   * H-9:
   *  - `Object.is` correctly handles `NaN` / `+0 vs -0` (unlike `===`).
   *  - Objects / arrays compare by reference — pass a deep-equal to override.
   *  - Must be a **pure predicate** (no side effects) — same contract as
   *    `React.PureComponent.shouldComponentUpdate`.
   *
   * @default (prev, next) => !Object.is(prev, next)
   */
  shouldUpdate?: (prev: T, next: T) => boolean;
}

// Default equality — H-9. `Object.is` is used instead of `===` so that
// `setValue(NaN)` called twice collapses to a single change (Object.is(NaN,
// NaN) === true) and `setValue(+0) then setValue(-0)` is correctly detected
// as a change. Matches React useState's internal bail-out semantics.
const defaultShouldUpdate = <T>(prev: T, next: T): boolean => !Object.is(prev, next);

/**
 * Unify controlled / uncontrolled state into a `useState`-shaped tuple.
 *
 * @example Uncontrolled
 * ```tsx
 * const [pressed, setPressed] = useControllableState({ defaultValue: false });
 * ```
 *
 * @example Controlled
 * ```tsx
 * const [pressed, setPressed] = useControllableState({
 *   value: props.pressed,
 *   defaultValue: false,
 *   onChange: props.onPressedChange,
 * });
 * ```
 *
 * @example Lazy initial (H-10)
 * ```tsx
 * const [v, setV] = useControllableState({
 *   defaultValue: () => parseFromStorage(),
 * });
 * ```
 *
 * @example Deep-equal guard (H-9)
 * ```tsx
 * const [arr, setArr] = useControllableState({
 *   value, defaultValue: [],
 *   shouldUpdate: (a, b) => !shallowArrayEqual(a, b),
 * });
 * ```
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>,
): readonly [T, ControllableSetter<T>] {
  const {
    value,
    defaultValue,
    onChange,
    shouldUpdate = defaultShouldUpdate,
  } = options;

  // Whether we're in controlled mode THIS render. Recomputed every render so
  // `current` immediately reflects controlled-value changes without waiting
  // for an effect.
  const isControlled = value !== undefined;

  // Uncontrolled storage. `useState` natively accepts `T | (() => T)`, so
  // H-10 is one-for-one delegation — no extra work here.
  const [uncontrolledValue, setUncontrolledValue] = React.useState<T>(defaultValue);

  // ── Refs latched to "latest" so the stable setter (H-3) can read
  //    up-to-date state without re-creating. All refs sync in a single
  //    effect after render (see below).
  const isControlledRef = React.useRef(isControlled);
  const valueRef = React.useRef(value);
  const uncontrolledRef = React.useRef(uncontrolledValue);
  const onChangeRef = React.useRef(onChange);
  const shouldUpdateRef = React.useRef(shouldUpdate);

  // Single effect per render — cheapest possible ref sync path. Runs after
  // commit, which is fine for event-driven setter calls (events happen
  // after effects in the same frame).
  React.useEffect(() => {
    isControlledRef.current = isControlled;
    valueRef.current = value;
    uncontrolledRef.current = uncontrolledValue;
    onChangeRef.current = onChange;
    shouldUpdateRef.current = shouldUpdate;
  });

  // DEV-only mode-transition warning (H-6). Effect-phase tracking avoids
  // render-time mutation footguns under React Strict Mode / concurrent
  // re-renders. We use `undefined` as the "first effect" sentinel: the
  // warn is only considered on renders AFTER the initial commit, so there
  // is no way for the first render to accidentally self-report as a
  // transition regardless of how many times the hook body is invoked.
  const prevIsControlledRef = React.useRef<boolean | undefined>(undefined);
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      prevIsControlledRef.current = isControlled;
      return;
    }
    if (
      prevIsControlledRef.current !== undefined &&
      prevIsControlledRef.current !== isControlled
    ) {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI] useControllableState: switching between controlled and ' +
          'uncontrolled mode is not supported. Pick one mode per component ' +
          'instance lifetime. This message is shown once per transition.',
      );
    }
    prevIsControlledRef.current = isControlled;
  });

  // Stable setter (H-3). `useCallback([])` + refs means the returned
  // function reference is stable for the entire hook lifetime.
  const setValue = React.useCallback<ControllableSetter<T>>((next) => {
    const prev = isControlledRef.current
      ? (valueRef.current as T)
      : uncontrolledRef.current;

    // H-5 · resolve functional updater against the freshest prev.
    const resolved =
      typeof next === 'function'
        ? (next as (p: T) => T)(prev)
        : next;

    // H-9 · equality shortcut. Runs BEFORE any side effect so an unchanged
    // value has zero observable cost (no re-render, no onChange).
    if (!shouldUpdateRef.current(prev, resolved)) return;

    if (!isControlledRef.current) {
      setUncontrolledValue(resolved);
      // Immediate ref sync so a synchronous follow-up call like
      //   setValue(p => !p); setValue(p => !p)
      // sees the in-between value (the effect-based sync runs too late).
      uncontrolledRef.current = resolved;
    }

    // H-4 · only fires when shouldUpdate returned true. Ref-latched (H-8)
    // so the latest `onChange` closure is always invoked.
    onChangeRef.current?.(resolved);
  }, []);

  const current = isControlled ? (value as T) : uncontrolledValue;
  return [current, setValue] as const;
}
