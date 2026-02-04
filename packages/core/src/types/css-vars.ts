export type CSSVariable = `--${string}`;

export type CSSVariables<Variable extends string = CSSVariable> = Partial<Record<Variable, string | number>>;

export type CSSVars<
  Variable extends string = CSSVariable,
  Theme = unknown
> =
  | CSSVariables<Variable>
  | ((theme: Theme) => CSSVariables<Variable>)
  | CSSVars<Variable, Theme>[];