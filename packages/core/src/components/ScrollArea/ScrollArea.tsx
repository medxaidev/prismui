'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import classes from './ScrollArea.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover' | 'never';

export interface ScrollAreaProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'dir'> {
  /** Text direction. @default 'ltr' */
  dir?: 'ltr' | 'rtl';

  /** Scrollbar size (width for vertical, height for horizontal). Numbers are treated as px. @default '0.625rem' */
  scrollbarSize?: number | string;

  /**
   * Scrollbar visibility behavior.
   * - `hover` — visible on hover
   * - `scroll` — visible while scrolling
   * - `auto` — always visible when overflowing
   * - `always` — always visible
   * - `never` — always hidden
   * @default 'hover'
   */
  type?: ScrollAreaType;

  /** Delay in ms before hiding scrollbars (for `hover` and `scroll` types). @default 1000 */
  scrollHideDelay?: number;

  /** Which scrollbars to render. @default 'xy' */
  scrollbars?: 'x' | 'y' | 'xy' | false;

  /** Add padding to offset scrollbar width/height so content doesn't overlap. @default false */
  offsetScrollbars?: boolean | 'x' | 'y';

  /** Ref for the viewport (scrollable container) element. */
  viewportRef?: React.Ref<HTMLDivElement>;

  /** Props passed to the viewport element. */
  viewportProps?: React.ComponentPropsWithoutRef<'div'>;

  /** Called when viewport is scrolled with current { x, y } position. */
  onScrollPositionChange?: (position: { x: number; y: number }) => void;

  /** Called when scrolled to the bottom. */
  onBottomReached?: () => void;

  /** Called when scrolled to the top. */
  onTopReached?: () => void;

  /** CSS overscroll-behavior for the viewport. */
  overscrollBehavior?: React.CSSProperties['overscrollBehavior'];
}

export interface ScrollAreaAutosizeProps extends ScrollAreaProps {
  /** Max height before scrolling activates. Required for Autosize. */
  maxHeight?: number | string;

  /** Called when content overflows (becomes scrollable) or stops overflowing. */
  onOverflowChange?: (overflowing: boolean) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveScrollbarSize(size?: number | string): string | undefined {
  if (size === undefined) return undefined;
  if (typeof size === 'number') return `${size}px`;
  return size;
}

function mapTypeToRadix(type: ScrollAreaType): RadixScrollArea.ScrollAreaProps['type'] {
  switch (type) {
    case 'hover': return 'hover';
    case 'scroll': return 'scroll';
    case 'auto': return 'auto';
    case 'always': return 'always';
    case 'never': return 'always'; // We hide via CSS instead
    default: return 'hover';
  }
}

// ---------------------------------------------------------------------------
// ScrollArea Component
// ---------------------------------------------------------------------------

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    {
      children,
      scrollbarSize,
      type = 'hover',
      scrollHideDelay = 1000,
      scrollbars = 'xy',
      offsetScrollbars = false,
      viewportRef,
      viewportProps,
      onScrollPositionChange,
      onBottomReached,
      onTopReached,
      overscrollBehavior,
      className,
      style,
      ...others
    },
    ref,
  ) {
    const resolvedSize = resolveScrollbarSize(scrollbarSize);
    const rootStyle: React.CSSProperties = {
      ...style,
      ...(resolvedSize ? { '--scrollarea-scrollbar-size': resolvedSize } as React.CSSProperties : {}),
      ...(overscrollBehavior ? { overscrollBehavior } : {}),
    };

    const rootClassName = [classes.root, className].filter(Boolean).join(' ');

    const offsetValue = offsetScrollbars === true ? 'xy' : offsetScrollbars || undefined;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      viewportProps?.onScroll?.(e as any);
      const target = e.currentTarget;
      onScrollPositionChange?.({ x: target.scrollLeft, y: target.scrollTop });

      const { scrollTop, scrollHeight, clientHeight } = target;
      // Threshold of -0.8 for sub-pixel rendering in some browsers
      if (scrollTop - (scrollHeight - clientHeight) >= -0.8) {
        onBottomReached?.();
      }
      if (scrollTop === 0) {
        onTopReached?.();
      }
    };

    const showVertical = scrollbars === 'xy' || scrollbars === 'y';
    const showHorizontal = scrollbars === 'xy' || scrollbars === 'x';

    return (
      <RadixScrollArea.Root
        ref={ref}
        type={mapTypeToRadix(type)}
        scrollHideDelay={scrollHideDelay}
        className={rootClassName}
        style={rootStyle}
        {...others}
      >
        <RadixScrollArea.Viewport
          ref={viewportRef}
          className={classes.viewport}
          data-offset-scrollbars={offsetValue}
          data-scrollbars={scrollbars || undefined}
          {...viewportProps}
          onScroll={handleScroll}
        >
          {children}
        </RadixScrollArea.Viewport>

        {showHorizontal && (
          <RadixScrollArea.Scrollbar
            orientation="horizontal"
            className={classes.scrollbar}
            data-hidden={type === 'never' || undefined}
          >
            <RadixScrollArea.Thumb className={classes.thumb} />
          </RadixScrollArea.Scrollbar>
        )}

        {showVertical && (
          <RadixScrollArea.Scrollbar
            orientation="vertical"
            className={classes.scrollbar}
            data-hidden={type === 'never' || undefined}
          >
            <RadixScrollArea.Thumb className={classes.thumb} />
          </RadixScrollArea.Scrollbar>
        )}

        <RadixScrollArea.Corner className={classes.corner} />
      </RadixScrollArea.Root>
    );
  },
) as React.ForwardRefExoticComponent<ScrollAreaProps & React.RefAttributes<HTMLDivElement>> & {
  Autosize: typeof ScrollAreaAutosize;
};

ScrollArea.displayName = '@prismui/core/ScrollArea';

// ---------------------------------------------------------------------------
// ScrollArea.Autosize Component
// ---------------------------------------------------------------------------

export const ScrollAreaAutosize = forwardRef<HTMLDivElement, ScrollAreaAutosizeProps>(
  function ScrollAreaAutosize(
    {
      children,
      maxHeight,
      onOverflowChange,
      style,
      scrollbars,
      ...scrollAreaProps
    },
    ref,
  ) {
    const viewportObserverRef = useRef<HTMLDivElement>(null);
    const [overflowing, setOverflowing] = useState(false);
    const didMount = useRef(false);

    // Merge external viewportRef with our observer ref
    const combinedViewportRef = (node: HTMLDivElement | null) => {
      (viewportObserverRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      const externalRef = scrollAreaProps.viewportRef;
      if (typeof externalRef === 'function') externalRef(node);
      else if (externalRef && typeof externalRef === 'object') {
        (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    useEffect(() => {
      if (!onOverflowChange) return;
      const el = viewportObserverRef.current;
      if (!el) return;

      const update = () => {
        const isOverflowing = el.scrollHeight > el.clientHeight;
        if (isOverflowing !== overflowing) {
          if (didMount.current) {
            onOverflowChange(isOverflowing);
          } else {
            didMount.current = true;
            if (isOverflowing) {
              onOverflowChange(true);
            }
          }
          setOverflowing(isOverflowing);
        }
      };

      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, [onOverflowChange, overflowing]);

    const outerStyle: React.CSSProperties = {
      display: 'flex',
      overflow: 'hidden',
      ...style,
    };

    const innerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden',
      maxHeight: maxHeight,
      ...(scrollbars === 'y' && { minWidth: 0 }),
      ...(scrollbars === 'x' && { minHeight: 0 }),
      ...(scrollbars === 'xy' && { minWidth: 0, minHeight: 0 }),
      ...(scrollbars === false && { minWidth: 0, minHeight: 0 }),
    };

    return (
      <div ref={ref} style={outerStyle}>
        <div style={innerStyle}>
          <ScrollArea
            {...scrollAreaProps}
            scrollbars={scrollbars}
            viewportRef={combinedViewportRef}
          >
            {children}
          </ScrollArea>
        </div>
      </div>
    );
  },
);

ScrollAreaAutosize.displayName = '@prismui/core/ScrollAreaAutosize';

// Attach compound component
(ScrollArea as any).Autosize = ScrollAreaAutosize;
