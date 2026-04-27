/**
 * Radio + RadioGroup · public barrel
 *
 * Design reference: `@/devdocs/components/Radio/design.md` v0.2
 *
 * Commit 1 lands RadioGroup foundation only:
 *   - RadioGroup (container with state + roving registry)
 *   - RadioGroupContextValue / RadioGroupItemRecord types
 *
 * Subsequent commits add:
 *   - Commit 2 : Radio child (group consumer · click select · roving tabindex)
 *   - Commit 3 : Arrow-key navigation + Home/End + selection-follows-focus
 *   - Commit 4 : Standalone fallback path (P0-1 A)
 *   - Commit 5 : Field integration (FCP-1~6)
 *   - Commit 6 : Upstream Field.Label delegation upgrade
 *   - Commit 7 : CSS · visual · mode-B 真分轨
 *   - Commit 8 : L4 Feedback integration
 *   - Commit 9 : Invariants helper · DEV warns · TS forbidden props
 *   - Commit 10: Tests + stories + barrel finalisation
 */
export { RadioGroup } from './RadioGroup';
export type {
  RadioGroupProps,
  RadioGroupOwnProps,
  RadioGroupStylesNames,
} from './RadioGroup';

export { Radio, RADIO_DEFAULT_FEEDBACKS } from './Radio';
export type {
  RadioProps,
  RadioOwnProps,
  RadioStylesNames,
} from './Radio';

// Context types — exported as types only (the Context object itself is
// component-local · not part of the public API surface · §10.1).
export type {
  RadioGroupContextValue,
  RadioGroupItemRecord,
} from './RadioGroupContext';

// Test-only reset hook for DEV invariant latches. Production builds
// short-circuit inside the helper — safe to re-export unconditionally.
export { __resetRadioInvariantWarnings } from './radio-invariants';
