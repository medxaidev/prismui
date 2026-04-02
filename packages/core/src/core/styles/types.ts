/**
 * Styling Unit type definitions for PrismUI.
 *
 * This module defines the core concept of **StylesNames** — the minimal addressable
 * unit in PrismUI's styling system. Each StylesName represents a named DOM element
 * (or logical style region) within a component.
 *
 * StylesNames are purely structural: they name the DOM parts of a component,
 * without encoding variant, state, or any style information.
 *
 * @module styles
 *
 * ## Naming Convention
 *
 * Components should define their own StylesNames following these rules:
 *
 * 1. **`root` is always present** — every component has a root element.
 * 2. **Use semantic names** — describe function, not implementation (`label`, not `span`).
 * 3. **Reflect DOM hierarchy** — order names from outer to inner (`root` → `inner` → `label`).
 * 4. **Stay consistent** — similar components use similar names (`Button.label`, `Chip.label`).
 * 5. **No state names** — don't include `disabled`, `loading`, etc.
 *
 * @example
 * ```ts
 * // In your component file (e.g., Button.tsx):
 * import type { StylesNames } from '@prismui/core/styles';
 *
 * export type ButtonStylesNames = 'root' | 'inner' | 'label';
 *
 * // Verify it's a valid StylesNames subtype
 * const _check: StylesNames = 'root' satisfies ButtonStylesNames;
 * ```
 */

// =============================================================================
// Core Type
// =============================================================================

/**
 * Base type for all StylesNames.
 *
 * Every component defines its own narrowed union type (e.g. `ButtonStylesNames`),
 * but all of them extend `string`. This base type exists so that generic utilities
 * can accept any StylesNames without knowing the specific component.
 *
 * Components should define their StylesNames in their own files, not here.
 *
 * @example
 * ```ts
 * // Generic utility function
 * function logStyleName(name: StylesNames): void {
 *   console.log(name);
 * }
 *
 * // Component-specific type (defined in component file)
 * type ButtonStylesNames = 'root' | 'inner' | 'label';
 *
 * // Usage
 * logStyleName('root' satisfies ButtonStylesNames); // ✅
 * ```
 */
export type StylesNames = string;

// =============================================================================
// CSS Variables Types (Step 2.2: Styling Data Flow)
// =============================================================================

/**
 * CSS Variable name type.
 *
 * All CSS variable names must start with `--`.
 *
 * @example
 * ```ts
 * const varName: CssVariable = '--button-height';  // ✅
 * const invalid: CssVariable = 'button-height';    // ❌ Type error
 * ```
 */
export type CssVariable = `--${string}`;

/**
 * CSS Variables object type.
 *
 * A flat record of CSS variable names to their values.
 * Supports both loose mode (default) and strict mode (with generic constraint).
 *
 * @template Variable - The CSS variable names (default: any CSS variable)
 *
 * @example
 * ```ts
 * // Loose mode (default, recommended)
 * const vars: CssVariables = {
 *   '--button-height': '48px',
 *   '--button-bg': 'blue',
 * };
 *
 * // Strict mode (component-specific)
 * type ButtonCssVariable = '--button-height' | '--button-bg';
 * const buttonVars: CssVariables<ButtonCssVariable> = {
 *   '--button-height': '48px',
 *   '--button-bg': 'blue',
 *   // '--invalid': 'red',  // ❌ Type error
 * };
 * ```
 */
export type CssVariables<Variable extends string = CssVariable> = Partial<
  Record<Variable, string>
>;

/**
 * VarsResolver function type.
 *
 * Converts component props (and optionally theme) to CSS Variables.
 *
 * This is pure Data Flow: props → variables. How these variables are applied
 * to DOM elements is handled by the Styling Engine (Step 2.4).
 *
 * @template Variable - The CSS variable names (default: any CSS variable)
 *
 * @example
 * ```ts
 * // Loose mode (recommended)
 * const resolver: VarsResolver = (props) => ({
 *   '--button-height': props.size === 'lg' ? '48px' : '36px',
 *   '--button-bg': 'blue',
 * });
 *
 * // Strict mode (optional)
 * type ButtonCssVariable = '--button-height' | '--button-bg';
 * const strictResolver: VarsResolver<ButtonCssVariable> = (props) => ({
 *   '--button-height': '48px',
 *   '--button-bg': 'blue',
 * });
 *
 * // With theme
 * const resolverWithTheme: VarsResolver = (props, theme) => ({
 *   '--button-height': theme?.spacing?.(2) ?? '8px',
 * });
 * ```
 */
export type VarsResolver<Variable extends string = CssVariable> = (
  props: Record<string, any>,
  theme?: any // Theme type TBD in future stage
) => CssVariables<Variable>;

// =============================================================================
// Styling Override Types (Step 2.3: Styling Override)
// =============================================================================

/**
 * Styling override props for components.
 *
 * Allows users to override component styles at three levels:
 * 1. CSS Variables (via `style`) - recommended, system-controlled
 * 2. StylesNames-level classNames (via `classNames`) - structural override
 * 3. Inline styles (via `style`) - fallback, non-controlled
 *
 * ## Important: `style` has dual semantics
 *
 * The `style` prop contains two sub-layers:
 * - Layer A: CSS Variables (system-controlled, participates in system inference)
 * - Layer B: Inline styles (non-controlled fallback, escape hatch)
 *
 * Step 2.4 must distinguish between these two types of styles when merging.
 *
 * @template Names - The component's StylesNames type
 *
 * @example
 * ```tsx
 * // Layer 1: CSS Variables override (recommended)
 * <Button style={{ "--button-height": "60px" }} />
 *
 * // Layer 2: StylesNames-level className override
 * <Button classNames={{ root: "my-root" }} />
 *
 * // Layer 3: Inline style override (fallback)
 * <Button style={{ padding: 0 }} />
 *
 * // Combined usage
 * <Button
 *   className="user-button"
 *   classNames={{ root: "user-root" }}
 *   style={{
 *     "--button-height": "60px",  // CSS Variable (controlled)
 *     padding: 0,                  // Inline style (non-controlled)
 *   }}
 * />
 * ```
 */
export type StylesOverride<Names extends string = string> = {
  /**
   * Additional className for the root element.
   *
   * Merge order (Step 2.4 must follow):
   *   system classes → classNames.root → className
   *
   * @example
   * ```tsx
   * <Button className="user-button" />
   * // Final: "prismui-Button-root user-button"
   * ```
   */
  className?: string;

  /**
   * Inline styles for the root element.
   *
   * Contains two sub-layers:
   * - CSS Variables (--*): system-controlled, recommended
   * - Inline styles: non-controlled fallback
   *
   * @example
   * ```tsx
   * <Button
   *   style={{
   *     "--button-height": "60px",  // CSS Variable (recommended)
   *     padding: 0,                  // Inline style (fallback)
   *   }}
   * />
   * ```
   */
  style?: React.CSSProperties;

  /**
   * StylesNames-level className overrides.
   *
   * Each key corresponds to a StylesName, and the value is the className to add.
   *
   * Merge order (Step 2.4 must follow):
   *   system classes → classNames[name] → className (for root only)
   *
   * @example
   * ```tsx
   * <Button classNames={{ root: "my-root", label: "my-label" }} />
   * // root: "prismui-Button-root my-root"
   * // label: "prismui-Button-label my-label"
   * ```
   */
  classNames?: Partial<Record<Names, string>>;
};
