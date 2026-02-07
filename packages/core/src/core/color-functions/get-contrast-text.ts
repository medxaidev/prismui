import { isLightColor } from './luminance';

/**
 * Returns an appropriate contrast text color (black or white) for the given
 * background color, based on WCAG relative luminance.
 *
 * @param backgroundColor - Any CSS color string (hex, rgb, hsl)
 * @param lightText - Text color for dark backgrounds (default: '#FFFFFF')
 * @param darkText - Text color for light backgrounds (default: '#1C252E')
 */
export function getContrastText(
  backgroundColor: string,
  lightText = '#FFFFFF',
  darkText = '#1C252E',
): string {
  return isLightColor(backgroundColor) ? darkText : lightText;
}
