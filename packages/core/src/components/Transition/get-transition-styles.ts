import type { TransitionStatus } from '../../hooks/use-transition';
import type { PrismuiTransition } from './transitions';
import { transitions } from './transitions';

// ---------------------------------------------------------------------------
// Status → style-key mapping
// ---------------------------------------------------------------------------

const transitionStatuses = {
  entering: 'in',
  entered: 'in',
  exiting: 'out',
  exited: 'out',
  'pre-exiting': 'out',
  'pre-entering': 'out',
} as const;

// ---------------------------------------------------------------------------
// getTransitionStyles
// ---------------------------------------------------------------------------

export function getTransitionStyles({
  transition,
  state,
  duration,
  timingFunction,
}: {
  transition: PrismuiTransition;
  state: TransitionStatus;
  duration: number;
  timingFunction: string;
}): React.CSSProperties {
  const shared: React.CSSProperties = {
    WebkitBackfaceVisibility: 'hidden',
    willChange: 'opacity, transform',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: timingFunction,
  };

  if (typeof transition === 'string') {
    if (!(transition in transitions)) {
      return {};
    }

    const preset = transitions[transition];
    return {
      transitionProperty: preset.transitionProperty,
      ...shared,
      ...preset.common,
      ...preset[transitionStatuses[state]],
    };
  }

  // Custom transition object
  return {
    transitionProperty: transition.transitionProperty,
    ...shared,
    ...transition.common,
    ...transition[transitionStatuses[state]],
  };
}
