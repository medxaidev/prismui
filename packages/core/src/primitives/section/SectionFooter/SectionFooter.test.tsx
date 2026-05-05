/**
 * Stage-15 Phase 3 · SectionFooter primitive · structural test suite.
 *
 * Test topology:
 *   - LY-SEC-3 default element <footer>                                 (2 tests)
 *   - LY-SEC-2 does NOT emit data-surface                               (1 test)
 *   - LY-CORE-2 polymorphic                                             (1 test)
 *   - LY-CORE-7 user APIs                                               (2 tests)
 *   - LY-SEC-3 standalone usability                                     (1 test)
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SectionFooter } from './SectionFooter';

describe('SectionFooter · LY-SEC-3 default element', () => {
  it('renders <footer> by default', () => {
    const { container } = render(<SectionFooter>x</SectionFooter>);
    expect(container.firstElementChild!.tagName).toBe('FOOTER');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<SectionFooter ref={ref}>r</SectionFooter>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe('SectionFooter · LY-SEC-2 surface ignorance', () => {
  it('does NOT emit data-surface', () => {
    const { container } = render(<SectionFooter>x</SectionFooter>);
    expect(container.firstElementChild!.hasAttribute('data-surface')).toBe(false);
  });
});

describe('SectionFooter · LY-CORE-2 polymorphic', () => {
  it('renders as the element passed to component', () => {
    const { container } = render(<SectionFooter component="div">x</SectionFooter>);
    expect(container.firstElementChild!.tagName).toBe('DIV');
  });
});

describe('SectionFooter · LY-CORE-7 user APIs', () => {
  it('appends user className', () => {
    const { container } = render(<SectionFooter className="my-cls">x</SectionFooter>);
    expect(container.firstElementChild!.className).toMatch(/\bmy-cls\b/);
  });

  it('forwards user style + children (action buttons)', () => {
    const { container } = render(
      <SectionFooter style={{ borderTop: '1px solid red' }}>
        <button>Cancel</button>
        <button>Confirm</button>
      </SectionFooter>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.borderTop).toContain('red');
    expect(el.querySelectorAll('button').length).toBe(2);
  });
});

describe('SectionFooter · LY-SEC-3 standalone', () => {
  it('works without a wrapping Section element', () => {
    const { container } = render(
      <div>
        <SectionFooter>standalone</SectionFooter>
      </div>,
    );
    expect(container.querySelector('footer')!.textContent).toBe('standalone');
  });
});
