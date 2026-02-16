import { describe, it, expect } from 'vitest';
import { transitions } from './transitions';
import type { PrismuiTransitionName } from './transitions';

// ---------------------------------------------------------------------------
// Transition presets
// ---------------------------------------------------------------------------

describe('transitions — preset registry', () => {
  const allNames: PrismuiTransitionName[] = [
    'top-start', 'top', 'top-end',
    'bottom-start', 'bottom', 'bottom-end',
    'left-start', 'left', 'left-end',
    'right-start', 'right', 'right-end',
    'fade', 'grow', 'zoom',
    'slide-up', 'slide-down', 'slide-left', 'slide-right',
  ];

  it('contains all expected preset names', () => {
    for (const name of allNames) {
      expect(transitions).toHaveProperty(name);
    }
  });

  it('has exactly the expected number of presets', () => {
    expect(Object.keys(transitions)).toHaveLength(allNames.length);
  });

  it.each(allNames)('preset "%s" has required shape', (name) => {
    const preset = transitions[name];
    expect(preset).toHaveProperty('in');
    expect(preset).toHaveProperty('out');
    expect(preset).toHaveProperty('transitionProperty');
    expect(typeof preset.transitionProperty).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// translate3d / scale3d usage (GPU acceleration)
// ---------------------------------------------------------------------------

describe('transitions — GPU-accelerated transforms', () => {
  const placementNames: PrismuiTransitionName[] = [
    'top-start', 'top', 'top-end',
    'bottom-start', 'bottom', 'bottom-end',
    'left-start', 'left', 'left-end',
    'right-start', 'right', 'right-end',
  ];

  it.each(placementNames)('placement "%s" uses translate3d in out state', (name) => {
    const out = transitions[name].out;
    expect((out as any).transform).toContain('translate3d');
  });

  it.each(placementNames)('placement "%s" uses scale3d in out state', (name) => {
    const out = transitions[name].out;
    expect((out as any).transform).toContain('scale3d');
  });

  it.each(placementNames)('placement "%s" uses translate3d(0,0,0) in "in" state', (name) => {
    const inState = transitions[name].in;
    expect((inState as any).transform).toContain('translate3d(0, 0, 0)');
  });

  it('grow uses scale3d', () => {
    expect((transitions.grow.in as any).transform).toContain('scale3d');
    expect((transitions.grow.out as any).transform).toContain('scale3d');
  });

  it('zoom uses scale3d', () => {
    expect((transitions.zoom.in as any).transform).toContain('scale3d');
    expect((transitions.zoom.out as any).transform).toContain('scale3d');
  });

  it('slide-up uses translate3d', () => {
    expect((transitions['slide-up'].out as any).transform).toContain('translate3d');
  });
});

// ---------------------------------------------------------------------------
// Placement transform origins
// ---------------------------------------------------------------------------

describe('transitions — transform origins', () => {
  it('top placements have bottom-* origins', () => {
    expect(transitions['top-start'].common?.transformOrigin).toBe('bottom left');
    expect(transitions.top.common?.transformOrigin).toBe('bottom center');
    expect(transitions['top-end'].common?.transformOrigin).toBe('bottom right');
  });

  it('bottom placements have top-* origins', () => {
    expect(transitions['bottom-start'].common?.transformOrigin).toBe('top left');
    expect(transitions.bottom.common?.transformOrigin).toBe('top center');
    expect(transitions['bottom-end'].common?.transformOrigin).toBe('top right');
  });

  it('left placements have right-* origins', () => {
    expect(transitions['left-start'].common?.transformOrigin).toBe('right top');
    expect(transitions.left.common?.transformOrigin).toBe('right center');
    expect(transitions['left-end'].common?.transformOrigin).toBe('right bottom');
  });

  it('right placements have left-* origins', () => {
    expect(transitions['right-start'].common?.transformOrigin).toBe('left top');
    expect(transitions.right.common?.transformOrigin).toBe('left center');
    expect(transitions['right-end'].common?.transformOrigin).toBe('left bottom');
  });
});

// ---------------------------------------------------------------------------
// Generic effects
// ---------------------------------------------------------------------------

describe('transitions — generic effects', () => {
  it('fade only transitions opacity', () => {
    expect(transitions.fade.transitionProperty).toBe('opacity');
    expect(transitions.fade.in).toEqual({ opacity: 1 });
    expect(transitions.fade.out).toEqual({ opacity: 0 });
    expect(transitions.fade.common).toBeUndefined();
  });

  it('grow scales from 0.75', () => {
    expect((transitions.grow.out as any).transform).toContain('0.75');
    expect(transitions.grow.common?.transformOrigin).toBe('center center');
  });

  it('zoom scales from 0', () => {
    expect((transitions.zoom.out as any).transform).toContain('scale3d(0, 0, 1)');
    expect(transitions.zoom.common?.transformOrigin).toBe('center center');
  });
});
