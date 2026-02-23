'use client';

import React, { forwardRef, useId } from 'react';
import { useUncontrolled } from '../../hooks/use-uncontrolled';
import { TabsProvider } from './Tabs.context';
import { TabsList } from './TabsList';
import { TabsTab } from './TabsTab';
import { TabsPanel } from './TabsPanel';
import classes from './Tabs.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TabsVariant = 'default' | 'outline' | 'pills';

export interface TabsProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onChange'> {
  /** Uncontrolled default value */
  defaultValue?: string | null;

  /** Controlled value */
  value?: string | null;

  /** Called when value changes */
  onChange?: (value: string | null) => void;

  /** Visual variant. @default 'default' */
  variant?: TabsVariant;

  /** Tabs orientation. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';

  /** Tabs.List placement for vertical orientation. @default 'left' */
  placement?: 'left' | 'right';

  /** Accent color (CSS color or variable). */
  color?: string;

  /** Border radius (CSS value). */
  radius?: string | number;

  /** Flip tab list / panel position (horizontal only). @default false */
  inverted?: boolean;

  /** Keep inactive panels mounted in DOM. @default true */
  keepMounted?: boolean;

  /** Arrow keys loop through tabs. @default true */
  loop?: boolean;

  /** Activate tab on arrow key focus. @default true */
  activateTabWithKeyboard?: boolean;

  /** Allow clicking active tab to deselect. @default false */
  allowTabDeactivation?: boolean;

  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs(
    {
      defaultValue,
      value,
      onChange,
      variant = 'default',
      orientation = 'horizontal',
      placement = 'left',
      color,
      radius,
      inverted = false,
      keepMounted = true,
      loop = true,
      activateTabWithKeyboard = true,
      allowTabDeactivation = false,
      children,
      className,
      style,
      id,
      ...others
    },
    ref,
  ) {
    const autoId = useId();
    const uid = id || autoId;

    const [currentTab, setCurrentTab] = useUncontrolled<string | null>({
      value,
      defaultValue,
      finalValue: null,
      onChange,
    });

    const getTabId = (tabValue: string) => `${uid}-tab-${tabValue}`;
    const getPanelId = (tabValue: string) => `${uid}-panel-${tabValue}`;

    const rootClassName = [classes.root, className].filter(Boolean).join(' ');

    const resolvedRadius = typeof radius === 'number' ? `${radius}px` : radius;

    return (
      <TabsProvider
        value={{
          value: currentTab,
          onChange: setCurrentTab,
          orientation,
          placement,
          loop,
          activateTabWithKeyboard,
          allowTabDeactivation,
          variant,
          inverted: orientation === 'horizontal' && inverted,
          keepMounted,
          getTabId,
          getPanelId,
        }}
      >
        <div
          ref={ref}
          id={uid}
          className={rootClassName}
          data-orientation={orientation}
          data-variant={variant}
          data-inverted={orientation === 'horizontal' && inverted ? true : undefined}
          data-placement={orientation === 'vertical' ? placement : undefined}
          style={{
            '--tabs-color': color || undefined,
            '--tabs-radius': resolvedRadius || undefined,
            ...style,
          } as React.CSSProperties}
          {...others}
        >
          {children}
        </div>
      </TabsProvider>
    );
  },
) as React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>> & {
  List: typeof TabsList;
  Tab: typeof TabsTab;
  Panel: typeof TabsPanel;
};

Tabs.displayName = '@prismui/core/Tabs';
(Tabs as any).List = TabsList;
(Tabs as any).Tab = TabsTab;
(Tabs as any).Panel = TabsPanel;
