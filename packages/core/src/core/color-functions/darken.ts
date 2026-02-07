import { toRgba } from './to-rgba';

/**
 * Darkens a color by the given amount (0–1).
 * For CSS variables, uses `color-mix(in srgb, ...)`.
 */
export function darken(color: string, amount: number): string {
  if (color.startsWith('var(')) {
    return `color-mix(in srgb, ${color}, black ${amount * 100}%)`;
  }

  const { r, g, b, a } = toRgba(color);
  const f = 1 - amount;

  const dark = (input: number) => Math.round(input * f);

  return `rgba(${dark(r)}, ${dark(g)}, ${dark(b)}, ${a})`;
}
