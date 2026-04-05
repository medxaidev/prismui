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

// CSS Modules type safety
export { ensureAllClasses } from './ensure-classes';
export type { ExactClasses } from './ensure-classes';

// Component types
export type { ComponentPayload, StylingProps, ComponentProps } from './types';
