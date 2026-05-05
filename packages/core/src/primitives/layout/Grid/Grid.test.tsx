/**
 * Stage-15 Phase 1 · Grid primitive · structural test suite.
 *
 * Test topology (mapped back to invariants):
 *   - LY-GRID-1 display grid + polymorphic                                  (3 tests)
 *   - LY-GRID-2 columns number → repeat(n, minmax(0, 1fr))                  (3 tests)
 *   - LY-GRID-2 columns string passthrough                                  (2 tests)
 *   - LY-GRID-3 gap default 'md' + 8 SpacingScale keys                      (2 tests)
 *   - LY-GRID-3 rowGap / columnGap fine-grained override                    (3 tests)
 *   - LY-GRID-4 responsive rejection · DEV warn on object columns           (2 tests)
 *   - LY-GRID-4 DEV warn on out-of-range number                             (2 tests)
 *   - LY-BOX-3  reverse: Grid does NOT expose padding/margin                (1 test)
 *   - LY-CORE-1 no inline style beyond the CSS custom property              (2 tests)
 *   - LY-CORE-7 user APIs + style merge                                     (2 tests)
 */
import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Grid, GRID_DEFAULT_GAP } from './Grid';

describe('Grid · LY-GRID-1 display grid + polymorphic', () => {
  it('renders a <div> by default', () => {
    const { container } = render(<Grid>x</Grid>);
    expect(container.firstElementChild!.tagName).toBe('DIV');
  });

  it('renders as the element passed to `component`', () => {
    const { container } = render(<Grid component="section">x</Grid>);
    expect(container.firstElementChild!.tagName).toBe('SECTION');
  });

  it('forwards ref to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Grid ref={ref}>r</Grid>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe('Grid · LY-GRID-2 columns (number)', () => {
  it('columns=3 → CSS custom property with repeat() template', () => {
    const { container } = render(<Grid columns={3}>x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('data-columns')).toBe('');
    expect(el.style.getPropertyValue('--prismui-grid-template-columns')).toBe(
      'repeat(3, minmax(0, 1fr))',
    );
  });

  it.each([[1], [2], [4], [6], [12]] as const)(
    'columns=%i emits repeat(%i, minmax(0, 1fr))',
    (n) => {
      const { container } = render(<Grid columns={n}>x</Grid>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.getPropertyValue('--prismui-grid-template-columns')).toBe(
        `repeat(${n}, minmax(0, 1fr))`,
      );
    },
  );

  it('omits data-columns + custom property when columns is undefined', () => {
    const { container } = render(<Grid>x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute('data-columns')).toBe(false);
    expect(el.style.getPropertyValue('--prismui-grid-template-columns')).toBe('');
  });
});

describe('Grid · LY-GRID-2 columns (string template)', () => {
  it('passes string template through unchanged', () => {
    const { container } = render(<Grid columns="200px 1fr auto">x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--prismui-grid-template-columns')).toBe(
      '200px 1fr auto',
    );
    expect(el.getAttribute('data-columns')).toBe('');
  });

  it('accepts empty-ish strings without transformation (honest passthrough)', () => {
    const { container } = render(<Grid columns="minmax(0, 1fr) 2fr">x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--prismui-grid-template-columns')).toBe(
      'minmax(0, 1fr) 2fr',
    );
  });
});

describe('Grid · LY-GRID-3 gap default + SpacingScale', () => {
  it('emits data-gap="md" by default', () => {
    const { container } = render(<Grid>x</Grid>);
    expect(container.firstElementChild!.getAttribute('data-gap')).toBe(GRID_DEFAULT_GAP);
    expect(GRID_DEFAULT_GAP).toBe('md');
  });

  it.each([
    ['none'], ['xs'], ['sm'], ['md'], ['lg'], ['xl'], ['2xl'], ['3xl'],
  ] as const)('gap="%s" → data-gap', (key) => {
    const { container } = render(<Grid gap={key}>x</Grid>);
    expect(container.firstElementChild!.getAttribute('data-gap')).toBe(key);
  });
});

describe('Grid · LY-GRID-3 rowGap / columnGap', () => {
  it('emits data-row-gap only when rowGap is set', () => {
    const { container: withoutGap } = render(<Grid>x</Grid>);
    expect(withoutGap.firstElementChild!.hasAttribute('data-row-gap')).toBe(false);

    const { container: withGap } = render(<Grid rowGap="lg">x</Grid>);
    expect(withGap.firstElementChild!.getAttribute('data-row-gap')).toBe('lg');
  });

  it('emits data-column-gap only when columnGap is set', () => {
    const { container: withoutGap } = render(<Grid>x</Grid>);
    expect(withoutGap.firstElementChild!.hasAttribute('data-column-gap')).toBe(false);

    const { container: withGap } = render(<Grid columnGap="xl">x</Grid>);
    expect(withGap.firstElementChild!.getAttribute('data-column-gap')).toBe('xl');
  });

  it('supports rowGap + columnGap + gap together (fine-grained override)', () => {
    const { container } = render(<Grid gap="md" rowGap="sm" columnGap="lg">x</Grid>);
    const el = container.firstElementChild!;
    expect(el.getAttribute('data-gap')).toBe('md');
    expect(el.getAttribute('data-row-gap')).toBe('sm');
    expect(el.getAttribute('data-column-gap')).toBe('lg');
  });
});

// ── LY-GRID-4 · DEV rejection of responsive / invalid values ────────────────

describe('Grid · LY-GRID-4 responsive rejection', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('DEV warns when columns is an object (responsive attempt)', () => {
    // Forced-through via `as unknown` to simulate a user bypassing the
    // TS compile-time rejection of object columns.
    const responsive = { base: 1, md: 2 } as unknown as number;
    render(<Grid columns={responsive}>x</Grid>);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toMatch(/Responsive object values/);
    expect(warnSpy.mock.calls[0]?.[0]).toMatch(/LY-GRID-4/);
  });

  it('DEV warn does NOT set data-columns / CSS var for object values', () => {
    const responsive = { base: 1 } as unknown as number;
    const { container } = render(<Grid columns={responsive}>x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute('data-columns')).toBe(false);
    expect(el.style.getPropertyValue('--prismui-grid-template-columns')).toBe('');
  });
});

describe('Grid · LY-GRID-2 soft range advisory', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it.each([[0], [13], [-1], [1.5]] as const)(
    'DEV warns for out-of-range / non-integer columns=%s',
    (n) => {
      render(<Grid columns={n}>x</Grid>);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0]?.[0]).toMatch(/soft 1–12 integer range/);
    },
  );

  it('does NOT warn for valid in-range integer values', () => {
    render(<Grid columns={6}>x</Grid>);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('Grid · LY-BOX-3 reverse · no padding/margin surface', () => {
  it('does not pollute DOM with padding/margin data-attrs', () => {
    const props = { padding: 'md', margin: 'lg' } as unknown as React.ComponentProps<typeof Grid>;
    const { container } = render(<Grid {...props}>x</Grid>);
    const el = container.firstElementChild!;
    expect(el.hasAttribute('data-padding')).toBe(false);
    expect(el.hasAttribute('data-margin')).toBe(false);
  });
});

describe('Grid · LY-CORE-1 style discipline', () => {
  it('injects ONLY the CSS custom property (no regular style properties)', () => {
    const { container } = render(<Grid columns={4} gap="lg">x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    // The only thing Grid writes to `style` is the CSS custom property.
    // Regular CSS properties (color / display / etc.) must remain untouched.
    expect(el.style.display).toBe('');
    expect(el.style.gridTemplateColumns).toBe('');
    expect(el.style.getPropertyValue('--prismui-grid-template-columns')).toBe(
      'repeat(4, minmax(0, 1fr))',
    );
  });

  it('produces NO inline style when columns is unset', () => {
    const { container } = render(<Grid gap="lg" rowGap="sm">x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    // No user style passed, no columns → style attr should not exist at all.
    expect(el.getAttribute('style')).toBeNull();
  });
});

describe('Grid · LY-CORE-7 user APIs + style merge', () => {
  it('merges user style on top of the CSS custom property', () => {
    const { container } = render(
      <Grid columns={3} style={{ background: 'pink' }}>
        x
      </Grid>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--prismui-grid-template-columns')).toBe(
      'repeat(3, minmax(0, 1fr))',
    );
    expect(el.style.background).toBe('pink');
  });

  it('forwards className / aria-label / id', () => {
    const { container } = render(
      <Grid id="g1" className="app-grid" aria-label="cards">
        x
      </Grid>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.id).toBe('g1');
    expect(el.className).toMatch(/\bapp-grid\b/);
    expect(el.getAttribute('aria-label')).toBe('cards');
  });
});
