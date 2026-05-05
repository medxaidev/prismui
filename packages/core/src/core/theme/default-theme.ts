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

    // ========== Stage-14 SZ-TYPE-2 Family Layer (v1.0 lock) ==========
    // Three semantic families × three size steps = 9 tokens.
    // - body  (running text · regular weight 400)
    // - title (headings · semibold 600)
    // - label (UI text · medium 500)
    //
    // SZ-TYPE-1: every lineHeight ∈ {16, 20, 24, 28, 32, 36, 40, 48}
    //            (px integer · `% 4 === 0`). Asserted in `theme.test.ts`.
    // SZ-TYPE-3: every token declares (fontSize, lineHeight, fontWeight).
    //
    // Anchors documented in STAGE-14-OVERVIEW.md:
    //   body.md  = 14/20  (§3.6 example · canonical body baseline)
    //   title.md = 20/28  (§3.7.1 Section schema · titleSize)
    //   label.md = 14/20  (§OQ-SZ-1 = B · Button label baseline)
    //
    // Non-anchor sizes (sm / lg) follow a regular 3-step ramp:
    //   body.sm  = 13/20  (dense form caption · footnote · table cell text)
    //   body.lg  = 16/24  (long-form reading)
    //   title.sm = 16/24  (subtitle / h4)
    //   title.lg = 24/32  (display / h1)
    //   label.sm = 12/16  (dense UI label · chip · badge)
    //   label.lg = 16/24  (large button text)
    body: {
      sm: { fontSize: '13px', lineHeight: 20, fontWeight: 400 },
      md: { fontSize: '14px', lineHeight: 20, fontWeight: 400 },
      lg: { fontSize: '16px', lineHeight: 24, fontWeight: 400 },
    },
    title: {
      sm: { fontSize: '16px', lineHeight: 24, fontWeight: 600 },
      md: { fontSize: '20px', lineHeight: 28, fontWeight: 600 },
      lg: { fontSize: '24px', lineHeight: 32, fontWeight: 600 },
    },
    label: {
      sm: { fontSize: '12px', lineHeight: 16, fontWeight: 500 },
      md: { fontSize: '14px', lineHeight: 20, fontWeight: 500 },
      lg: { fontSize: '16px', lineHeight: 24, fontWeight: 500 },
    },
  },

  // ========== Spacing System ==========
  // Stage-14 SZ-SCALE-4 (v0.2 lock): 8-step semantic spacing.
  // Values are rem-based for user-zoom safety; equivalent px shown for
  // reference at default root font-size 16px. All values satisfy SZ-SCALE-2
  // `value % 4 === 0` (4-px base, Stage-14 SZ-SCALE-1).
  spacing: {
    none: '0px',     // 0px
    xs:   '0.25rem', // 4px
    sm:   '0.5rem',  // 8px
    md:   '1rem',    // 16px
    lg:   '1.5rem',  // 24px
    xl:   '2rem',    // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem',   // 48px
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

  // ========== Section Layout System (Stage-14 Phase 4 · SZ-SEC-1 / SZ-SEC-2) ==========
  // Single source of truth for any container component rendering Header /
  // Content / Footer bands (Modal · Drawer · Toast · Dialog · Card).
  //
  // Schema authority: STAGE-14-OVERVIEW.md §3.7.1 (locked v0.5).
  //
  // Default values follow the §3.7.1 spec verbatim — Modal Round 0 (Stage-11
  // Phase 7) is the first real consumer; if its visual review reveals the
  // need to retune, the change goes through ADR-005 v1.0.6+ audit log
  // rather than being patched in-place here. Phase 4 deliberately does NOT
  // pre-tune to "what Modal probably wants" because that would make the
  // token a Modal-specific helper instead of a cross-container contract.
  //
  // Token derivation (Stage-14 single-direction chain · §2.2 · v1.1 schema):
  //   spacing   → paddingX (lg=24) · gap (none=0)
  //   typography → titleSize references theme.typography.title.{size}
  //                ('md' = 20/28 · §3.6 anchor)
  //   per-band  → header.paddingY (lg=24) · content.paddingY (none=0) · footer.paddingY (lg=24)
  //   alignment → CSS Flexbox literal unions (compile-time guard, D-3)
  //
  // v1.1 default rhythm (was uniform paddingY: md across all bands in v1.0):
  //   Header  : pY = lg = 24  (square padding · matches paddingX)
  //   Content : pY = 0        (Content abuts Header / Footer · no redundant whitespace)
  //   Footer  : pY = lg = 24  (square padding · matches paddingX)
  //   Gap     : 0             (bands abut directly · padding inside bands does the work)
  //
  // This is the Card / Dialog canonical rhythm: title and action bands have
  // comfortable square padding · content fills the remaining vertical space
  // without adding more whitespace. Modal Round 0 may override these via
  // its own theme overrides if a different rhythm is desired (the schema
  // supports any per-band paddingY combination).
  layout: {
    section: {
      // —— Spacing (2 fields · top-level · v1.1) ——————————————————————————————
      paddingX: '1.5rem', // spacing.lg = 24px
      gap:      '0px',    // spacing.none = 0 (v1.1 · was 'md'/16 in v1.0)

      // —— Typography (1 field) · references theme.typography.title.md = 20/28
      // (the §3.6 anchor used across Stage-14 docs as the "modal title" benchmark)
      titleSize: 'md',

      // —— Per-band config (alignment + paddingY · v1.1) ——————————————————————
      header: {
        // Title and CloseButton vertically centered (Modal/Dialog convention).
        // 'start' is reserved for multi-line wrapped titles where Close must
        // anchor near the first text baseline.
        align: 'center',
        // Title flush left, CloseButton flush right — the canonical Modal
        // header pattern across iOS / Material / Mantine / shadcn.
        justify: 'between',
        // v1.1: square padding (lg=24 · matches paddingX) for Header band.
        paddingY: '1.5rem', // spacing.lg = 24px
      },
      footer: {
        // Action buttons right-aligned — primary action rightmost is the
        // most-tested layout (Apple HIG / Material Design / NN/g research).
        justify: 'end',
        // v1.1: square padding (lg=24 · matches paddingX) for Footer band.
        paddingY: '1.5rem', // spacing.lg = 24px
      },
      content: {
        // overflow-y: auto — long content scrolls within the Content band
        // rather than the modal as a whole. Toast/error containers may
        // override to 'never' on a per-instance basis.
        scroll: 'auto',
        // v1.1: 0 padding so Content abuts Header / Footer directly. The
        // bands above and below already supply their own square paddingY,
        // so any non-zero Content paddingY would produce redundant whitespace.
        paddingY: '0px', // spacing.none = 0
      },
    },
  },

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

  // ========== Z-Index System (Stage-11 · OV-FLOAT-3) ==========
  // Numerical hierarchy mirrors the conventional Material/Bootstrap stacking
  // order: popover < modal < tooltip < toast. Components MUST consume these
  // via `theme.zIndex.{key}` (or the Floating primitive's `zIndexLevel`
  // option) rather than hard-coding.
  zIndex: {
    tooltip: 1500,
    popover: 1300,
    modal: 1400,
    toast: 1600,
  },

  // ========== Global Config ==========
  scale: 1,

  // ========== Component defaultProps ==========
  components: {},
};
