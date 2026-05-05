/**
 * Stage-15 Phase 3 · SectionHeader primitive · structural test suite.
 *
 * Test topology:
 *   - LY-SEC-3 default element <header>                                 (2 tests)
 *   - LY-SEC-2 does NOT emit data-surface (band-level surface ignorance) (1 test)
 *   - LY-CORE-2 polymorphic                                             (2 tests)
 *   - LY-CORE-7 user APIs flow through                                  (2 tests)
 *   - LY-SEC-3 standalone usability (no parent Section required)        (1 test)
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SectionHeader } from './SectionHeader';

describe('SectionHeader · LY-SEC-3 default element', () => {
  it('renders <header> by default', () => {
    const { container } = render(<SectionHeader>x</SectionHeader>);
    expect(container.firstElementChild!.tagName).toBe('HEADER');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<SectionHeader ref={ref}>r</SectionHeader>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe('SectionHeader · LY-SEC-2 surface ignorance', () => {
  it('does NOT emit data-surface (only Section root does)', () => {
    // Bands are surface-agnostic — they consume `theme.layout.section.*`
    // directly and have no need to advertise the parent's surface.
    const { container } = render(<SectionHeader>x</SectionHeader>);
    expect(container.firstElementChild!.hasAttribute('data-surface')).toBe(false);
  });
});

describe('SectionHeader · LY-CORE-2 polymorphic', () => {
  it('renders as the element passed to component', () => {
    const { container } = render(<SectionHeader component="div">x</SectionHeader>);
    expect(container.firstElementChild!.tagName).toBe('DIV');
  });

  it('does NOT add data-surface on polymorphic non-default element', () => {
    const { container } = render(<SectionHeader component="div">x</SectionHeader>);
    expect(container.firstElementChild!.hasAttribute('data-surface')).toBe(false);
  });
});

describe('SectionHeader · LY-CORE-7 user APIs', () => {
  it('appends user className', () => {
    const { container } = render(<SectionHeader className="my-cls">x</SectionHeader>);
    expect(container.firstElementChild!.className).toMatch(/\bmy-cls\b/);
  });

  it('forwards children + style', () => {
    const { container } = render(
      <SectionHeader style={{ color: 'red' }}>
        <h2>Title</h2>
      </SectionHeader>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('red');
    expect(el.querySelector('h2')!.textContent).toBe('Title');
  });
});

describe('SectionHeader · LY-SEC-3 standalone usability', () => {
  it('works without a wrapping Section element', () => {
    // SectionHeader MUST consume section CSS vars directly so it can
    // be used outside a Section (e.g. inside a Card surface).
    const { container } = render(
      <div data-testid="parent-not-section">
        <SectionHeader>standalone</SectionHeader>
      </div>,
    );
    expect(container.querySelector('header')!.textContent).toBe('standalone');
  });
});
