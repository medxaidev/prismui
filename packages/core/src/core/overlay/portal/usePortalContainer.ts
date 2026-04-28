/**
 * Stage-11 · L0 Overlay Foundation · Portal · `usePortalContainer` hook
 *
 * Contract: `@/devdocs/system/portal-primitive.md` §2.2 + §三 + §4.2 + §五
 *
 * Resolution order (OV-PORTAL-1 · 3-level cascade):
 *   1. options.container         (caller · highest priority)
 *   2. OverlayProvider.container (context)
 *   3. document.body             (kernel default)
 *
 * Per-level lazy callbacks: callback returning `null` triggers DEV warn and
 * falls through to the next level (per §三 v0.1.1 P1-1 fix · NOT short-circuit
 * to document.body).
 *
 * SSR safety (OV-PORTAL-2 · single-phase mount-effect strategy):
 *   · Returns `null` on server / pre-hydrate / pre-mount.
 *   · Mount effect flips `mounted: false → true` exactly once.
 *   · Post-mount re-render returns the resolved container.
 *
 * No-document safety (P-4): if `globalThis.document` is undefined post-mount,
 * returns `null` instead of throwing.
 */

import { useContext, useEffect, useState } from 'react';

import { PortalContext, type PortalContainerSource } from './portal-context';

export interface UsePortalContainerOptions {
  /** Explicit container override (highest priority · OV-PORTAL-1 level 1). */
  container?: PortalContainerSource;
}

function resolveLevel(
  src: PortalContainerSource | undefined,
): Element | DocumentFragment | null {
  if (src == null) return null;
  return typeof src === 'function' ? src() : src;
}

export function usePortalContainer(
  options?: UsePortalContainerOptions,
): Element | DocumentFragment | null {
  const ctx = useContext(PortalContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Level 1 · explicit options.container.
  const fromOptions = resolveLevel(options?.container);
  if (fromOptions) return fromOptions;
  if (options?.container != null && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      '[PrismUI] usePortalContainer: options.container resolved to null · falling back to OverlayProvider context',
    );
  }

  // Level 2 · OverlayProvider context.
  const fromContext = resolveLevel(ctx.container);
  if (fromContext) return fromContext;
  if (ctx.container != null && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      '[PrismUI] usePortalContainer: OverlayProvider.container resolved to null · falling back to document.body',
    );
  }

  // Level 3 · kernel default. Defensive null guard for non-browser environments (P-4).
  if (typeof document === 'undefined') return null;
  return document.body;
}
