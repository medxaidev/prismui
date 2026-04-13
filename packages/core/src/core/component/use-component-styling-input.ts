import * as React from 'react';
import { useThemeOptional } from '../theme/context/theme.context';
import { cx } from '../styles/cx';

/**
 * Resolves theme.components[componentName].classNames and .styles,
 * merges them with props-level classNames / styles, and returns
 * the combined input for createStylingContext.
 *
 * Priority: theme < props (props always win per-slot, per-property).
 *
 * Design constraints:
 * - Both classNames and styles use dual-path write (no Set scan).
 *   Reason: consistent strategy, prepares for Step 8.3 slot validation.
 * - undefined property values in merged styles are stripped.
 *   Reason: JS spread preserves undefined keys → <div style="opacity: undefined"> DOM pollution.
 * - Empty merged style objects ({}) are not written → no <div style=""> pollution.
 * - props.classNames[slot] = '' does NOT clear theme classNames (no "explicit clear" support).
 *
 * Naming: this is a "styling input resolver", sitting between:
 *   useComponentDefaultProps (props layer)
 *   → useComponentStylingInput (styling input layer)   ← here
 *   → createStylingContext (styling engine)
 */
export function useComponentStylingInput<Names extends string>(
  componentName: string,
  propsClassNames?: Partial<Record<Names, string>>,
  propsStyles?: Partial<Record<Names, React.CSSProperties>>,
  propsVars?: Record<string, string | number>,
  validSet?: ReadonlySet<Names>,
): {
  classNames: Partial<Record<Names, string>> | undefined;
  styles: Partial<Record<Names, React.CSSProperties>> | undefined;
  themeVars: Record<string, string | number> | undefined;
  vars: Record<string, string | number> | undefined;
} {
  const theme = useThemeOptional();
  // Read components map once
  const components = theme.components;
  const config = components ? components[componentName] : undefined;

  const themeClassNames = config?.classNames as Partial<Record<Names, string>> | undefined;
  const themeStyles = config?.styles as Partial<Record<Names, React.CSSProperties>> | undefined;
  const themeVarsRaw = config?.vars;

  // Independent bail-out per dimension
  const hasClassNames = themeClassNames || propsClassNames;
  const hasStyles = themeStyles || propsStyles;
  const hasVars = themeVarsRaw || propsVars;

  // Fast path: nothing to merge
  if (!hasClassNames && !hasStyles && !hasVars) {
    return { classNames: undefined, styles: undefined, themeVars: undefined, vars: undefined };
  }

  // ── DEV: warn on unknown theme classNames/styles slots ───────────────────
  // validSet is a pre-built Set (stable reference, constructed once at factory
  // definition time — not per render). Only theme-level overrides are checked;
  // props.classNames / props.styles keys are not validated (user freedom).
  if (process.env.NODE_ENV !== 'production' && validSet) {
    for (const slot in themeClassNames) {
      if (!validSet.has(slot as Names)) {
        console.warn(
          `[PrismUI] theme.components.${componentName}.classNames key "${slot}" ` +
          `is not a valid slot. Valid slots: [${[...validSet].join(', ')}]. ` +
          `This override will have no effect.`,
        );
      }
    }
    for (const slot in themeStyles) {
      if (!validSet.has(slot as Names)) {
        console.warn(
          `[PrismUI] theme.components.${componentName}.styles key "${slot}" ` +
          `is not a valid slot. Valid slots: [${[...validSet].join(', ')}]. ` +
          `This override will have no effect.`,
        );
      }
    }
  }

  // ── classNames merge — dual-path write (mirrors styles strategy) ──────────
  // Pass 1: theme slots (base layer)
  // Pass 2: props slots override (cx merges strings, empty string is inert)
  // Empty classNames result → undefined (no empty object leakage)
  let classNames: Partial<Record<Names, string>> | undefined;
  if (hasClassNames) {
    classNames = {} as Partial<Record<Names, string>>;

    if (themeClassNames) {
      for (const slot in themeClassNames) {
        classNames[slot as Names] = themeClassNames[slot as Names];
      }
    }

    if (propsClassNames) {
      for (const slot in propsClassNames) {
        const merged = cx(classNames[slot as Names], propsClassNames[slot as Names]);
        if (merged) {
          classNames[slot as Names] = merged;
        } else {
          // cx returned '' → remove slot entirely (no empty-string leakage)
          delete classNames[slot as Names];
        }
      }
    }

    if (Object.keys(classNames).length === 0) classNames = undefined;
  }

  // ── styles merge — dual-path write + undefined-value strip ───────────────
  // Pass 1: theme slots (base layer)
  // Pass 2: props slots override per-property; strip undefined values
  //   Why strip undefined: { opacity: undefined } is a valid JS object but
  //   React renders it as style="opacity: undefined" — invalid CSS.
  // Empty merged slot → not written (no <div style=""> pollution)
  let styles: Partial<Record<Names, React.CSSProperties>> | undefined;
  if (hasStyles) {
    styles = {} as Partial<Record<Names, React.CSSProperties>>;

    // Pass 1: write theme styles (base layer); skip empty objects immediately
    if (themeStyles) {
      for (const slot in themeStyles) {
        const themeSlot = themeStyles[slot as Names];
        if (themeSlot && Object.keys(themeSlot).length > 0) {
          styles[slot as Names] = themeSlot;
        }
      }
    }

    // Pass 2: merge props styles over theme (props win per-property)
    // - If props provides a slot, perform a full merge and strip undefined values.
    // - If the merged result is empty (all values were undefined), DELETE the slot
    //   even if Pass 1 had written a value for it — props intent takes precedence.
    if (propsStyles) {
      for (const slot in propsStyles) {
        const merged: Record<string, unknown> = {
          ...styles[slot as Names],
          ...propsStyles[slot as Names],
        };
        // Strip undefined values: JS spread preserves them, CSS does not allow them
        for (const key in merged) {
          if (merged[key] === undefined) delete merged[key];
        }
        if (Object.keys(merged).length > 0) {
          styles[slot as Names] = merged as React.CSSProperties;
        } else {
          // merged is empty → remove slot (handles opacity: undefined overriding theme value)
          delete styles[slot as Names];
        }
      }
    }

    if (Object.keys(styles).length === 0) styles = undefined;
  }

  // ── vars — dual-channel: themeVars and propsVars passed independently ─────
  // They are NOT merged here. createStylingContext assembles varsChain in order:
  //   system(varsResolver) → theme → user(props) → rootStyles → style
  //
  // DEV: warn on themeVars keys that are not valid CSS variables (must start with '--').
  // Correct component convention: "--button-height", NOT "--prismui-*" (token domain).
  // Step 8.3 will upgrade to full variable contract validation.
  let resolvedThemeVars: Record<string, string | number> | undefined;
  if (themeVarsRaw) {
    if (process.env.NODE_ENV !== 'production') {
      for (const key in themeVarsRaw) {
        if (!key.startsWith('--')) {
          console.warn(
            `[PrismUI] theme.components.${componentName}.vars key "${key}" ` +
            `is not a valid CSS variable (must start with "--"). ` +
            `Component-level vars should use the component prefix, ` +
            `e.g. "--${componentName.toLowerCase()}-*".`,
          );
        }
      }
    }
    resolvedThemeVars = Object.keys(themeVarsRaw).length > 0 ? themeVarsRaw : undefined;
  }

  // propsVars empty guard: {} === "not passed" — avoids DevTools false "user layer" signal
  // and keeps Step 8.3 variable contract checks semantically clean.
  const resolvedPropsVars =
    propsVars && Object.keys(propsVars).length > 0 ? propsVars : undefined;

  return {
    classNames,
    styles,
    themeVars: resolvedThemeVars,
    vars: resolvedPropsVars,
  };
}
