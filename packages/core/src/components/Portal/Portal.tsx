import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

export interface PortalProps {
  /** Content to render inside the portal */
  children: ReactNode;

  /** Target DOM element or CSS selector. @default document.body */
  target?: HTMLElement | string;
}

/**
 * Renders children into a DOM node outside the parent component hierarchy.
 *
 * - Default target: `document.body`
 * - Accepts an `HTMLElement` or a CSS selector string
 * - SSR-safe: renders nothing on the server
 *
 * @example
 * ```tsx
 * <Portal>
 *   <div className="modal">Modal content</div>
 * </Portal>
 *
 * <Portal target="#tooltip-root">
 *   <Tooltip />
 * </Portal>
 * ```
 */
export function Portal({ children, target }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (target instanceof HTMLElement) {
    targetRef.current = target;
  } else if (typeof target === 'string') {
    targetRef.current = document.querySelector<HTMLElement>(target);
  } else {
    targetRef.current = document.body;
  }

  if (!targetRef.current) return null;

  return createPortal(children, targetRef.current);
}

Portal.displayName = '@prismui/core/Portal';
