import type { PopoverBasePosition } from './PopoverBase.context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FloatingCoords {
  top: number;
  left: number;
  arrowTop?: number;
  arrowLeft?: number;
}

// ---------------------------------------------------------------------------
// Positioning
// ---------------------------------------------------------------------------

/**
 * Calculate floating element coordinates relative to the viewport (for position: fixed).
 *
 * Shared by PopoverBase and Tooltip.
 */
export function getFloatingCoords(
  targetRect: DOMRect,
  floatingRect: DOMRect,
  position: PopoverBasePosition,
  offset: number,
): FloatingCoords {
  const tCenterX = targetRect.left + targetRect.width / 2;
  const tCenterY = targetRect.top + targetRect.height / 2;

  let top = 0;
  let left = 0;
  let arrowLeft: number | undefined;
  let arrowTop: number | undefined;

  const halfW = floatingRect.width / 2;
  const halfH = floatingRect.height / 2;

  switch (position) {
    // --- Top ---
    case 'top':
      top = targetRect.top - floatingRect.height - offset;
      left = tCenterX - halfW;
      arrowLeft = halfW - 5;
      break;
    case 'top-start':
      top = targetRect.top - floatingRect.height - offset;
      left = targetRect.left;
      arrowLeft = Math.min(targetRect.width / 2, floatingRect.width - 16) - 5;
      break;
    case 'top-end':
      top = targetRect.top - floatingRect.height - offset;
      left = targetRect.right - floatingRect.width;
      arrowLeft = floatingRect.width - Math.min(targetRect.width / 2, floatingRect.width - 16) - 5;
      break;

    // --- Bottom ---
    case 'bottom':
      top = targetRect.bottom + offset;
      left = tCenterX - halfW;
      arrowLeft = halfW - 5;
      break;
    case 'bottom-start':
      top = targetRect.bottom + offset;
      left = targetRect.left;
      arrowLeft = Math.min(targetRect.width / 2, floatingRect.width - 16) - 5;
      break;
    case 'bottom-end':
      top = targetRect.bottom + offset;
      left = targetRect.right - floatingRect.width;
      arrowLeft = floatingRect.width - Math.min(targetRect.width / 2, floatingRect.width - 16) - 5;
      break;

    // --- Left ---
    case 'left':
      top = tCenterY - halfH;
      left = targetRect.left - floatingRect.width - offset;
      arrowTop = halfH - 5;
      break;
    case 'left-start':
      top = targetRect.top;
      left = targetRect.left - floatingRect.width - offset;
      arrowTop = Math.min(targetRect.height / 2, floatingRect.height - 16) - 5;
      break;
    case 'left-end':
      top = targetRect.bottom - floatingRect.height;
      left = targetRect.left - floatingRect.width - offset;
      arrowTop = floatingRect.height - Math.min(targetRect.height / 2, floatingRect.height - 16) - 5;
      break;

    // --- Right ---
    case 'right':
      top = tCenterY - halfH;
      left = targetRect.right + offset;
      arrowTop = halfH - 5;
      break;
    case 'right-start':
      top = targetRect.top;
      left = targetRect.right + offset;
      arrowTop = Math.min(targetRect.height / 2, floatingRect.height - 16) - 5;
      break;
    case 'right-end':
      top = targetRect.bottom - floatingRect.height;
      left = targetRect.right + offset;
      arrowTop = floatingRect.height - Math.min(targetRect.height / 2, floatingRect.height - 16) - 5;
      break;
  }

  return { top, left, arrowTop, arrowLeft };
}
