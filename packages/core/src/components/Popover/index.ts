/**
 * Popover · public barrel.
 *
 * Contract: `@/devdocs/components/Popover/design.md` v0.1.2
 */

export { Popover } from './Popover';
export type {
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverContentDismissOptions,
  PopoverAnchorProps,
} from './Popover';

export { useDismissPopover } from './useDismissPopover';
export type { UseDismissPopoverOptions } from './useDismissPopover';

export { default as popoverClasses } from './Popover.module.css';
