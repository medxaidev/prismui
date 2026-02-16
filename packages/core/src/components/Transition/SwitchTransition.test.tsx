import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SwitchTransition } from './SwitchTransition';
import { Transition } from './Transition';

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('SwitchTransition — basic rendering', () => {
  it('renders the current child', () => {
    render(
      <SwitchTransition>
        <Transition key="a" mounted reduceMotion>
          {(styles) => <div style={styles} data-testid="child-a">A</div>}
        </Transition>
      </SwitchTransition>,
    );
    expect(screen.getByTestId('child-a')).toBeTruthy();
    expect(screen.getByTestId('child-a').textContent).toBe('A');
  });

  it('has correct displayName', () => {
    expect(SwitchTransition.displayName).toBe('@prismui/core/SwitchTransition');
  });
});

// ---------------------------------------------------------------------------
// out-in mode (default)
// ---------------------------------------------------------------------------

describe('SwitchTransition — out-in mode', () => {
  it('defaults to out-in mode', () => {
    const { rerender } = render(
      <SwitchTransition>
        <Transition key="a" mounted reduceMotion>
          {(styles) => <div style={styles} data-testid="child-a">A</div>}
        </Transition>
      </SwitchTransition>,
    );

    // Switching key triggers transition
    rerender(
      <SwitchTransition>
        <Transition key="b" mounted reduceMotion>
          {(styles) => <div style={styles} data-testid="child-b">B</div>}
        </Transition>
      </SwitchTransition>,
    );

    // In out-in mode with reduceMotion, the old exits immediately,
    // then the new enters. Eventually child-b should be visible.
    // The exact intermediate states depend on timing, but the final
    // state should show child-b.
  });

  it('renders same key child when key does not change', () => {
    const { rerender } = render(
      <SwitchTransition>
        <Transition key="a" mounted reduceMotion>
          {(styles) => <div style={styles} data-testid="child-a">A1</div>}
        </Transition>
      </SwitchTransition>,
    );

    rerender(
      <SwitchTransition>
        <Transition key="a" mounted reduceMotion>
          {(styles) => <div style={styles} data-testid="child-a">A2</div>}
        </Transition>
      </SwitchTransition>,
    );

    // Same key — should update content without transition
    expect(screen.getByTestId('child-a').textContent).toBe('A2');
  });
});

// ---------------------------------------------------------------------------
// in-out mode
// ---------------------------------------------------------------------------

describe('SwitchTransition — in-out mode', () => {
  it('accepts mode="in-out"', () => {
    render(
      <SwitchTransition mode="in-out">
        <Transition key="a" mounted reduceMotion>
          {(styles) => <div style={styles} data-testid="child-a">A</div>}
        </Transition>
      </SwitchTransition>,
    );
    expect(screen.getByTestId('child-a')).toBeTruthy();
  });
});
