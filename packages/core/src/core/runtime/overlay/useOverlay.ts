'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useOverlayManager } from './useOverlayManager';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseOverlayOptions {
  /** Whether the overlay is currently open. */
  opened: boolean;

  /** Callback to close the overlay. */
  onClose: () => void;

  /** Whether to trap keyboard focus within the overlay. @default true */
  trapFocus?: boolean;

  /** Whether pressing Escape should close this overlay. @default true */
  closeOnEscape?: boolean;

  /** Whether to lock body scroll while this overlay is open. @default true */
  lockScroll?: boolean;
}

export interface UseOverlayReturn {
  /** The allocated z-index for this overlay. */
  zIndex: number;

  /** Whether this overlay is the topmost (active) in the stack. */
  isActive: boolean;

  /** The unique id assigned to this overlay instance. */
  overlayId: string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Registers/unregisters an overlay with the OverlayManager based on `opened` state.
 *
 * Returns the allocated z-index and active status for the overlay.
 *
 * @example
 * ```tsx
 * function MyModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
 *   const { zIndex, isActive } = useOverlay({ opened, onClose });
 *   if (!opened) return null;
 *   return <div style={{ zIndex }}>Modal content</div>;
 * }
 * ```
 */
export function useOverlay({
  opened,
  onClose,
  trapFocus = true,
  closeOnEscape = true,
  lockScroll = true,
}: UseOverlayOptions): UseOverlayReturn {
  const manager = useOverlayManager();
  const id = useId();
  const [zIndex, setZIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Keep onClose ref stable to avoid re-registering on every render
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (opened) {
      manager.register({
        id,
        trapFocus,
        closeOnEscape,
        lockScroll,
        onClose: () => onCloseRef.current(),
      });
      setZIndex(manager.getZIndex(id));
      setIsActive(manager.getActive()?.id === id);

      return () => {
        manager.unregister(id);
      };
    } else {
      // Ensure cleanup if opened transitions from true to false
      manager.unregister(id);
      setZIndex(0);
      setIsActive(false);
    }
    return undefined;
  }, [opened, id, trapFocus, closeOnEscape, lockScroll, manager]);

  return {
    zIndex,
    isActive,
    overlayId: id,
  };
}
