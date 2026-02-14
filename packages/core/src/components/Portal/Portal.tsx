import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SHARED_NODE_ATTR = 'data-prismui-portal-node';

/**
 * Creates a fresh `<div data-portal>` node, optionally applying
 * className, style, and id from the caller.
 */
function createPortalNode(opts?: {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}): HTMLDivElement {
  const node = document.createElement('div');
  node.setAttribute('data-portal', 'true');

  if (opts?.className) {
    node.classList.add(
      ...opts.className.split(' ').filter(Boolean),
    );
  }
  if (opts?.style) {
    Object.assign(node.style, opts.style);
  }
  if (opts?.id) {
    node.setAttribute('id', opts.id);
  }

  return node;
}

/**
 * SSR-safe useLayoutEffect — falls back to useEffect on the server.
 * In jsdom (tests) and browser, useLayoutEffect runs synchronously
 * after DOM mutations, which is critical for portal node resolution.
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : React.useEffect;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PortalProps {
  /** Portal children — rendered into the target DOM node. */
  children: React.ReactNode;

  /**
   * Target container for the portal.
   * - `HTMLElement` — use that element directly
   * - `string` — treated as a CSS selector (`document.querySelector`)
   * - `() => HTMLElement` — callback evaluated on mount (MUI pattern)
   * - `undefined` — a new `<div>` is created and appended to `document.body`
   *
   * @default document.body (via a created node)
   */
  target?: HTMLElement | string | (() => HTMLElement);

  /**
   * When `true`, children are rendered in-place (no portal).
   * Useful for conditional portal behaviour (MUI `disablePortal`).
   * @default false
   */
  disablePortal?: boolean;

  /**
   * When no explicit `target` is provided, reuse a single shared
   * `<div data-prismui-portal-node>` on `document.body` instead of
   * creating a new node per Portal instance.
   * @default true
   */
  reuseTargetNode?: boolean;

  /** CSS class name applied to the created portal node (ignored when `target` is an element). */
  className?: string;

  /** Inline styles applied to the created portal node (ignored when `target` is an element). */
  style?: React.CSSProperties;

  /** HTML `id` applied to the created portal node (ignored when `target` is an element). */
  id?: string;

  /** Ref forwarded to the resolved portal DOM node. */
  ref?: React.Ref<HTMLElement>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders children into a DOM node outside the parent component hierarchy.
 *
 * Combines patterns from MUI (`disablePortal`, container callback) and
 * Mantine (`data-portal` wrapper node, `reuseTargetNode`, className/style
 * forwarding).
 *
 * - SSR-safe: renders nothing on the server until after mount
 * - Cleans up created nodes on unmount
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
 *
 * <Portal disablePortal>
 *   <div>Rendered in-place</div>
 * </Portal>
 * ```
 */
export const Portal = React.forwardRef<HTMLElement, PortalProps>(
  function Portal(
    {
      children,
      target,
      disablePortal = false,
      reuseTargetNode = true,
      className,
      style,
      id,
    },
    ref,
  ) {
    const [mounted, setMounted] = useState(false);
    const nodeRef = useRef<HTMLElement | null>(null);
    const ownedRef = useRef(false);

    // Assign forwarded ref
    const assignRef = useCallback(
      (node: HTMLElement | null) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref && typeof ref === 'object') {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      [ref],
    );

    // Single layout effect: resolve target node synchronously so
    // createPortal can use it in the same render cycle.
    useIsomorphicLayoutEffect(() => {
      if (disablePortal) return;

      let node: HTMLElement | null = null;
      let owned = false;

      if (target) {
        // Explicit target
        if (typeof target === 'function') {
          node = target();
        } else if (typeof target === 'string') {
          node = document.querySelector<HTMLElement>(target);
        } else {
          node = target;
        }
      } else if (reuseTargetNode) {
        // Shared portal node
        const existing = document.querySelector<HTMLElement>(
          `[${SHARED_NODE_ATTR}]`,
        );
        if (existing) {
          node = existing;
        } else {
          node = createPortalNode({ className, style, id });
          node.setAttribute(SHARED_NODE_ATTR, 'true');
          document.body.appendChild(node);
          // Shared node is NOT removed on unmount
        }
      } else {
        // Unique node per instance
        node = createPortalNode({ className, style, id });
        document.body.appendChild(node);
        owned = true;
      }

      nodeRef.current = node;
      ownedRef.current = owned;
      assignRef(node);
      setMounted(true);

      return () => {
        if (owned && node && node.parentNode) {
          node.parentNode.removeChild(node);
        }
        nodeRef.current = null;
        ownedRef.current = false;
        assignRef(null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, disablePortal, reuseTargetNode]);

    // disablePortal → render in-place
    if (disablePortal) {
      return <>{children}</>;
    }

    // SSR / not yet mounted / target not found
    if (!mounted || !nodeRef.current) {
      return null;
    }

    return createPortal(<>{children}</>, nodeRef.current);
  },
);

Portal.displayName = '@prismui/core/Portal';
