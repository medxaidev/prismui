/**
 * Styling Unit exports.
 *
 * This module provides the core types for PrismUI's styling system.
 *
 * ## What is exported
 *
 * - `StylesNames`: Base type for component style names
 * - `CssVariable`: CSS variable name type (must start with --)
 * - `CssVariables`: CSS variables object type (supports generic constraint)
 * - `VarsResolver`: Function type for props → CSS variables transformation
 *
 * ## What is NOT exported
 *
 * - Component-specific StylesNames (e.g., `ButtonStylesNames`) are defined
 *   in their respective component files, not here.
 * - Component-specific CssVariable types (e.g., `ButtonCssVariable`) are
 *   defined in their respective component files (optional, for strict mode).
 *
 * @module styles
 *
 * // Component-specific type safety
 * const name: ButtonStylesNames = 'root'; // ✅
 * const bad: ButtonStylesNames = 'foo';   // ❌ compile error
 * ```
 */

// =============================================================================
// Core Types
// =============================================================================

export type { StylesNames } from './types';

// =============================================================================
// CSS Variables Types (Step 2.2: Styling Data Flow)
// =============================================================================

export type {
  CssVariable,
  CssVariables,
  CSSVariablesObject,
  InlineStyleObject,
  StyleProp,
  VarsResolver,
} from './types';

// =============================================================================
// Styling Override Types (Step 2.3: Styling Override)
// =============================================================================

export type { StylesOverride } from './types';

// =============================================================================
// Styling Engine (Step 2.4: Styling Engine)
// =============================================================================

export { cx } from './cx';
export { createGetStyles } from './get-styles';
export type {
  WithRoot,
  Classes,
  GetStylesInput,
  GetStylesOutput,
  GetStylesFn,
} from './types';
