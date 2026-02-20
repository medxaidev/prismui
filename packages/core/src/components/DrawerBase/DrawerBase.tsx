'use client';

import React, { forwardRef } from 'react';
import { ModalBase } from '../ModalBase/ModalBase';
import type { ModalBaseProps } from '../ModalBase/ModalBase';
import { ModalBaseOverlay } from '../ModalBase/ModalBaseOverlay';
import { Transition } from '../Transition/Transition';
import type { PrismuiTransitionName } from '../Transition';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { useMergedRef } from '../../hooks/use-merged-ref';
import { useModalBaseContext } from '../ModalBase/ModalBase.context';
import { DrawerBaseContext } from './DrawerBase.context';
import type { DrawerPosition, DrawerBaseContextValue } from './DrawerBase.context';
import classes from './DrawerBase.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DrawerBaseProps extends Omit<ModalBaseProps, 'children' | 'overlaySlot'> {
  /** Which edge the drawer slides from. @default 'right' */
  position?: DrawerPosition;

  /** Drawer width (left/right) or height (top/bottom). Numbers → px. @default 320 */
  size?: number | string;

  /** Overlay background opacity. @default 0.48 */
  overlayOpacity?: number;

  /** Overlay blur. @default 0 */
  overlayBlur?: number | string;

  /** Whether to show the overlay backdrop. @default true */
  withOverlay?: boolean;

  /** Content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Position → slide transition mapping
// ---------------------------------------------------------------------------

const POSITION_TRANSITION: Record<DrawerPosition, PrismuiTransitionName> = {
  left: 'slide-right',
  right: 'slide-left',
  top: 'slide-down',
  bottom: 'slide-up',
};

// ---------------------------------------------------------------------------
// Inner content (needs ModalBase context)
// ---------------------------------------------------------------------------

interface DrawerBaseContentProps {
  position: DrawerPosition;
  size: string;
  children?: React.ReactNode;
  className?: string;
}

const DrawerBaseContent = forwardRef<HTMLDivElement, DrawerBaseContentProps>(
  function DrawerBaseContent({ position, size, children, className }, ref) {
    const modalCtx = useModalBaseContext();
    const trapRef = useFocusTrap(modalCtx.opened && modalCtx.trapFocus);
    const mergedRef = useMergedRef(ref, trapRef);

    return (
      <Transition mounted={modalCtx.opened} transition={POSITION_TRANSITION[position]}>
        {(transitionStyles) => (
          <div
            ref={mergedRef}
            role="dialog"
            aria-modal
            tabIndex={-1}
            className={`${classes.content}${className ? ` ${className}` : ''}`}
            data-position={position}
            style={{
              ...transitionStyles,
              zIndex: modalCtx.zIndex + 1,
              '--drawer-size': size,
            } as React.CSSProperties}
          >
            {children}
          </div>
        )}
      </Transition>
    );
  },
);

DrawerBaseContent.displayName = '@prismui/core/DrawerBaseContent';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const DrawerBase = forwardRef<HTMLDivElement, DrawerBaseProps>(
  function DrawerBase(props, ref) {
    const {
      position = 'right',
      size = 320,
      overlayOpacity = 0.48,
      overlayBlur,
      withOverlay = true,
      children,
      className,
      ...others
    } = props;

    const sizeValue = typeof size === 'number' ? `${size}px` : size;

    const ctxValue: DrawerBaseContextValue = {
      opened: others.opened,
      onClose: others.onClose,
      position,
      closeOnClickOutside: others.closeOnClickOutside ?? true,
      zIndex: 0, // Will be overridden by ModalBase's allocated z-index
    };

    return (
      <DrawerBaseContext.Provider value={ctxValue}>
        <ModalBase
          ref={ref}
          className={className}
          overlaySlot={
            withOverlay ? (
              <ModalBaseOverlay
                backgroundOpacity={overlayOpacity}
                blur={overlayBlur}
              />
            ) : undefined
          }
          {...others}
        >
          <DrawerBaseContent position={position} size={sizeValue}>
            {children}
          </DrawerBaseContent>
        </ModalBase>
      </DrawerBaseContext.Provider>
    );
  },
);

DrawerBase.displayName = '@prismui/core/DrawerBase';
