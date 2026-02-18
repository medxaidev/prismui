'use client';

import React, { cloneElement, isValidElement } from 'react';
import { usePopoverBaseContext } from './PopoverBase.context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PopoverBaseTargetProps {
  /** Target element that triggers the popover. Must be a single React element. */
  children: React.ReactElement;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PopoverBaseTarget({ children }: PopoverBaseTargetProps) {
  const ctx = usePopoverBaseContext();

  if (!isValidElement(children)) {
    throw new Error(
      '[PrismUI] PopoverBase.Target requires a single React element as children.',
    );
  }

  return cloneElement(children as React.ReactElement<any>, {
    ref: (node: HTMLElement | null) => {
      ctx.setTargetRef(node);
      // Forward ref from child if it has one
      const childRef = (children as any).ref;
      if (typeof childRef === 'function') childRef(node);
      else if (childRef && typeof childRef === 'object') childRef.current = node;
    },
    onClick: (e: React.MouseEvent) => {
      if (!ctx.disabled) {
        ctx.onToggle();
      }
      (children as any).props?.onClick?.(e);
    },
    'aria-haspopup': 'true',
    'aria-expanded': ctx.opened,
    'aria-controls': ctx.opened ? ctx.popoverId : undefined,
  });
}

PopoverBaseTarget.displayName = '@prismui/core/PopoverBaseTarget';
