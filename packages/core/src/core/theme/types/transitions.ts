// ---------------------------------------------------------------------------
// Transition theme types
// ---------------------------------------------------------------------------

export interface PrismuiTransitionDurations {
  shortest: number;
  shorter: number;
  short: number;
  standard: number;
  complex: number;
  enteringScreen: number;
  leavingScreen: number;
}

export interface PrismuiTransitionEasings {
  easeInOut: string;
  easeOut: string;
  easeIn: string;
  sharp: string;
}

export interface PrismuiTransitions {
  duration: PrismuiTransitionDurations;
  easing: PrismuiTransitionEasings;
}
