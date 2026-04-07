import { useRef } from "react";
import { createStylingContext, type StylingContext } from "./create-styling-context";
import type { ComponentPayload } from "./types";

/**
 * Internal Hook to bind React semantics
 * 
 * This ensures useStyles is a true React Hook, not a pure function.
 * 
 * Why this is critical:
 * - React Hook rules only apply to functions that call Hooks
 * - Without this, ESLint hook rules won't enforce proper usage
 * - Users could incorrectly call useStyles in conditionals
 * - Future Hook additions (useContext, etc.) won't cause breaking changes
 * 
 * Implementation:
 * - Uses useRef as a lightweight, side-effect-free Hook
 * - The ref value is never used, it only serves to bind React semantics
 * - Zero runtime overhead (useRef is extremely cheap)
 */
function usePrismUISemantics(): void {
  // This Hook call is intentional and critical for React semantics
  // It ensures useStyles is recognized as a Hook by React and ESLint
  useRef(null);
}

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
  // CRITICAL: Bind React semantics
  // This makes useStyles a true React Hook, enabling:
  // - ESLint hook rules enforcement
  // - Proper Hook usage validation
  // - Future Hook additions without breaking changes
  usePrismUISemantics();

  // Normalize input (supports both flat and layered APIs)
  const normalized = normalizeStylingInput(input);

  // Convert normalized input to createStylingContext format
  // createStylingContext expects: Props & { className?, style?, classNames?, styles?, vars? }
  const propsForContext = {
    ...normalized.props,
    classNames: normalized.overrides.classNames,
    styles: normalized.overrides.styles,
    vars: normalized.overrides.vars,
  } as Props & {
    classNames?: Partial<Record<Names, string>>;
    styles?: Partial<Record<Names, React.CSSProperties>>;
    vars?: Record<string, string>;
  };

  return createStylingContext(styling, propsForContext);
}

/**
 * Type guard for LayeredStylingInput
 * 
 * Strict validation to prevent false positives:
 * - Must be an object
 * - Must have at least one of: props, overrides
 * - If props exists, it must be object or undefined
 * - If overrides exists, it must be object or undefined
 * 
 * This prevents incorrect detection of invalid inputs like:
 * { props: 123 } or { overrides: "invalid" }
 */
function isLayeredInput<Props>(input: any): input is LayeredStylingInput<Props> {
  // Must be an object
  if (!input || typeof input !== "object") {
    return false;
  }

  const hasProps = "props" in input;
  const hasOverrides = "overrides" in input;

  // Must have at least one layer
  if (!hasProps && !hasOverrides) {
    return false;
  }

  // If props exists, it must be object or undefined
  if (hasProps && input.props !== undefined && typeof input.props !== "object") {
    return false;
  }

  // If overrides exists, it must be object or undefined
  if (hasOverrides && input.overrides !== undefined && typeof input.overrides !== "object") {
    return false;
  }

  return true;
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
