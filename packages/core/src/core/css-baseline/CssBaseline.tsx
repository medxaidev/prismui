'use client';

import { useLayoutEffect } from 'react';
import { insertCssOnce } from '../style-engine';
import { useStyleRegistry } from '../style-engine';
import { BASELINE_CSS } from './baseline-css';

const BASELINE_ID = 'prismui-css-baseline';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Injects a comprehensive CSS reset / baseline into the document.
 *
 * References theme CSS variables for `background-color`, `color`, `font-family`,
 * and `focus-visible` outline, so it must be rendered within a `PrismuiThemeProvider`
 * that has already injected theme variables (or after `<ThemeVars />`).
 *
 * Uses `insertCssOnce` so the baseline is injected only once and is
 * collected by the SSR registry when running on the server.
 */
export function CssBaseline() {
  const registry = useStyleRegistry();

  // SSR: inject during render (useLayoutEffect is a no-op on the server)
  if (typeof document === 'undefined') {
    insertCssOnce(BASELINE_ID, BASELINE_CSS, registry);
  }

  // Browser: inject synchronously before paint
  useLayoutEffect(() => {
    insertCssOnce(BASELINE_ID, BASELINE_CSS, registry);
  }, [registry]);

  return null;
}
