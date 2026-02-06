'use client';

import { useLayoutEffect } from 'react';
import { insertCssOnce } from '../style-engine';
import { useStyleRegistry } from '../style-engine';

// ---------------------------------------------------------------------------
// Baseline CSS
// ---------------------------------------------------------------------------

const BASELINE_CSS = `*,*::before,*::after{box-sizing:border-box;}
html{-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;line-height:1.5;}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;background-color:var(--prismui-palette-background-default);color:var(--prismui-palette-text-primary);}
hr{height:0;color:inherit;border-top-width:1px;}
a{color:inherit;text-decoration:inherit;}
b,strong{font-weight:bolder;}
img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle;}
img,video{max-width:100%;height:auto;}
button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:inherit;color:inherit;margin:0;padding:0;}`;

const BASELINE_ID = 'prismui-css-baseline';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Injects a minimal CSS reset / baseline into the document.
 *
 * References theme CSS variables for `background-color` and `color` on `body`,
 * so it must be rendered within a `PrismuiThemeProvider` that has already
 * injected theme variables (or after `<ThemeVars />`).
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
