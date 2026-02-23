'use client';

import React, { forwardRef } from 'react';
import { useTabsContext } from './Tabs.context';
import classes from './Tabs.module.css';

export interface TabsListProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Tabs.Tab components */
  children: React.ReactNode;

  /** If true, tabs fill all available space equally. @default false */
  grow?: boolean;

  /** Tab alignment. @default 'flex-start' */
  justify?: React.CSSProperties['justifyContent'];
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ children, className, grow, justify, style, ...others }, ref) {
    const ctx = useTabsContext();

    const variantClass = classes[`list--${ctx.variant}`] || '';
    const rootClassName = [classes.list, variantClass, className].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={ctx.orientation}
        className={rootClassName}
        data-grow={grow || undefined}
        data-orientation={ctx.orientation}
        data-placement={ctx.orientation === 'vertical' ? ctx.placement : undefined}
        data-inverted={ctx.inverted || undefined}
        style={{ '--tabs-justify': justify, ...style } as React.CSSProperties}
        {...others}
      >
        {children}
      </div>
    );
  },
);

TabsList.displayName = '@prismui/core/TabsList';
