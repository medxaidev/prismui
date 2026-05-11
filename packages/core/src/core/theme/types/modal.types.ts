/**
 * Stage-11 Phase 7c · Modal Layout + Transition tokens
 *
 * Authority: ADR-007 决策 6 (LY-MODAL-2 size schema · 5 档) +
 *   决策 18 (LY-MODAL-3 backdrop visual schema · 2 字段) +
 *   决策 19 (LY-MODAL-4 panel chrome · border 默 'none') +
 *   决策 14 (PR-INTEROP-1 token-level 保护 · backdrop.duration ≥ content.duration).
 *
 * These tokens are the single source of truth consumed by Modal.module.css
 * via the `--prismui-modal-*` CSS variables emitted in
 * `context/css-variables.ts`. Component-level props do NOT expose these
 * visual fields (决策 18 「prop 不暴露 visual props」); user override paths =
 * theme token / className / asChild (v1.x).
 */

import type { CSSLength } from './theme.types';

// ─────────────────────────────────────────────────────────────────────────────
// ModalSizePreset · LY-MODAL-2 (议题 B 决策 6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 5-tier Modal panel width preset. Numeric/string fallback handled at the
 * component layer (`<Modal.Content size={720}>` / `size="50vw"`) — not a
 * theme token. Schema lives here so the default values (ROUND-0 §LY-MODAL-2
 * candidates · Phase 7c 锁 = 320 / 480 / 640 / 880 / 1200) stay themeable.
 *
 * Maps to CSS: `.content[data-size='{key}'] { width: var(--prismui-modal-size-{key}); }`
 */
export interface ModalSizePreset {
  xs: CSSLength;
  sm: CSSLength;
  md: CSSLength;
  lg: CSSLength;
  xl: CSSLength;
}

// ─────────────────────────────────────────────────────────────────────────────
// ModalBackdropVisual · LY-MODAL-3 (议题 F 决策 18)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Backdrop visual schema · 2 fields (议题 F 决策 18 锁方案 α · alpha 折进
 * color · 不立独立 opacity 字段).
 *
 * - `color`: CSS color value **含 alpha** (e.g. `rgba(0,0,0,0.5)` ·
 *   `rgb(0 0 0 / 50%)` · `color-mix(...)`). Consumers writing pure hex
 *   are responsible for alpha channel themselves.
 * - `blur`: CSS `backdrop-filter` value (e.g. `'none'` · `'blur(8px)'`).
 *   Default = `'none'` (决策 18 minimum-viable · 真 blur 消费者 opt-in).
 */
export interface ModalBackdropVisual {
  color: string;
  blur: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ModalLayoutToken · 议题 B 决策 6 + 议题 F 决策 18-19
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Modal layout + chrome schema (Phase 7c 实装 · ADR-007 封版后第 2 实施 session).
 *
 * Field count = 5 (size preset) + 2 (backdrop) + 1 (border) = 8 emitted vars
 * under `--prismui-modal-*`. `box-shadow` / `border-radius` / `z-index` /
 * `background` / `color` are NOT Modal-local tokens — they consume
 * `theme.shadows.xl` / `theme.radius.lg` / `theme.zIndex.modal` /
 * `theme.palette.{surface,text}` via existing global CSS vars (决策 19
 * 「不自定 Modal-only token namespace」).
 */
export interface ModalLayoutToken {
  /** 5 档 panel width preset (议题 B 决策 6 LY-MODAL-2). */
  size: ModalSizePreset;
  /** Backdrop visual (议题 F 决策 18 LY-MODAL-3 · 2 字段). */
  backdrop: ModalBackdropVisual;
  /**
   * Panel border (议题 F 决策 19 LY-MODAL-4 · 默 'none').
   *
   * Any CSS `border` shorthand (`'none'` · `'1px solid rgba(...)'`).
   * Themes can override to add a border without touching className /
   * asChild. Modal.module.css reads this via `--prismui-modal-border`.
   */
  border: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ModalTransitionToken · 议题 D 决策 13-14 (TR-MODAL-1 + PR-INTEROP-1)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Modal motion schema (Phase 7c 实装 · `theme.transition.modal.*`).
 *
 * **Invariant** (PR-INTEROP-1 第 2 层 token 保护 · 议题 D 决策 14):
 *   `backdrop.duration >= content.duration`
 *
 * Motivation: during exit, backdrop MUST NOT disappear before content —
 * otherwise exit briefly shows "naked" Modal content over a fully opaque
 * page (visual fracture). The check lives in `createTheme()` as a DEV-mode
 * warning (runtime soft-check · not TypeScript compile-time · because
 * duration strings are free-form CSS values not parseable at type level).
 *
 * Default values: both `200ms` (equal · satisfies `>=` bound minimally).
 * The 200ms baseline matches `theme.transition.duration.slow` (议题 F
 * 决策 18 notes motion namespace; Modal uses `.slow` because the panel
 * transform + opacity composite reads cleaner at 200ms than 150ms at
 * Modal visual weight).
 *
 * Components consume these via:
 *   `transition: opacity var(--prismui-modal-backdrop-duration) ...;` (backdrop)
 *   `transition: opacity var(--prismui-modal-content-duration) ...;`  (content)
 */
export interface ModalTransitionToken {
  backdrop: { duration: string };
  content:  { duration: string };
}
