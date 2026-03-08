// ---------------------------------------------------------------------------
// State Selectors — efficient partial state subscriptions
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeState, RuntimeStore } from './store';

/** Selector function: extract a slice from RuntimeState. */
export type StateSelector<T> = (state: Readonly<RuntimeState>) => T;

/**
 * Subscribe to a derived slice of state.
 * Listener is called only when `selector(state)` changes (`Object.is` comparison).
 * Returns an unsubscribe function.
 */
export function selectFromStore<T>(
  store: RuntimeStore,
  selector: StateSelector<T>,
  listener: (selected: T) => void,
): () => void {
  let prev = selector(store.getState());

  // Notify with initial value
  listener(prev);

  return store.subscribe((state) => {
    const next = selector(state);
    if (!Object.is(prev, next)) {
      prev = next;
      listener(next);
    }
  });
}

/**
 * createSelector — memoized selector with multiple input selectors.
 * Re-computes the result function only when any input selector output changes.
 * Uses Object.is for equality checks on each input.
 */
export function createSelector<TInputs extends readonly unknown[], TResult>(
  inputSelectors: { [K in keyof TInputs]: StateSelector<TInputs[K]> },
  resultFn: (...inputs: TInputs) => TResult,
): StateSelector<TResult> {
  let lastInputs: TInputs | undefined;
  let lastResult: TResult;

  return (state: Readonly<RuntimeState>): TResult => {
    const nextInputs = inputSelectors.map((sel) => sel(state)) as unknown as TInputs;

    if (lastInputs !== undefined) {
      let allEqual = true;
      for (let i = 0; i < nextInputs.length; i++) {
        if (!Object.is(nextInputs[i], lastInputs[i])) {
          allEqual = false;
          break;
        }
      }
      if (allEqual) {
        return lastResult;
      }
    }

    lastInputs = nextInputs;
    lastResult = resultFn(...nextInputs);
    return lastResult;
  };
}
