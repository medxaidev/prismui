import { describe, it, expect } from 'vitest';
import { getTransitionStyles } from './get-transition-styles';
import type { TransitionStatus } from '../../hooks/use-transition';

// ---------------------------------------------------------------------------
// getTransitionStyles
// ---------------------------------------------------------------------------

describe('getTransitionStyles', () => {
  const base = {
    duration: 300,
    timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  };

  it('returns "in" styles for entering status', () => {
    const styles = getTransitionStyles({
      transition: 'fade',
      state: 'entering',
      ...base,
    });
    expect(styles).toHaveProperty('opacity', 1);
    expect(styles.transitionDuration).toBe('300ms');
  });

  it('returns "in" styles for entered status', () => {
    const styles = getTransitionStyles({
      transition: 'fade',
      state: 'entered',
      ...base,
    });
    expect(styles).toHaveProperty('opacity', 1);
  });

  it('returns "out" styles for exiting status', () => {
    const styles = getTransitionStyles({
      transition: 'fade',
      state: 'exiting',
      ...base,
    });
    expect(styles).toHaveProperty('opacity', 0);
  });

  it('returns "out" styles for exited status', () => {
    const styles = getTransitionStyles({
      transition: 'fade',
      state: 'exited',
      ...base,
    });
    expect(styles).toHaveProperty('opacity', 0);
  });

  it('returns "out" styles for pre-entering status', () => {
    const styles = getTransitionStyles({
      transition: 'fade',
      state: 'pre-entering',
      ...base,
    });
    expect(styles).toHaveProperty('opacity', 0);
  });

  it('returns "out" styles for pre-exiting status', () => {
    const styles = getTransitionStyles({
      transition: 'fade',
      state: 'pre-exiting',
      ...base,
    });
    expect(styles).toHaveProperty('opacity', 0);
  });

  it('includes transitionDuration and timingFunction', () => {
    const styles = getTransitionStyles({
      transition: 'grow',
      state: 'entering',
      ...base,
    });
    expect(styles.transitionDuration).toBe('300ms');
    expect(styles.transitionTimingFunction).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
  });

  it('includes transitionProperty from preset', () => {
    const styles = getTransitionStyles({
      transition: 'fade',
      state: 'entering',
      ...base,
    });
    expect(styles.transitionProperty).toBe('opacity');
  });

  it('includes common styles (transformOrigin)', () => {
    const styles = getTransitionStyles({
      transition: 'grow',
      state: 'entering',
      ...base,
    });
    expect(styles.transformOrigin).toBe('center center');
  });

  it('includes willChange for GPU hints', () => {
    const styles = getTransitionStyles({
      transition: 'top',
      state: 'entering',
      ...base,
    });
    expect(styles.willChange).toBe('opacity, transform');
  });

  it('returns empty object for unknown string transition', () => {
    const styles = getTransitionStyles({
      transition: 'nonexistent' as any,
      state: 'entering',
      ...base,
    });
    expect(styles).toEqual({});
  });

  it('supports custom transition object', () => {
    const custom = {
      in: { opacity: 1, transform: 'rotate(0deg)' },
      out: { opacity: 0, transform: 'rotate(90deg)' },
      transitionProperty: 'opacity, transform',
    };
    const styles = getTransitionStyles({
      transition: custom,
      state: 'entering',
      ...base,
    });
    expect(styles.opacity).toBe(1);
    expect(styles.transform).toBe('rotate(0deg)');
    expect(styles.transitionProperty).toBe('opacity, transform');
  });

  it('custom transition object uses "out" for exiting', () => {
    const custom = {
      in: { opacity: 1 },
      out: { opacity: 0 },
      transitionProperty: 'opacity',
    };
    const styles = getTransitionStyles({
      transition: custom,
      state: 'exiting',
      ...base,
    });
    expect(styles.opacity).toBe(0);
  });

  it('placement transition includes translate3d in "in" state', () => {
    const styles = getTransitionStyles({
      transition: 'top',
      state: 'entering',
      ...base,
    });
    expect(styles.transform).toContain('translate3d(0, 0, 0)');
  });

  it('placement transition includes translate3d offset in "out" state', () => {
    const styles = getTransitionStyles({
      transition: 'top',
      state: 'exiting',
      ...base,
    });
    expect(styles.transform).toContain('translate3d');
    expect(styles.transform).toContain('12px');
  });
});
