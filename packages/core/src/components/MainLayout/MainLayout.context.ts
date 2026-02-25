'use client';

import { createContext, useContext } from 'react';

export interface MainLayoutContextValue {
  headerHeight: number;
  withBorder: boolean;
}

const MainLayoutContext = createContext<MainLayoutContextValue | null>(null);

export const MainLayoutProvider = MainLayoutContext.Provider;

export function useMainLayoutContext(): MainLayoutContextValue {
  const ctx = useContext(MainLayoutContext);
  if (!ctx) {
    throw new Error(
      '[PrismUI] MainLayout compound components must be used within a <MainLayout>.',
    );
  }
  return ctx;
}
