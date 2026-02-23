'use client';

import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useDidUpdate } from './use-did-update';
import { mergeRefs } from './use-merged-ref';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAutoHeightDuration(height: number | string) {
  if (!height || typeof height === 'string') {
    return 0;
  }
  const constant = height / 36;
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}

function getElementSize(
  el: React.RefObject<HTMLElement | null>,
  orientation: 'vertical' | 'horizontal',
) {
  if (!el?.current) return 'auto';
  return orientation === 'vertical' ? el.current.scrollHeight : el.current.scrollWidth;
}

function getRaf() {
  return typeof window !== 'undefined' ? window.requestAnimationFrame : undefined;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseCollapseInput {
  /** Whether the content is expanded. */
  opened: boolean;

  /** Transition duration in ms. If not set, auto-calculated from content height. */
  transitionDuration?: number;

  /** CSS transition timing function. @default 'ease' */
  transitionTimingFunction?: string;

  /** Called when the transition ends (both open and close). */
  onTransitionEnd?: () => void;

  /** Keep element in DOM when collapsed (display: block with height: 0 instead of display: none). @default false */
  keepMounted?: boolean;

  /** Collapse orientation. @default 'vertical' */
  orientation?: 'vertical' | 'horizontal';
}

export interface GetCollapsePropsInput {
  [key: string]: unknown;
  style?: React.CSSProperties;
  onTransitionEnd?: (e: React.TransitionEvent) => void;
  refKey?: string;
  ref?: React.ForwardedRef<HTMLDivElement>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCollapse({
  transitionDuration,
  transitionTimingFunction = 'ease',
  onTransitionEnd = () => { },
  opened,
  keepMounted = false,
  orientation = 'vertical',
}: UseCollapseInput): (props?: GetCollapsePropsInput) => Record<string, any> {
  const el = useRef<HTMLElement | null>(null);

  const sizeProp = orientation === 'vertical' ? 'height' : 'width';
  const collapsedSize = 0;

  const getCollapsedStyles = (): React.CSSProperties => ({
    [sizeProp]: 0,
    overflow: 'hidden',
    ...(keepMounted ? {} : { display: 'none' }),
  });

  const [styles, setStylesRaw] = useState<React.CSSProperties>(
    opened ? {} : getCollapsedStyles(),
  );

  const setStyles = (newStyles: React.CSSProperties | ((old: React.CSSProperties) => React.CSSProperties)): void => {
    flushSync(() => setStylesRaw(newStyles));
  };

  const mergeStyles = (newStyles: React.CSSProperties): void => {
    setStyles((old) => ({ ...old, ...newStyles }));
  };

  function getTransitionStyles(size: number | string) {
    const duration = transitionDuration ?? getAutoHeightDuration(size);
    return {
      transition: `${sizeProp} ${duration}ms ${transitionTimingFunction}, opacity ${duration}ms ${transitionTimingFunction}`,
    };
  }

  useDidUpdate(() => {
    const raf = getRaf();
    if (typeof raf === 'function') {
      if (opened) {
        raf(() => {
          mergeStyles({ willChange: sizeProp, display: 'block', overflow: 'hidden' });
          raf(() => {
            const size = getElementSize(el, orientation);
            mergeStyles({ ...getTransitionStyles(size), [sizeProp]: size });
          });
        });
      } else {
        raf(() => {
          const size = getElementSize(el, orientation);
          mergeStyles({ ...getTransitionStyles(size), willChange: sizeProp, [sizeProp]: size });
          raf(() => mergeStyles({ [sizeProp]: collapsedSize, overflow: 'hidden' }));
        });
      }
    }
  }, [opened]);

  const handleTransitionEnd = (e: React.TransitionEvent): void => {
    if (e.target !== el.current || e.propertyName !== sizeProp) {
      return;
    }

    if (opened) {
      const size = getElementSize(el, orientation);
      if (size === styles[sizeProp]) {
        setStyles({});
      } else {
        mergeStyles({ [sizeProp]: size });
      }
      onTransitionEnd();
    } else if (styles[sizeProp] === collapsedSize) {
      setStyles(getCollapsedStyles());
      onTransitionEnd();
    }
  };

  function getCollapseProps({ style = {}, refKey = 'ref', ...rest }: GetCollapsePropsInput = {}) {
    const theirRef: any = rest[refKey];
    const props: any = {
      'aria-hidden': !opened,
      ...rest,
      [refKey]: mergeRefs(el, theirRef),
      onTransitionEnd: handleTransitionEnd,
      style: { boxSizing: 'border-box', ...style, ...styles },
    };

    // Handle inert attribute based on React version
    if (React.version.startsWith('18')) {
      if (!opened) {
        props.inert = '';
      }
    } else {
      props.inert = !opened;
    }

    return props;
  }

  return getCollapseProps;
}
