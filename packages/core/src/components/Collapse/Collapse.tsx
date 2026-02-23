'use client';

import React, { forwardRef } from 'react';
import { useCollapse } from '../../hooks/use-collapse';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollapseProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Whether the content is expanded (visible). */
  opened: boolean;

  /** Transition duration in ms. If not set, auto-calculated from content height. @default 200 */
  transitionDuration?: number;

  /** CSS transition timing function. @default 'ease' */
  transitionTimingFunction?: string;

  /** Whether to animate opacity alongside height. @default true */
  animateOpacity?: boolean;

  /** Keep element in DOM when collapsed (height: 0 instead of display: none). @default false */
  keepMounted?: boolean;

  /** Called when the open/close transition ends. */
  onTransitionEnd?: () => void;

  /** Collapse orientation. @default 'vertical' */
  orientation?: 'vertical' | 'horizontal';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(
  function Collapse(
    {
      children,
      opened,
      transitionDuration = 200,
      transitionTimingFunction = 'ease',
      animateOpacity = true,
      keepMounted = false,
      onTransitionEnd,
      orientation = 'vertical',
      style,
      ...others
    },
    ref,
  ) {
    const getCollapseProps = useCollapse({
      opened,
      transitionDuration,
      transitionTimingFunction,
      onTransitionEnd,
      keepMounted,
      orientation,
    });

    // When duration is 0, skip animation entirely
    if (transitionDuration === 0) {
      if (!opened && !keepMounted) return null;
      return (
        <div
          ref={ref}
          style={{
            ...style,
            ...(opened ? {} : { overflow: 'hidden', [orientation === 'vertical' ? 'height' : 'width']: 0 }),
          }}
          aria-hidden={!opened}
          {...others}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        {...getCollapseProps({
          style: {
            opacity: opened || !animateOpacity ? 1 : 0,
            transition: animateOpacity
              ? `opacity ${transitionDuration}ms ${transitionTimingFunction}`
              : 'none',
            ...style,
          },
          ref,
          ...others,
        })}
      >
        {children}
      </div>
    );
  },
);

Collapse.displayName = '@prismui/core/Collapse';
