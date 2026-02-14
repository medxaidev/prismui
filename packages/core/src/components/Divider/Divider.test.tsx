import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Divider } from './Divider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(<PrismuiProvider>{ui}</PrismuiProvider>);
}

function root(container: HTMLElement) {
  return container.querySelector('[role="separator"]') as HTMLElement;
}

function labelEl(container: HTMLElement) {
  return container.querySelector('[class*="label"]') as HTMLElement | null;
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Divider — basic rendering', () => {
  it('renders a separator element', () => {
    const { container } = renderWithProvider(<Divider />);
    expect(root(container)).toBeTruthy();
    expect(root(container).getAttribute('role')).toBe('separator');
  });

  it('has correct displayName', () => {
    expect(Divider.displayName).toBe('@prismui/core/Divider');
  });

  it('defaults to horizontal orientation', () => {
    const { container } = renderWithProvider(<Divider />);
    expect(root(container).getAttribute('data-orientation')).toBe('horizontal');
    expect(root(container).getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('renders with horizontal border by default', () => {
    const { container } = renderWithProvider(<Divider />);
    const el = root(container);
    expect(el.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithProvider(<Divider ref={ref} />);
    expect(ref.current).toBeTruthy();
    expect(ref.current!.getAttribute('role')).toBe('separator');
  });
});

// ---------------------------------------------------------------------------
// Orientation
// ---------------------------------------------------------------------------

describe('Divider — orientation', () => {
  it('sets data-orientation="horizontal"', () => {
    const { container } = renderWithProvider(<Divider orientation="horizontal" />);
    expect(root(container).getAttribute('data-orientation')).toBe('horizontal');
  });

  it('sets data-orientation="vertical"', () => {
    const { container } = renderWithProvider(<Divider orientation="vertical" />);
    expect(root(container).getAttribute('data-orientation')).toBe('vertical');
  });

  it('sets aria-orientation for accessibility', () => {
    const { container } = renderWithProvider(<Divider orientation="vertical" />);
    expect(root(container).getAttribute('aria-orientation')).toBe('vertical');
  });
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

describe('Divider — label', () => {
  it('renders label when provided', () => {
    const { container } = renderWithProvider(<Divider label="Section" />);
    const lbl = labelEl(container);
    expect(lbl).toBeTruthy();
    expect(lbl!.textContent).toBe('Section');
  });

  it('sets data-with-label on root when label is present', () => {
    const { container } = renderWithProvider(<Divider label="Test" />);
    expect(root(container).hasAttribute('data-with-label')).toBe(true);
  });

  it('does not set data-with-label when no label', () => {
    const { container } = renderWithProvider(<Divider />);
    expect(root(container).hasAttribute('data-with-label')).toBe(false);
  });

  it('does not render label when orientation is vertical', () => {
    const { container } = renderWithProvider(
      <Divider label="Hidden" orientation="vertical" />,
    );
    expect(labelEl(container)).toBeNull();
    expect(root(container).hasAttribute('data-with-label')).toBe(false);
  });

  it('renders ReactNode as label', () => {
    const { container } = renderWithProvider(
      <Divider label={<strong>Bold Label</strong>} />,
    );
    const lbl = labelEl(container);
    expect(lbl).toBeTruthy();
    expect(lbl!.querySelector('strong')).toBeTruthy();
    expect(lbl!.textContent).toBe('Bold Label');
  });
});

// ---------------------------------------------------------------------------
// Label position
// ---------------------------------------------------------------------------

describe('Divider — labelPosition', () => {
  it('defaults to center (no data-position attribute means center)', () => {
    const { container } = renderWithProvider(<Divider label="Center" />);
    const lbl = labelEl(container);
    expect(lbl!.getAttribute('data-position')).toBe('center');
  });

  it('sets data-position="left"', () => {
    const { container } = renderWithProvider(
      <Divider label="Left" labelPosition="left" />,
    );
    expect(labelEl(container)!.getAttribute('data-position')).toBe('left');
  });

  it('sets data-position="right"', () => {
    const { container } = renderWithProvider(
      <Divider label="Right" labelPosition="right" />,
    );
    expect(labelEl(container)!.getAttribute('data-position')).toBe('right');
  });

  it('labelPosition takes priority over textAlign', () => {
    const { container } = renderWithProvider(
      <Divider label="Priority" labelPosition="left" textAlign="right" />,
    );
    expect(labelEl(container)!.getAttribute('data-position')).toBe('left');
  });

  it('textAlign maps to label position when labelPosition is not set', () => {
    const { container } = renderWithProvider(
      <Divider label="TextAlign" textAlign="right" />,
    );
    expect(labelEl(container)!.getAttribute('data-position')).toBe('right');
  });
});

// ---------------------------------------------------------------------------
// Border style
// ---------------------------------------------------------------------------

describe('Divider — borderStyle', () => {
  it('defaults to solid', () => {
    const { container } = renderWithProvider(<Divider />);
    const el = root(container);
    // varsResolver sets --divider-border-style
    expect(el.style.getPropertyValue('--divider-border-style')).toBe('solid');
  });

  it('sets dashed border style via CSS variable', () => {
    const { container } = renderWithProvider(<Divider borderStyle="dashed" />);
    expect(root(container).style.getPropertyValue('--divider-border-style')).toBe('dashed');
  });

  it('sets dotted border style via CSS variable', () => {
    const { container } = renderWithProvider(<Divider borderStyle="dotted" />);
    expect(root(container).style.getPropertyValue('--divider-border-style')).toBe('dotted');
  });
});

// ---------------------------------------------------------------------------
// Size
// ---------------------------------------------------------------------------

describe('Divider — size', () => {
  it('sets --divider-size for named size', () => {
    const { container } = renderWithProvider(<Divider size="md" />);
    expect(root(container).style.getPropertyValue('--divider-size')).toBe(
      'var(--divider-size-md)',
    );
  });

  it('sets --divider-size for xl', () => {
    const { container } = renderWithProvider(<Divider size="xl" />);
    expect(root(container).style.getPropertyValue('--divider-size')).toBe(
      'var(--divider-size-xl)',
    );
  });
});

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

describe('Divider — color', () => {
  it('does not set --divider-color when no color prop (uses CSS default)', () => {
    const { container } = renderWithProvider(<Divider />);
    // When no color prop, varsResolver returns undefined → no inline var
    const val = root(container).style.getPropertyValue('--divider-color');
    expect(val).toBe('');
  });

  it('sets --divider-color for CSS color value', () => {
    const { container } = renderWithProvider(<Divider color="#ff0000" />);
    const val = root(container).style.getPropertyValue('--divider-color');
    expect(val).toBe('#ff0000');
  });

  it('sets --divider-color for semantic color', () => {
    const { container } = renderWithProvider(<Divider color="primary" />);
    const val = root(container).style.getPropertyValue('--divider-color');
    expect(val).toContain('--prismui-primary-main');
  });
});

// ---------------------------------------------------------------------------
// Variant (MUI: fullWidth / inset / middle)
// ---------------------------------------------------------------------------

describe('Divider — variant (MUI)', () => {
  it('sets data-variant="inset"', () => {
    const { container } = renderWithProvider(<Divider variant="inset" />);
    expect(root(container).getAttribute('data-variant')).toBe('inset');
  });

  it('sets data-variant="middle"', () => {
    const { container } = renderWithProvider(<Divider variant="middle" />);
    expect(root(container).getAttribute('data-variant')).toBe('middle');
  });

  it('sets data-variant="fullWidth"', () => {
    const { container } = renderWithProvider(<Divider variant="fullWidth" />);
    expect(root(container).getAttribute('data-variant')).toBe('fullWidth');
  });
});

// ---------------------------------------------------------------------------
// flexItem (MUI)
// ---------------------------------------------------------------------------

describe('Divider — flexItem', () => {
  it('sets data-flex-item when flexItem is true', () => {
    const { container } = renderWithProvider(<Divider flexItem />);
    expect(root(container).hasAttribute('data-flex-item')).toBe(true);
  });

  it('does not set data-flex-item by default', () => {
    const { container } = renderWithProvider(<Divider />);
    expect(root(container).hasAttribute('data-flex-item')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('Divider — Styles API', () => {
  it('applies custom className', () => {
    const { container } = renderWithProvider(
      <Divider className="my-divider" />,
    );
    expect(root(container).classList.contains('my-divider')).toBe(true);
  });

  it('applies custom style', () => {
    const { container } = renderWithProvider(
      <Divider style={{ marginTop: 20 }} />,
    );
    expect(root(container).style.marginTop).toBe('20px');
  });

  it('applies classNames to selectors', () => {
    const { container } = renderWithProvider(
      <Divider
        label="Styled"
        classNames={{ root: 'custom-root', label: 'custom-label' }}
      />,
    );
    expect(root(container).classList.contains('custom-root')).toBe(true);
    expect(labelEl(container)!.classList.contains('custom-label')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// HTML attributes passthrough
// ---------------------------------------------------------------------------

describe('Divider — HTML attributes', () => {
  it('passes through data-testid', () => {
    const { container } = renderWithProvider(
      <Divider data-testid="my-divider" />,
    );
    expect(root(container).getAttribute('data-testid')).toBe('my-divider');
  });

  it('passes through id', () => {
    const { container } = renderWithProvider(<Divider id="divider-1" />);
    expect(root(container).id).toBe('divider-1');
  });
});
