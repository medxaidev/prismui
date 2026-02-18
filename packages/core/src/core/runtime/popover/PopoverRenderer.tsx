'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Transition } from '../../../components/Transition/Transition';
import { OptionalPortal } from '../../../components/Portal/OptionalPortal';
import { getFloatingCoords } from '../../../components/PopoverBase/positioning';
import { usePopoverController } from './usePopoverController';
import type { PopoverInstance } from './types';
import popoverClasses from '../../../components/Popover/Popover.module.css';
import baseClasses from '../../../components/PopoverBase/PopoverBase.module.css';

// ---------------------------------------------------------------------------
// Single popover instance renderer
// ---------------------------------------------------------------------------

function PopoverInstanceRenderer({
  instance,
  onClose,
}: {
  instance: PopoverInstance;
  onClose: (id: string) => void;
}) {
  const { id, options } = instance;
  const {
    content,
    target,
    position = 'bottom',
    withArrow = true,
    offset = 8,
    closeOnClickOutside = true,
    closeOnEscape = true,
    className,
  } = options;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const positionedRef = useRef(false);

  const effectiveOffset = withArrow ? offset + 6 : offset;

  const updatePosition = useCallback(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown || !target) return;

    const targetRect = target.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();
    const coords = getFloatingCoords(targetRect, dropdownRect, position, effectiveOffset);

    dropdown.style.top = `${coords.top}px`;
    dropdown.style.left = `${coords.left}px`;

    const arrow = arrowRef.current;
    if (arrow) {
      if (coords.arrowLeft !== undefined) arrow.style.left = `${coords.arrowLeft}px`;
      else arrow.style.left = '';
      if (coords.arrowTop !== undefined) arrow.style.top = `${coords.arrowTop}px`;
      else arrow.style.top = '';
    }
  }, [target, position, effectiveOffset]);

  // Scroll/resize listeners
  useEffect(() => {
    const handleUpdate = () => updatePosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);
    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [updatePosition]);

  // Click-outside
  useEffect(() => {
    if (!closeOnClickOutside) return undefined;

    const handleClickOutside = (e: MouseEvent) => {
      const node = e.target as Node;
      const isInsideDropdown = dropdownRef.current?.contains(node);
      const isInsideTarget = target?.contains(node);
      if (!isInsideDropdown && !isInsideTarget) {
        onClose(id);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickOutside, id, onClose, target]);

  // Escape key
  useEffect(() => {
    if (!closeOnEscape) return undefined;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose(id);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, id, onClose]);

  return (
    <OptionalPortal withinPortal>
      <Transition mounted transition="fade" duration={200}>
        {(transitionStyles) => (
          <div
            ref={(node) => {
              (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              if (node && !positionedRef.current) {
                positionedRef.current = true;
                updatePosition();
              }
            }}
            role="dialog"
            className={`${baseClasses.dropdown} ${popoverClasses.dropdown}${className ? ` ${className}` : ''}`}
            style={{ ...transitionStyles, top: 0, left: 0, zIndex: 1400 }}
            data-position={position}
          >
            {content}
            {withArrow && (
              <div
                ref={arrowRef}
                className={`${baseClasses.arrow} ${popoverClasses.arrow}`}
              />
            )}
          </div>
        )}
      </Transition>
    </OptionalPortal>
  );
}

// ---------------------------------------------------------------------------
// PopoverRenderer
// ---------------------------------------------------------------------------

/**
 * Renders programmatic popovers managed by the PopoverController.
 *
 * Place this component once inside your PrismuiProvider tree.
 *
 * @example
 * ```tsx
 * <PrismuiProvider modules={[overlayModule(), popoverModule()]}>
 *   <App />
 *   <PopoverRenderer />
 * </PrismuiProvider>
 * ```
 */
export function PopoverRenderer() {
  const controller = usePopoverController();
  const [popovers, setPopovers] = useState<PopoverInstance[]>([]);

  useEffect(() => {
    setPopovers(controller.getPopovers());

    const unsubscribe = controller.subscribe((next) => {
      setPopovers([...next]);
    });

    return unsubscribe;
  }, [controller]);

  const handleClose = useCallback(
    (id: string) => controller.close(id),
    [controller],
  );

  return (
    <>
      {popovers.map((instance) => (
        <PopoverInstanceRenderer
          key={instance.id}
          instance={instance}
          onClose={handleClose}
        />
      ))}
    </>
  );
}

PopoverRenderer.displayName = '@prismui/core/PopoverRenderer';
