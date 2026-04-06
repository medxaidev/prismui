import { createStylingContext, type StylingContext } from "./create-styling-context";
import type { ComponentPayload } from "./types";

/**
 * React Hook for Styling System
 *
 * Core positioning: React Adapter (not a createStylingContext wrapper)
 *
 * Why this is a true Hook:
 * - Uses useThemeOptional (React Context)
 * - Reserves Theme/Direction/ColorScheme integration points
 * - API semantics are stable (won't change from "pure function" to "Hook")
 *
 * Why useMemo is NOT used:
 * - Hook internals don't memo, leaving control to the caller
 * - input object is a new reference on each render, internal memo is ineffective
 * - createStylingContext is a pure and lightweight function, direct call has no performance issues
 * - Allows caller to memo styling themselves: useMemo(() => ({ ... }), [deps])
 *
 * Supports two API styles (compatible evolution):
 *
 * Style 1 (flat structure, compatible with current):
 * ```tsx
 * const ctx = useStyles(styling, {
 *   size, variant,           // component props
 *   classNames, styles,      // styling overrides
 * });
 * ```
 *
 * Style 2 (layered structure, recommended for future):
 * ```tsx
 * const ctx = useStyles(styling, {
 *   props: { size, variant },              // component props
 *   overrides: { classNames, styles },     // styling overrides
 * });
 * ```
 *
 * @example
 * ```tsx
 * function MyComponent({ size, variant, classNames }: MyComponentProps) {
 *   const ctx = useStyles(
 *     {
 *       structure: { stylesNames: ['root', 'inner', 'label'] as const },
 *       resources: { classes },
 *       logic: { varsResolver },
 *     },
 *     // Recommended: layered structure
 *     {
 *       props: { size, variant },
 *       overrides: { classNames },
 *     },
 *   );
 *
 *   return (
 *     <div {...ctx.getRootProps()}>
 *       <span {...ctx.getStyles('inner')}>
 *         <span {...ctx.getStyles('label')}>Label</span>
 *       </span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStyles<Props = any, Names extends string = string>(
  styling: ComponentPayload<Props, Names>["styling"],
  input: StylingInput<Props>,
): StylingContext<Names> {
  // CRITICAL: Bind React semantics (reserve for Step 2.8)
  // const theme = useThemeOptional(); // Step 2.8 will implement
  // Currently not used, but reserves the Hook semantics for future Theme integration

  // Normalize input (supports both flat and layered APIs)
  const normalized = normalizeStylingInput(input);

  // Convert normalized input to createStylingContext format
  // createStylingContext expects: Props & { className?, style?, classNames? }
  const propsForContext = {
    ...normalized.props,
    classNames: normalized.overrides.classNames,
    // Note: normalized.overrides.styles and vars are not yet supported by createStylingContext
    // They will be added in Step 2.8
  } as Props & {
    classNames?: Partial<Record<Names, string>>;
  };

  return createStylingContext(styling, propsForContext);
}

/**
 * Type guard for LayeredStylingInput
 */
function isLayeredInput<Props>(input: any): input is LayeredStylingInput<Props> {
  return (
    input &&
    typeof input === "object" &&
    (("props" in input && (input.props === undefined || typeof input.props === "object")) ||
      ("overrides" in input && (input.overrides === undefined || typeof input.overrides === "object")))
  );
}

/**
 * Normalize StylingInput (compatible with both flat and layered APIs)
 */
function normalizeStylingInput<Props>(input: StylingInput<Props>): NormalizedStylingInput {
  // Detect if layered structure (using type guard)
  if (isLayeredInput(input)) {
    return {
      props: input.props ?? {},
      overrides: input.overrides ?? {},
    };
  }

  // Compatible with flat structure (extract styling overrides)
  const { classNames, styles, vars, ...props } = input as FlatStylingInput<Props>;
  return {
    props,
    overrides: { classNames, styles, vars },
  };
}

/**
 * Styling input contract (supports two structures)
 *
 * @template Props - Component props type
 */
export type StylingInput<Props = any> =
  | FlatStylingInput<Props>      // Flat structure (compatible with current)
  | LayeredStylingInput<Props>;  // Layered structure (recommended for future)

/**
 * Flat structure (compatible with current API)
 *
 * Type safety: Props is no longer any, but the actual Props type of the component
 * IDE hints: Auto-complete component props
 * Compile check: Invalid props will error
 *
 * @template Props - Component props type
 */
type FlatStylingInput<Props = any> = Props & {
  // Styling overrides (conventional fields)
  classNames?: Partial<Record<string, string>>;
  styles?: Partial<Record<string, React.CSSProperties>>;
  vars?: Record<string, string>;
};

/**
 * Layered structure (recommended future API)
 *
 * Clear boundaries: component props and styling overrides are separated
 * Type safety: Props type constraint
 *
 * @template Props - Component props type
 */
type LayeredStylingInput<Props = any> = {
  // Component props (passed to varsResolver)
  props?: Props;

  // Styling overrides
  overrides?: {
    classNames?: Partial<Record<string, string>>;
    styles?: Partial<Record<string, React.CSSProperties>>;
    vars?: Record<string, string>;
  };
};

/**
 * Normalized input (internal use)
 */
type NormalizedStylingInput = {
  props: Record<string, any>;
  overrides: {
    classNames?: Partial<Record<string, string>>;
    styles?: Partial<Record<string, React.CSSProperties>>;
    vars?: Record<string, string>;
  };
};
