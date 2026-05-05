/**
 * Stage-15 Phase 3 · SectionContent primitive · structural test suite.
 *
 * Test topology:
 *   - LY-SEC-3 default element <div>                                    (2 tests)
 *   - LY-SEC-2 does NOT emit data-surface                               (1 test)
 *   - LY-CORE-2 polymorphic                                             (1 test)
 *   - LY-CORE-7 user APIs                                               (2 tests)
 *   - LY-SEC-3 standalone usability                                     (1 test)
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SectionContent } from './SectionContent';

describe('SectionContent · LY-SEC-3 default element', () => {
  it('renders <div> by default (no native HTML semantic for "content")', () => {
    const { container } = render(<SectionContent>x</SectionContent>);
    expect(container.firstElementChild!.tagName).toBe('DIV');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<SectionContent ref={ref}>r</SectionContent>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe('SectionContent · LY-SEC-2 surface ignorance', () => {
  it('does NOT emit data-surface', () => {
    const { container } = render(<SectionContent>x</SectionContent>);
    expect(container.firstElementChild!.hasAttribute('data-surface')).toBe(false);
  });
});

describe('SectionContent · LY-CORE-2 polymorphic', () => {
  it('renders as the element passed to component', () => {
    const { container } = render(
      <SectionContent component="article">x</SectionContent>,
    );
    expect(container.firstElementChild!.tagName).toBe('ARTICLE');
  });
});

describe('SectionContent · LY-CORE-7 user APIs', () => {
  it('appends user className', () => {
    const { container } = render(<SectionContent className="my-cls">x</SectionContent>);
    expect(container.firstElementChild!.className).toMatch(/\bmy-cls\b/);
  });

  it('forwards user style', () => {
    const { container } = render(
      <SectionContent style={{ background: 'cyan' }}>x</SectionContent>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.background).toBe('cyan');
  });
});

describe('SectionContent · LY-SEC-3 standalone', () => {
  it('works without a wrapping Section element', () => {
    const { container } = render(
      <div>
        <SectionContent>standalone</SectionContent>
      </div>,
    );
    expect(container.querySelector('div > div')!.textContent).toBe('standalone');
  });
});
