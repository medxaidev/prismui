import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Grid } from './Grid';
import { GridCol } from './GridCol';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(<PrismuiProvider>{ui}</PrismuiProvider>);
}

function gridRoot(container: HTMLElement) {
  return container.firstElementChild as HTMLElement;
}

function gridInner(container: HTMLElement) {
  return gridRoot(container).firstElementChild as HTMLElement;
}

function cols(container: HTMLElement) {
  return Array.from(gridInner(container).children) as HTMLElement[];
}

// ---------------------------------------------------------------------------
// Grid — basic rendering
// ---------------------------------------------------------------------------

describe('Grid — basic rendering', () => {
  it('renders children inside inner wrapper', () => {
    const { container } = renderWithProvider(
      <Grid>
        <Grid.Col span={6}>A</Grid.Col>
        <Grid.Col span={6}>B</Grid.Col>
      </Grid>,
    );
    expect(gridInner(container)).toBeTruthy();
    expect(cols(container).length).toBe(2);
  });

  it('has correct displayName', () => {
    expect(Grid.displayName).toBe('@prismui/core/Grid');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithProvider(
      <Grid ref={ref}>
        <Grid.Col>test</Grid.Col>
      </Grid>,
    );
    expect(ref.current).toBeTruthy();
    expect(ref.current!.tagName).toBe('DIV');
  });

  it('renders with root class', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col>test</Grid.Col></Grid>,
    );
    expect(gridRoot(container).className).toContain('root');
  });

  it('renders inner with inner class', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col>test</Grid.Col></Grid>,
    );
    expect(gridInner(container).className).toContain('inner');
  });
});

// ---------------------------------------------------------------------------
// Grid — gutter
// ---------------------------------------------------------------------------

describe('Grid — gutter', () => {
  it('sets --grid-gutter for named spacing token', () => {
    const { container } = renderWithProvider(
      <Grid gutter="lg"><Grid.Col>test</Grid.Col></Grid>,
    );
    expect(gridRoot(container).style.getPropertyValue('--grid-gutter')).toBe(
      'var(--prismui-spacing-lg)',
    );
  });

  it('sets --grid-gutter for numeric value', () => {
    const { container } = renderWithProvider(
      <Grid gutter={32}><Grid.Col>test</Grid.Col></Grid>,
    );
    const val = gridRoot(container).style.getPropertyValue('--grid-gutter');
    expect(val).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Grid — justify / align / overflow
// ---------------------------------------------------------------------------

describe('Grid — justify / align / overflow', () => {
  it('sets --grid-justify', () => {
    const { container } = renderWithProvider(
      <Grid justify="center"><Grid.Col>test</Grid.Col></Grid>,
    );
    expect(gridRoot(container).style.getPropertyValue('--grid-justify')).toBe('center');
  });

  it('sets --grid-align', () => {
    const { container } = renderWithProvider(
      <Grid align="flex-end"><Grid.Col>test</Grid.Col></Grid>,
    );
    expect(gridRoot(container).style.getPropertyValue('--grid-align')).toBe('flex-end');
  });

  it('sets --grid-overflow', () => {
    const { container } = renderWithProvider(
      <Grid overflow="hidden"><Grid.Col>test</Grid.Col></Grid>,
    );
    expect(gridRoot(container).style.getPropertyValue('--grid-overflow')).toBe('hidden');
  });
});

// ---------------------------------------------------------------------------
// Grid — static component
// ---------------------------------------------------------------------------

describe('Grid — static component', () => {
  it('exposes Grid.Col', () => {
    expect(Grid.Col).toBe(GridCol);
  });
});

// ---------------------------------------------------------------------------
// Grid.Col — basic rendering
// ---------------------------------------------------------------------------

describe('Grid.Col — basic rendering', () => {
  it('renders with col class', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col>test</Grid.Col></Grid>,
    );
    const col = cols(container)[0];
    expect(col.className).toContain('col');
  });

  it('has correct displayName', () => {
    expect(GridCol.displayName).toBe('@prismui/core/Grid.Col');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithProvider(
      <Grid><Grid.Col ref={ref}>test</Grid.Col></Grid>,
    );
    expect(ref.current).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Grid.Col — span
// ---------------------------------------------------------------------------

describe('Grid.Col — span', () => {
  it('defaults to span=12 (full width)', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col>test</Grid.Col></Grid>,
    );
    const col = cols(container)[0];
    // 12/12 = 100%
    expect(col.style.getPropertyValue('--col-flex-basis')).toBe('100%');
  });

  it('sets correct flex-basis for span=6', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col span={6}>test</Grid.Col></Grid>,
    );
    const col = cols(container)[0];
    expect(col.style.getPropertyValue('--col-flex-basis')).toBe('50%');
  });

  it('sets correct flex-basis for span=4', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col span={4}>test</Grid.Col></Grid>,
    );
    const col = cols(container)[0];
    const val = col.style.getPropertyValue('--col-flex-basis');
    // 4/12 = 33.333...%
    expect(val).toContain('33.3333');
  });

  it('sets correct flex-basis for span=3', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col span={3}>test</Grid.Col></Grid>,
    );
    const col = cols(container)[0];
    expect(col.style.getPropertyValue('--col-flex-basis')).toBe('25%');
  });

  it('handles span="auto"', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col span="auto">test</Grid.Col></Grid>,
    );
    const col = cols(container)[0];
    expect(col.style.getPropertyValue('--col-flex-basis')).toBe('0rem');
    expect(col.style.getPropertyValue('--col-flex-grow')).toBe('1');
    expect(col.style.getPropertyValue('--col-max-width')).toBe('100%');
  });

  it('handles span="content"', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col span="content">test</Grid.Col></Grid>,
    );
    const col = cols(container)[0];
    expect(col.style.getPropertyValue('--col-flex-basis')).toBe('auto');
    expect(col.style.getPropertyValue('--col-width')).toBe('auto');
    expect(col.style.getPropertyValue('--col-max-width')).toBe('unset');
  });
});

// ---------------------------------------------------------------------------
// Grid.Col — offset
// ---------------------------------------------------------------------------

describe('Grid.Col — offset', () => {
  it('sets --col-offset for offset=3', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col offset={3}>test</Grid.Col></Grid>,
    );
    const col = cols(container)[0];
    expect(col.style.getPropertyValue('--col-offset')).toBe('25%');
  });

  it('sets --col-offset to 0 for offset=0', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col offset={0}>test</Grid.Col></Grid>,
    );
    const col = cols(container)[0];
    expect(col.style.getPropertyValue('--col-offset')).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// Grid.Col — order
// ---------------------------------------------------------------------------

describe('Grid.Col — order', () => {
  it('sets --col-order', () => {
    const { container } = renderWithProvider(
      <Grid><Grid.Col order={2}>test</Grid.Col></Grid>,
    );
    const col = cols(container)[0];
    expect(col.style.getPropertyValue('--col-order')).toBe('2');
  });
});

// ---------------------------------------------------------------------------
// Grid — columns prop
// ---------------------------------------------------------------------------

describe('Grid — columns', () => {
  it('uses custom column count for span calculation', () => {
    const { container } = renderWithProvider(
      <Grid columns={24}>
        <Grid.Col span={12}>test</Grid.Col>
      </Grid>,
    );
    const col = cols(container)[0];
    // 12/24 = 50%
    expect(col.style.getPropertyValue('--col-flex-basis')).toBe('50%');
  });

  it('uses custom column count for offset calculation', () => {
    const { container } = renderWithProvider(
      <Grid columns={24}>
        <Grid.Col offset={6}>test</Grid.Col>
      </Grid>,
    );
    const col = cols(container)[0];
    // 6/24 = 25%
    expect(col.style.getPropertyValue('--col-offset')).toBe('25%');
  });
});

// ---------------------------------------------------------------------------
// Grid — grow
// ---------------------------------------------------------------------------

describe('Grid — grow', () => {
  it('sets flex-grow=1 on columns when grow is true', () => {
    const { container } = renderWithProvider(
      <Grid grow>
        <Grid.Col span={4}>A</Grid.Col>
        <Grid.Col span={4}>B</Grid.Col>
      </Grid>,
    );
    const allCols = cols(container);
    allCols.forEach((col) => {
      expect(col.style.getPropertyValue('--col-flex-grow')).toBe('1');
    });
  });

  it('sets max-width=100% on columns when grow is true', () => {
    const { container } = renderWithProvider(
      <Grid grow>
        <Grid.Col span={4}>A</Grid.Col>
      </Grid>,
    );
    const col = cols(container)[0];
    expect(col.style.getPropertyValue('--col-max-width')).toBe('100%');
  });
});

// ---------------------------------------------------------------------------
// Grid — Styles API
// ---------------------------------------------------------------------------

describe('Grid — Styles API', () => {
  it('applies custom className', () => {
    const { container } = renderWithProvider(
      <Grid className="my-grid"><Grid.Col>test</Grid.Col></Grid>,
    );
    expect(gridRoot(container).classList.contains('my-grid')).toBe(true);
  });

  it('passes through data-testid', () => {
    const { container } = renderWithProvider(
      <Grid data-testid="my-grid"><Grid.Col>test</Grid.Col></Grid>,
    );
    expect(gridRoot(container).getAttribute('data-testid')).toBe('my-grid');
  });
});

// ---------------------------------------------------------------------------
// Grid.Col — error without Grid parent
// ---------------------------------------------------------------------------

describe('Grid.Col — error without Grid parent', () => {
  it('throws when used outside Grid', () => {
    expect(() => {
      renderWithProvider(<GridCol>test</GridCol>);
    }).toThrow('Grid.Col must be used within a Grid component');
  });
});
