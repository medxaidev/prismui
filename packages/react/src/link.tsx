// ---------------------------------------------------------------------------
// Link — anchor element that navigates via RouterModule
// ---------------------------------------------------------------------------

import React, { useCallback } from 'react';
import type { RouterController } from '@prismui/core';
import { useRuntime } from './use-runtime';

/** Props for the Link component. */
export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Target path. */
  to: string;
  /** Optional state to pass with navigation. */
  state?: unknown;
  /** If true, use replace instead of push. */
  replace?: boolean;
  /** Children elements. */
  children?: React.ReactNode;
}

/**
 * An anchor element that navigates via the Router Module.
 * Prevents default browser navigation and uses router.push() or router.replace().
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({ to, state, replace: useReplace, onClick, children, ...rest }, ref) {
    const runtime = useRuntime();
    const controller = runtime.modules.router as RouterController;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Allow user onClick to run first
        onClick?.(e);

        // Don't intercept if modifier keys are held or default was prevented
        if (e.defaultPrevented) return;
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
        if (e.button !== 0) return; // Only left click

        e.preventDefault();

        if (useReplace) {
          controller.replace(to, state);
        } else {
          controller.push(to, state);
        }
      },
      [controller, to, state, useReplace, onClick],
    );

    return (
      <a ref={ref} href={to} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  },
);
