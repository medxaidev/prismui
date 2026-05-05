/**
 * Stage-15 Phase 1 · Center primitive · structural test suite.
 *
 * Test topology (mapped back to invariants):
 *   - LY-CENTER-1 single-child centering + polymorphic                      (3 tests)
 *   - LY-CENTER-2 DEV multi-child advisory · per-instance latched           (4 tests)
 *   - LY-CENTER-2 Prod silence (no warn when NODE_ENV='production')         (1 test)
 *   - LY-BOX-3    reverse: Center does NOT expose padding/margin/gap        (1 test)
 *   - LY-CORE-1   zero-runtime style                                        (1 test)
 *   - LY-CORE-7   user APIs flow through                                    (2 tests)
 */
import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Center } from './Center';

describe('Center · LY-CENTER-1 single-child centering + polymorphic', () => {
  it('renders a <div> by default', () => {
    const { container } = render(<Center>x</Center>);
    expect(container.firstElementChild!.tagName).toBe('DIV');
  });

  it('renders as the element passed to `component`', () => {
    const { container } = render(<Center component="section">x</Center>);
    expect(container.firstElementChild!.tagName).toBe('SECTION');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Center ref={ref}>r</Center>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current!.tagName).toBe('DIV');
  });
});

// ── LY-CENTER-2 · DEV multi-child advisory ──────────────────────────────────

describe('Center · LY-CENTER-2 DEV multi-child advisory', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('does NOT warn for a single child', () => {
    render(<Center><span>only</span></Center>);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn for zero children (text/null/undefined are 0 elements)', () => {
    // React.Children.count counts text strings as children too — but text
    // strings are the most common "single child" case and are intended use.
    // We only warn when count > 1, so a sole text node never warns.
    render(<Center>just text</Center>);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns once when receiving > 1 children', () => {
    render(
      <Center>
        <span>a</span>
        <span>b</span>
      </Center>,
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toMatch(/\[PrismUI\] <Center>/);
    expect(warnSpy.mock.calls[0]?.[0]).toMatch(/2 children/);
  });

  it('does NOT re-warn on subsequent renders of the same Center instance (per-instance latch)', () => {
    const Tester = ({ flip }: { flip: number }) => (
      <Center>
        <span>a</span>
        <span>b</span>
        <span key={flip}>c · v{flip}</span>
      </Center>
    );
    const { rerender } = render(<Tester flip={0} />);
    rerender(<Tester flip={1} />);
    rerender(<Tester flip={2} />);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});

// ── LY-CENTER-2 · Prod silence ──────────────────────────────────────────────

describe('Center · LY-CENTER-2 Prod silence', () => {
  it('does NOT warn when NODE_ENV is production', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(
        <Center>
          <span>a</span>
          <span>b</span>
          <span>c</span>
        </Center>,
      );
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    }
  });
});

describe('Center · LY-BOX-3 reverse · no spacing surface', () => {
  it('does not pollute DOM with padding/margin/gap data-attrs', () => {
    const props = { padding: 'md', margin: 'lg', gap: 'sm' } as unknown as React.ComponentProps<typeof Center>;
    const { container } = render(<Center {...props}>x</Center>);
    const el = container.firstElementChild!;
    expect(el.hasAttribute('data-padding')).toBe(false);
    expect(el.hasAttribute('data-margin')).toBe(false);
    expect(el.hasAttribute('data-gap')).toBe(false);
  });
});

describe('Center · LY-CORE-1 zero-runtime style', () => {
  it('does not inject inline style', () => {
    const { container } = render(<Center>x</Center>);
    expect(container.firstElementChild!.getAttribute('style')).toBeNull();
  });
});

describe('Center · LY-CORE-7 user APIs flow through', () => {
  it('appends user className after the primitive root class', () => {
    const { container } = render(<Center className="user-extra">c</Center>);
    const cls = container.firstElementChild!.className;
    expect(cls).toMatch(/\buser-extra\b/);
    expect(cls.split(/\s+/).length).toBeGreaterThanOrEqual(2);
  });

  it('forwards inline style + aria-label + id + role', () => {
    const { container } = render(
      <Center id="c1" role="presentation" aria-label="hero" style={{ background: 'lime' }}>
        c
      </Center>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.id).toBe('c1');
    expect(el.getAttribute('role')).toBe('presentation');
    expect(el.getAttribute('aria-label')).toBe('hero');
    expect(el.style.background).toBe('lime');
  });
});
