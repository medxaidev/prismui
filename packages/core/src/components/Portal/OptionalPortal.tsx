import React from 'react';
import { Portal } from './Portal';
import type { PortalProps } from './Portal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OptionalPortalProps extends PortalProps {
  /**
   * When `true`, children are rendered inside a `<Portal />`.
   * When `false`, children are rendered in-place.
   * @default true
   */
  withinPortal?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Conditionally wraps children in a `<Portal />`.
 *
 * Useful for components like Modal, Popover, Tooltip that need an
 * opt-out mechanism for portal rendering.
 *
 * @example
 * ```tsx
 * <OptionalPortal withinPortal={false}>
 *   <div>Rendered in-place</div>
 * </OptionalPortal>
 *
 * <OptionalPortal withinPortal>
 *   <div>Rendered in portal</div>
 * </OptionalPortal>
 * ```
 */
export const OptionalPortal = React.forwardRef<HTMLElement, OptionalPortalProps>(
  function OptionalPortal(
    { withinPortal = true, children, ...others },
    ref,
  ) {
    if (!withinPortal) {
      return <>{children}</>;
    }

    return (
      <Portal ref={ref} {...others}>
        {children}
      </Portal>
    );
  },
);

OptionalPortal.displayName = '@prismui/core/OptionalPortal';
