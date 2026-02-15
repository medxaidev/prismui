import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Text } from './Text';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <PrismuiProvider>{ui}</PrismuiProvider>,
  );
}

function getRoot(container: HTMLElement) {
  return container.querySelector('.prismui-Text-root')!;
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Text — basic rendering', () => {
  it('renders a <p> element by default (body1)', () => {
    const { container } = renderWithProvider(<Text>Hello</Text>);
    const root = getRoot(container);
    expect(root.tagName).toBe('P');
    expect(root.textContent).toBe('Hello');
  });

  it('has correct displayName', () => {
    expect(Text.displayName).toBe('@prismui/core/Text');
  });

  it('applies prismui-Text-root class', () => {
    const { container } = renderWithProvider(<Text>Test</Text>);
    const root = getRoot(container);
    expect(root.classList.contains('prismui-Text-root')).toBe(true);
  });

  it('renders children', () => {
    renderWithProvider(<Text>Some text content</Text>);
    expect(screen.getByText('Some text content')).toBeTruthy();
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    renderWithProvider(<Text ref={ref}>Ref test</Text>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('P');
  });
});

// ---------------------------------------------------------------------------
// Typography variants — element mapping
// ---------------------------------------------------------------------------

describe('Text — variant element mapping', () => {
  it('renders <h1> for variant="h1"', () => {
    const { container } = renderWithProvider(<Text variant="h1">Heading 1</Text>);
    expect(getRoot(container).tagName).toBe('H1');
  });

  it('renders <h2> for variant="h2"', () => {
    const { container } = renderWithProvider(<Text variant="h2">Heading 2</Text>);
    expect(getRoot(container).tagName).toBe('H2');
  });

  it('renders <h3> for variant="h3"', () => {
    const { container } = renderWithProvider(<Text variant="h3">Heading 3</Text>);
    expect(getRoot(container).tagName).toBe('H3');
  });

  it('renders <h4> for variant="h4"', () => {
    const { container } = renderWithProvider(<Text variant="h4">Heading 4</Text>);
    expect(getRoot(container).tagName).toBe('H4');
  });

  it('renders <h5> for variant="h5"', () => {
    const { container } = renderWithProvider(<Text variant="h5">Heading 5</Text>);
    expect(getRoot(container).tagName).toBe('H5');
  });

  it('renders <h6> for variant="h6"', () => {
    const { container } = renderWithProvider(<Text variant="h6">Heading 6</Text>);
    expect(getRoot(container).tagName).toBe('H6');
  });

  it('renders <p> for variant="subtitle1"', () => {
    const { container } = renderWithProvider(<Text variant="subtitle1">Sub 1</Text>);
    expect(getRoot(container).tagName).toBe('P');
  });

  it('renders <p> for variant="subtitle2"', () => {
    const { container } = renderWithProvider(<Text variant="subtitle2">Sub 2</Text>);
    expect(getRoot(container).tagName).toBe('P');
  });

  it('renders <p> for variant="body1"', () => {
    const { container } = renderWithProvider(<Text variant="body1">Body 1</Text>);
    expect(getRoot(container).tagName).toBe('P');
  });

  it('renders <p> for variant="body2"', () => {
    const { container } = renderWithProvider(<Text variant="body2">Body 2</Text>);
    expect(getRoot(container).tagName).toBe('P');
  });

  it('renders <span> for variant="caption"', () => {
    const { container } = renderWithProvider(<Text variant="caption">Caption</Text>);
    expect(getRoot(container).tagName).toBe('SPAN');
  });

  it('renders <span> for variant="overline"', () => {
    const { container } = renderWithProvider(<Text variant="overline">Overline</Text>);
    expect(getRoot(container).tagName).toBe('SPAN');
  });
});

// ---------------------------------------------------------------------------
// Typography variants — CSS variables
// ---------------------------------------------------------------------------

describe('Text — variant CSS variables', () => {
  it('sets correct CSS variables for h1', () => {
    const { container } = renderWithProvider(<Text variant="h1">H1</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-fz: 2.5rem');
    expect(style).toContain('--text-fw: 800');
    expect(style).toContain('--text-lh: 1.25');
  });

  it('sets correct CSS variables for h6', () => {
    const { container } = renderWithProvider(<Text variant="h6">H6</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-fz: 1.0625rem');
    expect(style).toContain('--text-fw: 600');
    expect(style).toContain('--text-lh: 1.56');
  });

  it('sets correct CSS variables for body1', () => {
    const { container } = renderWithProvider(<Text variant="body1">Body</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-fz: 1rem');
    expect(style).toContain('--text-fw: 400');
    expect(style).toContain('--text-lh: 1.5');
  });

  it('sets correct CSS variables for subtitle2', () => {
    const { container } = renderWithProvider(<Text variant="subtitle2">Sub2</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-fz: 0.875rem');
    expect(style).toContain('--text-fw: 600');
    expect(style).toContain('--text-lh: 1.57');
  });

  it('sets correct CSS variables for caption', () => {
    const { container } = renderWithProvider(<Text variant="caption">Cap</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-fz: 0.75rem');
    expect(style).toContain('--text-fw: 400');
  });

  it('sets correct CSS variables for overline', () => {
    const { container } = renderWithProvider(<Text variant="overline">Over</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-fz: 0.75rem');
    expect(style).toContain('--text-fw: 700');
  });
});

// ---------------------------------------------------------------------------
// data-variant attribute
// ---------------------------------------------------------------------------

describe('Text — data-variant attribute', () => {
  it('sets data-variant for heading variants', () => {
    const { container } = renderWithProvider(<Text variant="h1">H1</Text>);
    expect(getRoot(container).getAttribute('data-variant')).toBe('h1');
  });

  it('sets data-variant for body variants', () => {
    const { container } = renderWithProvider(<Text variant="body2">Body2</Text>);
    expect(getRoot(container).getAttribute('data-variant')).toBe('body2');
  });

  it('sets data-variant for overline', () => {
    const { container } = renderWithProvider(<Text variant="overline">Over</Text>);
    expect(getRoot(container).getAttribute('data-variant')).toBe('overline');
  });
});

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

describe('Text — color', () => {
  it('sets --text-color for semantic color "primary"', () => {
    const { container } = renderWithProvider(<Text color="primary">Primary</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-color: var(--prismui-primary-main)');
  });

  it('sets --text-color for palette token "text.secondary"', () => {
    const { container } = renderWithProvider(<Text color="text.secondary">Secondary</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-color: var(--prismui-text-secondary)');
  });

  it('sets --text-color for CSS passthrough', () => {
    const { container } = renderWithProvider(<Text color="#ff0000">Red</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-color: #ff0000');
  });

  it('does not set --text-color when color is undefined', () => {
    const { container } = renderWithProvider(<Text>No color</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).not.toContain('--text-color');
  });
});

// ---------------------------------------------------------------------------
// Truncate
// ---------------------------------------------------------------------------

describe('Text — truncate', () => {
  it('sets data-truncate="end" when truncate={true}', () => {
    const { container } = renderWithProvider(<Text truncate>Truncated</Text>);
    expect(getRoot(container).getAttribute('data-truncate')).toBe('end');
  });

  it('sets data-truncate="end" when truncate="end"', () => {
    const { container } = renderWithProvider(<Text truncate="end">Truncated</Text>);
    expect(getRoot(container).getAttribute('data-truncate')).toBe('end');
  });

  it('sets data-truncate="start" when truncate="start"', () => {
    const { container } = renderWithProvider(<Text truncate="start">Truncated</Text>);
    expect(getRoot(container).getAttribute('data-truncate')).toBe('start');
  });

  it('does not set data-truncate when truncate is undefined', () => {
    const { container } = renderWithProvider(<Text>Normal</Text>);
    expect(getRoot(container).hasAttribute('data-truncate')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Line clamp
// ---------------------------------------------------------------------------

describe('Text — lineClamp', () => {
  it('sets data-line-clamp and --text-line-clamp CSS variable', () => {
    const { container } = renderWithProvider(<Text lineClamp={3}>Clamped</Text>);
    const root = getRoot(container);
    expect(root.hasAttribute('data-line-clamp')).toBe(true);
    const style = root.getAttribute('style') ?? '';
    expect(style).toContain('--text-line-clamp: 3');
  });

  it('does not set data-line-clamp when lineClamp is undefined', () => {
    const { container } = renderWithProvider(<Text>Normal</Text>);
    expect(getRoot(container).hasAttribute('data-line-clamp')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Inline
// ---------------------------------------------------------------------------

describe('Text — inline', () => {
  it('sets data-inline when inline={true}', () => {
    const { container } = renderWithProvider(<Text inline>Inline</Text>);
    expect(getRoot(container).hasAttribute('data-inline')).toBe(true);
  });

  it('does not set data-inline when inline is false', () => {
    const { container } = renderWithProvider(<Text>Normal</Text>);
    expect(getRoot(container).hasAttribute('data-inline')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Inherit
// ---------------------------------------------------------------------------

describe('Text — inherit', () => {
  it('sets data-inherit when inherit={true}', () => {
    const { container } = renderWithProvider(<Text inherit>Inherited</Text>);
    expect(getRoot(container).hasAttribute('data-inherit')).toBe(true);
  });

  it('does not set data-inherit by default', () => {
    const { container } = renderWithProvider(<Text>Normal</Text>);
    expect(getRoot(container).hasAttribute('data-inherit')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gutter bottom
// ---------------------------------------------------------------------------

describe('Text — gutterBottom', () => {
  it('sets data-gutter-bottom when gutterBottom={true}', () => {
    const { container } = renderWithProvider(<Text gutterBottom>Gutter</Text>);
    expect(getRoot(container).hasAttribute('data-gutter-bottom')).toBe(true);
  });

  it('does not set data-gutter-bottom by default', () => {
    const { container } = renderWithProvider(<Text>Normal</Text>);
    expect(getRoot(container).hasAttribute('data-gutter-bottom')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gradient
// ---------------------------------------------------------------------------

describe('Text — gradient', () => {
  it('sets data-gradient and --text-gradient CSS variable', () => {
    const { container } = renderWithProvider(
      <Text gradient={{ from: '#ff0000', to: '#0000ff' }}>Gradient</Text>,
    );
    const root = getRoot(container);
    expect(root.hasAttribute('data-gradient')).toBe(true);
    const style = root.getAttribute('style') ?? '';
    expect(style).toContain('--text-gradient: linear-gradient(180deg, #ff0000 0%, #0000ff 100%)');
  });

  it('supports custom deg', () => {
    const { container } = renderWithProvider(
      <Text gradient={{ from: 'red', to: 'blue', deg: 45 }}>Gradient</Text>,
    );
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('linear-gradient(45deg');
  });

  it('does not set data-gradient when gradient is undefined', () => {
    const { container } = renderWithProvider(<Text>Normal</Text>);
    expect(getRoot(container).hasAttribute('data-gradient')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Span shorthand
// ---------------------------------------------------------------------------

describe('Text — span prop', () => {
  it('renders <span> when span={true}', () => {
    const { container } = renderWithProvider(<Text span>Span text</Text>);
    expect(getRoot(container).tagName).toBe('SPAN');
  });

  it('renders <span> even for heading variant when span={true}', () => {
    const { container } = renderWithProvider(<Text variant="h1" span>H1 as span</Text>);
    expect(getRoot(container).tagName).toBe('SPAN');
  });
});

// ---------------------------------------------------------------------------
// Polymorphic
// ---------------------------------------------------------------------------

describe('Text — polymorphic', () => {
  it('renders as <div> with component="div"', () => {
    const { container } = renderWithProvider(
      <Text component="div">Div text</Text>,
    );
    expect(getRoot(container).tagName).toBe('DIV');
  });

  it('renders as <a> with component="a"', () => {
    const { container } = renderWithProvider(
      <Text component="a" href="https://example.com">Link</Text>,
    );
    const root = getRoot(container);
    expect(root.tagName).toBe('A');
    expect(root.getAttribute('href')).toBe('https://example.com');
  });
});

// ---------------------------------------------------------------------------
// Align & textTransform
// ---------------------------------------------------------------------------

describe('Text — align & textTransform', () => {
  it('sets --text-align CSS variable', () => {
    const { container } = renderWithProvider(<Text align="center">Centered</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-align: center');
  });

  it('sets --text-transform CSS variable', () => {
    const { container } = renderWithProvider(<Text textTransform="uppercase">Upper</Text>);
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('--text-transform: uppercase');
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('Text — Styles API', () => {
  it('supports className prop', () => {
    const { container } = renderWithProvider(<Text className="custom-class">Styled</Text>);
    expect(getRoot(container).classList.contains('custom-class')).toBe(true);
  });

  it('supports style prop', () => {
    const { container } = renderWithProvider(
      <Text style={{ marginTop: '10px' }}>Styled</Text>,
    );
    const style = getRoot(container).getAttribute('style') ?? '';
    expect(style).toContain('margin-top: 10px');
  });

  it('passes HTML attributes through', () => {
    const { container } = renderWithProvider(
      <Text id="my-text" data-testid="text-el">Attrs</Text>,
    );
    const root = getRoot(container);
    expect(root.getAttribute('id')).toBe('my-text');
    expect(root.getAttribute('data-testid')).toBe('text-el');
  });
});
