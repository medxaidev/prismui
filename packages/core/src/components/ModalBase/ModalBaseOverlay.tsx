'use client';

import React, { forwardRef } from 'react';
import { Overlay } from '../Overlay/Overlay';
import { Transition } from '../Transition/Transition';
import { useModalBaseContext } from './ModalBase.context';
import type { PrismuiRadius } from '../../core/theme/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModalBaseOverlayProps {
  /** Additional class name. */
  className?: string;

  /** Additional inline styles. */
  style?: React.CSSProperties;

  /** Click handler for the overlay. */
  onClick?: React.MouseEventHandler<HTMLDivElement>;

  /** Overlay background-color opacity 0–1 @default 0.6 */
  backgroundOpacity?: number;

  /** Overlay background-color @default '#000' */
  color?: React.CSSProperties['backgroundColor'];

  /** Overlay background blur @default 0 */
  blur?: number | string;

  /** Border radius @default 0 */
  radius?: PrismuiRadius;

  /** Content inside overlay */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ModalBaseOverlay = forwardRef<HTMLDivElement, ModalBaseOverlayProps>(
  function ModalBaseOverlay({ onClick, className, style, children, ...props }, ref) {
    const ctx = useModalBaseContext();

    return (
      <Transition mounted={ctx.opened} transition="fade">
        {(transitionStyles) => (
          <Overlay
            ref={ref}
            className={className}
            style={{ ...transitionStyles, ...style } as any}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              onClick?.(e);
              if (ctx.closeOnClickOutside) {
                ctx.onClose();
              }
            }}
            {...props}
          >
            {children}
          </Overlay>
        )}
      </Transition>
    );
  },
);

ModalBaseOverlay.displayName = '@prismui/core/ModalBaseOverlay';
