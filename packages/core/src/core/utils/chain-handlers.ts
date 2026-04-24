/**
 * Stage-10 · Utility · `chainHandlers`
 *
 * Source of truth: `@/devdocs/system/feedback-contract.md` v0.2 §5.3
 *
 * Purpose:
 *   Compose multiple optional callbacks into a single handler that runs
 *   them in order. Used primarily to merge `FeedbackController.pressHandlers`
 *   with user business callbacks without clobbering either side via spread.
 *
 * Semantics (Round 1 v2.1 decision · OQ-FB-6 Option A):
 *   · All handlers run in the order they are passed
 *   · `undefined` handlers are silently skipped (not an error)
 *   · **First throw propagates upward** · subsequent handlers do NOT run
 *   · No error aggregation · no error swallowing
 *   · Same semantics as React Aria `mergeProps` / Mantine `callAll`
 *
 * If callers need error isolation they MUST wrap individual handlers in
 * try/catch themselves — this utility is deliberately minimal.
 */

export function chainHandlers<Args extends unknown[]>(
  ...fns: (((...args: Args) => void) | undefined)[]
): (...args: Args) => void {
  return (...args: Args): void => {
    for (const fn of fns) {
      fn?.(...args); // first throw propagates · loop breaks naturally
    }
  };
}
