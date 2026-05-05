/**
 * Stage-15 Phase 3 · SectionTitle primitive · structural test suite.
 *
 * SectionTitle is the 5th public Section primitive (v1.0.8 · ADR-005
 * audit entry). It locks the title typography against heading-element
 * browser defaults, closing the SZ-SEC-1 typography end-to-end loop.
 *
 * Test topology:
 *   - LY-SEC-3 default element <h2>                                     (2 tests)
 *   - LY-SEC-2 does NOT emit data-surface (band-level surface ignorance)(1 test)
 *   - LY-CORE-2 polymorphic (component="h3" / "div")                    (2 tests)
 *   - LY-CORE-7 user APIs flow through (className / style / children)   (2 tests)
 *   - LY-SEC-3 standalone usability (works outside SectionHeader)       (1 test)
 *   - SZ-SEC-1 typography lock (consumes `.title` CSS module class)     (1 test)
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SectionTitle } from './SectionTitle';

describe('SectionTitle · LY-SEC-3 default element', () => {
  it('renders <h2> by default (Modal/Dialog title convention)', () => {
    const { container } = render(<SectionTitle>x</SectionTitle>);
    expect(container.firstElementChild!.tagName).toBe('H2');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(<SectionTitle ref={ref}>r</SectionTitle>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('SectionTitle · LY-SEC-2 surface ignorance', () => {
  it('does NOT emit data-surface (only Section root does)', () => {
    const { container } = render(<SectionTitle>x</SectionTitle>);
    expect(container.firstElementChild!.hasAttribute('data-surface')).toBe(false);
  });
});

describe('SectionTitle · LY-CORE-2 polymorphic', () => {
  it('renders <h3> when component="h3" (nested section outline)', () => {
    const { container } = render(<SectionTitle component="h3">x</SectionTitle>);
    expect(container.firstElementChild!.tagName).toBe('H3');
  });

  it('renders <div role="heading"> when explicitly opted out of heading semantic', () => {
    const { container } = render(
      <SectionTitle component="div" role="heading" aria-level={2}>
        x
      </SectionTitle>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el.getAttribute('role')).toBe('heading');
    expect(el.getAttribute('aria-level')).toBe('2');
  });
});

describe('SectionTitle · LY-CORE-7 user APIs', () => {
  it('appends user className', () => {
    const { container } = render(<SectionTitle className="my-cls">x</SectionTitle>);
    expect(container.firstElementChild!.className).toMatch(/\bmy-cls\b/);
  });

  it('forwards children + style', () => {
    const { container } = render(
      <SectionTitle style={{ color: 'red' }}>Settings</SectionTitle>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('red');
    expect(el.textContent).toBe('Settings');
  });
});

describe('SectionTitle · LY-SEC-3 standalone usability', () => {
  it('works without a wrapping Section / SectionHeader element', () => {
    // SectionTitle MUST consume the title CSS vars directly so it can
    // be used outside a Section (e.g. as a standalone heading inside
    // a Card surface or a custom Modal arrangement).
    const { container } = render(
      <div data-testid="parent-not-section">
        <SectionTitle>standalone</SectionTitle>
      </div>,
    );
    expect(container.querySelector('h2')!.textContent).toBe('standalone');
  });
});

describe('SectionTitle · SZ-SEC-1 typography lock', () => {
  it('applies the `.title` CSS module class (token-driven typography)', () => {
    // The whole point of SectionTitle is to apply `.title` (which
    // resets `<h2>`'s defaults and explicitly assigns the resolved
    // title triplet via `--prismui-section-title-*` vars). The class
    // must be present on the rendered element — otherwise the title
    // would inherit `<h2>`'s browser defaults and the end-to-end
    // SZ-SEC-1 promise breaks.
    const { container } = render(<SectionTitle>x</SectionTitle>);
    const cls = container.firstElementChild!.className;
    // The CSS module hashes the class name; we only require the
    // hash form contains the local identifier "title" as a substring,
    // which is the standard css-modules + vitest stub behaviour.
    expect(cls).toMatch(/title/);
  });
});
