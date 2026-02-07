import { toRgba } from './to-rgba';

/**
 * Applies alpha transparency to a color string.
 * Supports hex, rgb, hsl, and CSS variable references.
 *
 * For CSS variables, uses `color-mix(in srgb, ...)` for browser-native blending.
 */
export function rgba(color: string, alpha: number): string {
  if (typeof color !== 'string' || alpha > 1 || alpha < 0) {
    return 'rgba(0, 0, 0, 1)';
  }

  if (color.startsWith('var(')) {
    const mixPercentage = (1 - alpha) * 100;
    return `color-mix(in srgb, ${color}, transparent ${mixPercentage}%)`;
  }

  const { r, g, b } = toRgba(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const alpha = rgba;
