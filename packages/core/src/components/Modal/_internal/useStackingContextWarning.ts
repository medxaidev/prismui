/**
 * Stage-11 Phase 7c · Modal · `useStackingContextWarning` (PR-INTEROP-4 V2 path)
 *
 * Authority: ADR-007 决策 20 (PR-INTEROP-4 dev-mode anti-pattern warning ·
 * 议题 F.3 对抗 3.1-3.4 落实 · 不立独立 invariant · 锁实施期处置).
 *
 * **责任边界 3 条款** (决策 20 占位段审阅反馈 P2-1):
 *   (a) 问题归属 — 用户配置 `<OverlayProvider container={customRef}>` 时 ·
 *       customRef 节点祖先链有触发 stacking context 的 CSS 属性 → 即使
 *       `theme.zIndex.modal=1400` 也突破不了父 stacking context 隔离。
 *   (b) 上游职责清晰 — Stage-11 portal-primitive 锁「Portal/OverlayProvider
 *       不管理 z-index」· 本 warning 不归责于 Portal 也不归责于
 *       theme.zIndex.modal 数值设计。
 *   (c) warning 定位 — Modal 实施期 anti-pattern warning · 针对
 *       OverlayProvider container placement (祖先 stacking context 检测)。
 *
 * **算法 (V2 主路径)**:
 *   1. 仅在 NODE_ENV !== 'production' 下激活 (production tree-shake)。
 *   2. open=true 后 (Presence enter / contentRef populated)，从 Modal.Content
 *      DOM 元素的父级开始向上 walk。
 *   3. 跳过 contentRef 元素自身 (Modal.Content 本身 position:fixed +
 *      z-index:var(--prismui-z-modal) · 它不需要"突破"自己的 stacking ctx)。
 *   4. 跳过 `<body>` 与 `<html>` (viewport-rooted · 用户改不了 · 不警告)。
 *   5. 第一次命中即停止 walk + 单次 console.warn (含具体祖先节点 selector +
 *      触发 CSS 属性 + 文档链接)。同一次 open 周期内不再重复警告 (latch)。
 *
 * **8 项祖先 stacking context 触发因子** (CSS Spec · 决策 20 锁定清单 ·
 * 至少必锁 1-5 项 · 6-8 视实施开销 · 本实现 8 项全锁因为 getComputedStyle
 * 单次调用即可 read 全部属性 · 增量开销 0 ms):
 *   1. `transform`        非 `none`
 *   2. `filter`           非 `none`
 *   3. `opacity`          < 1
 *   4. `isolation`        `isolate`
 *   5. `contain`          含 `layout`/`paint`/`strict`/`content`
 *   6. `will-change`      含 `transform`/`filter`/`opacity`/`position`
 *   7. `mix-blend-mode`   非 `normal`
 *   8. `backdrop-filter`  非 `none`
 *
 * **不取的实施位置** (议题 F.3 对抗 3.3 已裁定):
 *   ✗ V1 OverlayProvider 内部检测 — 越权 Stage-11 primitive
 *   △ V3 ESLint rule + 文档化 — Phase 7c 兜底 · 与本 hook 并行 (不冲突)
 */

import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Stacking-context detection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Public for direct unit-testing of the detection table without rendering a
 * Modal. Returns the first violated CSS property name, or `null` when the
 * element does NOT create a stacking context.
 *
 * Note on `<html>` / `<body>`: callers should pre-skip them. The function
 * itself does not enforce that — it judges the element on CSS alone — but
 * `walkAncestorsForStackingContext` skips them because users cannot
 * realistically refactor away the root document stacking context.
 */
export function detectStackingContextProperty(el: Element): string | null {
  // Skip non-Element nodes defensively (DocumentFragment / text · should not
  // appear via parentElement walk but TypeScript narrows are easier this way).
  const styles = getComputedStyle(el);

  // 1. transform — any non-none value (incl. translate3d / scale / rotate).
  const transform = styles.transform;
  if (transform && transform !== 'none') return 'transform';

  // 2. filter — any non-none value (blur / drop-shadow / grayscale · etc).
  const filter = styles.filter;
  if (filter && filter !== 'none') return 'filter';

  // 3. opacity — < 1 triggers stacking context (browser implementation
  //    technically allows `1` exactly to skip; floating-point tolerance
  //    via `< 1`).
  const opacity = Number.parseFloat(styles.opacity);
  if (Number.isFinite(opacity) && opacity < 1) return 'opacity';

  // 4. isolation — `isolate`.
  if (styles.isolation === 'isolate') return 'isolation';

  // 5. contain — any of layout / paint / strict / content (any one triggers).
  //    `contain` is space-separated (e.g. "layout paint"). substring test
  //    is sufficient and avoids regex compile.
  const contain = styles.contain;
  if (contain && contain !== 'none') {
    if (
      contain.includes('layout') ||
      contain.includes('paint')  ||
      contain.includes('strict') ||
      contain.includes('content')
    ) {
      return 'contain';
    }
  }

  // 6. will-change — only when value lists a property that itself can promote
  //    to a stacking context (transform / filter / opacity / perspective).
  //    Tokenise by `,` + whitespace so `scroll-position` (a single hyphenated
  //    token) does NOT match `position`. CSS Spec defines will-change values
  //    as a comma-separated list of CSS property identifiers.
  const willChange = styles.willChange;
  if (willChange && willChange !== 'auto') {
    const tokens = willChange.split(/[\s,]+/).filter(Boolean);
    const promoting = new Set(['transform', 'filter', 'opacity', 'perspective']);
    if (tokens.some((t) => promoting.has(t))) {
      return 'will-change';
    }
  }

  // 7. mix-blend-mode — any non-normal value.
  if (styles.mixBlendMode && styles.mixBlendMode !== 'normal') {
    return 'mix-blend-mode';
  }

  // 8. backdrop-filter — any non-none value. Vendor-prefixed equivalent is
  //    not separately checked (modern browsers expose unprefixed since 2022).
  const backdropFilter = (styles as CSSStyleDeclaration & {
    backdropFilter?: string;
  }).backdropFilter;
  if (backdropFilter && backdropFilter !== 'none') {
    return 'backdrop-filter';
  }

  return null;
}

interface AncestorHit {
  ancestor: Element;
  property: string;
}

/**
 * Walk from `start.parentElement` upward, returning the first ancestor that
 * creates a stacking context. Skips `<html>` and `<body>` because those are
 * the viewport root — flagging them would be noise (users cannot remove the
 * document root stacking context).
 */
function walkAncestorsForStackingContext(
  start: Element,
): AncestorHit | null {
  let node: Element | null = start.parentElement;
  while (node) {
    if (node === document.body || node === document.documentElement) {
      return null;
    }
    const property = detectStackingContextProperty(node);
    if (property) {
      return { ancestor: node, property };
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * Format a short selector hint for an offending ancestor. Prefers `id` when
 * present (most specific · usually unique), then the first className, then
 * tag name. Used in the warning string only; no behavior depends on this.
 */
function describeAncestor(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (el.id) return `<${tag} id="${el.id}">`;
  const cls =
    typeof el.className === 'string' && el.className.trim().length > 0
      ? el.className.trim().split(/\s+/)[0]
      : null;
  if (cls) return `<${tag} class="${cls}">`;
  return `<${tag}>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseStackingContextWarningOptions {
  /**
   * `true` when the Modal is open and `contentRef.current` is populated.
   * The hook only runs the walk on the rising edge (`active: false → true`),
   * so re-renders during a single open cycle do not retrigger.
   */
  active: boolean;
  /** Ref to the rendered `Modal.Content` DOM element. */
  contentRef: React.RefObject<HTMLElement | null>;
}

/**
 * Dev-only · single warning per open cycle when an ancestor between
 * `contentRef.current` and `<body>` creates a stacking context. Tree-shaken
 * in production builds via `process.env.NODE_ENV !== 'production'` guard.
 */
export function useStackingContextWarning(
  options: UseStackingContextWarningOptions,
): void {
  const { active, contentRef } = options;
  // `latched` resets on the falling edge so the next open cycle warns again
  // if the structure still violates. Avoids spamming on every open while
  // staying noisy enough for repeated mistakes.
  const latched = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!active) {
      latched.current = false;
      return;
    }
    if (latched.current) return;

    const el = contentRef.current;
    if (!el) return;
    if (typeof document === 'undefined') return;
    if (typeof getComputedStyle !== 'function') return;

    const hit = walkAncestorsForStackingContext(el);
    if (!hit) return;

    latched.current = true;

    // eslint-disable-next-line no-console
    console.warn(
      `[PrismUI Modal] Detected an ancestor stacking context that traps the ` +
        `Modal portal: ${describeAncestor(hit.ancestor)} sets \`${hit.property}\` ` +
        `which creates a new stacking context. The Modal panel and backdrop ` +
        `will render BELOW any sibling above this ancestor — \`theme.zIndex.modal\` ` +
        `cannot escape an ancestor stacking context (CSS Spec). Recommended ` +
        `fix: pass an \`<OverlayProvider container>\` that is a descendant of ` +
        `\`<body>\` only, or remove the offending CSS property. ` +
        `See @/devdocs/components/Modal/design.md (PR-INTEROP-4 anti-pattern · ` +
        `ADR-007 决策 20).`,
      hit.ancestor,
    );
  }, [active, contentRef]);
}
