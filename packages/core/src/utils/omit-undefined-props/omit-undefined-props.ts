export type OmitUndefinedProps<T extends Record<string, any>> = {
  [K in keyof T]?: Exclude<T[K], undefined>;
};

export function omitUndefinedProps<T extends Record<string, any>>(
  props: T
): OmitUndefinedProps<T> {
  const result: Record<string, any> = {};

  for (const key in props) {
    const value = props[key];
    if (value !== undefined) result[key] = value;
  }

  return result as OmitUndefinedProps<T>;
}
