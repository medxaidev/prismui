import { Field as FieldRoot } from './Field';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { FieldError } from './FieldError';

// Compound components are attached as static properties inside ./Field.
// Re-type the export to expose that API surface to consumers.
export const Field = FieldRoot as typeof FieldRoot & {
  Label: typeof FieldLabel;
  Description: typeof FieldDescription;
  Error: typeof FieldError;
};

export { FieldLabel, FieldDescription, FieldError };

export { FieldContext, useFieldContext } from './FieldContext';
export type { FieldContextValue } from './FieldContext';

export { useFieldControlProps } from './useFieldControlProps';
export type { FieldControlPropsInput } from './useFieldControlProps';

export type { FieldProps, FieldOwnProps, FieldStylesNames } from './Field';
export type { FieldLabelProps, FieldLabelOwnProps, FieldLabelStylesNames } from './FieldLabel';
export type {
  FieldDescriptionProps,
  FieldDescriptionOwnProps,
  FieldDescriptionStylesNames,
} from './FieldDescription';
export type { FieldErrorProps, FieldErrorOwnProps, FieldErrorStylesNames } from './FieldError';
