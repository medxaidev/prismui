import { toRgba } from './to-rgba';

/**
 * Converts any CSS color string to an RGB channel string (e.g. "12 104 233").
 * Returns null if the color cannot be parsed or is a CSS variable reference.
 *
 * Used for generating `*Channel` CSS variables that enable
 * `rgba(var(--prismui-primary-mainChannel) / 0.5)` syntax.
 */
export function getColorChannels(color: string): string | null {
  if (!color || color.startsWith('var(')) {
    return null;
  }

  const { r, g, b } = toRgba(color);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }

  return `${r} ${g} ${b}`;
}
