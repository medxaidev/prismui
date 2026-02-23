import React from 'react';

export interface CreateScopedKeydownHandlerInput {
  /** CSS selector to find sibling elements (e.g. '[role="tab"]') */
  siblingSelector: string;

  /** CSS selector to find the parent container (e.g. '[role="tablist"]') */
  parentSelector: string;

  /** If true, the element is activated (clicked) when focused via arrow keys. @default true */
  activateOnFocus?: boolean;

  /** If true, navigation wraps from last to first and vice versa. @default true */
  loop?: boolean;

  /** Orientation determines which arrow keys are used. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';

  /** Text direction. @default 'ltr' */
  dir?: 'ltr' | 'rtl';

  /** Original onKeyDown handler to call before scoped handling. */
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
}

function findVisibleSiblings(parent: Element, selector: string): HTMLElement[] {
  const all = parent.querySelectorAll<HTMLElement>(selector);
  return Array.from(all).filter(
    (el) => !el.hasAttribute('disabled') && !el.hasAttribute('data-disabled'),
  );
}

/**
 * Creates a keyboard event handler that navigates between sibling elements
 * within a parent container using arrow keys, Home, and End.
 *
 * Follows WAI-ARIA keyboard interaction patterns for tablist, toolbar, etc.
 */
export function createScopedKeydownHandler({
  siblingSelector,
  parentSelector,
  activateOnFocus = true,
  loop = true,
  orientation = 'horizontal',
  dir = 'ltr',
  onKeyDown,
}: CreateScopedKeydownHandlerInput): React.KeyboardEventHandler<HTMLElement> {
  return (event: React.KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);

    const target = event.currentTarget;
    const parent = target.closest(parentSelector);
    if (!parent) return;

    const siblings = findVisibleSiblings(parent, siblingSelector);
    const currentIndex = siblings.indexOf(target as HTMLElement);
    if (currentIndex === -1) return;

    const focusAndActivate = (element: HTMLElement) => {
      event.preventDefault();
      element.focus();
      if (activateOnFocus) {
        element.click();
      }
    };

    // Determine "next" and "previous" based on orientation and direction
    const isHorizontal = orientation === 'horizontal';
    const isRtl = dir === 'rtl';

    const nextKeys = isHorizontal
      ? isRtl ? ['ArrowLeft'] : ['ArrowRight']
      : ['ArrowDown'];
    const prevKeys = isHorizontal
      ? isRtl ? ['ArrowRight'] : ['ArrowLeft']
      : ['ArrowUp'];

    // Also support cross-axis for horizontal (ArrowDown) and vertical (ArrowRight)
    // This matches Mantine behavior where both axes work
    if (isHorizontal) {
      nextKeys.push('ArrowDown');
      prevKeys.push('ArrowUp');
    } else {
      nextKeys.push(isRtl ? 'ArrowLeft' : 'ArrowRight');
      prevKeys.push(isRtl ? 'ArrowRight' : 'ArrowLeft');
    }

    if (nextKeys.includes(event.key)) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < siblings.length) {
        focusAndActivate(siblings[nextIndex]);
      } else if (loop) {
        focusAndActivate(siblings[0]);
      }
      return;
    }

    if (prevKeys.includes(event.key)) {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        focusAndActivate(siblings[prevIndex]);
      } else if (loop) {
        focusAndActivate(siblings[siblings.length - 1]);
      }
      return;
    }

    if (event.key === 'Home') {
      focusAndActivate(siblings[0]);
      return;
    }

    if (event.key === 'End') {
      focusAndActivate(siblings[siblings.length - 1]);
    }
  };
}
