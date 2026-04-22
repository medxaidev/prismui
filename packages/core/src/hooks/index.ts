// Hooks barrel — first React hook module in PrismUI Core.
// See @/devdocs/hooks/ for design docs of each hook.
// Hook contract (HR-1 ~ HR-8) is currently embodied by useControllableState;
// if/when a third hook is added here, the contract will be promoted to
// @/devdocs/system/hook-contract.md as a first-class document.

export {
  useControllableState,
  type ControllableSetter,
  type UseControllableStateOptions,
} from './use-controllable-state';
