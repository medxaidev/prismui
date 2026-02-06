import type { PrismuiTheme } from './types';
import { defaultTheme } from './default-theme';
import { deepMerge } from '../../utils';

// ---------------------------------------------------------------------------
// createTheme
// ---------------------------------------------------------------------------

/**
 * Merges user-provided theme overrides with the default theme.
 *
 * This function does **not** resolve semantic palette colors (primary..error).
 * Resolution happens at CSS variable generation time in `getPrismuiCssVariables`.
 */
export function createTheme(
  config: Partial<PrismuiTheme> = {},
): PrismuiTheme {
  return deepMerge(defaultTheme, config);
}