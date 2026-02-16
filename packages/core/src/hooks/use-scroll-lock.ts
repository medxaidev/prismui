import { useEffect, useRef } from 'react';

export interface UseScrollLockOptions {
  /** Whether scroll should be locked */
  enabled: boolean;
}

/**
 * Locks body scroll when enabled.
 * Saves and restores the original `overflow` style on cleanup.
 * Handles nested lock/unlock via a simple counter.
 */

let lockCount = 0;
let originalOverflow = '';

export function useScrollLock({ enabled }: UseScrollLockOptions): void {
  const locked = useRef(false);

  useEffect(() => {
    if (enabled && !locked.current) {
      if (lockCount === 0) {
        originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
      lockCount += 1;
      locked.current = true;
    }

    return () => {
      if (locked.current) {
        lockCount -= 1;
        locked.current = false;
        if (lockCount === 0) {
          document.body.style.overflow = originalOverflow;
        }
      }
    };
  }, [enabled]);
}
