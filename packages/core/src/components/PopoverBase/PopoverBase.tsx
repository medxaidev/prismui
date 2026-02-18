'use client';

import React, { useState, useRef, useCallback, useEffect, useId } from 'react';
import { useOverlay } from '../../core/runtime/overlay/useOverlay';
import { PopoverBaseContext } from './PopoverBase.context';
import type { PopoverBasePosition, PopoverBaseContextValue } from './PopoverBase.context';
import { PopoverBaseTarget } from './PopoverBaseTarget';
import { PopoverBaseDropdown } from './PopoverBaseDropdown';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PopoverBaseProps {
  /** Popover content (Target + Dropdown). */
  children: React.ReactNode;

  /** Controlled opened state. */
  opened?: boolean;

  /** Callback when popover should close. */
  onClose?: () => void;

  /** Callback when popover should open. */
  onOpen?: () => void;

  /** Callback when popover toggles. */
  onChange?: (opened: boolean) => void;

  /** Popover position relative to target. @default 'bottom' */
  position?: PopoverBasePosition;

  /** Whether to show an arrow. @default false */
  withArrow?: boolean;

  /** Offset from the target element in px. @default 8 */
  offset?: number;

  /** Whether the popover is disabled. @default false */
  disabled?: boolean;

  /** Whether clicking outside should close the popover. @default true */
  closeOnClickOutside?: boolean;

  /** Whether pressing Escape should close the popover. @default true */
  closeOnEscape?: boolean;

  /** Whether to render within a portal. @default true */
  withinPortal?: boolean;

  /** Transition duration in ms. @default 200 */
  transitionDuration?: number;

  /** Override z-index (otherwise allocated by OverlayManager). */
  zIndex?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PopoverBase({
  children,
  opened: controlledOpened,
  onClose: onCloseProp,
  onOpen: onOpenProp,
  onChange,
  position = 'bottom',
  withArrow = false,
  offset = 8,
  disabled = false,
  closeOnClickOutside = true,
  closeOnEscape = true,
  withinPortal = true,
  transitionDuration = 200,
  zIndex: zIndexProp,
}: PopoverBaseProps) {
  const [uncontrolledOpened, setUncontrolledOpened] = useState(false);
  const isControlled = controlledOpened !== undefined;
  const opened = isControlled ? controlledOpened : uncontrolledOpened;

  const popoverId = useId();
  const targetRef = useRef<HTMLElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close handler for OverlayManager
  const handleClose = useCallback(() => {
    if (isControlled) {
      onCloseProp?.();
    } else {
      setUncontrolledOpened(false);
    }
    onChange?.(false);
  }, [isControlled, onCloseProp, onChange]);

  // Register with OverlayManager for z-index + Escape handling
  const { zIndex: allocatedZIndex } = useOverlay({
    opened,
    onClose: handleClose,
    trapFocus: false,
    closeOnEscape,
    lockScroll: false,
  });

  const finalZIndex = zIndexProp ?? allocatedZIndex;

  const onOpen = useCallback(() => {
    if (disabled) return;
    if (isControlled) {
      onOpenProp?.();
    } else {
      setUncontrolledOpened(true);
    }
    onChange?.(true);
  }, [disabled, isControlled, onOpenProp, onChange]);

  const onClose = useCallback(() => {
    if (isControlled) {
      onCloseProp?.();
    } else {
      setUncontrolledOpened(false);
    }
    onChange?.(false);
  }, [isControlled, onCloseProp, onChange]);

  const onToggle = useCallback(() => {
    if (opened) {
      onClose();
    } else {
      onOpen();
    }
  }, [opened, onOpen, onClose]);

  // Click-outside detection
  useEffect(() => {
    if (!opened || !closeOnClickOutside) return undefined;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideTarget = targetRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideTarget && !isInsideDropdown) {
        onClose();
      }
    };

    // Use setTimeout to avoid closing immediately when the click that opened it propagates
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [opened, closeOnClickOutside, onClose]);

  const ctxValue: PopoverBaseContextValue = {
    opened,
    onClose,
    onOpen,
    onToggle,
    zIndex: finalZIndex,
    position,
    withArrow,
    offset,
    setTargetRef: (node) => { targetRef.current = node; },
    setDropdownRef: (node) => { dropdownRef.current = node; },
    popoverId,
    disabled,
    withinPortal,
    transitionDuration,
  };

  return (
    <PopoverBaseContext.Provider value={ctxValue}>
      {children}
    </PopoverBaseContext.Provider>
  );
}

// Attach compound components
PopoverBase.Target = PopoverBaseTarget;
PopoverBase.Dropdown = PopoverBaseDropdown;

PopoverBase.displayName = '@prismui/core/PopoverBase';
