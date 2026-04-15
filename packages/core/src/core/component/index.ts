/**
 * Component factory system for PrismUI.
 * 
 * This module provides the core factory function for creating polymorphic components
 * with full type safety and ref forwarding.
 * 
 * @module component
 */

export { createComponent } from './create-component';
export type { PolymorphicComponent } from './create-component';

// Factory system with styling integration
export { factory } from './factory';
export type { FactoryRenderContext } from './factory';

// Styling context
export { createStylingContext, omitComponentProps } from './create-styling-context';
export type { StylingContext } from './create-styling-context';

// React Hook for styling system
export { useStyles } from './use-styles';
export type { StylingInput } from './use-styles';

// Component defaultProps hook
export { useComponentDefaultProps } from './use-component-default-props';

// CSS Modules type safety
export { ensureClasses } from './ensure-classes';

// Component types
export type { ComponentPayload, StylingProps, ComponentProps, ComponentSystem, ComponentSystemEntry, ResolvedNames } from './types';

// Slot System (Stage 9)
export { defineSlots, SLOT_SYMBOL } from './define-slots';
export type { SlotDefinition, SlotNames, SlotMetadata } from './define-slots';
export { resolveStylesNames } from './resolve-styles-names';

// System marks (for double-wrap detection)
export { WITH_VARIANT_MARK, WITH_SIZE_MARK, WITH_STATE_MARK, SYSTEM_MARKS } from './system-marks';
