/** Adds `className` to the list only if the given selector is the root selector */
export function getRootClassName(
  rootSelector: string,
  selector: string,
  className: string | undefined,
): string | undefined {
  return rootSelector === selector ? className : undefined;
}
