// Hooks barrel — public React hook modules in PrismUI Core.
// See @/devdocs/hooks/ for design docs of each hook.

export {
  useControllableState,
  type ControllableSetter,
  type UseControllableStateOptions,
} from './use-controllable-state';

// Stage-16 · Phase 3 · responsive client hooks (opt-in · CSS-first stays
// the primary path; these cover imperative/JS branches).
export { useMediaQuery } from './use-media-query';
export { useBreakpoint } from './use-breakpoint';
