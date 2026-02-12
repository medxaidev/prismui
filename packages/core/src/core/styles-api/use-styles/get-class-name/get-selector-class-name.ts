/** Returns class for given selector from library styles (`*.module.css`) */
export function getSelectorClassName(
  selector: string,
  classes: Record<string, string>,
  unstyled: boolean | undefined,
): string | undefined {
  return unstyled ? undefined : classes[selector];
}
