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

// Styles API (re-export from styles-api module)
export {
  createVarsResolver,
  useStyles,
  useResolvedStylesApi,
  resolveClassNames,
  resolveStyles,
  cx,
} from '../styles-api';

export type {
  StylesApiProps,
  CompoundStylesApiProps,
  ClassNames,
  Styles,
  GetStylesApiOptions,
  StylesRecord,
  VarsResolver,
  PartialVarsResolver,
  TransformVars,
  PartialTransformVars,
  CssVariable,
  UseStylesInput,
  GetStylesApi,
  UseResolvedStylesApiInput,
} from '../styles-api';
