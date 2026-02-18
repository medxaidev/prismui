'use client';

import React, { forwardRef } from 'react';
import { Box } from '../Box';
import type { BoxProps } from '../Box';
import { OptionalPortal } from '../Portal/OptionalPortal';
import { useOverlay } from '../../core/runtime/overlay/useOverlay';
import { useScrollLock } from '../../hooks/use-scroll-lock';
import { useFocusReturn } from '../../hooks/use-focus-return';
import { ModalBaseContext } from './ModalBase.context';
import type { ModalBaseContextValue } from './ModalBase.context';
import type { TransitionOverride } from '../Transition/Transition';
import classes from './ModalBase.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModalBaseProps extends BoxProps {
  /** Whether the modal is currently open. */
  opened: boolean;

  /** Callback to close the modal. */
  onClose: () => void;

  // -- Runtime options ------------------------------------------------------

  /** Whether to trap keyboard focus within the modal content. @default true */
  trapFocus?: boolean;

  /** Whether pressing Escape should close this modal. @default true */
  closeOnEscape?: boolean;

  /** Whether to lock body scroll while this modal is open. @default true */
  lockScroll?: boolean;

  /** Whether to render inside a Portal. @default true */
  withinPortal?: boolean;

  /** Whether clicking outside the content should close the modal. @default true */
  closeOnClickOutside?: boolean;

  // -- Transition -----------------------------------------------------------

  /** Override transition props for subcomponents. */
  transitionProps?: TransitionOverride;

  // -- Styling --------------------------------------------------------------

  /** Override the z-index (otherwise allocated by OverlayManager). */
  zIndex?: number;

  /** Slot for the overlay backdrop (rendered in its own layer behind content). */
  overlaySlot?: React.ReactNode;

  /** Content (rendered in the scrollable content layer above the overlay). */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ModalBase = forwardRef<HTMLDivElement, ModalBaseProps>(
  function ModalBase(props, ref) {
    const {
      opened,
      onClose,
      trapFocus = true,
      closeOnEscape = true,
      lockScroll = true,
      withinPortal = true,
      closeOnClickOutside = true,
      transitionProps,
      zIndex: zIndexProp,
      overlaySlot,
      children,
      className,
      style,
      ...others
    } = props;

    // Register with overlay manager
    const { zIndex: allocatedZIndex, isActive } = useOverlay({
      opened,
      onClose,
      trapFocus,
      closeOnEscape,
      lockScroll,
    });

    // Focus return on close
    useFocusReturn({ opened, shouldReturnFocus: trapFocus });

    // Scroll lock
    useScrollLock({ enabled: opened && lockScroll });

    const finalZIndex = zIndexProp ?? allocatedZIndex;

    // Context for subcomponents
    const ctxValue: ModalBaseContextValue = {
      opened,
      onClose,
      trapFocus,
      closeOnClickOutside,
      zIndex: finalZIndex,
    };

    return (
      <OptionalPortal withinPortal={withinPortal}>
        <ModalBaseContext.Provider value={ctxValue}>
          <Box
            ref={ref}
            className={`${classes.root}${className ? ` ${className}` : ''}`}
            style={{ ...style, zIndex: finalZIndex }}
            data-modal-base=""
            data-active={isActive || undefined}
            {...others}
          >
            {/* Layer 1: overlay backdrop (paints first = behind) */}
            <div className={classes.overlayLayer}>
              {overlaySlot}
            </div>
            {/* Layer 2: scrollable content (paints second = on top) */}
            <div
              className={classes.inner}
              onClick={(e) => {
                if (e.target === e.currentTarget && closeOnClickOutside) {
                  onClose();
                }
              }}
            >
              {children}
            </div>
          </Box>
        </ModalBaseContext.Provider>
      </OptionalPortal>
    );
  },
);

ModalBase.displayName = '@prismui/core/ModalBase';
