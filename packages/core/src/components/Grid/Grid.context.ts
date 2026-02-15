import React from 'react';

export interface GridContextValue {
  columns: number;
  grow: boolean | undefined;
  gutter: string | number | undefined;
}

const GridContext = React.createContext<GridContextValue | null>(null);

export const GridProvider = GridContext.Provider;

export function useGridContext(): GridContextValue {
  const ctx = React.useContext(GridContext);
  if (!ctx) {
    throw new Error('Grid.Col must be used within a Grid component');
  }
  return ctx;
}
