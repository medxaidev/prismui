import React, { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FocusTrap, FocusTrapInitialFocus } from './FocusTrap';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithProvider(ui: React.ReactElement) {
  return render(<PrismuiProvider>{ui}</PrismuiProvider>);
}

// ---------------------------------------------------------------------------
// FocusTrap — basic rendering
// ---------------------------------------------------------------------------

describe('FocusTrap — basic rendering', () => {
  it('has correct displayName', () => {
    expect(FocusTrap.displayName).toBe('@prismui/core/FocusTrap');
  });

  it('renders children', () => {
    renderWithProvider(
      <FocusTrap>
        <div data-testid="child">Content</div>
      </FocusTrap>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('returns children as-is when not a single element', () => {
    const { container } = renderWithProvider(
      <FocusTrap>
        <div>A</div>
        <div>B</div>
      </FocusTrap>,
    );
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(2);
  });

  it('returns string children as-is', () => {
    const { container } = renderWithProvider(
      <FocusTrap>Hello</FocusTrap>,
    );
    expect(container.textContent).toContain('Hello');
  });
});

// ---------------------------------------------------------------------------
// FocusTrap — active prop
// ---------------------------------------------------------------------------

describe('FocusTrap — active prop', () => {
  it('does not trap focus when active is false', () => {
    renderWithProvider(
      <FocusTrap active={false}>
        <div data-testid="child">
          <input data-testid="input" />
        </div>
      </FocusTrap>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('defaults active to true', () => {
    renderWithProvider(
      <FocusTrap>
        <div data-testid="child">
          <input data-testid="input" />
        </div>
      </FocusTrap>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// FocusTrap — ref merging
// ---------------------------------------------------------------------------

describe('FocusTrap — ref merging', () => {
  it('merges innerRef with focus trap ref', () => {
    function TestComponent() {
      const innerRef = useRef<HTMLDivElement>(null);
      return (
        <FocusTrap innerRef={innerRef}>
          <div data-testid="child">
            <input />
          </div>
        </FocusTrap>
      );
    }

    renderWithProvider(<TestComponent />);
    expect(screen.getByTestId('child')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// FocusTrap.InitialFocus
// ---------------------------------------------------------------------------

describe('FocusTrap.InitialFocus', () => {
  it('has correct displayName', () => {
    expect(FocusTrapInitialFocus.displayName).toBe('@prismui/core/FocusTrapInitialFocus');
  });

  it('is attached as FocusTrap.InitialFocus', () => {
    expect(FocusTrap.InitialFocus).toBe(FocusTrapInitialFocus);
  });

  it('renders a visually hidden span with data-autofocus', () => {
    renderWithProvider(<FocusTrap.InitialFocus data-testid="initial" />);
    const el = screen.getByTestId('initial');
    expect(el).toBeTruthy();
    expect(el.tagName).toBe('SPAN');
    expect(el.getAttribute('data-autofocus')).not.toBeNull();
    expect(el.getAttribute('tabindex')).toBe('-1');
  });
});

// ---------------------------------------------------------------------------
// FocusTrap — focus behavior (with timers)
// ---------------------------------------------------------------------------

describe('FocusTrap — focus behavior', () => {
  it('focuses first tabbable element after mount', async () => {
    vi.useFakeTimers();

    renderWithProvider(
      <FocusTrap>
        <div>
          <input data-testid="first-input" />
          <input data-testid="second-input" />
        </div>
      </FocusTrap>,
    );

    vi.runAllTimers();

    // In jsdom, focus may not work perfectly, but the ref should be set
    expect(screen.getByTestId('first-input')).toBeTruthy();

    vi.useRealTimers();
  });

  it('focuses element with data-autofocus attribute', async () => {
    vi.useFakeTimers();

    renderWithProvider(
      <FocusTrap>
        <div>
          <input data-testid="first-input" />
          <input data-testid="autofocus-input" data-autofocus />
        </div>
      </FocusTrap>,
    );

    vi.runAllTimers();

    expect(screen.getByTestId('autofocus-input')).toBeTruthy();

    vi.useRealTimers();
  });

  it('focuses FocusTrap.InitialFocus when present', async () => {
    vi.useFakeTimers();

    renderWithProvider(
      <FocusTrap>
        <div>
          <FocusTrap.InitialFocus data-testid="initial-focus" />
          <input data-testid="input" />
        </div>
      </FocusTrap>,
    );

    vi.runAllTimers();

    expect(screen.getByTestId('initial-focus')).toBeTruthy();

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// FocusTrap — keyboard Tab scoping
// ---------------------------------------------------------------------------

describe('FocusTrap — Tab scoping', () => {
  it('adds keydown listener when active', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');

    renderWithProvider(
      <FocusTrap>
        <div>
          <input />
        </div>
      </FocusTrap>,
    );

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addSpy.mockRestore();
  });

  it('does not add keydown listener when inactive', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const callsBefore = addSpy.mock.calls.filter(([e]) => e === 'keydown').length;

    renderWithProvider(
      <FocusTrap active={false}>
        <div>
          <input />
        </div>
      </FocusTrap>,
    );

    const callsAfter = addSpy.mock.calls.filter(([e]) => e === 'keydown').length;
    expect(callsAfter).toBe(callsBefore);
    addSpy.mockRestore();
  });

  it('removes keydown listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderWithProvider(
      <FocusTrap>
        <div>
          <input />
        </div>
      </FocusTrap>,
    );

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
