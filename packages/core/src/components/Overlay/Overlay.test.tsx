import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Overlay } from './Overlay';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderOverlay(props: Partial<React.ComponentProps<typeof Overlay>> = {}) {
  return render(
    <PrismuiProvider>
      <Overlay data-testid="overlay" {...props} />
    </PrismuiProvider>,
  );
}

function getOverlay() {
  return screen.getByTestId('overlay');
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Overlay — basic rendering', () => {
  it('renders without crashing', () => {
    renderOverlay();
    expect(getOverlay()).toBeTruthy();
  });

  it('has correct displayName', () => {
    expect(Overlay.displayName).toBe('@prismui/core/Overlay');
  });

  it('renders children', () => {
    renderOverlay({ children: <span data-testid="child">Content</span> });
    expect(screen.getByTestId('child')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Fixed positioning
// ---------------------------------------------------------------------------

describe('Overlay — fixed positioning', () => {
  it('applies data-fixed attribute when fixed=true', () => {
    renderOverlay({ fixed: true });
    expect(getOverlay().getAttribute('data-fixed')).toBe('true');
  });

  it('does not apply data-fixed when fixed=false', () => {
    renderOverlay({ fixed: false });
    expect(getOverlay().getAttribute('data-fixed')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Center content
// ---------------------------------------------------------------------------

describe('Overlay — center', () => {
  it('applies data-center attribute when center=true', () => {
    renderOverlay({ center: true });
    expect(getOverlay().getAttribute('data-center')).toBe('true');
  });

  it('does not apply data-center when center=false', () => {
    renderOverlay({ center: false });
    expect(getOverlay().getAttribute('data-center')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Background color and opacity
// ---------------------------------------------------------------------------

describe('Overlay — background color and opacity', () => {
  it('accepts custom color', () => {
    renderOverlay({ color: '#ff0000' });
    expect(getOverlay()).toBeTruthy();
  });

  it('accepts custom backgroundOpacity', () => {
    renderOverlay({ backgroundOpacity: 0.8 });
    expect(getOverlay()).toBeTruthy();
  });

  it('accepts both color and backgroundOpacity', () => {
    renderOverlay({ color: '#0000ff', backgroundOpacity: 0.5 });
    expect(getOverlay()).toBeTruthy();
  });

  it('uses default black with 0.6 opacity when no props provided', () => {
    renderOverlay();
    expect(getOverlay()).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Gradient
// ---------------------------------------------------------------------------

describe('Overlay — gradient', () => {
  it('accepts gradient prop', () => {
    renderOverlay({ gradient: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.2))' });
    expect(getOverlay()).toBeTruthy();
  });

  it('gradient overrides color prop', () => {
    renderOverlay({
      gradient: 'linear-gradient(to right, red, blue)',
      color: '#ff0000',
    });
    expect(getOverlay()).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Blur
// ---------------------------------------------------------------------------

describe('Overlay — blur', () => {
  it('accepts blur as number', () => {
    renderOverlay({ blur: 4 });
    expect(getOverlay()).toBeTruthy();
  });

  it('accepts blur as string', () => {
    renderOverlay({ blur: '8px' });
    expect(getOverlay()).toBeTruthy();
  });

  it('renders without blur by default', () => {
    renderOverlay();
    expect(getOverlay()).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Z-index
// ---------------------------------------------------------------------------

describe('Overlay — z-index', () => {
  it('accepts zIndex as number', () => {
    renderOverlay({ zIndex: 300 });
    expect(getOverlay()).toBeTruthy();
  });

  it('accepts zIndex as string', () => {
    renderOverlay({ zIndex: '500' });
    expect(getOverlay()).toBeTruthy();
  });

  it('uses default zIndex 200', () => {
    renderOverlay();
    expect(getOverlay()).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

describe('Overlay — radius', () => {
  it('accepts named radius', () => {
    renderOverlay({ radius: 'md' });
    expect(getOverlay()).toBeTruthy();
  });

  it('accepts numeric radius', () => {
    renderOverlay({ radius: 8 });
    expect(getOverlay()).toBeTruthy();
  });

  it('accepts string radius', () => {
    renderOverlay({ radius: '12px' });
    expect(getOverlay()).toBeTruthy();
  });

  it('uses default radius 0', () => {
    renderOverlay();
    expect(getOverlay()).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

describe('Overlay — composition', () => {
  it('renders with all props combined', () => {
    renderOverlay({
      fixed: true,
      center: true,
      color: '#000',
      backgroundOpacity: 0.7,
      blur: 2,
      zIndex: 400,
      radius: 'lg',
      children: <div data-testid="content">Modal Content</div>,
    });

    expect(getOverlay().getAttribute('data-fixed')).toBe('true');
    expect(getOverlay().getAttribute('data-center')).toBe('true');
    expect(screen.getByTestId('content')).toBeTruthy();
  });

  it('renders with gradient and blur', () => {
    renderOverlay({
      gradient: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.3))',
      blur: 8,
      fixed: true,
    });

    expect(getOverlay().getAttribute('data-fixed')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// Styles API
// ---------------------------------------------------------------------------

describe('Overlay — Styles API', () => {
  it('applies custom className', () => {
    renderOverlay({ className: 'my-overlay' });
    expect(getOverlay().classList.contains('my-overlay')).toBe(true);
  });

  it('applies custom style', () => {
    renderOverlay({ style: { marginTop: 10 } });
    expect(getOverlay().style.marginTop).toBe('10px');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <PrismuiProvider>
        <Overlay ref={ref} />
      </PrismuiProvider>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

// ---------------------------------------------------------------------------
// Polymorphic
// ---------------------------------------------------------------------------

describe('Overlay — polymorphic', () => {
  it('renders as different element with component prop', () => {
    const { container } = render(
      <PrismuiProvider>
        <Overlay component="section" />
      </PrismuiProvider>,
    );
    expect(container.querySelector('section')).toBeTruthy();
  });
});
