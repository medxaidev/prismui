import type { PrismuiSizeTokens } from './types';

/**
 * defaultSizeTokens
 *
 * Default box model values for all 5 size tiers.
 *
 * Design decision (Stage-3 Step-1, 2026-04-14):
 * PrismUI uses strict 8px grid: 24 / 32 / 40 / 48 / 56.
 * md = 40px is intentionally larger than the industry default of 36px (MUI/Mantine).
 * Rationale: 8px grid consistency > migration convenience.
 * Migration note: users coming from MUI/Mantine who want 36px should use size="sm" (32px)
 * or override via theme.components.Button.defaultProps.size.
 * See: devdocs/stage/stage-3-step-(stage-9)-1.md
 *
 * Units: px strings (CSSLength format)
 * Only height + paddingX — fontSize / iconSize / gap are NOT part of the size contract.
 */
export const defaultSizeTokens: PrismuiSizeTokens = {
  xs: { height: '24px', paddingX: '8px'  },
  sm: { height: '32px', paddingX: '12px' },
  md: { height: '40px', paddingX: '16px' },
  lg: { height: '48px', paddingX: '20px' },
  xl: { height: '56px', paddingX: '24px' },
};
