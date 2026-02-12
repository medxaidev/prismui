import type { CSSProperties } from 'react';
import type { PrismuiTheme } from '../../../theme';
import type { CssVariable } from '../../create-vars-resolver';

type ResolvedVars = Partial<Record<string, Record<CssVariable, string | undefined>>>;

export type _VarsResolver = (
  theme: PrismuiTheme,
  props: Record<string, any>,
  ctx: Record<string, any> | undefined,
) => ResolvedVars;

function filterUndefined(obj: Record<string, string | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]!;
    }
  }
  return result;
}

function mergeVars(vars: (ResolvedVars | undefined)[]): ResolvedVars {
  return vars.reduce<ResolvedVars>((acc, current) => {
    if (current) {
      Object.keys(current).forEach((key) => {
        acc[key] = { ...acc[key], ...filterUndefined(current[key]!) };
      });
    }
    return acc;
  }, {});
}

export function resolveVars(
  theme: PrismuiTheme,
  props: Record<string, any>,
  stylesCtx: Record<string, any> | undefined,
  selector: string,
  themeName: string[],
  varsResolver: _VarsResolver | undefined,
  vars: _VarsResolver | undefined,
): CSSProperties {
  return (
    mergeVars([
      varsResolver?.(theme, props, stylesCtx),
      ...themeName.map((name) =>
        (theme.components?.[name]?.vars as _VarsResolver | undefined)?.(theme, props, stylesCtx),
      ),
      vars?.(theme, props, stylesCtx),
    ])?.[selector] as CSSProperties
  ) || {};
}
