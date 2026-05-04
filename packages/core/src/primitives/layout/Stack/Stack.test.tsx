/**
 * Stage-15 Phase 1 · Stack primitive · structural test suite.
 *
 * Test topology (mapped back to invariants):
 *   - LY-STACK-1 vertical flex semantic lock + polymorphic                    (3 tests)
 *   - LY-STACK-2 gap default 'md' + 8 SpacingScale keys                       (3 tests)
 *   - LY-STACK-3 align (5 literals) + justify (6 literals)                    (3 tests)
 *   - LY-BOX-3   reverse: Stack does NOT expose padding/margin props          (1 test · runtime check + comment-doc'd TS guard)
 *   - LY-CORE-1  zero-runtime style                                           (1 test)
 *   - LY-CORE-5  data-attr DOM-bearing · undefined align/justify omits attr   (1 test)
 *   - LY-CORE-7  user className / style / aria-* / refs flow through          (2 tests)
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Stack, STACK_DEFAULT_GAP } from './Stack';

describe('Stack · LY-STACK-1 vertical flex + polymorphic', () => {
  it('renders a <div> by default', () => {
    const { container } = render(<Stack>x</Stack>);
    expect(container.firstElementChild!.tagName).toBe('DIV');
  });

  it('renders as the element passed to `component`', () => {
    const { container } = render(<Stack component="ul">x</Stack>);
    expect(container.firstElementChild!.tagName).toBe('UL');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Stack ref={ref}>r</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current!.tagName).toBe('DIV');
  });
});

describe('Stack · LY-STACK-2 gap', () => {
  it('emits data-gap="md" by default (LY-STACK-2 default lock)', () => {
    const { container } = render(<Stack>x</Stack>);
    expect(container.firstElementChild!.getAttribute('data-gap')).toBe(STACK_DEFAULT_GAP);
    expect(STACK_DEFAULT_GAP).toBe('md');
  });

  it.each([
    ['none'], ['xs'], ['sm'], ['md'], ['lg'], ['xl'], ['2xl'], ['3xl'],
  ] as const)('emits data-gap="%s" for each SpacingScale key', (key) => {
    const { container } = render(<Stack gap={key}>x</Stack>);
    expect(container.firstElementChild!.getAttribute('data-gap')).toBe(key);
  });

  it('always emits data-gap (honest default · LY-STACK-2 contract)', () => {
    const { container } = render(<Stack>x</Stack>);
    // Even when user passes nothing, data-gap is set to 'md'. This is by
    // design: the default value is a *real* value users can inspect, not a
    // hidden CSS fallback.
    expect(container.firstElementChild!.hasAttribute('data-gap')).toBe(true);
  });
});

describe('Stack · LY-STACK-3 align + justify', () => {
  it.each([
    ['start'], ['center'], ['end'], ['stretch'], ['baseline'],
  ] as const)('align="%s" → data-align', (v) => {
    const { container } = render(<Stack align={v}>x</Stack>);
    expect(container.firstElementChild!.getAttribute('data-align')).toBe(v);
  });

  it.each([
    ['start'], ['center'], ['end'], ['between'], ['around'], ['evenly'],
  ] as const)('justify="%s" → data-justify', (v) => {
    const { container } = render(<Stack justify={v}>x</Stack>);
    expect(container.firstElementChild!.getAttribute('data-justify')).toBe(v);
  });

  it('omits data-align / data-justify when user does not set them (LY-CORE-5)', () => {
    const { container } = render(<Stack>x</Stack>);
    const el = container.firstElementChild!;
    expect(el.hasAttribute('data-align')).toBe(false);
    expect(el.hasAttribute('data-justify')).toBe(false);
  });
});

describe('Stack · LY-BOX-3 reverse · no padding/margin surface', () => {
  it('does not pollute DOM with padding/margin data-attrs even if forced', () => {
    // Stack's TypeScript surface refuses `padding` / `margin` (compile-time
    // guard — see StackOwnProps). The runtime additionally must NOT relay
    // any such prop to the DOM. We force the props through a typed escape
    // here ONLY to prove the runtime is honest about LY-BOX-3.
    const props = { padding: 'md', margin: 'lg' } as unknown as React.ComponentProps<typeof Stack>;
    const { container } = render(<Stack {...props}>x</Stack>);
    const el = container.firstElementChild!;
    // The unknown props get spread through `...rest` (Stack does not own
    // them), so they reach the DOM as unrecognized attributes — but they
    // MUST NOT be transformed into Box-style `data-padding` / `data-margin`
    // attributes. That naming space belongs exclusively to <Box>.
    expect(el.hasAttribute('data-padding')).toBe(false);
    expect(el.hasAttribute('data-margin')).toBe(false);
  });
});

describe('Stack · LY-CORE-1 zero-runtime style', () => {
  it('does not inject inline style', () => {
    const { container } = render(<Stack gap="lg" align="center" justify="between">x</Stack>);
    expect(container.firstElementChild!.getAttribute('style')).toBeNull();
  });
});

describe('Stack · LY-CORE-7 user APIs flow through', () => {
  it('appends user className after the primitive root class', () => {
    const { container } = render(<Stack className="user-extra">c</Stack>);
    const cls = container.firstElementChild!.className;
    expect(cls).toMatch(/\buser-extra\b/);
    expect(cls.split(/\s+/).length).toBeGreaterThanOrEqual(2);
  });

  it('forwards inline style + aria-label + id + role', () => {
    const { container } = render(
      <Stack id="s1" role="list" aria-label="vstack" style={{ background: 'red' }}>
        c
      </Stack>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.id).toBe('s1');
    expect(el.getAttribute('role')).toBe('list');
    expect(el.getAttribute('aria-label')).toBe('vstack');
    expect(el.style.background).toBe('red');
  });
});
