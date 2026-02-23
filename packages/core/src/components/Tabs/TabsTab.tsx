'use client';

import React, { forwardRef } from 'react';
import { useTabsContext } from './Tabs.context';
import { createScopedKeydownHandler } from '../../utils/create-scoped-keydown-handler';
import classes from './Tabs.module.css';

export interface TabsTabProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Value that associates this tab with a panel. Required. */
  value: string;

  /** Tab label */
  children?: React.ReactNode;

  /** Content displayed on the left side of the label */
  leftSection?: React.ReactNode;

  /** Content displayed on the right side of the label */
  rightSection?: React.ReactNode;

  /** Per-tab color override (CSS color value or CSS variable) */
  color?: string;
}

export const TabsTab = forwardRef<HTMLButtonElement, TabsTabProps>(
  function TabsTab(
    {
      children,
      className,
      value,
      onClick,
      onKeyDown,
      disabled,
      color,
      leftSection,
      rightSection,
      style,
      tabIndex,
      ...others
    },
    ref,
  ) {
    const ctx = useTabsContext();
    const active = value === ctx.value;

    const activateTab = (event: React.MouseEvent<HTMLButtonElement>) => {
      ctx.onChange(
        ctx.allowTabDeactivation ? (value === ctx.value ? null : value) : value,
      );
      onClick?.(event);
    };

    const variantClass = classes[`tab--${ctx.variant}`] || '';
    const rootClassName = [classes.tab, variantClass, className].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={ctx.getTabId(value)}
        aria-selected={active}
        aria-controls={ctx.getPanelId(value)}
        tabIndex={tabIndex !== undefined ? tabIndex : active || ctx.value === null ? 0 : -1}
        disabled={disabled}
        data-active={active || undefined}
        data-disabled={disabled || undefined}
        data-orientation={ctx.orientation}
        data-inverted={ctx.inverted || undefined}
        data-placement={ctx.orientation === 'vertical' ? ctx.placement : undefined}
        className={rootClassName}
        style={{
          '--tabs-color': color || undefined,
          ...style,
        } as React.CSSProperties}
        onClick={activateTab}
        onKeyDown={createScopedKeydownHandler({
          siblingSelector: '[role="tab"]',
          parentSelector: '[role="tablist"]',
          activateOnFocus: ctx.activateTabWithKeyboard,
          loop: ctx.loop,
          orientation: ctx.orientation,
          onKeyDown,
        })}
        {...others}
      >
        {leftSection && (
          <span className={classes.tabSection} data-position="left">
            {leftSection}
          </span>
        )}
        {children && <span className={classes.tabLabel}>{children}</span>}
        {rightSection && (
          <span className={classes.tabSection} data-position="right">
            {rightSection}
          </span>
        )}
      </button>
    );
  },
);

TabsTab.displayName = '@prismui/core/TabsTab';
