/** Returns variant className: `classes[selector--variant]` if present */
export function getVariantClassName(
  variant: string | undefined,
  classes: Record<string, string>,
  selector: string,
  unstyled: boolean | undefined,
): string | undefined {
  return variant && !unstyled ? classes[`${selector}--${variant}`] : undefined;
}
