'use client';

import React, {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  cloneElement,
  isValidElement,
} from 'react';
import { Transition } from '../Transition/Transition';
import { OptionalPortal } from '../Portal/OptionalPortal';
import classes from './Tooltip.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TooltipPosition =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export interface TooltipProps {
  /** Tooltip content (text or ReactNode). */
  label: React.ReactNode;

  /** Target element that triggers the tooltip. Must be a single React element. */
  children: React.ReactElement;

  /** Tooltip position relative to target. @default 'top' */
  position?: TooltipPosition;

  /** Whether to show an arrow pointing to the target. @default true */
  withArrow?: boolean;

  /** Offset from the target element in px. @default 8 */
  offset?: number;

  /** Delay before showing tooltip in ms. @default 0 */
  openDelay?: number;

  /** Delay before hiding tooltip in ms. @default 0 */
  closeDelay?: number;

  /** Whether the tooltip is disabled. @default false */
  disabled?: boolean;

  /** Whether to allow multiline content. @default false */
  multiline?: boolean;

  /** Custom z-index. @default 1500 */
  zIndex?: number;

  /** Controlled opened state. */
  opened?: boolean;

  /** Whether to render within a portal. @default true */
  withinPortal?: boolean;

  /** Transition duration in ms. @default 150 */
  transitionDuration?: number;

  /** Custom className for the tooltip element. */
  className?: string;

  /** Custom style for the tooltip element. */
  style?: React.CSSProperties;

  /** Tooltip color (CSS color value). */
  color?: string;

  /** aria-label for the tooltip target (if label is not a string). */
  ariaLabel?: string;

  /** Events that trigger the tooltip. @default ['hover', 'focus'] */
  events?: Array<'hover' | 'focus' | 'touch'>;
}

// ---------------------------------------------------------------------------
// Positioning utilities
// ---------------------------------------------------------------------------

interface Coords {
  top: number;
  left: number;
  arrowTop?: number;
  arrowLeft?: number;
}

function getTooltipCoords(
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  position: TooltipPosition,
  offset: number,
): Coords {
  // Target center
  const tCenterX = targetRect.left + targetRect.width / 2;
  const tCenterY = targetRect.top + targetRect.height / 2;

  let top = 0;
  let left = 0;
  let arrowLeft: number | undefined;
  let arrowTop: number | undefined;

  const tooltipHalfW = tooltipRect.width / 2;
  const tooltipHalfH = tooltipRect.height / 2;

  switch (position) {
    // --- Top ---
    case 'top':
      top = targetRect.top - tooltipRect.height - offset;
      left = tCenterX - tooltipHalfW;
      arrowLeft = tooltipHalfW - 4;
      break;
    case 'top-start':
      top = targetRect.top - tooltipRect.height - offset;
      left = targetRect.left;
      arrowLeft = Math.min(targetRect.width / 2, tooltipRect.width - 12) - 4;
      break;
    case 'top-end':
      top = targetRect.top - tooltipRect.height - offset;
      left = targetRect.right - tooltipRect.width;
      arrowLeft = tooltipRect.width - Math.min(targetRect.width / 2, tooltipRect.width - 12) - 4;
      break;

    // --- Bottom ---
    case 'bottom':
      top = targetRect.bottom + offset;
      left = tCenterX - tooltipHalfW;
      arrowLeft = tooltipHalfW - 4;
      break;
    case 'bottom-start':
      top = targetRect.bottom + offset;
      left = targetRect.left;
      arrowLeft = Math.min(targetRect.width / 2, tooltipRect.width - 12) - 4;
      break;
    case 'bottom-end':
      top = targetRect.bottom + offset;
      left = targetRect.right - tooltipRect.width;
      arrowLeft = tooltipRect.width - Math.min(targetRect.width / 2, tooltipRect.width - 12) - 4;
      break;

    // --- Left ---
    case 'left':
      top = tCenterY - tooltipHalfH;
      left = targetRect.left - tooltipRect.width - offset;
      arrowTop = tooltipHalfH - 4;
      break;
    case 'left-start':
      top = targetRect.top;
      left = targetRect.left - tooltipRect.width - offset;
      arrowTop = Math.min(targetRect.height / 2, tooltipRect.height - 12) - 4;
      break;
    case 'left-end':
      top = targetRect.bottom - tooltipRect.height;
      left = targetRect.left - tooltipRect.width - offset;
      arrowTop = tooltipRect.height - Math.min(targetRect.height / 2, tooltipRect.height - 12) - 4;
      break;

    // --- Right ---
    case 'right':
      top = tCenterY - tooltipHalfH;
      left = targetRect.right + offset;
      arrowTop = tooltipHalfH - 4;
      break;
    case 'right-start':
      top = targetRect.top;
      left = targetRect.right + offset;
      arrowTop = Math.min(targetRect.height / 2, tooltipRect.height - 12) - 4;
      break;
    case 'right-end':
      top = targetRect.bottom - tooltipRect.height;
      left = targetRect.right + offset;
      arrowTop = tooltipRect.height - Math.min(targetRect.height / 2, tooltipRect.height - 12) - 4;
      break;
  }

  return { top, left, arrowTop, arrowLeft };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(
    {
      label,
      children,
      position = 'top',
      withArrow = true,
      offset: offsetProp = 8,
      openDelay = 0,
      closeDelay = 0,
      disabled = false,
      multiline = false,
      zIndex,
      opened: controlledOpened,
      withinPortal = true,
      transitionDuration = 225,
      className,
      style,
      color,
      ariaLabel,
      events = ['hover', 'focus'],
    },
    ref,
  ) {
    const [uncontrolledOpened, setUncontrolledOpened] = useState(false);
    const isControlled = controlledOpened !== undefined;
    const opened = isControlled ? controlledOpened : uncontrolledOpened;

    const tooltipId = useId();
    const targetRef = useRef<HTMLElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const arrowRef = useRef<HTMLDivElement>(null);
    const positionedRef = useRef(false);

    // Effective offset includes arrow size
    const effectiveOffset = withArrow ? offsetProp + 4 : offsetProp;

    // Direct DOM mutation for positioning — avoids setState during commit phase
    const updatePosition = useCallback(() => {
      const target = targetRef.current;
      const tooltip = tooltipRef.current;
      if (!target || !tooltip) return;

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const coords = getTooltipCoords(targetRect, tooltipRect, position, effectiveOffset);

      tooltip.style.top = `${coords.top}px`;
      tooltip.style.left = `${coords.left}px`;
      tooltip.style.visibility = 'visible';

      // Position arrow via DOM
      const arrow = arrowRef.current;
      if (arrow) {
        if (coords.arrowLeft !== undefined) arrow.style.left = `${coords.arrowLeft}px`;
        if (coords.arrowTop !== undefined) arrow.style.top = `${coords.arrowTop}px`;
      }
    }, [position, effectiveOffset]);

    // Reset positioned flag when closed; listen to scroll/resize while open
    useEffect(() => {
      if (!opened) {
        positionedRef.current = false;
        return undefined;
      }
      const handleUpdate = () => updatePosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }, [opened, updatePosition]);

    const clearTimeouts = useCallback(() => {
      if (openTimeoutRef.current !== null) {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }
      if (closeTimeoutRef.current !== null) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    }, []);

    const open = useCallback(() => {
      if (disabled || isControlled) return;
      clearTimeouts();
      if (openDelay === 0) {
        setUncontrolledOpened(true);
      } else {
        openTimeoutRef.current = setTimeout(() => {
          setUncontrolledOpened(true);
        }, openDelay);
      }
    }, [disabled, isControlled, openDelay, clearTimeouts]);

    const close = useCallback(() => {
      if (isControlled) return;
      clearTimeouts();
      if (closeDelay === 0) {
        setUncontrolledOpened(false);
      } else {
        closeTimeoutRef.current = setTimeout(() => {
          setUncontrolledOpened(false);
        }, closeDelay);
      }
    }, [isControlled, closeDelay, clearTimeouts]);

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => clearTimeouts();
    }, [clearTimeouts]);

    // Build event handlers for the target element
    const targetEventHandlers: Record<string, React.EventHandler<any>> = {};

    if (events.includes('hover')) {
      targetEventHandlers.onMouseEnter = (e: React.MouseEvent) => {
        open();
        (children as any).props?.onMouseEnter?.(e);
      };
      targetEventHandlers.onMouseLeave = (e: React.MouseEvent) => {
        close();
        (children as any).props?.onMouseLeave?.(e);
      };
    }

    if (events.includes('focus')) {
      targetEventHandlers.onFocus = (e: React.FocusEvent) => {
        open();
        (children as any).props?.onFocus?.(e);
      };
      targetEventHandlers.onBlur = (e: React.FocusEvent) => {
        close();
        (children as any).props?.onBlur?.(e);
      };
    }

    if (events.includes('touch')) {
      targetEventHandlers.onTouchStart = (e: React.TouchEvent) => {
        open();
        (children as any).props?.onTouchStart?.(e);
      };
      targetEventHandlers.onTouchEnd = (e: React.TouchEvent) => {
        close();
        (children as any).props?.onTouchEnd?.(e);
      };
    }

    // Don't render tooltip if label is empty
    if (!label && label !== 0) {
      return <>{children}</>;
    }

    // Clone child to attach ref and event handlers
    const target = isValidElement(children)
      ? cloneElement(children as React.ReactElement<any>, {
        ...targetEventHandlers,
        ref: (node: HTMLElement) => {
          (targetRef as React.MutableRefObject<HTMLElement | null>).current = node;
          // Forward ref from child if it has one
          const childRef = (children as any).ref;
          if (typeof childRef === 'function') childRef(node);
          else if (childRef) (childRef as React.MutableRefObject<HTMLElement | null>).current = node;
        },
        'aria-describedby': opened ? tooltipId : undefined,
      })
      : children;

    const tooltipStyle: React.CSSProperties = {
      ...style,
      top: 0,
      left: 0,
      ...(zIndex !== undefined && { '--tooltip-z-index': zIndex } as any),
      ...(color && { '--tooltip-bg': color } as any),
    };

    return (
      <>
        {target}
        <OptionalPortal withinPortal={withinPortal}>
          <Transition
            mounted={opened && !disabled}
            transition="fade"
            duration={transitionDuration}
          >
            {(transitionStyles) => (
              <div
                ref={(node) => {
                  (tooltipRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                  if (typeof ref === 'function') ref(node);
                  else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                  // Only measure once per open cycle — repeated calls during
                  // animation cause jitter because getBoundingClientRect
                  // returns changing values while scale transition is active.
                  if (node && !positionedRef.current) {
                    positionedRef.current = true;
                    updatePosition();
                  }
                }}
                id={tooltipId}
                role="tooltip"
                className={`${classes.tooltip}${className ? ` ${className}` : ''}`}
                style={{ ...tooltipStyle, ...transitionStyles }}
                data-position={position}
                data-multiline={multiline || undefined}
              >
                {label}
                {withArrow && (
                  <div
                    ref={arrowRef}
                    className={classes.arrow}
                  />
                )}
              </div>
            )}
          </Transition>
        </OptionalPortal>
      </>
    );
  },
);

Tooltip.displayName = '@prismui/core/Tooltip';
