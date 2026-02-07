'use client';

import { useLayoutEffect } from 'react';
import { getPrismuiThemeCssText } from './css-vars';
import { insertCssOnce } from '../style-engine';
import { usePrismuiTheme } from '../PrismuiProvider/prismui-theme-context';
import { useStyleRegistry } from '../style-engine';

/**
 * Injects theme CSS variables into the document.
 *
 * Uses `insertCssOnce` with the special `'prismui-theme-vars'` id, which
 * writes to a dedicated `<style data-prismui-theme-vars>` element. On theme
 * or color-scheme changes, the entire block is **replaced** (not appended).
 *
 * In SSR, CSS is collected into the style registry instead.
 */
export function ThemeVars() {
  const { theme, colorScheme } = usePrismuiTheme();
  const registry = useStyleRegistry();

  const cssText = getPrismuiThemeCssText(theme, colorScheme);

  // useLayoutEffect fires synchronously after DOM mutations but before paint.
  // On the server it is a no-op, so we also call insertCssOnce during render
  // to ensure the SSR registry captures the CSS.
  if (typeof document === 'undefined') {
    insertCssOnce('prismui-theme-vars', cssText, registry);
  }

  useLayoutEffect(() => {
    insertCssOnce('prismui-theme-vars', cssText, registry);
  }, [cssText, registry]);

  return null;
}
