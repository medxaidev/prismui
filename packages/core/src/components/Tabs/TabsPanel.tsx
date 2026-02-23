'use client';

import React, { forwardRef } from 'react';
import { useTabsContext } from './Tabs.context';
import classes from './Tabs.module.css';

export interface TabsPanelProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Value that associates this panel with a tab. Required. */
  value: string;

  /** Panel content */
  children: React.ReactNode;

  /** Per-panel override for keepMounted. */
  keepMounted?: boolean;
}

export const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(
  function TabsPanel({ children, className, value, style, keepMounted, ...others }, ref) {
    const ctx = useTabsContext();
    const active = ctx.value === value;
    const shouldMount = ctx.keepMounted || keepMounted;
    const content = shouldMount ? children : active ? children : null;

    const rootClassName = [classes.panel, className].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={ctx.getPanelId(value)}
        aria-labelledby={ctx.getTabId(value)}
        data-orientation={ctx.orientation}
        className={rootClassName}
        style={!active ? { display: 'none', ...style } : style}
        {...others}
      >
        {content}
      </div>
    );
  },
);

TabsPanel.displayName = '@prismui/core/TabsPanel';
