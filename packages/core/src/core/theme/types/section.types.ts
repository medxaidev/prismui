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
 * 8-field shape (§3.7.1):
 *   spacing     (3) · paddingX, paddingY, gap
 *   typography  (1) · titleSize       → references `theme.typography.title.{size}`
 *   alignment   (4) · header.align, header.justify, footer.justify, content.scroll
 *
 * D-1 (locked v1.0)  · namespace = `theme.layout.section.*` (OQ-SZ-7 = A)
 * D-2 (locked v1.0)  · nested header/footer/content sub-objects (semantic per
 *                       "section" · v1.x extensions like `header.titleColor`
 *                       slot in cleanly · NOT flattened)
 * D-3 (locked v1.0)  · alignment fields use TypeScript literal unions (compile-
 *                       time guard · matches Stage-14 SZ-TYPE-2 family literal
 *                       style · prevents typo-introduced misalignment bugs)
 * D-4 (locked v1.0)  · all 8 fields emit CSS variables (alignment values map
 *                       to Flexbox CSS literals like 'space-between' so
 *                       container components stay fully declarative)
 * D-5 (deferred v1.x) · SectionPrimitive helper deferred to Stage-11 Phase 7
 *                       Modal Round 0 (避免空中楼阁 · 等真实消费者出现再抽象)
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
// SectionLayoutToken interface (8 fields · §3.7.1 schema)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Section Layout Token (Stage-14 SZ-SEC-1).
 *
 * The complete 8-field schema for `theme.layout.section`. Container components
 * (Modal / Drawer / Toast / Dialog / Card) consume these tokens via the
 * `--prismui-section-*` CSS variables emitted by the theme system.
 *
 * **Field count = 3 (spacing) + 1 (typography) + 4 (alignment) = 8 · matches
 * STAGE-14-OVERVIEW §3.7.1 spec.**
 */
export interface SectionLayoutToken {
  // ── Spacing (3 fields) ────────────────────────────────────────────────────
  /**
   * Horizontal padding for all three bands (Header / Content / Footer).
   * Default = `spacing.lg` (24px). MUST resolve to a value in `theme.spacing.*`
   * — hard-coded values violate SZ-SEC-1.
   */
  paddingX: CSSLength;

  /**
   * Vertical padding for all three bands. Default = `spacing.md` (16px).
   * MUST resolve to a value in `theme.spacing.*`.
   */
  paddingY: CSSLength;

  /**
   * Gap between Header / Content / Footer bands. Default = `spacing.md` (16px).
   * Realized via CSS `gap` on the section's flex column container.
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
   * Header band alignment configuration.
   * - `align`: vertical alignment of Header children (Title vs CloseButton)
   * - `justify`: horizontal distribution (Title left · Close right)
   */
  header: {
    align: SectionHeaderAlign;
    justify: SectionHeaderJustify;
  };

  /**
   * Footer band alignment configuration.
   * - `justify`: horizontal distribution of action buttons
   */
  footer: {
    justify: SectionFooterJustify;
  };

  /**
   * Content band overflow configuration.
   * - `scroll`: overflow handling for long content
   */
  content: {
    scroll: SectionContentScroll;
  };
}
