import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Transition } from './Transition';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function flushRafs() {
  // Flush double-rAF used by useTransition
  act(() => {
    vi.advanceTimersByTime(0);
  });
  act(() => {
    vi.advanceTimersByTime(0);
  });
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('Transition — basic rendering', () => {
  it('renders children when mounted=true and reduceMotion=true', () => {
    render(
      <Transition mounted reduceMotion>
        {(styles) => <div data-testid="child" style={styles}>Content</div>}
      </Transition>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
    expect(screen.getByTestId('child').textContent).toBe('Content');
  });

  it('does not render children when mounted=false and reduceMotion=true', () => {
    render(
      <Transition mounted={false} reduceMotion>
        {(styles) => <div data-testid="child" style={styles}>Content</div>}
      </Transition>,
    );
    expect(screen.queryByTestId('child')).toBeNull();
  });

  it('renders with display:none when keepMounted=true and mounted=false (reduceMotion)', () => {
    render(
      <Transition mounted={false} keepMounted reduceMotion>
        {(styles) => <div data-testid="child" style={styles}>Content</div>}
      </Transition>,
    );
    const child = screen.getByTestId('child');
    expect(child.style.display).toBe('none');
  });

  it('passes empty styles when reduceMotion=true and mounted=true', () => {
    let receivedStyles: React.CSSProperties = {};
    render(
      <Transition mounted reduceMotion>
        {(styles) => {
          receivedStyles = styles;
          return <div>Test</div>;
        }}
      </Transition>,
    );
    expect(Object.keys(receivedStyles)).toHaveLength(0);
  });

  it('has correct displayName', () => {
    expect(Transition.displayName).toBe('@prismui/core/Transition');
  });
});

// ---------------------------------------------------------------------------
// Transition lifecycle (with animation)
// ---------------------------------------------------------------------------

describe('Transition — lifecycle', () => {
  it('starts in entered state when initially mounted', () => {
    let receivedStyles: React.CSSProperties = {};
    render(
      <Transition mounted duration={300}>
        {(styles) => {
          receivedStyles = styles;
          return <div data-testid="child">Test</div>;
        }}
      </Transition>,
    );
    // Initially mounted → entered → "in" styles
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('unmounts after exit transition completes', () => {
    const { rerender } = render(
      <Transition mounted duration={200} reduceMotion>
        {(styles) => <div data-testid="child" style={styles}>Test</div>}
      </Transition>,
    );

    rerender(
      <Transition mounted={false} duration={200} reduceMotion>
        {(styles) => <div data-testid="child" style={styles}>Test</div>}
      </Transition>,
    );

    // With reduceMotion, should be immediately unmounted
    expect(screen.queryByTestId('child')).toBeNull();
  });

  it('calls onEnter and onEntered callbacks (reduceMotion)', () => {
    const onEnter = vi.fn();
    const onEntered = vi.fn();

    const { rerender } = render(
      <Transition mounted={false} reduceMotion onEnter={onEnter} onEntered={onEntered}>
        {(styles) => <div style={styles}>Test</div>}
      </Transition>,
    );

    rerender(
      <Transition mounted reduceMotion onEnter={onEnter} onEntered={onEntered}>
        {(styles) => <div style={styles}>Test</div>}
      </Transition>,
    );

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEntered).toHaveBeenCalledTimes(1);
  });

  it('calls onExit and onExited callbacks (reduceMotion)', () => {
    const onExit = vi.fn();
    const onExited = vi.fn();

    const { rerender } = render(
      <Transition mounted reduceMotion onExit={onExit} onExited={onExited}>
        {(styles) => <div style={styles}>Test</div>}
      </Transition>,
    );

    rerender(
      <Transition mounted={false} reduceMotion onExit={onExit} onExited={onExited}>
        {(styles) => <div style={styles}>Test</div>}
      </Transition>,
    );

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(onExited).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Transition presets
// ---------------------------------------------------------------------------

describe('Transition — presets', () => {
  it('defaults to fade transition', () => {
    let receivedStyles: React.CSSProperties = {};
    render(
      <Transition mounted duration={300}>
        {(styles) => {
          receivedStyles = styles;
          return <div>Test</div>;
        }}
      </Transition>,
    );
    // Initially mounted → entered → "in" styles with fade
    // The transition styles should include opacity: 1
    expect(receivedStyles.transitionProperty).toBe('opacity');
  });

  it('applies grow transition styles', () => {
    let receivedStyles: React.CSSProperties = {};
    render(
      <Transition mounted transition="grow" duration={300}>
        {(styles) => {
          receivedStyles = styles;
          return <div>Test</div>;
        }}
      </Transition>,
    );
    expect(receivedStyles.transformOrigin).toBe('center center');
    expect(receivedStyles.transitionProperty).toBe('opacity, transform');
  });

  it('applies placement transition styles', () => {
    let receivedStyles: React.CSSProperties = {};
    render(
      <Transition mounted transition="top" duration={300}>
        {(styles) => {
          receivedStyles = styles;
          return <div>Test</div>;
        }}
      </Transition>,
    );
    expect(receivedStyles.transformOrigin).toBe('bottom center');
    expect(receivedStyles.transform).toContain('translate3d(0, 0, 0)');
  });
});

// ---------------------------------------------------------------------------
// Duration and timing
// ---------------------------------------------------------------------------

describe('Transition — duration and timing', () => {
  it('uses default duration of 225ms', () => {
    let receivedStyles: React.CSSProperties = {};
    render(
      <Transition mounted>
        {(styles) => {
          receivedStyles = styles;
          return <div>Test</div>;
        }}
      </Transition>,
    );
    expect(receivedStyles.transitionDuration).toBe('225ms');
  });

  it('uses custom duration', () => {
    let receivedStyles: React.CSSProperties = {};
    render(
      <Transition mounted duration={500}>
        {(styles) => {
          receivedStyles = styles;
          return <div>Test</div>;
        }}
      </Transition>,
    );
    expect(receivedStyles.transitionDuration).toBe('500ms');
  });

  it('uses default timing function', () => {
    let receivedStyles: React.CSSProperties = {};
    render(
      <Transition mounted>
        {(styles) => {
          receivedStyles = styles;
          return <div>Test</div>;
        }}
      </Transition>,
    );
    expect(receivedStyles.transitionTimingFunction).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
  });

  it('uses custom timing function', () => {
    let receivedStyles: React.CSSProperties = {};
    render(
      <Transition mounted timingFunction="ease-in-out">
        {(styles) => {
          receivedStyles = styles;
          return <div>Test</div>;
        }}
      </Transition>,
    );
    expect(receivedStyles.transitionTimingFunction).toBe('ease-in-out');
  });
});

// ---------------------------------------------------------------------------
// Custom transition object
// ---------------------------------------------------------------------------

describe('Transition — custom transition object', () => {
  it('supports custom transition styles', () => {
    const custom = {
      in: { opacity: 1, transform: 'rotate(0deg)' },
      out: { opacity: 0, transform: 'rotate(180deg)' },
      transitionProperty: 'opacity, transform',
    };

    let receivedStyles: React.CSSProperties = {};
    render(
      <Transition mounted transition={custom} duration={300}>
        {(styles) => {
          receivedStyles = styles;
          return <div>Test</div>;
        }}
      </Transition>,
    );
    expect(receivedStyles.opacity).toBe(1);
    expect(receivedStyles.transform).toBe('rotate(0deg)');
  });
});

// ---------------------------------------------------------------------------
// keepMounted
// ---------------------------------------------------------------------------

describe('Transition — keepMounted', () => {
  it('keeps element in DOM with display:none when not mounted (reduceMotion)', () => {
    const { rerender } = render(
      <Transition mounted keepMounted reduceMotion>
        {(styles) => <div data-testid="child" style={styles}>Test</div>}
      </Transition>,
    );

    rerender(
      <Transition mounted={false} keepMounted reduceMotion>
        {(styles) => <div data-testid="child" style={styles}>Test</div>}
      </Transition>,
    );

    const child = screen.getByTestId('child');
    expect(child.style.display).toBe('none');
  });
});
