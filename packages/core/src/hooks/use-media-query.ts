import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseMediaQueryOptions {
  /** Value returned during SSR and before hydration. @default false */
  initialValue?: boolean;
  /** If true, returns `initialValue` and never attaches a listener. @default false */
  disabled?: boolean;
}

/**
 * Subscribe to a CSS media query. SSR-safe.
 *
 * ```ts
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * ```
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {},
): boolean {
  const { initialValue = false, disabled = false } = options;

  const [matches, setMatches] = useState<boolean>(() => {
    if (disabled) return initialValue;
    if (typeof window === 'undefined') return initialValue;
    return window.matchMedia(query).matches;
  });

  const queryRef = useRef(query);
  queryRef.current = query;

  const handleChange = useCallback((e: MediaQueryListEvent) => {
    setMatches(e.matches);
  }, []);

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    const mql = window.matchMedia(queryRef.current);
    setMatches(mql.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [query, disabled, handleChange]);

  return matches;
}
