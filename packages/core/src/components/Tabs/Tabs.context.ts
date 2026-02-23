'use client';

import { createContext, useContext } from 'react';

export interface TabsContextValue {
  /** Current active tab value */
  value: string | null;

  /** Called when active tab changes */
  onChange: (value: string | null) => void;

  /** Tab orientation */
  orientation: 'horizontal' | 'vertical';

  /** Tab list placement for vertical orientation */
  placement: 'left' | 'right';

  /** Whether arrow keys loop through tabs */
  loop: boolean;

  /** Whether tabs activate on arrow key focus */
  activateTabWithKeyboard: boolean;

  /** Whether clicking active tab deselects it */
  allowTabDeactivation: boolean;

  /** Visual variant */
  variant: string;

  /** Whether tabs are inverted (horizontal only) */
  inverted: boolean;

  /** Whether inactive panels stay mounted */
  keepMounted: boolean;

  /** Base ID for generating tab/panel IDs */
  getTabId: (value: string) => string;

  /** Base ID for generating panel IDs */
  getPanelId: (value: string) => string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export const TabsProvider = TabsContext.Provider;

export function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(
      '[PrismUI] Tabs compound components must be used within a <Tabs> component.',
    );
  }
  return ctx;
}
