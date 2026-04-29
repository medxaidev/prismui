/**
 * Tooltip · public barrel.
 *
 * Contract: `@/devdocs/components/Tooltip/design.md` v0.5
 */

export { Tooltip } from './Tooltip';
export type {
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipContentProps,
  TooltipContentDismissOptions,
} from './Tooltip';

export { useTooltipDismissal } from './useTooltipDismissal';
export type { UseTooltipDismissalOptions } from './useTooltipDismissal';

export { default as tooltipClasses } from './Tooltip.module.css';
