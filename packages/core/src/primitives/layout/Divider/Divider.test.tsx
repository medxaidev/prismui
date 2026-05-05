/**
 * Stage-15 Phase 1 · Divider primitive · structural test suite.
 *
 * Test topology (mapped back to invariants):
 *   - LY-DIV-1 default element + native a11y                               (3 tests)
 *   - LY-DIV-1 polymorphic a11y · auto role="separator" on non-hr          (2 tests)
 *   - LY-DIV-1 Round 1 Insight 1 · user role NOT overwritten               (3 tests)
 *   - LY-DIV-1 aria-orientation honest-default                             (3 tests)
 *   - LY-DIV-2 orientation prop → data-orientation                         (3 tests)
 *   - LY-BOX-3 reverse: Divider does NOT expose padding/margin             (1 test)
 *   - LY-CORE-1 zero-runtime style                                         (1 test)
 *   - LY-CORE-7 user APIs flow through                                     (2 tests)
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Divider, DIVIDER_DEFAULT_ORIENTATION } from './Divider';

describe('Divider · LY-DIV-1 default element + native a11y', () => {
  it('renders <hr> by default', () => {
    const { container } = render(<Divider />);
    expect(container.firstElementChild!.tagName).toBe('HR');
  });

  it('does NOT add explicit role on <hr> (native implicit role="separator" is canonical)', () => {
    const { container } = render(<Divider />);
    // <hr> has implicit ARIA role="separator" (HTML spec). Adding an
    // explicit attribute is redundant; we omit it to keep the DOM
    // minimal and avoid snapshot-test churn.
    expect(container.firstElementChild!.hasAttribute('role')).toBe(false);
  });

  it('forwards ref to the <hr> element', () => {
    const ref = React.createRef<HTMLHRElement>();
    render(<Divider ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current!.tagName).toBe('HR');
  });
});

describe('Divider · LY-DIV-1 polymorphic a11y auto-augmentation', () => {
  it('adds role="separator" when rendered as a non-hr element', () => {
    const { container } = render(<Divider component="div" />);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe('DIV');
    expect(el.getAttribute('role')).toBe('separator');
  });

  it('adds role="separator" for <span> variant (inline separator)', () => {
    const { container } = render(<Divider component="span" orientation="vertical" />);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe('SPAN');
    expect(el.getAttribute('role')).toBe('separator');
  });
});

describe('Divider · LY-DIV-1 Round 1 Insight 1 · user role NOT overwritten', () => {
  it('forwards user role="presentation" on <hr> (defuses separator semantics)', () => {
    // Scenario: consumer wants a decorative divider with no a11y impact.
    // Insight 1 lesson: primitive MUST NOT silently re-override role
    // back to "separator" — that would make the primitive dishonest
    // about keyboard/a11y behaviour.
    const { container } = render(<Divider role="presentation" />);
    expect(container.firstElementChild!.getAttribute('role')).toBe('presentation');
  });

  it('forwards user role on polymorphic non-hr element', () => {
    const { container } = render(<Divider component="div" role="presentation" />);
    expect(container.firstElementChild!.getAttribute('role')).toBe('presentation');
  });

  it('forwards a custom role (e.g. role="none") unchanged', () => {
    const { container } = render(<Divider component="div" role="none" />);
    expect(container.firstElementChild!.getAttribute('role')).toBe('none');
  });
});

describe('Divider · LY-DIV-1 aria-orientation honest-default', () => {
  it('fills aria-orientation from `orientation` prop by default (horizontal)', () => {
    const { container } = render(<Divider />);
    expect(container.firstElementChild!.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('fills aria-orientation from `orientation` prop by default (vertical)', () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.firstElementChild!.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('forwards user aria-orientation unchanged (does NOT re-derive from orientation prop)', () => {
    // Contract: if the consumer wants a divider whose ARIA orientation
    // diverges from its visual orientation (unusual but not forbidden),
    // the primitive MUST respect that. Same honest-default rule as role.
    const { container } = render(
      <Divider orientation="horizontal" aria-orientation="vertical" />,
    );
    expect(container.firstElementChild!.getAttribute('aria-orientation')).toBe('vertical');
  });
});

describe('Divider · LY-DIV-2 orientation → data-orientation', () => {
  it('data-orientation="horizontal" by default', () => {
    const { container } = render(<Divider />);
    expect(container.firstElementChild!.getAttribute('data-orientation')).toBe(
      DIVIDER_DEFAULT_ORIENTATION,
    );
    expect(DIVIDER_DEFAULT_ORIENTATION).toBe('horizontal');
  });

  it('data-orientation="horizontal" when orientation="horizontal"', () => {
    const { container } = render(<Divider orientation="horizontal" />);
    expect(container.firstElementChild!.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('data-orientation="vertical" when orientation="vertical"', () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.firstElementChild!.getAttribute('data-orientation')).toBe('vertical');
  });
});

describe('Divider · LY-BOX-3 reverse · no padding/margin surface', () => {
  it('does not pollute DOM with padding/margin data-attrs', () => {
    // Divider intentionally does NOT accept padding/margin (LY-DIV-2 +
    // LY-BOX-3). Adjacent spacing is the parent's responsibility via
    // Stack/Inline gap. Forced-through values must not appear as
    // data-* pollution in the DOM.
    const props = { padding: 'md', margin: 'lg' } as unknown as React.ComponentProps<typeof Divider>;
    const { container } = render(<Divider {...props} />);
    const el = container.firstElementChild!;
    expect(el.hasAttribute('data-padding')).toBe(false);
    expect(el.hasAttribute('data-margin')).toBe(false);
  });
});

describe('Divider · LY-CORE-1 zero-runtime style', () => {
  it('does not inject inline style', () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.firstElementChild!.getAttribute('style')).toBeNull();
  });
});

describe('Divider · LY-CORE-7 user APIs flow through', () => {
  it('appends user className after the primitive root class', () => {
    const { container } = render(<Divider className="user-extra" />);
    const cls = container.firstElementChild!.className;
    expect(cls).toMatch(/\buser-extra\b/);
    expect(cls.split(/\s+/).length).toBeGreaterThanOrEqual(2);
  });

  it('forwards inline style + id (user-set style merges onto element)', () => {
    const { container } = render(
      <Divider id="d1" style={{ borderColor: 'red', height: 40 }} orientation="vertical" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.id).toBe('d1');
    expect(el.style.borderColor).toBe('red');
    expect(el.style.height).toBe('40px');
  });
});
