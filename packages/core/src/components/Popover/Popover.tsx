'use client';

import { forwardRef } from 'react';
import { PopoverBase } from '../PopoverBase/PopoverBase';
import type { PopoverBaseProps } from '../PopoverBase/PopoverBase';
import { PopoverBaseTarget } from '../PopoverBase/PopoverBaseTarget';
import type { PopoverBaseTargetProps } from '../PopoverBase/PopoverBaseTarget';
import { PopoverBaseDropdown } from '../PopoverBase/PopoverBaseDropdown';
import type { PopoverBaseDropdownProps } from '../PopoverBase/PopoverBaseDropdown';
import popoverClasses from './Popover.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PopoverProps extends PopoverBaseProps {
  /** Popover width. @default 'auto' */
  width?: number | string;
}

export interface PopoverDropdownProps extends PopoverBaseDropdownProps {
  /** Additional class name for the dropdown. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Popover.Target — pass-through to PopoverBase.Target
// ---------------------------------------------------------------------------

function PopoverTarget(props: PopoverBaseTargetProps) {
  return <PopoverBaseTarget {...props} />;
}

PopoverTarget.displayName = '@prismui/core/PopoverTarget';

// ---------------------------------------------------------------------------
// Popover.Dropdown — wraps PopoverBase.Dropdown with glassmorphism styles
// ---------------------------------------------------------------------------

const PopoverDropdown = forwardRef<HTMLDivElement, PopoverDropdownProps>(
  function PopoverDropdown({ className, style, children, ...props }, ref) {
    const mergedClassName = `${popoverClasses.dropdown}${className ? ` ${className}` : ''}`;

    return (
      <PopoverBaseDropdown
        ref={ref}
        className={mergedClassName}
        arrowClassName={popoverClasses.arrow}
        style={style}
        {...props}
      >
        {children}
      </PopoverBaseDropdown>
    );
  },
);

PopoverDropdown.displayName = '@prismui/core/PopoverDropdown';

// ---------------------------------------------------------------------------
// Popover — wraps PopoverBase with default arrow and semantic styling
// ---------------------------------------------------------------------------

export function Popover({
  children,
  withArrow = true,
  position = 'bottom',
  offset = 8,
  width,
  ...props
}: PopoverProps) {
  return (
    <PopoverBase
      withArrow={withArrow}
      position={position}
      offset={offset}
      {...props}
    >
      {children}
    </PopoverBase>
  );
}

// Attach compound components
Popover.Target = PopoverTarget;
Popover.Dropdown = PopoverDropdown;

Popover.displayName = '@prismui/core/Popover';
