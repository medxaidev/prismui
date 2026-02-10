// Core types
export type {
  DataAttributes,
  FactoryPayload,
  PolymorphicFactoryPayload,
  ExtendCompoundComponent,
  ExtendsRootComponent,
  ExtendComponent,
  StaticComponents,
  ThemeExtend,
  ComponentClasses,
  FactoryComponentWithProps,
  PrismuiComponentStaticProperties,
  PrismuiComponent,
} from './factory';

// Factory functions + identity
export { factory, identity } from './factory';

// Polymorphic factory
export type {
  PolymorphicComponentWithProps,
  PrismuiPolymorphicComponent,
} from './polymorphic-factory';
export { polymorphicFactory } from './polymorphic-factory';

// useProps hook
export { useProps } from './use-props';

// Type aliases for component declarations
export type { Factory, PolymorphicFactory } from './create-factory';
