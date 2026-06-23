/**
 * Stage-15 Phase 1 · Inline primitive · structural test suite.
 *
 * Test topology (mapped back to invariants):
 *   - LY-INLINE-1 horizontal flex semantic lock + polymorphic               (3 tests)
 *   - LY-INLINE-2 gap default 'md' + 8 SpacingScale keys                    (3 tests)
 *   - LY-INLINE-2 align (5 literals) + justify (6 literals)                 (3 tests)
 *   - LY-INLINE-2 wrap boolean attribute behaviour                          (3 tests)
 *   - LY-BOX-3   reverse: Inline does NOT expose padding/margin             (1 test)
 *   - LY-CORE-1  zero-runtime style                                         (1 test)
 *   - LY-CORE-7  user APIs flow through                                     (2 tests)
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Inline, INLINE_DEFAULT_GAP } from './Inline';

describe('Inline · LY-INLINE-1 horizontal flex + polymorphic', () => {
  it('renders a <div> by default', () => {
    const { container } = render(<Inline>x</Inline>);
    expect(container.firstElementChild!.tagName).toBe('DIV');
  });

  it('renders as the element passed to `component`', () => {
    const { container } = render(<Inline component="nav">x</Inline>);
    expect(container.firstElementChild!.tagName).toBe('NAV');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Inline ref={ref}>r</Inline>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current!.tagName).toBe('DIV');
  });
});

describe('Inline · LY-INLINE-2 gap', () => {
  it('emits data-gap="md" by default (LY-INLINE-2 default lock)', () => {
    const { container } = render(<Inline>x</Inline>);
    expect(container.firstElementChild!.getAttribute('data-gap')).toBe(INLINE_DEFAULT_GAP);
    expect(INLINE_DEFAULT_GAP).toBe('md');
  });

  it.each([
    ['none'], ['xs'], ['sm'], ['md'], ['lg'], ['xl'], ['2xl'], ['3xl'],
  ] as const)('emits data-gap="%s" for each SpacingScale key', (key) => {
    const { container } = render(<Inline gap={key}>x</Inline>);
    expect(container.firstElementChild!.getAttribute('data-gap')).toBe(key);
  });

  it('always emits data-gap (honest default · LY-INLINE-2 contract)', () => {
    const { container } = render(<Inline>x</Inline>);
    expect(container.firstElementChild!.hasAttribute('data-gap')).toBe(true);
  });
});

describe('Inline · LY-INLINE-2 align + justify', () => {
  it.each([
    ['start'], ['center'], ['end'], ['stretch'], ['baseline'],
  ] as const)('align="%s" → data-align', (v) => {
    const { container } = render(<Inline align={v}>x</Inline>);
    expect(container.firstElementChild!.getAttribute('data-align')).toBe(v);
  });

  it.each([
    ['start'], ['center'], ['end'], ['between'], ['around'], ['evenly'],
  ] as const)('justify="%s" → data-justify', (v) => {
    const { container } = render(<Inline justify={v}>x</Inline>);
    expect(container.firstElementChild!.getAttribute('data-justify')).toBe(v);
  });

  it('omits data-align / data-justify when user does not set them', () => {
    const { container } = render(<Inline>x</Inline>);
    const el = container.firstElementChild!;
    expect(el.hasAttribute('data-align')).toBe(false);
    expect(el.hasAttribute('data-justify')).toBe(false);
  });
});

describe('Inline · LY-INLINE-2 wrap', () => {
  it('does NOT emit data-wrap when wrap is omitted (default nowrap)', () => {
    const { container } = render(<Inline>x</Inline>);
    expect(container.firstElementChild!.hasAttribute('data-wrap')).toBe(false);
  });

  it('does NOT emit data-wrap when wrap=false', () => {
    const { container } = render(<Inline wrap={false}>x</Inline>);
    expect(container.firstElementChild!.hasAttribute('data-wrap')).toBe(false);
  });

  it('emits valueless data-wrap when wrap=true (boolean-attribute idiom)', () => {
    const { container } = render(<Inline wrap>x</Inline>);
    const el = container.firstElementChild!;
    expect(el.hasAttribute('data-wrap')).toBe(true);
    // Boolean attribute: presence carries the meaning, value is the empty string.
    // We deliberately avoid stringifying "true"/"false" into the DOM (mirrors
    // native `<input disabled>` / `<details open>` behaviour).
    expect(el.getAttribute('data-wrap')).toBe('');
  });
});

describe('Inline · LY-BOX-3 reverse · no padding/margin surface', () => {
  it('does not pollute DOM with padding/margin data-attrs', () => {
    const props = { padding: 'md', margin: 'lg' } as unknown as React.ComponentProps<typeof Inline>;
    const { container } = render(<Inline {...props}>x</Inline>);
    const el = container.firstElementChild!;
    expect(el.hasAttribute('data-padding')).toBe(false);
    expect(el.hasAttribute('data-margin')).toBe(false);
  });
});

describe('Inline · LY-CORE-1 zero-runtime style', () => {
  it('does not inject inline style', () => {
    const { container } = render(
      <Inline gap="lg" align="center" justify="between" wrap>x</Inline>,
    );
    expect(container.firstElementChild!.getAttribute('style')).toBeNull();
  });
});

describe('Inline · LY-CORE-7 user APIs flow through', () => {
  it('appends user className after the primitive root class', () => {
    const { container } = render(<Inline className="user-extra">c</Inline>);
    const cls = container.firstElementChild!.className;
    expect(cls).toMatch(/\buser-extra\b/);
    expect(cls.split(/\s+/).length).toBeGreaterThanOrEqual(2);
  });

  it('forwards inline style + aria-label + id + role', () => {
    const { container } = render(
      <Inline id="i1" role="toolbar" aria-label="actions" style={{ background: 'pink' }}>
        c
      </Inline>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.id).toBe('i1');
    expect(el.getAttribute('role')).toBe('toolbar');
    expect(el.getAttribute('aria-label')).toBe('actions');
    expect(el.style.background).toBe('pink');
  });
});

// ─── Stage-16 Phase 2 · responsive `gap` / `align` / `justify` / `wrap` ─────
describe('Inline · Stage-16 responsive (gap / align / justify)', () => {
  it('emits per-breakpoint data-gap-<bp> for a responsive object', () => {
    const { container } = render(
      <Inline gap={{ xs: 'sm', md: 'lg' }}>x</Inline>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('data-gap-xs')).toBe('sm');
    expect(el.getAttribute('data-gap-md')).toBe('lg');
    expect(el.getAttribute('data-gap')).toBeNull();
  });

  it('emits per-breakpoint data-align-<bp> + data-justify-<bp>', () => {
    const { container } = render(
      <Inline align={{ md: 'start' }} justify={{ lg: 'between' }}>x</Inline>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('data-align-md')).toBe('start');
    expect(el.getAttribute('data-justify-lg')).toBe('between');
    expect(el.getAttribute('data-align')).toBeNull();
    expect(el.getAttribute('data-justify')).toBeNull();
  });

  it('falls back to scalar default data-gap="md" when gap is empty object', () => {
    const { container } = render(<Inline gap={{}}>x</Inline>);
    expect(container.firstElementChild!.getAttribute('data-gap')).toBe('md');
  });
});

describe('Inline · Stage-16 responsive (wrap)', () => {
  it('emits valueless data-wrap when scalar wrap=true', () => {
    const { container } = render(<Inline wrap>x</Inline>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute('data-wrap')).toBe(true);
    expect(el.getAttribute('data-wrap')).toBe('');
  });

  it('omits data-wrap when scalar wrap=false', () => {
    const { container } = render(<Inline wrap={false}>x</Inline>);
    expect(container.firstElementChild!.hasAttribute('data-wrap')).toBe(false);
  });

  it('emits string-valued data-wrap-<bp> for responsive wrap (true/false)', () => {
    const { container } = render(
      <Inline wrap={{ xs: true, lg: false }}>x</Inline>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('data-wrap-xs')).toBe('true');
    expect(el.getAttribute('data-wrap-lg')).toBe('false');
    // Scalar attr must NOT be emitted in responsive mode.
    expect(el.hasAttribute('data-wrap')).toBe(false);
  });

  it('omits all data-wrap attrs when wrap is undefined', () => {
    const { container } = render(<Inline>x</Inline>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute('data-wrap')).toBe(false);
    for (const bp of ['xs', 'sm', 'md', 'lg', 'xl']) {
      expect(el.hasAttribute(`data-wrap-${bp}`)).toBe(false);
    }
  });

  it('omits all data-wrap attrs when responsive object is empty', () => {
    const { container } = render(<Inline wrap={{}}>x</Inline>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute('data-wrap')).toBe(false);
    for (const bp of ['xs', 'sm', 'md', 'lg', 'xl']) {
      expect(el.hasAttribute(`data-wrap-${bp}`)).toBe(false);
    }
  });
});

describe('Inline · Stage-16 RES-RT-1 boundary', () => {
  it('does not inject inline style for any responsive prop combination', () => {
    const { container } = render(
      <Inline
        gap={{ xs: 'sm', md: 'lg' }}
        align={{ md: 'start' }}
        justify={{ lg: 'between' }}
        wrap={{ xs: true, lg: false }}
      >
        x
      </Inline>,
    );
    expect(container.firstElementChild!.getAttribute('style')).toBeNull();
  });
});
