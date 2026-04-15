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
 * Base type for all component StylesNames.
 *
 * StylesNames define the addressable styling units within a component.
 * Each component should define its own narrowed union type.
 *
 * This is a generic type that defaults to string, allowing both:
 * 1. Loose usage (StylesNames) - accepts any string
 * 2. Strict usage (StylesNames<'root' | 'inner'>) - type-safe union
 *
 * @template T - The specific style names (defaults to string for backward compatibility)
 *
 * @example
 * ```ts
 * // Generic usage (accepts any string)
 * function logStyleName(name: StylesNames): void {
 *   console.log(name);
 * }
 *
 * // Component-specific type (defined in component file)
 * type ButtonStylesNames = StylesNames<'root' | 'inner' | 'label'>;
 *
 * // Usage
 * const name: ButtonStylesNames = 'root'; // 
 * const invalid: ButtonStylesNames = 'invalid'; // Type error
 * ```
 */
export type StylesNames<T extends string = string> = T;

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
 * Values can be `string` or `number`. Numbers are automatically converted to strings
 * when applied to the DOM (e.g., `{ '--opacity': 0.5 }` becomes `--opacity: 0.5`).
 *
 * @template Variable - The CSS variable names (default: any CSS variable)
 *
 * @example
 * ```ts
 * // Loose mode (default, recommended)
 * const vars: CssVariables = {
 *   '--button-height': '48px',
 *   '--button-bg': 'blue',
 *   '--opacity': 0.5,        // ✅ number is allowed
 *   '--z-index': 10,         // ✅ number is allowed
 * };
 *
 * // Strict mode (component-specific)
 * type ButtonCssVariable = '--button-height' | '--button-bg' | '--opacity';
 * const buttonVars: CssVariables<ButtonCssVariable> = {
 *   '--button-height': '48px',
 *   '--button-bg': 'blue',
 *   '--opacity': 0.5,
 *   // '--invalid': 'red',  // ❌ Type error
 * };
 * ```
 */
export type CssVariables<Variable extends string = CssVariable> = Partial<
  Record<Variable, string | number>
>;

/**
 * CSS Variables object type for inline usage.
 *
 * This type only accepts CSS variable keys (starting with `--`).
 * Used to represent pure CSS Variables without inline styles.
 *
 * @example
 * ```ts
 * const vars: CSSVariablesObject = {
 *   '--button-height': '48px',
 *   '--opacity': 0.5,
 * };
 * ```
 */
export type CSSVariablesObject = {
  [key: `--${string}`]: string | number;
};

/**
 * Inline style object type (standard React CSS properties).
 *
 * This is just React.CSSProperties, representing standard CSS properties.
 *
 * @example
 * ```ts
 * const inlineStyles: InlineStyleObject = {
 *   padding: 0,
 *   margin: '8px',
 * };
 * ```
 */
export type InlineStyleObject = React.CSSProperties;

/**
 * Style prop type that combines CSS Variables and inline styles.
 *
 * This type accepts both CSS Variables and inline styles in the same object.
 * At runtime, the object can contain both types of properties.
 *
 * **Type-level semantics** (for Step 2.4):
 * - CSS Variables (`--*`): system-controlled, participates in styling system
 * - Inline styles: non-controlled fallback, escape hatch
 *
 * **Runtime separation** (Step 2.4 implementation):
 * ```ts
 * function splitStyle(style: StyleProp) {
 *   const vars: CSSVariablesObject = {};
 *   const inline: InlineStyleObject = {};
 *   for (const key in style) {
 *     if (key.startsWith('--')) {
 *       vars[key] = style[key];
 *     } else {
 *       inline[key] = style[key];
 *     }
 *   }
 *   return { vars, inline };
 * }
 * ```
 *
 * The helper types `CSSVariablesObject` and `InlineStyleObject` are provided
 * for type annotations in Step 2.4's splitting logic.
 *
 * @example
 * ```tsx
 * <Button
 *   style={{
 *     '--button-height': '60px',  // ✅ CSS Variable
 *     '--opacity': 0.5,           // ✅ CSS Variable (number)
 *     padding: 0,                 // ✅ Inline style
 *     margin: '8px',              // ✅ Inline style
 *   }}
 * />
 * ```
 */
export type StyleProp = (React.CSSProperties & CSSVariablesObject) | undefined;

/**
 * VarsResolver function type.
 *
 * Converts component props (and optionally theme) to CSS Variables.
 *
 * This is pure Data Flow: props → variables. How these variables are applied
 * to DOM elements is handled by the Styling Engine (Step 2.4).
 *
 * @template Props - Component props type (default: Record<string, any> for loose mode)
 * @template Variable - The CSS variable names (default: any CSS variable)
 *
 * @example
 * ```ts
 * // Loose mode (no type inference, manual annotation required)
 * const resolver: VarsResolver = (props: ButtonProps) => ({
 *   '--button-height': props.size === 'lg' ? '48px' : '36px',
 *   '--button-bg': 'blue',
 * });
 *
 * // Strict mode with Props type (recommended, automatic type inference)
 * type ButtonProps = { size?: 'sm' | 'lg'; color?: string };
 * const strictResolver: VarsResolver<ButtonProps> = (props) => ({
 *   //                                                ^^^^^ props.size is typed
 *   '--button-height': props.size === 'lg' ? '48px' : '36px',
 *   '--button-bg': props.color ?? 'blue',
 * });
 *
 * // Strict mode with Props + Variable constraints
 * type ButtonCssVariable = '--button-height' | '--button-bg';
 * const fullStrictResolver: VarsResolver<ButtonProps, ButtonCssVariable> = (props) => ({
 *   '--button-height': props.size === 'lg' ? '48px' : '36px',
 *   '--button-bg': props.color ?? 'blue',
 *   // '--invalid': 'red',  // ❌ Type error
 * });
 *
 * // With theme (theme is always provided — useThemeOptional fallback ensures it)
 * const resolverWithTheme: VarsResolver<ButtonProps> = (props, theme) => ({
 *   '--button-height': theme.spacing.md ?? '1rem',
 * });
 * ```
 */
export type VarsResolver<
  Props = Record<string, any>,
  Variable extends string = CssVariable
> = (
  props: Props,
  theme?: import("../theme/types").PrismUITheme<string, string>
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
   * Contains two sub-layers (type-distinguished):
   * - CSS Variables (--*): system-controlled, recommended
   * - Inline styles: non-controlled fallback
   *
   * The type system distinguishes between CSS Variables and inline styles,
   * enabling Step 2.4 to split and merge them correctly.
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
  style?: StyleProp;

  /**
   * StylesNames-level className overrides.
   *
   * Each key corresponds to a StylesName, and the value is the className to add.
   *
   * Merge order (Step 2.4 must follow):
   *   system classes → classNames[name] → className (for root only)
   *
   * **Known limitation (Step 2.3)**:
   * - `Names` is a string-based constraint (loose mode)
   * - Not bound to component structure at this stage
   * - Step 2.5 will tighten this via `ComponentPayload.stylesNames`
   *
   * @example
   * ```tsx
   * <Button classNames={{ root: "my-root", label: "my-label" }} />
   * // root: "prismui-Button-root my-root"
   * // label: "prismui-Button-label my-label"
   * ```
   */
  classNames?: Partial<Record<Names, string>>;

  /**
   * StylesNames-level inline style overrides.
   *
   * Each key corresponds to a StylesName, and the value is the inline styles to apply.
   * Supports both CSS Variables and regular CSS properties.
   *
   * Merge order (Step 2.4 must follow):
   *   system vars → styles[name] → style (for root only)
   *
   * **Step 2.8 requirement**: This MUST be fully implemented for Stage 2 validation.
   *
   * @example
   * ```tsx
   * <Button
   *   styles={{
   *     root: { borderRadius: '20px', '--button-height': '60px' },
   *     label: { fontWeight: 'bold' },
   *   }}
   * />
   * ```
   */
  styles?: Partial<Record<Names, React.CSSProperties>>;

  /**
   * CSS Variables override (alternative to style prop).
   *
   * Provides a dedicated API for overriding CSS Variables without mixing
   * with inline styles. This is the recommended way to customize component appearance.
   *
   * Merge order (Step 2.4 must follow):
   *   system vars → vars → style
   *
   * **Step 2.8 requirement**: This MUST be fully implemented for Stage 2 validation.
   *
   * @example
   * ```tsx
   * <Button
   *   vars={{
   *     '--button-height': '60px',
   *     '--button-bg': '#ff0000',
   *   }}
   * />
   * ```
   */
  vars?: CSSVariablesObject;
};

// =============================================================================
// Styling Engine Types (Step 2.4)
// =============================================================================

/**
 * Type helper to enforce that Names must include 'root'.
 *
 * This ensures compile-time guarantee that the StylesNames type always includes 'root',
 * preventing runtime errors and aligning type system with runtime semantics.
 *
 * @template Names - The component's StylesNames type
 *
 * @example
 * ```ts
 * type Good = WithRoot<'root' | 'label'>;  // ✅ 'root' | 'label'
 * type Bad = WithRoot<'label' | 'icon'>;   // ❌ never (compile error)
 * ```
 */
export type WithRoot<Names extends string> = 'root' extends Names ? Names : never;

/**
 * CSS class names record type.
 *
 * Maps StylesNames to their corresponding CSS class names.
 * All names must be present (non-partial), ensuring type safety.
 *
 * **Critical constraint**: `root` must always exist and is explicitly typed.
 * This ensures type-level guarantee that `classes.root` is always a string,
 * eliminating the need for runtime type assertions.
 *
 * @template Names - The component's StylesNames type (must include 'root')
 *
 * @example
 * ```ts
 * type ButtonStylesNames = 'root' | 'inner' | 'label';
 * const classes: Classes<ButtonStylesNames> = {
 *   root: 'btn-root',
 *   inner: 'btn-inner',
 *   label: 'btn-label',
 * };
 * ```
 */
export type Classes<Names extends string> = {
  root: string;
} & Record<Names, string>;

/**
 * Input for the getStyles function.
 *
 * Contains all the necessary data to compute the final className and style
 * for each slot (StylesName) in a component.
 *
 * **Type constraint**: Names MUST include 'root'. This is enforced at compile time
 * via the WithRoot helper type in createGetStyles.
 *
 * @template Names - The component's StylesNames type (must include 'root')
 *
 * @example
 * ```ts
 * const input: GetStylesInput<'root' | 'label'> = {
 *   classes: { root: 'btn-root', label: 'btn-label' },
 *   vars: { '--button-height': '48px' },
 *   className: 'user-button',
 *   classNames: { root: 'user-root' },
 *   style: { '--opacity': 0.5, padding: 0 },
 * };
 * ```
 */
export type GetStylesInput<Names extends string> = {
  /**
   * CSS class names for each slot.
   * All names must be present (from CSS Modules or static classes).
   */
  classes: Classes<Names>;

  /**
   * Ordered CSS Variable layers (from createStylingContext).
   * Applied only to the root slot via sequential Object.assign merge.
   *
   * Order determines priority: later layers override earlier ones.
   * createStylingContext assembles: [systemVars, themeVars, userVars, ...]
   *
   * createGetStyles does NOT know what any layer means — it only iterates.
   * Layer semantics are the sole responsibility of createStylingContext.
   */
  varsChain: (Record<string, string | number> | undefined)[];

  /**
   * User-provided className for the root element.
   * Merged after system classes and classNames.root.
   */
  className?: string;

  /**
   * User-provided classNames for each slot.
   * Merged after system classes.
   *
   * Note: `root` is explicitly typed to ensure type safety when accessing
   * `classNames?.root` without type assertions.
   */
  classNames?: Partial<Record<Names, string>> & { root?: string };

  /**
   * User-provided style for the root element.
   * Contains both CSS Variables and inline styles.
   */
  style?: StyleProp;

  /**
   * User-provided styles for each slot.
   * Each slot can have its own inline styles.
   *
   * Merge order: system vars → styles[name] → style (for root only)
   *
   * **Step 2.8 requirement**: This MUST be fully supported.
   */
  styles?: Partial<Record<Names, React.CSSProperties>>;

};

/**
 * Output of the getStyles function.
 *
 * Contains the final className and style for a slot.
 *
 * **Styling Engine → React DOM Boundary Contract**:
 * - `className` is ALWAYS a string (empty string if no classes)
 * - `style` is optional and only exists on root slot
 *
 * @example
 * ```tsx
 * const output = getStyles('root');
 * // → { className: 'btn-root user-root user-button', style: { ... } }
 *
 * const output2 = getStyles('label');
 * // → { className: 'btn-label' }
 * ```
 */
export type GetStylesOutput = {
  /**
   * Final className for the slot.
   * Merged from: system classes → classNames[name] → className (root only)
   */
  className: string;

  /**
   * Final style for the slot.
   *
   * - **Root slot**: ALWAYS present (may be empty `{}`)
   * - **Non-root slots**: undefined
   *
   * Merged from: system vars → user vars → inline styles
   */
  style?: StyleProp;
};

/**
 * getStyles function type.
 *
 * Returns the final className and style for a given slot name.
 *
 * **Type constraint**: Names MUST include 'root'. This is enforced at compile time
 * via the WithRoot helper type in createGetStyles.
 *
 * @template Names - The component's StylesNames type (must include 'root')
 *
 * @example
 * ```ts
 * const getStyles: GetStylesFn<'root' | 'label'> = createGetStyles(...);
 * getStyles('root');  // → { className: string, style?: StyleProp }
 * getStyles('label'); // → { className: string }
 * ```
 */
export type GetStylesFn<Names extends string> = (name: Names) => GetStylesOutput;
