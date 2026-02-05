/**
 * Checks whether a value is a "plain" object.
 *
 * A plain object is an object created by `{}` / `new Object()` or with a null prototype.
 * Arrays, class instances, Dates, Maps, etc. are NOT considered plain objects.
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}