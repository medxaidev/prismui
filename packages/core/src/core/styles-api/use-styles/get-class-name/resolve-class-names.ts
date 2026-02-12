import type { PrismuiTheme } from '../../../theme';

export type _ClassNames =
  | undefined
  | Partial<Record<string, string>>
  | ((
      theme: PrismuiTheme,
      props: Record<string, any>,
      ctx: Record<string, any> | undefined
    ) => Partial<Record<string, string>>);

export type _ClassNamesArray = _ClassNames | _ClassNames[];

const EMPTY_CLASS_NAMES: Partial<Record<string, string>> = {};

function mergeClassNames(objects: Partial<Record<string, string>>[]) {
  const merged: Partial<Record<string, string>> = {};
  objects.forEach((obj) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (merged[key]) {
        merged[key] = [merged[key], value].filter(Boolean).join(' ');
      } else {
        merged[key] = value;
      }
    });
  });
  return merged;
}

export function resolveClassNames(
  theme: PrismuiTheme,
  classNames: _ClassNamesArray,
  props: Record<string, any>,
  stylesCtx: Record<string, any> | undefined,
): Partial<Record<string, string>> {
  const arrayClassNames = Array.isArray(classNames) ? classNames : [classNames];
  const resolvedClassNames = arrayClassNames.map((item) =>
    typeof item === 'function' ? item(theme, props, stylesCtx) : item || EMPTY_CLASS_NAMES,
  );
  return mergeClassNames(resolvedClassNames);
}
