/**
 * Stage-15 Phase 3 · Section primitive · structural test suite.
 *
 * Test topology (mapped back to invariants):
 *   - LY-SEC-2 default element + data-surface="page" honest default     (3 tests)
 *   - LY-SEC-2 surface="overlay" pivot                                  (2 tests)
 *   - LY-CORE-2 polymorphic via component prop                          (2 tests)
 *   - LY-CORE-7 user APIs (className / style / id / aria) flow through  (2 tests)
 *   - LY-SEC-3 optional bands · Section renders standalone              (1 test)
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Section, SECTION_DEFAULT_SURFACE } from './Section';

describe('Section · LY-SEC-2 default element + honest default', () => {
  it('renders <section> by default', () => {
    const { container } = render(<Section>x</Section>);
    expect(container.firstElementChild!.tagName).toBe('SECTION');
  });

  it('emits data-surface="page" by default (honest default)', () => {
    const { container } = render(<Section>x</Section>);
    expect(container.firstElementChild!.getAttribute('data-surface')).toBe(
      SECTION_DEFAULT_SURFACE,
    );
    expect(SECTION_DEFAULT_SURFACE).toBe('page');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Section ref={ref}>r</Section>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current!.tagName).toBe('SECTION');
  });
});

describe('Section · LY-SEC-2 surface pivot', () => {
  it('emits data-surface="overlay" when surface="overlay"', () => {
    const { container } = render(<Section surface="overlay">x</Section>);
    expect(container.firstElementChild!.getAttribute('data-surface')).toBe('overlay');
  });

  it('emits data-surface="page" when explicitly set (round-trip)', () => {
    const { container } = render(<Section surface="page">x</Section>);
    expect(container.firstElementChild!.getAttribute('data-surface')).toBe('page');
  });
});

describe('Section · LY-CORE-2 polymorphic component prop', () => {
  it('renders as the element passed to component', () => {
    const { container } = render(<Section component="article">x</Section>);
    expect(container.firstElementChild!.tagName).toBe('ARTICLE');
  });

  it('still emits data-surface on the polymorphic element', () => {
    const { container } = render(
      <Section component="aside" surface="overlay">
        x
      </Section>,
    );
    const el = container.firstElementChild!;
    expect(el.tagName).toBe('ASIDE');
    expect(el.getAttribute('data-surface')).toBe('overlay');
  });
});

describe('Section · LY-CORE-7 user APIs flow through', () => {
  it('appends user className after the primitive root class', () => {
    const { container } = render(<Section className="user-extra">x</Section>);
    const cls = container.firstElementChild!.className;
    expect(cls).toMatch(/\buser-extra\b/);
    expect(cls.split(/\s+/).length).toBeGreaterThanOrEqual(2);
  });

  it('forwards id / aria-label / style', () => {
    const { container } = render(
      <Section id="s1" aria-label="settings" style={{ background: 'pink' }}>
        x
      </Section>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.id).toBe('s1');
    expect(el.getAttribute('aria-label')).toBe('settings');
    expect(el.style.background).toBe('pink');
  });
});

describe('Section · LY-SEC-3 optional bands · standalone', () => {
  it('renders without any band children (Section is the optional outer wrapper)', () => {
    // Section MUST NOT require Header/Content/Footer to be present.
    // Empty Section is a valid composition (e.g. a styled placeholder).
    const { container } = render(<Section />);
    expect(container.firstElementChild!.tagName).toBe('SECTION');
    expect(container.firstElementChild!.children.length).toBe(0);
  });
});
