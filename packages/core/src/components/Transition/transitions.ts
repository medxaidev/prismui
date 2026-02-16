// ---------------------------------------------------------------------------
// Transition preset definitions
// ---------------------------------------------------------------------------
// All transforms use translate3d / scale3d for GPU-accelerated compositing.
// Presets inspired by MUI Minimals tooltip transitions.
// ---------------------------------------------------------------------------

export interface PrismuiTransitionStyles {
  common?: React.CSSProperties;
  in: React.CSSProperties;
  out: React.CSSProperties;
  transitionProperty: React.CSSProperties['transitionProperty'];
}

// ---------------------------------------------------------------------------
// Preset names — placement-based (tooltip/popover), plus generic effects
// ---------------------------------------------------------------------------

export type PrismuiTransitionName =
  // Placement-based (tooltip/popover style)
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'left-start'
  | 'left'
  | 'left-end'
  | 'right-start'
  | 'right'
  | 'right-end'
  // Generic effects
  | 'fade'
  | 'grow'
  | 'zoom'
  // Slide directions
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right';

export type PrismuiTransition = PrismuiTransitionName | PrismuiTransitionStyles;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TRANSLATE_DISTANCE = '12px';

/**
 * Creates a placement-based transition preset.
 * Elements slide in from the direction they are placed relative to the anchor.
 * Uses translate3d for GPU acceleration.
 */
function placementTransition(
  translateOut: string,
  transformOrigin: string,
): PrismuiTransitionStyles {
  return {
    common: { transformOrigin },
    in: { opacity: 1, transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)' },
    out: { opacity: 0, transform: translateOut },
    transitionProperty: 'opacity, transform',
  };
}

// ---------------------------------------------------------------------------
// Preset registry
// ---------------------------------------------------------------------------

export const transitions: Record<PrismuiTransitionName, PrismuiTransitionStyles> = {
  // --- Placement-based transitions (MUI Minimals tooltip style) ---

  // Top placements: element appears above anchor, slides down from above
  'top-start': placementTransition(
    `translate3d(0, ${TRANSLATE_DISTANCE}, 0) scale3d(0.96, 0.96, 1)`,
    'bottom left',
  ),
  top: placementTransition(
    `translate3d(0, ${TRANSLATE_DISTANCE}, 0) scale3d(0.96, 0.96, 1)`,
    'bottom center',
  ),
  'top-end': placementTransition(
    `translate3d(0, ${TRANSLATE_DISTANCE}, 0) scale3d(0.96, 0.96, 1)`,
    'bottom right',
  ),

  // Bottom placements: element appears below anchor, slides up from below
  'bottom-start': placementTransition(
    `translate3d(0, -${TRANSLATE_DISTANCE}, 0) scale3d(0.96, 0.96, 1)`,
    'top left',
  ),
  bottom: placementTransition(
    `translate3d(0, -${TRANSLATE_DISTANCE}, 0) scale3d(0.96, 0.96, 1)`,
    'top center',
  ),
  'bottom-end': placementTransition(
    `translate3d(0, -${TRANSLATE_DISTANCE}, 0) scale3d(0.96, 0.96, 1)`,
    'top right',
  ),

  // Left placements: element appears to the left, slides in from left
  'left-start': placementTransition(
    `translate3d(${TRANSLATE_DISTANCE}, 0, 0) scale3d(0.96, 0.96, 1)`,
    'right top',
  ),
  left: placementTransition(
    `translate3d(${TRANSLATE_DISTANCE}, 0, 0) scale3d(0.96, 0.96, 1)`,
    'right center',
  ),
  'left-end': placementTransition(
    `translate3d(${TRANSLATE_DISTANCE}, 0, 0) scale3d(0.96, 0.96, 1)`,
    'right bottom',
  ),

  // Right placements: element appears to the right, slides in from right
  'right-start': placementTransition(
    `translate3d(-${TRANSLATE_DISTANCE}, 0, 0) scale3d(0.96, 0.96, 1)`,
    'left top',
  ),
  right: placementTransition(
    `translate3d(-${TRANSLATE_DISTANCE}, 0, 0) scale3d(0.96, 0.96, 1)`,
    'left center',
  ),
  'right-end': placementTransition(
    `translate3d(-${TRANSLATE_DISTANCE}, 0, 0) scale3d(0.96, 0.96, 1)`,
    'left bottom',
  ),

  // --- Generic effects ---

  fade: {
    in: { opacity: 1 },
    out: { opacity: 0 },
    transitionProperty: 'opacity',
  },

  grow: {
    common: { transformOrigin: 'center center' },
    in: { opacity: 1, transform: 'scale3d(1, 1, 1)' },
    out: { opacity: 0, transform: 'scale3d(0.75, 0.75, 1)' },
    transitionProperty: 'opacity, transform',
  },

  zoom: {
    common: { transformOrigin: 'center center' },
    in: { opacity: 1, transform: 'scale3d(1, 1, 1)' },
    out: { opacity: 0, transform: 'scale3d(0, 0, 1)' },
    transitionProperty: 'opacity, transform',
  },

  // --- Slide directions (full-distance, for drawers/panels) ---

  'slide-up': {
    common: { transformOrigin: 'bottom center' },
    in: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    out: { opacity: 0, transform: 'translate3d(0, 100%, 0)' },
    transitionProperty: 'opacity, transform',
  },

  'slide-down': {
    common: { transformOrigin: 'top center' },
    in: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    out: { opacity: 0, transform: 'translate3d(0, -100%, 0)' },
    transitionProperty: 'opacity, transform',
  },

  'slide-left': {
    common: { transformOrigin: 'right center' },
    in: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    out: { opacity: 0, transform: 'translate3d(100%, 0, 0)' },
    transitionProperty: 'opacity, transform',
  },

  'slide-right': {
    common: { transformOrigin: 'left center' },
    in: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    out: { opacity: 0, transform: 'translate3d(-100%, 0, 0)' },
    transitionProperty: 'opacity, transform',
  },
};
