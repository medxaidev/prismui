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
