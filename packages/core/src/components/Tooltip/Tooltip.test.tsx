import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tooltip } from './Tooltip';
import classes from './Tooltip.module.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Use withinPortal={false} and transitionDuration={0} for instant rendering in tests
function renderTooltip(props: Partial<React.ComponentProps<typeof Tooltip>> = {}) {
  return render(
    <Tooltip label="Test tooltip" withinPortal={false} transitionDuration={0} {...props}>
      <button>Hover me</button>
    </Tooltip>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- Rendering ----

  describe('rendering', () => {
    it('renders the target element', () => {
      renderTooltip();
      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    });

    it('does not render tooltip by default', () => {
      renderTooltip();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('renders tooltip on hover', () => {
      renderTooltip();
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('Test tooltip');
    });

    it('hides tooltip on mouse leave', () => {
      renderTooltip();
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      fireEvent.mouseLeave(button);
      // With duration=0 in test env, tooltip should unmount
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('renders tooltip on focus', () => {
      renderTooltip();
      fireEvent.focus(screen.getByRole('button'));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('hides tooltip on blur', () => {
      renderTooltip();
      const button = screen.getByRole('button');
      fireEvent.focus(button);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      fireEvent.blur(button);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('does not render tooltip when label is empty', () => {
      render(
        <Tooltip label="">
          <button>Hover me</button>
        </Tooltip>,
      );
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('does not render tooltip when label is null', () => {
      render(
        <Tooltip label={null as any}>
          <button>Hover me</button>
        </Tooltip>,
      );
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('renders tooltip when label is 0', () => {
      render(
        <Tooltip label={0} withinPortal={false} transitionDuration={0}>
          <button>Hover me</button>
        </Tooltip>,
      );
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('0');
    });
  });

  // ---- Disabled ----

  describe('disabled', () => {
    it('does not show tooltip when disabled', () => {
      renderTooltip({ disabled: true });
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  // ---- Controlled ----

  describe('controlled', () => {
    it('shows tooltip when opened is true', () => {
      renderTooltip({ opened: true });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('hides tooltip when opened is false', () => {
      renderTooltip({ opened: false });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('does not change state on hover when controlled', () => {
      const { rerender } = render(
        <Tooltip label="Test tooltip" opened={false}>
          <button>Hover me</button>
        </Tooltip>,
      );
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  // ---- Delay ----

  describe('delay', () => {
    it('respects openDelay', () => {
      renderTooltip({ openDelay: 300 });
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('respects closeDelay', () => {
      renderTooltip({ closeDelay: 200 });
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.mouseLeave(button);
      // Still visible during delay
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('cancels open timeout on mouse leave', () => {
      renderTooltip({ openDelay: 300 });
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      fireEvent.mouseLeave(button);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  // ---- Position ----

  describe('position', () => {
    it('sets data-position attribute', () => {
      renderTooltip({ position: 'bottom', opened: true });
      expect(screen.getByRole('tooltip')).toHaveAttribute('data-position', 'bottom');
    });

    it('defaults to top position', () => {
      renderTooltip({ opened: true });
      expect(screen.getByRole('tooltip')).toHaveAttribute('data-position', 'top');
    });

    it.each([
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'left', 'left-start', 'left-end',
      'right', 'right-start', 'right-end',
    ] as const)('supports position=%s', (pos) => {
      renderTooltip({ position: pos, opened: true });
      expect(screen.getByRole('tooltip')).toHaveAttribute('data-position', pos);
    });
  });

  // ---- Arrow ----

  describe('arrow', () => {
    it('renders arrow by default', () => {
      renderTooltip({ opened: true });
      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector(`.${classes.arrow}`);
      expect(arrow).toBeInTheDocument();
    });

    it('hides arrow when withArrow is false', () => {
      renderTooltip({ opened: true, withArrow: false });
      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector(`.${classes.arrow}`);
      expect(arrow).not.toBeInTheDocument();
    });
  });

  // ---- Multiline ----

  describe('multiline', () => {
    it('sets data-multiline when multiline is true', () => {
      renderTooltip({ opened: true, multiline: true });
      expect(screen.getByRole('tooltip')).toHaveAttribute('data-multiline');
    });

    it('does not set data-multiline by default', () => {
      renderTooltip({ opened: true });
      expect(screen.getByRole('tooltip')).not.toHaveAttribute('data-multiline');
    });
  });

  // ---- Accessibility ----

  describe('accessibility', () => {
    it('sets aria-describedby on target when opened', () => {
      renderTooltip({ opened: true });
      const button = screen.getByRole('button');
      const tooltip = screen.getByRole('tooltip');
      expect(button).toHaveAttribute('aria-describedby', tooltip.id);
    });

    it('does not set aria-describedby when closed', () => {
      renderTooltip({ opened: false });
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-describedby');
    });

    it('tooltip has role="tooltip"', () => {
      renderTooltip({ opened: true });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  // ---- Events ----

  describe('events', () => {
    it('supports hover-only events', () => {
      renderTooltip({ events: ['hover'] });
      fireEvent.focus(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('supports focus-only events', () => {
      renderTooltip({ events: ['focus'] });
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      fireEvent.focus(screen.getByRole('button'));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('preserves original event handlers on child', () => {
      const onMouseEnter = vi.fn();
      const onFocus = vi.fn();
      render(
        <Tooltip label="Test tooltip">
          <button onMouseEnter={onMouseEnter} onFocus={onFocus}>
            Hover me
          </button>
        </Tooltip>,
      );
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(onMouseEnter).toHaveBeenCalledTimes(1);

      fireEvent.focus(screen.getByRole('button'));
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
  });

  // ---- Custom styling ----

  describe('styling', () => {
    it('applies custom className', () => {
      renderTooltip({ opened: true, className: 'my-tooltip' });
      expect(screen.getByRole('tooltip')).toHaveClass('my-tooltip');
    });

    it('applies custom zIndex via CSS variable', () => {
      renderTooltip({ opened: true, zIndex: 9999 });
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.style.getPropertyValue('--tooltip-z-index')).toBe('9999');
    });

    it('applies custom color via CSS variable', () => {
      renderTooltip({ opened: true, color: 'red' });
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.style.getPropertyValue('--tooltip-bg')).toBe('red');
    });
  });
});
