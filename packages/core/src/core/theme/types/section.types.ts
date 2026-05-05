/**
 * Stage-14 Phase 4 · Section Layout Tokens (SZ-SEC-1 / SZ-SEC-2)
 *
 * Provides the structural schema for any container component that renders a
 * three-section layout (Header / Content / Footer) — Modal · Drawer · Toast ·
 * Dialog · Card.
 *
 * Single source of truth: `theme.layout.section.*`. Per SZ-SEC-2, container
 * components MUST consume these tokens (via the `--prismui-section-*` CSS
 * variables) instead of hardcoding `padding` / `gap` / `justify-content` /
 * `align-items` values inside their own .module.css.
 *
 * Schema authority: STAGE-14-OVERVIEW.md §3.7.1 (v0.5).
 *
 * 10-field shape (§3.7.1 · v1.1 revision · was 8 in v1.0):
 *   spacing     (2) · paddingX, gap                      ← top-level, shared
 *   typography  (1) · titleSize                          → references `theme.typography.title.{size}`
 *   alignment + per-band paddingY (7) ·
 *      header  · align, justify, paddingY
 *      footer  · justify, paddingY
 *      content · scroll, paddingY
 *
 * **v1.1 schema revision (Path B · ADR-005 v1.0.7 audit entry)**: the original
 * v1.0 schema collapsed `paddingY` into a single global field shared by all
 * three bands. The first multi-surface consumer (Card-anchored Section
 * Storybook visual review) revealed this was undersized — Card-style
 * compositions want `header.paddingY = footer.paddingY = paddingX` (square
 * padding for the title and action bands) AND `content.paddingY = 0` (so the
 * content band abuts the bands above and below without redundant whitespace).
 * Per-band `paddingY` is the only schema shape that supports both Modal-anchored
 * uniform padding AND Card-anchored band-specific padding. `paddingX` and `gap`
 * remain top-level because no consumer scenario has emerged that needs per-band
 * horizontal padding (it would break vertical alignment of band content) or
 * per-band gap (gap is by definition between bands, not inside one).
 *
 * D-1 (locked v1.0)  · namespace = `theme.layout.section.*` (OQ-SZ-7 = A)
 * D-2 (locked v1.0)  · nested header/footer/content sub-objects (semantic per
 *                       "section" · v1.x extensions like `header.titleColor`
 *                       slot in cleanly · NOT flattened)
 * D-3 (locked v1.0)  · alignment fields use TypeScript literal unions (compile-
 *                       time guard · matches Stage-14 SZ-TYPE-2 family literal
 *                       style · prevents typo-introduced misalignment bugs)
 * D-4 (locked v1.0)  · all fields emit CSS variables (alignment values map
 *                       to Flexbox CSS literals like 'space-between' so
 *                       container components stay fully declarative)
 * D-5 (deferred v1.x) · SectionPrimitive helper deferred to Stage-11 Phase 7
 *                       Modal Round 0 (避免空中楼阁 · 等真实消费者出现再抽象)
 * D-6 (locked v1.1)  · per-band `paddingY` fields override the v1.0 single
 *                       global `paddingY` (see schema rationale above)
 *
 * Future v1.x extensions (NOT in v1):
 *   - responsive variant (mobile breakpoint paddingX shrink)
 *   - nested section (section-in-section layouts)
 *   - per-section overrides (`theme.layout.section.modal.*` vs `.toast.*`)
 *
 * See STAGE-14-OVERVIEW.md §3.7 / ADR-005 §决议 8 / review-log 2026-04-30 (d).
 */

import type { CSSLength } from './theme.types';
import type { TypographySize } from './token-scale.types';

// ─────────────────────────────────────────────────────────────────────────────
// Alignment literal unions (D-3 · TypeScript compile-time enum)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `header.align` — vertical alignment of children inside the Header band.
 * Maps to CSS `align-items` on the Header flex container.
 *
 * - `'center'` — Title and CloseButton vertically centered (default · most common)
 * - `'start'`  — Title top-aligned (used when Title wraps multi-line and Close
 *                must stay near the first text baseline)
 *
 * Stretch / end are intentionally NOT exposed — they have no Modal-pattern use
 * case and would invite layout drift. v1.x may extend the union if a new
 * container type genuinely needs another value.
 */
export type SectionHeaderAlign = 'center' | 'start';

/**
 * `header.justify` — horizontal distribution of children inside the Header.
 * Maps to CSS `justify-content` on the Header flex container.
 *
 * `'between'` (default) — Title flush left, CloseButton flush right (Modal/Dialog
 * convention). v1.x may add `'start'` / `'end'` if a centered-title variant
 * appears.
 */
export type SectionHeaderJustify = 'between';

/**
 * `footer.justify` — horizontal distribution of action buttons in the Footer.
 *
 * - `'end'`     — buttons right-aligned (default · primary action rightmost)
 * - `'between'` — primary right, secondary left (Cancel | Confirm pattern)
 * - `'start'`   — buttons left-aligned (rarer · CN UX preference)
 *
 * `'center'` is excluded by design (Modal pattern never centers actions).
 */
export type SectionFooterJustify = 'end' | 'between' | 'start';

/**
 * `content.scroll` — overflow handling for the Content band.
 *
 * - `'auto'`  — overflow-y: auto (default · long content scrolls within Content)
 * - `'never'` — overflow: visible (error toast / brief alert · never scrolls)
 *
 * `'always'` is intentionally NOT exposed — it produces double scrollbars on
 * short content and is never the right Modal default.
 */
export type SectionContentScroll = 'auto' | 'never';

// ─────────────────────────────────────────────────────────────────────────────
// SectionLayoutToken interface (10 fields · v1.1 · §3.7.1 schema)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Section Layout Token (Stage-14 SZ-SEC-1).
 *
 * The complete 10-field schema for `theme.layout.section` (v1.1 · was 8 in
 * v1.0). Container components (Modal / Drawer / Toast / Dialog / Card)
 * consume these tokens via the `--prismui-section-*` CSS variables emitted
 * by the theme system.
 *
 * **Field count = 2 (spacing) + 1 (typography) + 7 (alignment + per-band
 * paddingY) = 10 · v1.1 schema · matches STAGE-14-OVERVIEW §3.7.1 spec.**
 */
export interface SectionLayoutToken {
  // ── Spacing (2 fields · top-level · shared across bands) ──────────────────
  /**
   * Horizontal padding for all three bands (Header / Content / Footer).
   * Default = `spacing.lg` (24px). MUST resolve to a value in `theme.spacing.*`
   * — hard-coded values violate SZ-SEC-1. `paddingX` is shared (not per-band)
   * because varying horizontal padding across bands breaks vertical alignment
   * of band content.
   */
  paddingX: CSSLength;

  /**
   * Gap between Header / Content / Footer bands. Default = `spacing.none` (0)
   * post v1.1 — paired with per-band `paddingY` defaults that produce the
   * Card/Dialog-canonical band-abuts-band rhythm. Realized via CSS `gap` on
   * the section's flex column container.
   */
  gap: CSSLength;

  // ── Typography (1 field) ──────────────────────────────────────────────────
  /**
   * Selects which `theme.typography.title.{size}` token applies to the
   * section Title. Default = `'md'` (20/28 — the §3.6 anchor).
   *
   * The token references a SIZE key (not the resolved fontSize/lineHeight/
   * fontWeight triplet) so that theme overrides of the title family auto-
   * propagate without needing to update layout.section.
   */
  titleSize: TypographySize;

  // ── Alignment (4 fields · nested per D-2) ─────────────────────────────────
  /**
   * Header band configuration.
   * - `align`: vertical alignment of Header children (Title vs CloseButton)
   * - `justify`: horizontal distribution (Title left · Close right)
   * - `paddingY`: vertical padding (v1.1 · was a global field in v1.0).
   *               Default = `spacing.lg` (24px) — matches `paddingX` for
   *               square Header padding (Card/Dialog convention).
   */
  header: {
    align: SectionHeaderAlign;
    justify: SectionHeaderJustify;
    paddingY: CSSLength;
  };

  /**
   * Footer band configuration.
   * - `justify`: horizontal distribution of action buttons
   * - `paddingY`: vertical padding (v1.1).
   *               Default = `spacing.lg` (24px) — matches `paddingX` for
   *               square Footer padding.
   */
  footer: {
    justify: SectionFooterJustify;
    paddingY: CSSLength;
  };

  /**
   * Content band configuration.
   * - `scroll`: overflow handling for long content
   * - `paddingY`: vertical padding (v1.1).
   *               Default = `spacing.none` (0) — Content abuts the Header /
   *               Footer bands directly, removing the redundant whitespace
   *               that v1.0's global `paddingY: md` produced. Consumers who
   *               want vertical breathing room inside Content should add it
   *               via the content children, not the band padding.
   */
  content: {
    scroll: SectionContentScroll;
    paddingY: CSSLength;
  };
}
