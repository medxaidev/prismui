/**
 * Stage-11 Phase 7a · Modal · `tabbable` · selector + sorter tests
 *
 * Authority: ADR-007 决策 1 + OQ-MODAL-IMPL-1 路径 A.
 *
 * Test topology (mapped back to invariants / OQs):
 *   - Selector correctness · standard tabbable elements         (3 tests)
 *   - Selector exclusions · disabled / tabindex=-1 / hidden     (3 tests)
 *   - Inert ancestor walking                                    (2 tests)
 *   - APG sort · positive tabindex · DOM-order ties             (2 tests)
 */

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { getTabbables } from './tabbable';

describe('getTabbables · selector correctness', () => {
  it('finds button / a[href] / input / select / textarea', () => {
    const { container } = render(
      <div data-testid="root">
        <button>b</button>
        <a href="#x">a</a>
        <input />
        <select>
          <option>o</option>
        </select>
        <textarea />
      </div>,
    );
    const root = container.querySelector('[data-testid="root"]') as HTMLElement;
    const els = getTabbables(root);
    expect(els.map((el) => el.tagName)).toEqual([
      'BUTTON',
      'A',
      'INPUT',
      'SELECT',
      'TEXTAREA',
    ]);
  });

  it('finds elements with explicit tabindex>=0', () => {
    const { container } = render(
      <div data-testid="root">
        <div tabIndex={0}>x</div>
        <span tabIndex={5}>y</span>
      </div>,
    );
    const root = container.querySelector('[data-testid="root"]') as HTMLElement;
    const els = getTabbables(root);
    expect(els.length).toBe(2);
  });

  it('finds contenteditable="true" elements', () => {
    const { container } = render(
      <div data-testid="root">
        <div contentEditable="true">edit me</div>
      </div>,
    );
    const root = container.querySelector('[data-testid="root"]') as HTMLElement;
    const els = getTabbables(root);
    expect(els.length).toBe(1);
  });
});

describe('getTabbables · selector exclusions', () => {
  it('excludes [disabled] form controls', () => {
    const { container } = render(
      <div data-testid="root">
        <button disabled>b</button>
        <input disabled />
        <button>ok</button>
      </div>,
    );
    const root = container.querySelector('[data-testid="root"]') as HTMLElement;
    const els = getTabbables(root);
    expect(els.length).toBe(1);
    expect(els[0].textContent).toBe('ok');
  });

  it('excludes tabindex="-1"', () => {
    const { container } = render(
      <div data-testid="root">
        <button tabIndex={-1}>skip</button>
        <button>ok</button>
      </div>,
    );
    const root = container.querySelector('[data-testid="root"]') as HTMLElement;
    const els = getTabbables(root);
    expect(els.length).toBe(1);
    expect(els[0].textContent).toBe('ok');
  });

  it('excludes display:none subtrees (via offsetParent === null)', () => {
    const { container } = render(
      <div data-testid="root">
        <div style={{ display: 'none' }}>
          <button>hidden</button>
        </div>
        <button>ok</button>
      </div>,
    );
    const root = container.querySelector('[data-testid="root"]') as HTMLElement;
    const els = getTabbables(root);
    expect(els.length).toBe(1);
    expect(els[0].textContent).toBe('ok');
  });
});

describe('getTabbables · inert ancestor walking', () => {
  it('excludes descendants of an [inert] ancestor', () => {
    const { container } = render(
      <div data-testid="root">
        <div data-testid="inert-region">
          <button>blocked</button>
          <input />
        </div>
        <button>ok</button>
      </div>,
    );
    const root = container.querySelector('[data-testid="root"]') as HTMLElement;
    const inertRegion = container.querySelector(
      '[data-testid="inert-region"]',
    ) as HTMLElement;
    inertRegion.setAttribute('inert', '');

    const els = getTabbables(root);
    expect(els.length).toBe(1);
    expect(els[0].textContent).toBe('ok');
  });

  it('does NOT exclude when inert is on a sibling, not ancestor', () => {
    const { container } = render(
      <div data-testid="root">
        <div data-testid="inert-sibling" />
        <button>ok</button>
      </div>,
    );
    const root = container.querySelector('[data-testid="root"]') as HTMLElement;
    const sibling = container.querySelector(
      '[data-testid="inert-sibling"]',
    ) as HTMLElement;
    sibling.setAttribute('inert', '');

    const els = getTabbables(root);
    expect(els.length).toBe(1);
  });
});

describe('getTabbables · APG sort order', () => {
  it('places positive tabindex first, ascending, with DOM-order ties', () => {
    const { container } = render(
      <div data-testid="root">
        <button data-id="zero-1">0a</button>
        <button data-id="pos-2" tabIndex={2}>
          2
        </button>
        <button data-id="pos-1" tabIndex={1}>
          1
        </button>
        <button data-id="zero-2">0b</button>
        <button data-id="pos-2-tie" tabIndex={2}>
          2-tie
        </button>
      </div>,
    );
    const root = container.querySelector('[data-testid="root"]') as HTMLElement;
    const els = getTabbables(root);
    const ids = els.map((el) => el.getAttribute('data-id'));
    // APG: tabindex 1 → tabindex 2 (DOM order on tie) → tabindex 0/unset (DOM order).
    expect(ids).toEqual(['pos-1', 'pos-2', 'pos-2-tie', 'zero-1', 'zero-2']);
  });

  it('returns DOM order when no positive tabindex present', () => {
    const { container } = render(
      <div data-testid="root">
        <button>a</button>
        <button>b</button>
        <button>c</button>
      </div>,
    );
    const root = container.querySelector('[data-testid="root"]') as HTMLElement;
    const els = getTabbables(root);
    expect(els.map((el) => el.textContent)).toEqual(['a', 'b', 'c']);
  });
});
