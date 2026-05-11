/**
 * Stage-15 Phase 3 · SectionDescription primitive · structural test suite.
 *
 * SectionDescription is the 6th public Section primitive (v1.0.10 ·
 * reverse-derived from Stage-11 Phase 7c Modal · ADR-007 议题 E 决策 16
 * 留口). It applies the explicit `<p>` margin reset so Modal /
 * Section bands can host a description paragraph without a 1em
 * vertical-rhythm break.
 *
 * Test topology (parity with SectionTitle.test.tsx):
 *   - LY-SEC-3 default element <p>                                      (2 tests)
 *   - LY-SEC-2 does NOT emit data-surface (band-level surface ignorance)(1 test)
 *   - LY-CORE-2 polymorphic (component="span" / "div")                  (2 tests)
 *   - LY-CORE-7 user APIs flow through (className / style / children)   (2 tests)
 *   - LY-SEC-3 standalone usability (works outside SectionHeader)       (1 test)
 *   - v1.0.10 minimal-reset contract (consumes `.description` class · no
 *     typography token chain)                                            (1 test)
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SectionDescription } from './SectionDescription';

describe('SectionDescription · LY-SEC-3 default element', () => {
  it('renders <p> by default (WAI-ARIA dialog describedby flow-text convention)', () => {
    const { container } = render(<SectionDescription>x</SectionDescription>);
    expect(container.firstElementChild!.tagName).toBe('P');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    render(<SectionDescription ref={ref}>r</SectionDescription>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe('SectionDescription · LY-SEC-2 surface ignorance', () => {
  it('does NOT emit data-surface (only Section root does)', () => {
    const { container } = render(<SectionDescription>x</SectionDescription>);
    expect(container.firstElementChild!.hasAttribute('data-surface')).toBe(false);
  });
});

describe('SectionDescription · LY-CORE-2 polymorphic', () => {
  it('renders <span> when component="span" (inline-context override)', () => {
    const { container } = render(
      <SectionDescription component="span">x</SectionDescription>,
    );
    expect(container.firstElementChild!.tagName).toBe('SPAN');
  });

  it('renders <div> when component="div" (allows block children)', () => {
    const { container } = render(
      <SectionDescription component="div">x</SectionDescription>,
    );
    expect(container.firstElementChild!.tagName).toBe('DIV');
  });
});

describe('SectionDescription · LY-CORE-7 user APIs', () => {
  it('appends user className', () => {
    const { container } = render(
      <SectionDescription className="my-desc">x</SectionDescription>,
    );
    expect(container.firstElementChild!.className).toMatch(/\bmy-desc\b/);
  });

  it('forwards children + style', () => {
    const { container } = render(
      <SectionDescription style={{ color: 'red' }}>Lorem ipsum</SectionDescription>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('red');
    expect(el.textContent).toBe('Lorem ipsum');
  });
});

describe('SectionDescription · LY-SEC-3 standalone usability', () => {
  it('works without a wrapping Section / SectionHeader element', () => {
    // SectionDescription MUST work standalone (e.g. inside a Card or a
    // custom Modal arrangement) — the .description reset applies regardless
    // of parent context.
    const { container } = render(
      <div data-testid="parent-not-section">
        <SectionDescription>standalone</SectionDescription>
      </div>,
    );
    expect(container.querySelector('p')!.textContent).toBe('standalone');
  });
});

describe('SectionDescription · v1.0.10 minimal-reset contract', () => {
  it('applies the `.description` CSS module class (margin: 0 reset)', () => {
    // The whole point of SectionDescription is to apply `.description`
    // (which resets <p>'s default margin-block:1em that would otherwise
    // break Modal / Section band rhythm). The class must be present on
    // the rendered element.
    const { container } = render(<SectionDescription>x</SectionDescription>);
    const cls = container.firstElementChild!.className;
    expect(cls).toMatch(/description/);
  });
});
