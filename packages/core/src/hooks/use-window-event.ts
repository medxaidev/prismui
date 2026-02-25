import { useEffect } from 'react';

/**
 * Attach an event listener to `window`. SSR-safe — no-ops when `window` is undefined.
 */
export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener(type, listener, options);
    return () => window.removeEventListener(type, listener, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, listener]);
}
