/**
 * Styling Unit type definitions for PrismUI.
 *
 * This module exports the core StylesNames type — the minimal addressable
 * unit in PrismUI's styling system.
 *
 * Components define their own StylesNames in their component files.
 *
 * @module styles
 *
 * @example
 * ```ts
 * import type { StylesNames } from '@prismui/core/styles';
 *
 * // In your component file:
 * export type ButtonStylesNames = 'root' | 'inner' | 'label';
 *
 * // Generic function that works with any component's StylesNames
 * function highlight<T extends StylesNames>(name: T): void { ... }
 *
 * // Component-specific type safety
 * const name: ButtonStylesNames = 'root'; // ✅
 * const bad: ButtonStylesNames = 'foo';   // ❌ compile error
 * ```
 */

export type { StylesNames } from './types';
