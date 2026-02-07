import { toRgba } from './to-rgba';

function gammaCorrect(c: number) {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * Calculates the relative luminance of a color (0–1) per WCAG 2.0.
 * Supports hex, rgb(), rgba(), hsl(), hsla().
 */
export function luminance(color: string): number {
  const { r, g, b } = toRgba(color);

  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  const rLinear = gammaCorrect(sR);
  const gLinear = gammaCorrect(sG);
  const bLinear = gammaCorrect(sB);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Returns true if the color is perceptually light (luminance > threshold).
 * Default threshold 0.45 balances WCAG accessibility with visual preference
 * (only very bright colors like yellow/amber get dark contrast text).
 */
export function isLightColor(color: string, luminanceThreshold = 0.45): boolean {
  if (color.startsWith('var(')) {
    return false;
  }

  return luminance(color) > luminanceThreshold;
}
