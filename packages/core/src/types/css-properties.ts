import type * as React from 'react';

export interface CSSProperties extends React.CSSProperties {
  [key: `--${string}`]: string | number;
}