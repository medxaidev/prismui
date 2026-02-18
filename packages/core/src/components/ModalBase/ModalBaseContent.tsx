'use client';

import React, { forwardRef } from 'react';
import { Paper } from '../Paper/Paper';
import type { PaperProps } from '../Paper/Paper';
import { Transition } from '../Transition/Transition';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { useMergedRef } from '../../hooks/use-merged-ref';
import { useModalBaseContext } from './ModalBase.context';
import classes from './ModalBase.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModalBaseContentProps {
  /** Additional class name. */
  className?: string;

  /** Additional inline styles. */
  style?: React.CSSProperties;

  /** Content inside the modal dialog. */
  children?: React.ReactNode;

  /** Paper shadow @default 'xl' */
  shadow?: PaperProps['shadow'];

  /** Paper radius @default 'md' */
  radius?: PaperProps['radius'];

  /** Whether to add a border @default false */
  withBorder?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ModalBaseContent = forwardRef<HTMLDivElement, ModalBaseContentProps>(
  function ModalBaseContent({ className, style, children, shadow, radius, withBorder, ...props }, ref) {
    const ctx = useModalBaseContext();
    const trapRef = useFocusTrap(ctx.opened && ctx.trapFocus);
    const mergedRef = useMergedRef(ref, trapRef);

    return (
      <Transition mounted={ctx.opened} transition="fade">
        {(transitionStyles) => (
          <Paper
            ref={mergedRef}
            role="dialog"
            aria-modal
            tabIndex={-1}
            className={`${classes.content}${className ? ` ${className}` : ''}`}
            style={{ ...transitionStyles, zIndex: ctx.zIndex + 1, ...style } as any}
            shadow={shadow}
            radius={radius}
            withBorder={withBorder}
            {...props}
          >
            {children}
          </Paper>
        )}
      </Transition>
    );
  },
);

ModalBaseContent.displayName = '@prismui/core/ModalBaseContent';
