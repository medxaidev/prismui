import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Group } from './Group';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(<PrismuiProvider>{ui}</PrismuiProvider>);
}

function root(container: HTMLElement) {
  return container.firstElementChild as HTMLElement;
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Group — basic rendering', () => {
  it('renders children', () => {
    const { container } = renderWithProvider(
      <Group>
        <span>A</span>
        <span>B</span>
      </Group>,
    );
    expect(root(container).textContent).toBe('AB');
  });

  it('has correct displayName', () => {
    expect(Group.displayName).toBe('@prismui/core/Group');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithProvider(<Group ref={ref}><span>test</span></Group>);
    expect(ref.current).toBeTruthy();
    expect(ref.current!.tagName).toBe('DIV');
  });

  it('renders as flex container', () => {
    const { container } = renderWithProvider(<Group><span>A</span></Group>);
    const el = root(container);
    expect(el.className).toContain('root');
  });
});

// ---------------------------------------------------------------------------
// Falsy children filtering
// ---------------------------------------------------------------------------

describe('Group — falsy children', () => {
  it('filters out null and undefined children', () => {
    const { container } = renderWithProvider(
      <Group>
        {null}
        {undefined}
        <div data-testid="real">Real</div>
      </Group>,
    );
    expect(root(container).children.length).toBe(1);
  });

  it('filters out false children', () => {
    const { container } = renderWithProvider(
      <Group>
        {false}
        <span>A</span>
        <span>B</span>
      </Group>,
    );
    expect(root(container).children.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// grow
// ---------------------------------------------------------------------------

describe('Group — grow', () => {
  it('sets data-grow attribute when grow is true', () => {
    const { container } = renderWithProvider(
      <Group grow><span>A</span></Group>,
    );
    expect(root(container).hasAttribute('data-grow')).toBe(true);
  });

  it('does not set data-grow by default', () => {
    const { container } = renderWithProvider(
      <Group><span>A</span></Group>,
    );
    expect(root(container).hasAttribute('data-grow')).toBe(false);
  });

  it('sets --group-child-width when grow and preventGrowOverflow', () => {
    const { container } = renderWithProvider(
      <Group grow preventGrowOverflow>
        <span>A</span>
        <span>B</span>
      </Group>,
    );
    const style = root(container).style;
    const childWidth = style.getPropertyValue('--group-child-width');
    expect(childWidth).toBeTruthy();
    expect(childWidth).toContain('50%');
  });

  it('does not set --group-child-width when grow is false', () => {
    const { container } = renderWithProvider(
      <Group preventGrowOverflow>
        <span>A</span>
        <span>B</span>
      </Group>,
    );
    const childWidth = root(container).style.getPropertyValue('--group-child-width');
    expect(childWidth).toBe('');
  });
});

// ---------------------------------------------------------------------------
// gap
// ---------------------------------------------------------------------------

describe('Group — gap', () => {
  it('sets --group-gap for named spacing token', () => {
    const { container } = renderWithProvider(
      <Group gap="lg"><span>A</span></Group>,
    );
    expect(root(container).style.getPropertyValue('--group-gap')).toBe(
      'var(--prismui-spacing-lg)',
    );
  });

  it('sets --group-gap for numeric value', () => {
    const { container } = renderWithProvider(
      <Group gap={24}><span>A</span></Group>,
    );
    const val = root(container).style.getPropertyValue('--group-gap');
    expect(val).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// justify / align / wrap
// ---------------------------------------------------------------------------

describe('Group — justify / align / wrap', () => {
  it('sets --group-justify', () => {
    const { container } = renderWithProvider(
      <Group justify="center"><span>A</span></Group>,
    );
    expect(root(container).style.getPropertyValue('--group-justify')).toBe('center');
  });

  it('sets --group-align', () => {
    const { container } = renderWithProvider(
      <Group align="flex-end"><span>A</span></Group>,
    );
    expect(root(container).style.getPropertyValue('--group-align')).toBe('flex-end');
  });

  it('sets --group-wrap', () => {
    const { container } = renderWithProvider(
      <Group wrap="nowrap"><span>A</span></Group>,
    );
    expect(root(container).style.getPropertyValue('--group-wrap')).toBe('nowrap');
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('Group — Styles API', () => {
  it('applies custom className', () => {
    const { container } = renderWithProvider(
      <Group className="my-group"><span>A</span></Group>,
    );
    expect(root(container).classList.contains('my-group')).toBe(true);
  });

  it('applies custom style', () => {
    const { container } = renderWithProvider(
      <Group style={{ marginTop: 10 }}><span>A</span></Group>,
    );
    expect(root(container).style.marginTop).toBe('10px');
  });
});

// ---------------------------------------------------------------------------
// HTML attributes
// ---------------------------------------------------------------------------

describe('Group — HTML attributes', () => {
  it('passes through data-testid', () => {
    const { container } = renderWithProvider(
      <Group data-testid="my-group"><span>A</span></Group>,
    );
    expect(root(container).getAttribute('data-testid')).toBe('my-group');
  });

  it('passes through id', () => {
    const { container } = renderWithProvider(
      <Group id="group-1"><span>A</span></Group>,
    );
    expect(root(container).id).toBe('group-1');
  });
});
