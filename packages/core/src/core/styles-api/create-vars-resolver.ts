import type { FactoryPayload } from '../factory';
import type { PrismuiTheme } from '../theme';

// ---------------------------------------------------------------------------
// CSS variable type helpers
// ---------------------------------------------------------------------------

export type CssVariable = `--${string}`;

export type TransformVars<V> = {
  [Key in keyof V]: V[Key] extends CssVariable ? Record<V[Key], string | undefined> : never;
};

export type PartialTransformVars<V> = {
  [Key in keyof V]: V[Key] extends CssVariable
    ? Partial<Record<V[Key], string | undefined>>
    : never;
};

// ---------------------------------------------------------------------------
// VarsResolver / PartialVarsResolver
// ---------------------------------------------------------------------------

export type VarsResolver<Payload extends FactoryPayload> = (
  theme: PrismuiTheme,
  props: Payload['props'],
  ctx: Payload['ctx']
) => TransformVars<Payload['vars']>;

export type PartialVarsResolver<Payload extends FactoryPayload> = (
  theme: PrismuiTheme,
  props: Payload['props'],
  ctx: Payload['ctx']
) => PartialTransformVars<Payload['vars']>;

// ---------------------------------------------------------------------------
// createVarsResolver — identity function for type safety
// ---------------------------------------------------------------------------

export function createVarsResolver<Payload extends FactoryPayload>(
  resolver: VarsResolver<Payload>,
): VarsResolver<Payload> {
  return resolver;
}
