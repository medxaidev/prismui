/**
 * Stage-11 Phase 7a · Modal · `_internal/tabbable`
 *
 * Self-written tabbable selector + sorter — OQ-MODAL-IMPL-1 路径 A
 * (ADR-007 audit log 2026-05-08 Phase 7a 启动 entry)。
 *
 * Authority: ADR-007 决策 1 + OQ-MODAL-IMPL-1 路径 A 锁定。
 *
 * **Why self-written, not vendor `tabbable`**:
 *   - Modal v1 trap 内不预期含 iframe / shadow DOM (ROUND-0 §四 OV-MODAL-1
 *     scope edge cases)。
 *   - 0 dep · ~30-60 行 · v1.x 升 vendor `tabbable` 单文件替换无 API
 *     break (`getTabbables(container)` 返回 sorted HTMLElement[] 是 v1.x
 *     升格的稳定 contract)。
 *   - 议题 A 决策 1「自研 useFocusTrap hook」与「再引 vendor selector」
 *     反向；selector 也自写 = 自研内聚一致。
 *
 * **APG correctness**:
 *   - Positive tabindex 排前 · 数值升序 · 同值 DOM 顺序（stable sort）。
 *   - tabindex=0 / 无 tabindex DOM 顺序。
 *   - 过滤 `[disabled]` / `[inert]` 祖先 / 不可见。
 *
 * **Visibility check (v1)**:
 *   - Ancestor walk for `el.style.display === 'none'` — covers React's
 *     `style={{ display: 'none' }}` + the common hand-coded inline pattern.
 *     jsdom has no layout engine, so `offsetParent` / `getClientRects` are
 *     unreliable (they often return null / empty even for fully-laid-out
 *     real-DOM equivalents). The inline-style walk is the most portable
 *     visibility signal that works in both jsdom and real browsers.
 *   - 不 cover `visibility: hidden` / stylesheet-driven `display: none` /
 *     `<details>` 折叠态 (jsdom getComputedStyle for cascaded rules is
 *     incomplete, and these are minority hidden patterns)。v1.x 真场景
 *     出现再升 (e.g. switch to vendor `tabbable` per OQ-MODAL-IMPL-1
 *     升格路径).
 *
 * NOT public — `_internal/` private. Phase 7b Modal compound 直接消费。
 */

const TABBABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'area[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]:not([tabindex="-1"])',
  'audio[controls]:not([tabindex="-1"])',
  'video[controls]:not([tabindex="-1"])',
].join(',');

/** Walk ancestors up to (but not including) root; return true if any has the `inert` attribute. */
function hasInertAncestor(el: HTMLElement, root: HTMLElement): boolean {
  let node: HTMLElement | null = el;
  while (node !== null && node !== root) {
    if (node.hasAttribute('inert')) return true;
    node = node.parentElement;
  }
  return false;
}

/**
 * Inline-style ancestor walk for `display: none` — see header note for the
 * rationale (jsdom has no layout, so `offsetParent` / `getClientRects` are
 * unreliable). Walks from `el` up to and including `root`. Returns `true`
 * when any element in that chain has its `style.display === 'none'`.
 */
function isHiddenByInlineDisplay(el: HTMLElement, root: HTMLElement): boolean {
  let node: HTMLElement | null = el;
  // Walk inclusive of `root` — a `display: none` on the trap container itself
  // means every descendant is hidden, and we should not advertise tabbables
  // inside it.
  while (node !== null) {
    // `node.style` is `null` for non-HTMLElement ancestors (e.g. SVGElement
    // proper); the type guard above narrows to HTMLElement so this is safe.
    if (node.style && node.style.display === 'none') return true;
    if (node === root) break;
    node = node.parentElement;
  }
  return false;
}

/** Read tabindex as a finite integer; missing or invalid → 0. */
function tabIndexOf(el: HTMLElement): number {
  const raw = el.getAttribute('tabindex');
  if (raw === null) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Return the tabbable descendants of `container` in tab-traversal order.
 *
 * Sort key (APG):
 *   1. tabindex > 0 — ascending numerical, stable on ties (DOM order).
 *   2. tabindex ≤ 0 / unset — DOM order.
 *
 * Excluded:
 *   - `[disabled]` form controls (also caught by selector).
 *   - `tabindex="-1"` (caught by selector).
 *   - Inert-ancestor descendants (`[inert]` walk).
 *   - Hidden via `display: none` (offsetParent === null AND no client rects).
 *
 * @returns A possibly-empty array. Caller guarantees non-empty when invoking
 *          focus-cycle logic — Modal Round 1 收尾 smoke (decision 20) tests
 *          the empty-container fallback path explicitly.
 */
export function getTabbables(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR),
  );

  const filtered: { el: HTMLElement; ti: number; ord: number }[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    if (hasInertAncestor(el, container)) continue;
    if (isHiddenByInlineDisplay(el, container)) continue;
    filtered.push({ el, ti: tabIndexOf(el), ord: i });
  }

  // Two-bucket APG sort: positive tabindex (asc · stable) → zero/unset (DOM order).
  filtered.sort((a, b) => {
    const aPos = a.ti > 0;
    const bPos = b.ti > 0;
    if (aPos && !bPos) return -1;
    if (!aPos && bPos) return 1;
    if (aPos && bPos) return a.ti !== b.ti ? a.ti - b.ti : a.ord - b.ord;
    return a.ord - b.ord;
  });

  return filtered.map((entry) => entry.el);
}
