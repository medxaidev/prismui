import { toRgba } from './to-rgba';

/**
 * Lightens a color by the given amount (0–1).
 * For CSS variables, uses `color-mix(in srgb, ...)`.
 */
export function lighten(color: string, amount: number): string {
  if (color.startsWith('var(')) {
    return `color-mix(in srgb, ${color}, white ${amount * 100}%)`;
  }

  const { r, g, b, a } = toRgba(color);

  const light = (input: number) => Math.round(input + (255 - input) * amount);

  return `rgba(${light(r)}, ${light(g)}, ${light(b)}, ${a})`;
}
