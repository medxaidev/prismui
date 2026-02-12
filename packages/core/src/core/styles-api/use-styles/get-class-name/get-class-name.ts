import type { PrismuiTheme } from '../../../theme';
import type { GetStylesApiOptions } from '../../styles-api.types';
import { getSelectorClassName } from './get-selector-class-name';
import { getStaticClassNames } from './get-static-class-names';
import { getVariantClassName } from './get-variant-class-name';
import { getRootClassName } from './get-root-class-name';
import { getThemeClassNames } from './get-theme-class-names';
import { resolveClassNames, type _ClassNamesArray } from './resolve-class-names';

// ---------------------------------------------------------------------------
// cx — lightweight clsx replacement (no external dependency)
// ---------------------------------------------------------------------------

export function cx(...args: (string | undefined | null | false | (string | undefined)[])[]): string {
  const result: string[] = [];
  for (const arg of args) {
    if (!arg) continue;
    if (Array.isArray(arg)) {
      for (const item of arg) {
        if (item) result.push(item);
      }
    } else {
      result.push(arg);
    }
  }
  return result.join(' ');
}

// ---------------------------------------------------------------------------
// GetClassNameOptions
// ---------------------------------------------------------------------------

export interface GetClassNameOptions {
  theme: PrismuiTheme;
  options: GetStylesApiOptions | undefined;
  themeName: string[];
  selector: string;
  classNames: _ClassNamesArray;
  classes: Record<string, string>;
  unstyled: boolean | undefined;
  className: string | undefined;
  rootSelector: string;
  props: Record<string, any>;
  stylesCtx?: Record<string, any> | undefined;
  withStaticClasses?: boolean;
}

// ---------------------------------------------------------------------------
// getClassName — assembles the final className for a selector
// ---------------------------------------------------------------------------

export function getClassName({
  theme,
  options,
  themeName,
  selector,
  classNames,
  classes,
  unstyled,
  className,
  rootSelector,
  props,
  stylesCtx,
  withStaticClasses,
}: GetClassNameOptions): string {
  return cx(
    // 1. Theme-level classNames
    getThemeClassNames(theme, themeName, selector, props, stylesCtx),
    // 2. Variant className from CSS Module
    getVariantClassName(options?.variant, classes, selector, unstyled),
    // 3. Component-level classNames (from useStyles input)
    resolveClassNames(theme, classNames, props, stylesCtx)?.[selector],
    // 4. Per-selector classNames from getStyles() options
    options?.classNames
      ? resolveClassNames(
        theme,
        options.classNames as _ClassNamesArray,
        options.props || props,
        stylesCtx,
      )?.[selector]
      : undefined,
    // 5. Root className (only for root selector)
    getRootClassName(rootSelector, selector, className),
    // 6. CSS Module selector class
    getSelectorClassName(selector, classes, unstyled),
    // 7. Static class names (e.g. prismui-Button-root)
    withStaticClasses !== false
      ? getStaticClassNames(themeName, selector, options?.withStaticClass)
      : undefined,
    // 8. Per-selector className from getStyles() options
    options?.className,
  );
}
