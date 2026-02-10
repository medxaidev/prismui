import type { FactoryPayload, PolymorphicFactoryPayload } from './factory';

// ---------------------------------------------------------------------------
// Convenience type aliases for component Factory type declarations
// ---------------------------------------------------------------------------

/**
 * Shorthand for declaring a non-polymorphic component's factory type.
 *
 * ```ts
 * export type PaperFactory = Factory<{
 *   props: PaperProps;
 *   ref: HTMLDivElement;
 *   stylesNames: 'root';
 *   vars: PaperCssVariables;
 * }>;
 * ```
 */
export type Factory<Payload extends FactoryPayload> = Payload;

/**
 * Shorthand for declaring a polymorphic component's factory type.
 *
 * ```ts
 * export type ButtonFactory = PolymorphicFactory<{
 *   props: ButtonProps;
 *   defaultRef: HTMLButtonElement;
 *   defaultComponent: 'button';
 *   stylesNames: ButtonStylesNames;
 *   vars: ButtonCssVariables;
 *   variant: ButtonVariant;
 * }>;
 * ```
 */
export type PolymorphicFactory<Payload extends PolymorphicFactoryPayload> = Payload;
