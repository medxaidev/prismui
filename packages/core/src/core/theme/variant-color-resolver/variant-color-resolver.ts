import type { PrismuiTheme } from '../types';
import type { PrismuiVariantKey } from '../types';
import type { PrismuiResolvedColorScheme } from '../types';

// ---------------------------------------------------------------------------
// VariantColorResolver — types
// ---------------------------------------------------------------------------

export interface VariantColorResolverInput {
  color: string;
  theme: PrismuiTheme;
  variant: PrismuiVariantKey;
  scheme: PrismuiResolvedColorScheme;
  autoContrast?: boolean;
}

export interface VariantColorsResult {
  background: string;
  color: string;
  border: string;
  hoverBackground: string;
  hoverColor: string;
  hoverBorder: string;
  hoverShadow: string;
}

export type VariantColorResolver = (
  input: VariantColorResolverInput,
) => VariantColorsResult;
