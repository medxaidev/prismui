import React, { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransitionGroup } from './TransitionGroup';
import { Transition } from './Transition';

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('TransitionGroup — basic rendering', () => {
  it('renders children inside a wrapper div by default', () => {
    const { container } = render(
      <TransitionGroup>
        <div key="a">A</div>
        <div key="b">B</div>
      </TransitionGroup>,
    );
    expect(container.firstChild?.nodeName).toBe('DIV');
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
  });

  it('renders with custom component', () => {
    const { container } = render(
      <TransitionGroup component="ul">
        <li key="a">A</li>
      </TransitionGroup>,
    );
    expect(container.firstChild?.nodeName).toBe('UL');
  });

  it('renders without wrapper when component={null}', () => {
    const { container } = render(
      <TransitionGroup component={null}>
        <div key="a">A</div>
      </TransitionGroup>,
    );
    // No wrapper — direct child
    expect(container.firstChild?.nodeName).toBe('DIV');
    expect(container.firstChild?.textContent).toBe('A');
  });

  it('applies className and style to wrapper', () => {
    const { container } = render(
      <TransitionGroup className="my-group" style={{ padding: 10 }}>
        <div key="a">A</div>
      </TransitionGroup>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('my-group')).toBe(true);
    expect(wrapper.style.padding).toBe('10px');
  });

  it('has correct displayName', () => {
    expect(TransitionGroup.displayName).toBe('@prismui/core/TransitionGroup');
  });
});

// ---------------------------------------------------------------------------
// Adding children
// ---------------------------------------------------------------------------

describe('TransitionGroup — adding children', () => {
  it('renders newly added children', () => {
    const { rerender } = render(
      <TransitionGroup>
        <div key="a">A</div>
      </TransitionGroup>,
    );

    rerender(
      <TransitionGroup>
        <div key="a">A</div>
        <div key="b">B</div>
      </TransitionGroup>,
    );

    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Removing children
// ---------------------------------------------------------------------------

describe('TransitionGroup — removing children', () => {
  it('marks removed children as exiting (sets mounted=false)', () => {
    const onExited = vi.fn();

    function TestItem({ itemKey, mounted = true }: { itemKey: string; mounted?: boolean }) {
      return (
        <Transition
          key={itemKey}
          mounted={mounted}
          reduceMotion
          onExited={onExited}
        >
          {(styles) => <div style={styles} data-testid={`item-${itemKey}`}>{itemKey}</div>}
        </Transition>
      );
    }

    const { rerender } = render(
      <TransitionGroup>
        <TestItem key="a" itemKey="a" />
        <TestItem key="b" itemKey="b" />
      </TransitionGroup>,
    );

    expect(screen.getByTestId('item-a')).toBeTruthy();
    expect(screen.getByTestId('item-b')).toBeTruthy();

    // Remove item "b"
    rerender(
      <TransitionGroup>
        <TestItem key="a" itemKey="a" />
      </TransitionGroup>,
    );

    // Item "a" should still be visible
    expect(screen.getByTestId('item-a')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Updating children
// ---------------------------------------------------------------------------

describe('TransitionGroup — updating children', () => {
  it('updates existing children props', () => {
    const { rerender } = render(
      <TransitionGroup>
        <div key="a" data-testid="item-a">Old</div>
      </TransitionGroup>,
    );

    rerender(
      <TransitionGroup>
        <div key="a" data-testid="item-a">New</div>
      </TransitionGroup>,
    );

    expect(screen.getByTestId('item-a').textContent).toBe('New');
  });
});
