import type { PrismUITheme, TextRoleName, TextRoleRef } from './types';
import { defaultColorFamilies } from './default-colors';
import { defaultLightPalette, defaultDarkPalette } from './default-palette';
import { defaultSizeTokens } from '../size/default-size-tokens';
import { defaultStateTokens } from '../state/default-state-tokens';

/**
 * Default Text Roles (Stage 3 — Step 8)
 *
 * Maps abstract text roles to structured palette references.
 * Uses TextRoleRef (NOT string DSL) for type safety and refactorability.
 *
 * Design rationale:
 * - primary/secondary/disabled → neutral family (text hierarchy, not semantic)
 *   IMPORTANT: must use role.fg fields that are designed to be READABLE ON THE
 *   DEFAULT PAGE BACKGROUND — i.e. bordered.fg / minimal.fg / low.fg.
 *   NEVER use high.fg here — `high.fg` is the foreground placed ON a filled
 *   high-contrast button (often #FFFFFF in light mode), not body text.
 * - danger/warning/success/info → semantic `.high.bg` (high-saturation text,
 *   WCAG AA on default background per Rule 7)
 *
 * See stage-3-step-(stage-9)-8.md §3 for full spec and constraints.
 */
export const defaultTextRoles: Record<TextRoleName, TextRoleRef> = {
  primary:   { semantic: 'neutral', role: 'bordered', field: 'fg' },
  secondary: { semantic: 'neutral', role: 'minimal',  field: 'fg' },
  disabled:  { semantic: 'neutral', role: 'low',  field: 'fg' },
  danger:    { semantic: 'error',   role: 'high', field: 'bg' },
  warning:   { semantic: 'warning', role: 'high', field: 'bg' },
  success:   { semantic: 'success', role: 'high', field: 'bg' },
  info:      { semantic: 'info',    role: 'high', field: 'bg' },
};

/**
 * Default PrismUI Theme
 *
 * Core Definition:
 * - All tokens have explicit units
 * - fontSize/spacing/radius use rem
 * - breakpoints use px (number)
 */
export const defaultTheme: PrismUITheme = {
  // ========== Color System ==========
  colors: defaultColorFamilies,

  palette: {
    light: defaultLightPalette,
    dark: defaultDarkPalette,
  },

  // ========== Typography System ==========
  typography: {
    fontFamily:
      '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyMonospace:
      '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',

    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
    },

    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    lineHeight: {
      xs: 1.25,
      sm: 1.4,
      md: 1.5,
      lg: 1.55,
      xl: 1.6,
    },
  },

  // ========== Spacing System ==========
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },

  // ========== Radius System ==========
  radius: {
    xs: '0.25rem', // 4px
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    full: '9999px', // pill / circle
  },

  // ========== Shadow System ==========
  shadows: {
    xs: '0 1px 2px 0 rgba(145, 158, 171, 0.16)',
    sm: '0 4px 8px 0 rgba(145, 158, 171, 0.16)',
    md: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
    lg: '0 16px 32px -4px rgba(145, 158, 171, 0.16)',
    xl: '-40px 40px 80px -8px rgba(0, 0, 0, 0.24)',
  },

  // ========== Breakpoint System ==========
  breakpoints: {
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1400,
  },

  // ========== Transition System ==========
  transition: {
    duration: {
      fast: '120ms',
      base: '150ms',
      slow: '200ms',
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in:       'cubic-bezier(0.4, 0, 1, 1)',
      out:      'cubic-bezier(0, 0, 0.2, 1)',
    },
  },

  // ========== Size System ==========
  size: defaultSizeTokens,

  // ========== State System ==========
  state: defaultStateTokens,

  // ========== Focus Ring System ==========
  focusRing: {
    width: '2px',
    offset: '2px',
    color: 'var(--prismui-color-primary)',
  },

  // ========== Focus Pointer-Halo System (mode-B真分轨) ==========
  // Weak-signal companion to `focusRing`. Consumed by C-2 Abstract controls
  // that are genuine mode-B carriers — Switch (v1.0 registered this token)
  // and Checkbox (v1.0 is the second cross-component carrier). Future
  // non-text-input C-2 Abstracts will reuse this token pair via
  // `var(--prismui-focus-pointer-halo-*)`.
  //
  // 🔴 Dark-mode adaptivity (v1.0.2 Round 1 cleanup closure):
  //   The halo color uses `color-mix(in srgb, currentColor 16%, transparent)`
  //   so it AUTOMATICALLY inherits the ambient text color — dark text on
  //   light backgrounds yields a dark halo; light text on dark backgrounds
  //   yields a light halo. This replaces the original `rgba(0, 0, 0, 0.16)`
  //   hardcoded black, which was invisible on dark-mode surfaces.
  //
  //   `currentColor` resolves to the component's `color` property, which
  //   inherits from the page's text color — a semantic signal that is
  //   always theme-appropriate. The 16% alpha keeps the halo visually
  //   weaker than the (strong) keyboard ring, preserving the mode-B
  //   visual hierarchy mandated by focus-behavior.md §4.3.
  //
  //   Intentionally NOT tied to primary color: the ring already carries
  //   primary, so keeping the halo neutral avoids double-signaling the same
  //   channel and reserves the primary color for strong focus indication.
  //
  //   Browser support: `color-mix()` is CSS Color Module Level 5 — Chrome
  //   111+, Safari 16.2+, Firefox 113+. All browsers in PrismUI's target
  //   matrix (modern evergreen + Next.js SSR). Themes may override to a
  //   legacy `rgba(...)` value if older browser support is required.
  focusPointerHalo: {
    width: '2px',
    color: 'color-mix(in srgb, currentColor 16%, transparent)',
  },

  // ========== Text Role System (Step 3.8) ==========
  textRoles: defaultTextRoles,

  // ========== Global Config ==========
  scale: 1,

  // ========== Component defaultProps ==========
  components: {},
};
