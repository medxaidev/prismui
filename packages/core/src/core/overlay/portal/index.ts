/**
 * Stage-11 · L0 Overlay Foundation · Portal primitive · public barrel
 *
 * Contract: `@/devdocs/system/portal-primitive.md` §二
 *
 * Public surface (3 exports + types) — `portal-context.ts` is INTERNAL and
 * intentionally not re-exported.
 */

export { Portal } from './Portal';
export type { PortalProps } from './Portal';

export { usePortalContainer } from './usePortalContainer';
export type { UsePortalContainerOptions } from './usePortalContainer';

export { OverlayProvider } from './OverlayProvider';
export type { OverlayProviderProps } from './OverlayProvider';

export type { PortalContainerSource } from './portal-context';
