/**
 * Stage-15 Phase 1 · Box primitive · structural test suite.
 *
 * Test topology (mapped back to invariants):
 *   - LY-BOX-1  default element + polymorphic `component` prop          (3 tests)
 *   - LY-BOX-2  spacing token passthrough · 8 props × token key         (4 tests)
 *   - LY-BOX-3  Box exclusively owns padding/margin props               (1 test · surface check via absence of data-attr when undefined)
 *   - LY-CORE-1 zero-runtime style · no injected inline style           (1 test)
 *   - LY-CORE-5 DOM-bearing data-attr · undefined props leave no attr    (1 test)
 *   - LY-CORE-7 user className / style / aria-* flow through            (3 tests)
 *
 * Total: 13 tests across 4 describe groups. All structural (no Provider
 * required — CSS variable resolution happens at render time in the browser
 * but the data-attr contract is what we assert here; LY-CORE-1 says CSS
 * variables are the only styling channel, so jsdom-level rule matching is
 * not part of the Box contract test).
 */
import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Box } from './Box';

describe('Box · LY-BOX-1 default element + polymorphic', () => {
  it('renders a <div> by default', () => {
    const { container } = render(<Box data-testid="box">hi</Box>);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe('DIV');
    expect(el.textContent).toBe('hi');
  });

  it('renders as the element passed to `component`', () => {
    const { container } = render(<Box component="section">body</Box>);
    expect(container.firstElementChild!.tagName).toBe('SECTION');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Box ref={ref}>r</Box>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current!.tagName).toBe('DIV');
  });
});

describe('Box · LY-BOX-2 spacing token passthrough', () => {
  // Table-driven: one assertion per (prop, expected-attr) pair across the
  // full SpacingScale. Avoids 8 × 8 = 64 boilerplate `it` blocks while still
  // exercising every scale key at least once across the 8 props.
  const scaleByProp: Array<[keyof import('./Box').BoxOwnProps, string, string]> = [
    ['padding', 'data-padding', 'md'],
    ['paddingX', 'data-padding-x', 'sm'],
    ['paddingY', 'data-padding-y', 'lg'],
    ['paddingTop', 'data-padding-top', 'xs'],
    ['paddingRight', 'data-padding-right', 'xl'],
    ['paddingBottom', 'data-padding-bottom', '2xl'],
    ['paddingLeft', 'data-padding-left', '3xl'],
    ['margin', 'data-margin', 'none'],
  ];

  it.each(scaleByProp)('prop `%s` -> attribute `%s` with value `%s`', (prop, attr, value) => {
    const props = { [prop]: value } as React.ComponentProps<typeof Box>;
    const { container } = render(<Box {...props} />);
    expect(container.firstElementChild!.getAttribute(attr)).toBe(value);
  });

  it('accepts multiple spacing props simultaneously', () => {
    const { container } = render(<Box padding="md" paddingX="lg" margin="sm" />);
    const el = container.firstElementChild!;
    expect(el.getAttribute('data-padding')).toBe('md');
    expect(el.getAttribute('data-padding-x')).toBe('lg');
    expect(el.getAttribute('data-margin')).toBe('sm');
  });

  it('accepts `none` scale key (explicit zero)', () => {
    const { container } = render(<Box padding="none" />);
    expect(container.firstElementChild!.getAttribute('data-padding')).toBe('none');
  });

  it('omits data-attrs for undefined spacing props (LY-CORE-5 · no "undefined" leak)', () => {
    const { container } = render(<Box padding="md" />);
    const el = container.firstElementChild!;
    expect(el.hasAttribute('data-padding')).toBe(true);
    // All other spacing attrs must be absent, not present-with-string-"undefined".
    for (const attr of [
      'data-padding-x',
      'data-padding-y',
      'data-padding-top',
      'data-padding-right',
      'data-padding-bottom',
      'data-padding-left',
      'data-margin',
    ]) {
      expect(el.hasAttribute(attr)).toBe(false);
    }
  });
});

describe('Box · LY-CORE-1 zero-runtime style', () => {
  it('does not inject an inline `style` attribute when no style prop is given', () => {
    const { container } = render(<Box padding="md" />);
    // Spacing is delivered via CSS module + attribute selector, never inline.
    expect(container.firstElementChild!.getAttribute('style')).toBeNull();
  });
});

describe('Box · LY-CORE-7 user APIs flow through', () => {
  it('appends user-supplied className after the primitive root class', () => {
    const { container } = render(<Box className="user-extra">c</Box>);
    const cls = container.firstElementChild!.className;
    // Root class (hashed by vite CSS modules) is present, user class is present.
    expect(cls).toMatch(/\buser-extra\b/);
    expect(cls.split(/\s+/).length).toBeGreaterThanOrEqual(2);
  });

  it('forwards user inline style untouched (LY-CORE-7 honesty clause)', () => {
    const { container } = render(<Box style={{ color: 'red' }}>c</Box>);
    expect((container.firstElementChild as HTMLElement).style.color).toBe('red');
  });

  it('forwards arbitrary DOM attributes (aria-*, data-*, id, role, onClick)', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Box id="my-box" role="region" aria-label="hello" data-custom="x" onClick={onClick}>
        c
      </Box>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.id).toBe('my-box');
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('hello');
    expect(el.getAttribute('data-custom')).toBe('x');
    el.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Box · Stage-16 responsive spacing (ADR-008)', () => {
  it('emits per-breakpoint data-attrs for a responsive map', () => {
    const { container } = render(<Box padding={{ xs: 'sm', md: 'lg', xl: '2xl' }} />);
    const el = container.firstElementChild!;
    expect(el.getAttribute('data-padding-xs')).toBe('sm');
    expect(el.getAttribute('data-padding-md')).toBe('lg');
    expect(el.getAttribute('data-padding-xl')).toBe('2xl');
    // Scalar attr must NOT be present when a map is given.
    expect(el.hasAttribute('data-padding')).toBe(false);
    // Unprovided breakpoints leave no attribute (LY-CORE-5 · no leak).
    expect(el.hasAttribute('data-padding-sm')).toBe(false);
    expect(el.hasAttribute('data-padding-lg')).toBe(false);
  });

  it('scalar and responsive props coexist across different spacing props', () => {
    const { container } = render(<Box padding="md" paddingX={{ xs: 'xs', lg: 'xl' }} />);
    const el = container.firstElementChild!;
    // scalar padding → data-padding
    expect(el.getAttribute('data-padding')).toBe('md');
    // responsive paddingX → data-padding-x-<bp>
    expect(el.getAttribute('data-padding-x-xs')).toBe('xs');
    expect(el.getAttribute('data-padding-x-lg')).toBe('xl');
    expect(el.hasAttribute('data-padding-x')).toBe(false);
  });

  it('every spacing prop supports the responsive map form', () => {
    const propToPrefix: Array<[string, string]> = [
      ['padding', 'data-padding-md'],
      ['paddingX', 'data-padding-x-md'],
      ['paddingY', 'data-padding-y-md'],
      ['paddingTop', 'data-padding-top-md'],
      ['paddingRight', 'data-padding-right-md'],
      ['paddingBottom', 'data-padding-bottom-md'],
      ['paddingLeft', 'data-padding-left-md'],
      ['margin', 'data-margin-md'],
    ];
    for (const [prop, attr] of propToPrefix) {
      const props = { [prop]: { md: 'lg' } } as React.ComponentProps<typeof Box>;
      const { container } = render(<Box {...props} />);
      expect(container.firstElementChild!.getAttribute(attr)).toBe('lg');
    }
  });

  it('does not inject inline style for responsive maps (LY-CORE-1 · zero runtime)', () => {
    const { container } = render(<Box padding={{ xs: 'sm', md: 'lg' }} />);
    expect(container.firstElementChild!.getAttribute('style')).toBeNull();
  });
});
