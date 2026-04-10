/**
 * System Marks
 *
 * Symbol tokens used by factory() to detect whether a varsResolver has
 * already been wrapped by a specific system middleware.
 *
 * This prevents double-wrapping when a component both:
 *   1. Declares systems: ['variant'] in the factory payload
 *   2. Manually passes withVariantColors(base) as the varsResolver
 *
 * Each system middleware (withVariantColors, withSize, withState, …) stamps
 * its output function with the corresponding symbol. factory() checks for the
 * mark before injecting, and silently skips if already stamped.
 */

export const WITH_VARIANT_MARK = Symbol('withVariantColors');

export const SYSTEM_MARKS = {
  variant: WITH_VARIANT_MARK,
  // future: size: WITH_SIZE_MARK,
  // future: state: WITH_STATE_MARK,
} as const;
