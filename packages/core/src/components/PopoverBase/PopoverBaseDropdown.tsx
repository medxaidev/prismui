'use client';

import React, { forwardRef, useRef, useCallback, useEffect } from 'react';
import { Transition } from '../Transition/Transition';
import { OptionalPortal } from '../Portal/OptionalPortal';
import { usePopoverBaseContext } from './PopoverBase.context';
import { getFloatingCoords } from './positioning';
import type { FloatingCoords } from './positioning';
import classes from './PopoverBase.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PopoverBaseDropdownProps {
  /** Dropdown content. */
  children?: React.ReactNode;

  /** Additional class name. */
  className?: string;

  /** Additional class name for the arrow element. */
  arrowClassName?: string;

  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PopoverBaseDropdown = forwardRef<HTMLDivElement, PopoverBaseDropdownProps>(
  function PopoverBaseDropdown({ children, className, arrowClassName, style }, ref) {
    const ctx = usePopoverBaseContext();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const arrowRef = useRef<HTMLDivElement>(null);
    const positionedRef = useRef(false);

    const effectiveOffset = ctx.withArrow ? ctx.offset + 6 : ctx.offset;

    const updatePosition = useCallback(() => {
      const dropdown = dropdownRef.current;
      if (!dropdown) return;

      // Get target element from context ref
      const target = ctx.getTargetRef();
      if (!target) return;

      const targetRect = target.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();
      const coords: FloatingCoords = getFloatingCoords(
        targetRect,
        dropdownRect,
        ctx.position,
        effectiveOffset,
      );

      dropdown.style.top = `${coords.top}px`;
      dropdown.style.left = `${coords.left}px`;
      // Match target width so dropdown is at least as wide as the trigger
      dropdown.style.minWidth = `${targetRect.width}px`;

      // Position arrow via DOM
      const arrow = arrowRef.current;
      if (arrow) {
        if (coords.arrowLeft !== undefined) arrow.style.left = `${coords.arrowLeft}px`;
        else arrow.style.left = '';
        if (coords.arrowTop !== undefined) arrow.style.top = `${coords.arrowTop}px`;
        else arrow.style.top = '';
      }
    }, [ctx.position, effectiveOffset]); // eslint-disable-line react-hooks/exhaustive-deps — getTargetRef reads a ref

    // Reset positioned flag when closed; listen to scroll/resize while open
    useEffect(() => {
      if (!ctx.opened) {
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
    }, [ctx.opened, updatePosition]);

    const dropdownStyle: React.CSSProperties = {
      ...style,
      top: 0,
      left: 0,
      zIndex: ctx.zIndex || 1400,
    };

    return (
      <OptionalPortal withinPortal={ctx.withinPortal}>
        <Transition
          mounted={ctx.opened && !ctx.disabled}
          transition="fade"
          duration={ctx.transitionDuration}
        >
          {(transitionStyles) => (
            <div
              ref={(node) => {
                (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                ctx.setDropdownRef(node);
                if (typeof ref === 'function') ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                // Measure once per open cycle
                if (node && !positionedRef.current) {
                  positionedRef.current = true;
                  updatePosition();
                }
              }}
              id={ctx.popoverId}
              role="dialog"
              className={`${classes.dropdown}${className ? ` ${className}` : ''}`}
              style={{ ...dropdownStyle, ...transitionStyles }}
              data-position={ctx.position}
            >
              {children}
              {ctx.withArrow && (
                <div
                  ref={arrowRef}
                  className={`${classes.arrow}${arrowClassName ? ` ${arrowClassName}` : ''}`}
                />
              )}
            </div>
          )}
        </Transition>
      </OptionalPortal>
    );
  },
);

PopoverBaseDropdown.displayName = '@prismui/core/PopoverBaseDropdown';
