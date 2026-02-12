import type { CSSProperties } from 'react';
import type { FactoryPayload } from '../factory';
import type { PrismuiTheme } from '../theme';
import type { PartialVarsResolver } from './create-vars-resolver';

// ---------------------------------------------------------------------------
// StylesRecord — base record mapping stylesNames → data
// ---------------------------------------------------------------------------

export type StylesRecord<StylesNames extends string, Payload> = Partial<
  Record<StylesNames, Payload>
>;

// ---------------------------------------------------------------------------
// StylesApiRecord — object or function form, compound vs root
// ---------------------------------------------------------------------------

export type StylesApiRecord<
  Payload extends FactoryPayload,
  DataType,
> = Payload['compound'] extends true
  ? Payload['stylesNames'] extends string
    ? StylesRecord<Payload['stylesNames'], DataType>
    : never
  : Payload['stylesNames'] extends string
    ?
        | StylesRecord<Payload['stylesNames'], DataType>
        | ((
            theme: PrismuiTheme,
            props: Payload['props'],
            ctx: Payload['ctx']
          ) => StylesRecord<Payload['stylesNames'], DataType>)
    : never;

// ---------------------------------------------------------------------------
// ClassNames / Styles — public prop types
// ---------------------------------------------------------------------------

export type ClassNames<Payload extends FactoryPayload> = StylesApiRecord<Payload, string>;

export type Styles<Payload extends FactoryPayload> = StylesApiRecord<Payload, CSSProperties>;

// ---------------------------------------------------------------------------
// GetStylesApiOptions — per-selector overrides passed to getStyles()
// ---------------------------------------------------------------------------

export interface GetStylesApiOptions {
  className?: string;
  style?: CSSProperties;
  classNames?: ClassNames<{ props: any; stylesNames: string }>;
  styles?: Styles<{ props: any; stylesNames: string }>;
  variant?: string;
  props?: Record<string, any>;
  withStaticClass?: boolean;
}

// ---------------------------------------------------------------------------
// StylesApiProps — props that every root component accepts
// ---------------------------------------------------------------------------

export interface StylesApiProps<Payload extends FactoryPayload> {
  unstyled?: boolean;
  variant?: Payload['variant'] extends string ? Payload['variant'] | (string & {}) : string;
  classNames?: ClassNames<Payload>;
  styles?: Styles<Payload>;
  vars?: PartialVarsResolver<Payload>;
}

// ---------------------------------------------------------------------------
// CompoundStylesApiProps — compound components omit unstyled
// ---------------------------------------------------------------------------

export interface CompoundStylesApiProps<Payload extends FactoryPayload>
  extends Omit<StylesApiProps<Payload>, 'unstyled'> {}
