/**
 * Stage-11 Phase 7a · Modal · jsdom environment spike
 *
 * Authority: ROUND-0 §7.3 启动前遗留项 #2 + ADR-007 audit log 2026-05-08
 * Phase 7a 启动 entry (Cascade 处置：spike 先验后做 fallback)。
 *
 * **Why this file exists**:
 * jsdom historically has incomplete support for the `inert` HTML attribute
 * (no event-blocking semantics; `<button>` inside `<div inert>` still
 * receives clicks). Stage-11 Phase 7 Modal trap-focus relies on inert-
 * ancestor walking via `tabbable.ts`'s `hasInertAncestor` helper. We
 * pin actual jsdom behaviour here so any silent regression (Vitest
 * upgrade / jsdom version bump) flips a red test instead of a silent
 * trap-focus correctness loss.
 *
 * **Documented spike findings (2026-05-08, vitest@latest + jsdom)**:
 *   - `[inert]` attribute is parseable but does NOT block focus / click
 *     events in jsdom. A `<button>` inside an `[inert]` ancestor still
 *     receives `.focus()` programmatically.
 *   - `[aria-hidden="true"]` does NOT affect focus in any browser engine —
 *     it's an a11y semantic only — and jsdom matches this real-DOM behaviour.
 *
 * **Implication for `tabbable.ts`**:
 *   `hasInertAncestor` walks ancestors and returns `true` on `[inert]`
 *   presence — this is an *attribute test*, not a focus-blocking test.
 *   Our test below verifies attribute walking works in jsdom, which is
 *   sufficient for trap correctness regardless of jsdom's event-handling
 *   gaps. Real browsers honour the focus-block via the platform; our
 *   selector-side filter prevents focus from being moved INTO inert
 *   regions in the first place.
 *
 * **What this file does NOT test**:
 *   - Trap correctness (covered by `useFocusTrap.test.tsx`).
 *   - Selector correctness (covered by `tabbable.test.ts`).
 *   - Real-browser inert focus block (out of jsdom scope; Storybook
 *     manual / Phase 7c Playwright e2e responsibility).
 */

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

describe('jsdom · inert attribute · attribute-walk readability', () => {
  it('exposes the inert attribute via hasAttribute / getAttribute', () => {
    const { container } = render(
      <div data-testid="outer">
        <div data-testid="inert-region">
          <button data-testid="inner">x</button>
        </div>
      </div>,
    );
    const inertRegion = container.querySelector(
      '[data-testid="inert-region"]',
    ) as HTMLElement;
    inertRegion.setAttribute('inert', '');
    expect(inertRegion.hasAttribute('inert')).toBe(true);

    // Walking ancestors of the inner button should find the inert attribute.
    const inner = container.querySelector(
      '[data-testid="inner"]',
    ) as HTMLElement;
    let foundInert = false;
    let node: HTMLElement | null = inner;
    while (node !== null && node !== container) {
      if (node.hasAttribute('inert')) {
        foundInert = true;
        break;
      }
      node = node.parentElement;
    }
    expect(foundInert).toBe(true);
  });

  it('reflects inert via element.inert property (HTML spec)', () => {
    const { container } = render(<div data-testid="el" />);
    const el = container.querySelector('[data-testid="el"]') as HTMLElement;
    el.setAttribute('inert', '');
    // jsdom may or may not implement the IDL `.inert` property on HTMLElement.
    // We tolerate either; the attribute path (above) is the canonical one
    // used by `tabbable.ts`. This test is informational — it does not gate
    // trap correctness.
    if ('inert' in el) {
      expect(typeof (el as unknown as { inert: boolean }).inert).toBe('boolean');
    }
  });
});

describe('jsdom · aria-hidden · informational', () => {
  it('does not influence focus targeting (matches real DOM)', () => {
    const { container } = render(
      <div aria-hidden="true">
        <button data-testid="hidden-btn">x</button>
      </div>,
    );
    const btn = container.querySelector(
      '[data-testid="hidden-btn"]',
    ) as HTMLButtonElement;
    btn.focus();
    // Real DOM and jsdom agree: aria-hidden does NOT block focus.
    // Our `tabbable.ts` deliberately does not filter on aria-hidden —
    // it is an a11y semantic, not a focusability gate.
    expect(document.activeElement).toBe(btn);
  });
});
