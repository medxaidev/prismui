import type { ElementType } from 'react';

/**
 * SlotDefinition — maps slot name to default element type.
 * Must include 'root'.
 *
 * Type-level constraint: `& { root: ElementType }` ensures TS catches missing root.
 * Runtime constraint: defineSlots() throws in DEV if root is absent.
 */
export type SlotDefinition = Record<string, ElementType> & { root: ElementType };

/**
 * Slot metadata symbol — marks a component as a factory-generated slot compound.
 * Used for:
 * - DEV warnings (slot used outside factory render)
 * - Debug tools (inspect slot identity)
 * - Future slot context (if route changes)
 *
 * Zero runtime cost in production.
 */
export const SLOT_SYMBOL: unique symbol = Symbol('prismui.slot');

export interface SlotMetadata {
  slotName: string;
  componentName: string;
}

/**
 * defineSlots — identity function for slot declaration.
 *
 * Purpose: narrow TypeScript inference so slot names and element types
 * are visible at compile time.
 *
 * Dual constraint on `root`:
 * - Type-level: `SlotDefinition` requires `root: ElementType`
 * - Runtime: DEV throws if `root` key is missing (guards against `as any` bypass)
 *
 * @example
 * const buttonSlots = defineSlots({
 *   root: 'button',
 *   inner: 'span',
 *   label: 'span',
 * });
 */
export function defineSlots<T extends SlotDefinition>(slots: T): Readonly<T> {
  if (process.env.NODE_ENV !== 'production') {
    if (!('root' in slots)) {
      throw new Error(
        '[PrismUI] defineSlots() requires a "root" slot. ' +
        'Root is the component existence anchor — without it, ' +
        'getRootProps(), factory defaultElement, and polymorphic behavior are undefined.',
      );
    }
  }
  return Object.freeze(slots);
}

/**
 * Utility: extract slot names as a string union type.
 *
 * @example
 * type ButtonSlotNames = SlotNames<typeof buttonSlots>;
 * // → 'root' | 'inner' | 'label'
 */
export type SlotNames<T extends SlotDefinition> = keyof T & string;
