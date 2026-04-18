import type { DataAttrsResolver } from '../component/data-attrs-resolver';

/**
 * InteractiveDisabledStrategy — §2.7 归属裁决
 *
 * Which state combinations should mark the root as non-interactive (i.e. suppress
 * hover / active visual feedback). Surface-level decision, passed in by the
 * component at factory declaration; the state system itself stays Surface-unaware.
 *
 * - 'action'   — `disabled || loading`          (Button / IconButton / MenuItem...)
 * - 'control'  — `disabled || readOnly`         (Input / Textarea / Select...)
 * - 'disabled' — `disabled` only                (static Tag / Card / fallback)
 * - function   — custom predicate (escape hatch)
 */
export type InteractiveDisabledStrategy =
  | 'action'
  | 'control'
  | 'disabled'
  | ((props: Record<string, any>) => boolean);

export interface StateDataAttrsOptions {
  /**
   * Strategy for deriving `data-interactive-disabled`. Defaults to `'disabled'`.
   * See {@link InteractiveDisabledStrategy}.
   */
  interactiveStrategy?: InteractiveDisabledStrategy;
}

/**
 * Single source of truth for the "non-interactive" predicate used by both
 * `data-interactive-disabled` (CSS hook) and component-level event guards
 * (e.g. Button's polymorphic onClick / onKeyDown swallow — §2.4 R-D4).
 *
 * Stage 3 Step 10 · A-3: exported so components can reuse the exact predicate
 * that produced the data-attr, eliminating drift between visual and behavioral
 * disabling.
 */
export function resolveInteractive(
  props: Record<string, any>,
  strategy: InteractiveDisabledStrategy,
): boolean {
  if (typeof strategy === 'function') return !!strategy(props);
  switch (strategy) {
    case 'action':  return !!(props.disabled || props.loading);
    case 'control': return !!(props.disabled || props.readOnly);
    case 'disabled':
    default:        return !!props.disabled;
  }
}

/**
 * stateDataAttrs
 *
 * Produces root state `data-*` attrs: `data-disabled` / `data-loading`
 * / `data-readonly` / `data-interactive-disabled`.
 *
 * The first three are 1:1 mirrors of props (boolean attrs using presence
 * convention). The fourth is a derived Surface-level attr whose predicate
 * is supplied by the component via `options.interactiveStrategy`.
 *
 * DEV warning: if `options.interactiveStrategy` is not provided but props
 * include `loading` or `readOnly`, emit a `console.warn` — the component
 * likely forgot to declare its Surface strategy, which means the derived
 * attr will miss the loading / readOnly case.
 */
export const stateDataAttrs: DataAttrsResolver<Record<string, any>, StateDataAttrsOptions> = (
  props,
  options,
) => {
  const strategy: InteractiveDisabledStrategy = options?.interactiveStrategy ?? 'disabled';

  if (process.env.NODE_ENV !== 'production') {
    const strategyNotSpecified = options?.interactiveStrategy === undefined;
    const hasLoading = props.loading !== undefined;
    const hasReadOnly = props.readOnly !== undefined;
    if (strategyNotSpecified && (hasLoading || hasReadOnly)) {
      // eslint-disable-next-line no-console
      console.warn(
        '[PrismUI] state system: props include ' +
        `${hasLoading ? 'loading' : ''}${hasLoading && hasReadOnly ? ' / ' : ''}${hasReadOnly ? 'readOnly' : ''}` +
        " but no `interactiveStrategy` option was declared. " +
        "`data-interactive-disabled` will only reflect `disabled`. " +
        "Declare `{ name: 'state', options: { interactiveStrategy: 'action' | 'control' } }` in systems.",
      );
    }
  }

  const interactive = resolveInteractive(props, strategy);

  return {
    'data-disabled':            props.disabled ? 'true' : undefined,
    'data-loading':             props.loading  ? 'true' : undefined,
    'data-readonly':            props.readOnly ? 'true' : undefined,
    'data-interactive-disabled': interactive ? 'true' : undefined,
  };
};
