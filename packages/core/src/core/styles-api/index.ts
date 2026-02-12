// Types
export * from './styles-api.types';
export type {
  VarsResolver,
  PartialVarsResolver,
  TransformVars,
  PartialTransformVars,
  CssVariable,
} from './create-vars-resolver';

// createVarsResolver
export { createVarsResolver } from './create-vars-resolver';

// useStyles
export { useStyles } from './use-styles/use-styles';
export type { UseStylesInput, GetStylesApi } from './use-styles/use-styles';

// useResolvedStylesApi
export { useResolvedStylesApi } from './use-resolved-styles-api';
export type { UseResolvedStylesApiInput } from './use-resolved-styles-api';

// resolveClassNames / resolveStyles (for compound component usage)
export { resolveClassNames } from './use-styles/get-class-name/resolve-class-names';
export { resolveStyles } from './use-styles/get-style/resolve-styles';

// cx utility
export { cx } from './use-styles/get-class-name/get-class-name';
