/**
 * Tooltip · Compound component (Root / Trigger / Content).
 *
 * Contract: `@/devdocs/components/Tooltip/design.md` v0.5
 *
 * Phase 3 主交付：Stage-11 Phase 6 + Stage-12 Phase 3 联调消费者 ·
 * 验证 closeDelay × Presence reverse 路径。
 *
 * Architecture (§六):
 *   Tooltip.Root      — open + scheduler (openDelay / closeDelay / cancel) + Context
 *   Tooltip.Trigger   — asChild · hover/focus 双轨 · Esc keydown · pointerType filter
 *   Tooltip.Content   — Portal + Presence + Floating(top/tooltip) + scrollOutside dismissal
 *
 * Round 1 + Phase 3 + OQ-TT-10 终锁 (v0.5 · 10/10):
 *   · TT-1 openDelay = 500ms (hover only · focus immediate)
 *   · TT-2 closeDelay = 150ms (symmetric hover-leave / blur)
 *   · TT-3 hover-intent = single delay
 *   · TT-4 touch = disable (pointerType filter)
 *   · TT-5 role="tooltip" = enforced (cannot be overridden)
 *   · TT-6 useTooltipDismissal hook provided (downgrade clause)
 *   · TT-7 三件套 (Root/Trigger/Content · no Anchor / no Arrow)
 *   · TT-8 disabled trigger still shows (DEV warn on native disabled)
 *   · TT-9 timer per instance
 *   · TT-10 locked = path 3 (APG either-may-close · v0.5 终锁)
 */

import * as React from 'react';

import { Portal } from '../../core/overlay/portal';
import {
  buildDefaultMiddleware,
  useFloatingPosition,
  type FloatingPlacement,
  type FloatingReference,
} from '../../core/overlay/floating';
import { Presence } from '../../core/transition/presence';
import { useControllableState } from '../../hooks/use-controllable-state';

import { TooltipContext, useTooltipContext } from './tooltip-context';
import { useTooltipDismissal } from './useTooltipDismissal';

// ─────────────────────────────────────────────────────────────────────────────
// Defaults (Round 1 locked v0.4)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_OPEN_DELAY = 500; // OQ-TT-1 = C
const DEFAULT_CLOSE_DELAY = 150; // OQ-TT-2 (= OV-DISMISS-9)
const DEFAULT_PLACEMENT: FloatingPlacement = 'top'; // OV-FLOAT-2 override
const DEFAULT_OFFSET = 6;

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export interface TooltipRootProps {
  /** 受控 open。与 defaultOpen 互斥。 */
  open?: boolean;
  /** 非受控 open 初始值。 */
  defaultOpen?: boolean;
  /** open 变化回调（受控 / 非受控均触发）。 */
  onOpenChange?: (open: boolean) => void;
  /**
   * Hover-path open delay (ms) · default 500ms (Round 1 OQ-TT-1 = C).
   * Focus path is always immediate · this value never gates focus opens (§5.2 / §6.1).
   */
  openDelay?: number;
  /**
   * Symmetric close delay (ms) · default 150ms (Round 1 OQ-TT-2 / OV-DISMISS-9).
   * Same value applies to hover-leave AND blur.
   */
  closeDelay?: number;
  /** Context Provider 子节点。 */
  children: React.ReactNode;
}

export interface TooltipTriggerProps {
  /**
   * asChild · 默认 true · 把 trigger 行为合并入用户传入的 element（仿 Radix）。
   * v1 仅交付 asChild=true 路径（与 Popover.Trigger 保持一致 · OQ-TT-7）。
   */
  asChild?: boolean;
  children: React.ReactElement;
}

export interface TooltipContentDismissOptions {
  /**
   * scroll-outside channel opt-in · default `true` (the only channel Tooltip
   * routes through `useDismissal` · v0.4 [Hook]).
   *
   * Esc / pointer / focus are NOT exposed here · they are either
   * component-owned (Esc → Trigger keydown · hover → component scheduler)
   * or N/A for Tooltip (focus-outside · Tooltip never accepts focus).
   */
  scrollOutside?: boolean;
}

export interface TooltipContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  /** Floating placement · default `'top'`. */
  placement?: FloatingPlacement;
  /** Reference ↔ floating main-axis offset (px) · default 6. */
  offset?: number;
  /** Portal container override · transparently forwarded to `<Portal>`. */
  container?: React.ComponentProps<typeof Portal>['container'];
  /** Presence forceMount opt-in · transparently forwarded to `<Presence>`. */
  forceMount?: boolean;
  /** Dismissal opt-in (only `scrollOutside` is exposed at this layer). */
  dismiss?: TooltipContentDismissOptions;
  children?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip.Root
// ─────────────────────────────────────────────────────────────────────────────

function TooltipRoot(props: TooltipRootProps): React.ReactElement {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    openDelay = DEFAULT_OPEN_DELAY,
    closeDelay = DEFAULT_CLOSE_DELAY,
    children,
  } = props;

  const [open, setOpenState] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLElement | null>(null);
  const triggerId = React.useId();
  const contentId = React.useId();

  // Single mutable scheduler timer · OQ-TT-9 = A (per-instance).
  // Whichever side schedules next clears the prior pending entry.
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelSchedule = React.useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setOpen = React.useCallback(
    (next: boolean) => {
      cancelSchedule();
      setOpenState(next);
    },
    [cancelSchedule, setOpenState],
  );

  const scheduleOpen = React.useCallback(() => {
    cancelSchedule();
    if (openDelay <= 0) {
      setOpenState(true);
      return;
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setOpenState(true);
    }, openDelay);
  }, [cancelSchedule, openDelay, setOpenState]);

  const scheduleClose = React.useCallback(() => {
    cancelSchedule();
    if (closeDelay <= 0) {
      setOpenState(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setOpenState(false);
    }, closeDelay);
  }, [cancelSchedule, closeDelay, setOpenState]);

  // Cleanup on unmount.
  React.useEffect(() => () => cancelSchedule(), [cancelSchedule]);

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      contentRef,
      triggerId,
      contentId,
      openDelay,
      closeDelay,
      scheduleOpen,
      scheduleClose,
      cancelSchedule,
    }),
    [
      open,
      setOpen,
      triggerId,
      contentId,
      openDelay,
      closeDelay,
      scheduleOpen,
      scheduleClose,
      cancelSchedule,
    ],
  );

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

TooltipRoot.displayName = 'Tooltip.Root';

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip.Trigger
// ─────────────────────────────────────────────────────────────────────────────

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  function TooltipTrigger(props, forwardedRef) {
    const { asChild = true, children } = props;
    const ctx = useTooltipContext('Tooltip.Trigger');

    if (process.env.NODE_ENV !== 'production' && asChild === false) {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Tooltip] Tooltip.Trigger v1 only supports `asChild=true` ' +
          '(default). Pass a single ReactElement child (e.g. <button>).',
      );
    }

    if (!React.isValidElement(children)) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(
          '[PrismUI Tooltip] Tooltip.Trigger requires exactly one ReactElement child.',
        );
      }
      return null;
    }

    const child = children as React.ReactElement<
      React.HTMLAttributes<HTMLElement> & {
        id?: string;
        disabled?: boolean;
        ref?: React.Ref<HTMLElement>;
      }
    >;
    const childProps = child.props ?? {};

    // OQ-TT-8 = A · DEV warn when consumer mixes native `disabled` with a
    // Tooltip wrapper. Native `disabled` suppresses pointer/focus events on
    // most browsers, so the tooltip will silently never show. Guidance: use
    // `aria-disabled` + visual styling instead.
    if (process.env.NODE_ENV !== 'production' && childProps.disabled === true) {
      // eslint-disable-next-line no-console
      console.warn(
        '[PrismUI Tooltip] Trigger child has native `disabled`; pointer/focus ' +
          'events are suppressed on most browsers, so the tooltip will not show. ' +
          'Use `aria-disabled` + visual styling instead (Round 1 OQ-TT-8 guidance).',
      );
    }

    const composedRef = composeRefs<HTMLElement>(
      ctx.triggerRef,
      forwardedRef,
      getElementRef(child),
    );

    const handlePointerEnter = (event: React.PointerEvent<HTMLElement>) => {
      childProps.onPointerEnter?.(event);
      if (event.defaultPrevented) return;
      // OQ-TT-4 = A · disable on touch (focus path still works for keyboard /
      // assistive-technology users).
      if (event.pointerType === 'touch') return;
      ctx.scheduleOpen();
    };

    const handlePointerLeave = (event: React.PointerEvent<HTMLElement>) => {
      childProps.onPointerLeave?.(event);
      if (event.defaultPrevented) return;
      if (event.pointerType === 'touch') return;
      ctx.scheduleClose();
    };

    const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      if (event.defaultPrevented) return;
      // §5.2 / §6.1 · focus path is immediate (no openDelay).
      ctx.setOpen(true);
    };

    const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      if (event.defaultPrevented) return;
      ctx.scheduleClose();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      childProps.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      // §6.5.1 · independent scenario · React synthetic bubble · setOpen(false).
      // §6.5.2 · nested-scenario behaviour deferred (OQ-TT-10 path 3 default ·
      // both Tooltip and parent overlay may close on a single Esc).
      if (event.key === 'Escape' && ctx.open) {
        ctx.setOpen(false);
      }
    };

    const merged: Record<string, unknown> = {
      ...childProps,
      id: childProps.id ?? ctx.triggerId,
      'aria-describedby': mergeAriaDescribedBy(
        childProps['aria-describedby'],
        ctx.contentId,
      ),
      'data-state': ctx.open ? 'open' : 'closed',
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      ref: composedRef,
    };

    return React.cloneElement(child, merged);
  },
);

TooltipTrigger.displayName = 'Tooltip.Trigger';

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip.Content
// ─────────────────────────────────────────────────────────────────────────────

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(props, forwardedRef) {
    const {
      placement = DEFAULT_PLACEMENT,
      offset: offsetValue = DEFAULT_OFFSET,
      container,
      forceMount,
      dismiss,
      children,
      style,
      id,
      ...rest
    } = props;

    const ctx = useTooltipContext('Tooltip.Content');

    // ── Floating positioning (zIndex level = 'tooltip' · OV-FLOAT-3) ────────
    const middleware = React.useMemo(
      () => buildDefaultMiddleware({ offset: offsetValue }),
      [offsetValue],
    );
    const { refs, floatingStyles } = useFloatingPosition({
      placement,
      middleware,
      zIndexLevel: 'tooltip',
    });

    React.useLayoutEffect(() => {
      refs.setReference(ctx.triggerRef.current as FloatingReference | null);
    });

    // ── Dismissal · only scrollOutside enabled by default (v0.4 [Hook]) ────
    useTooltipDismissal({
      open: ctx.open,
      onOpenChange: ctx.setOpen,
      triggerRef: ctx.triggerRef,
      overlayRef: ctx.contentRef,
      scrollOutside: dismiss?.scrollOutside,
    });

    // ── A11Y-3 (DEV) · warn if consumers nest focusable elements inside a
    //    Tooltip · Tooltip is non-modal and never participates in Tab order
    //    (§5.1 · Round 1 OQ-TT-5 / TT-A11Y-3).
    //
    //    No dep array · runs after every commit — Presence SSR-safe init
    //    (state='closed' first render · TR-PROTO-3) means the div is mounted
    //    on the *second* commit · so we can't gate on `ctx.open` changes.
    //    A ref-based latch ensures we warn at most once per Content lifetime.
    const warnedRef = React.useRef(false);
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'production') return;
      if (warnedRef.current) return;
      if (!ctx.open) return;
      const node = ctx.contentRef.current;
      if (!node) return;
      const focusable = node.querySelector(
        'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable) {
        warnedRef.current = true;
        // eslint-disable-next-line no-console
        console.warn(
          '[PrismUI Tooltip] Tooltip.Content should not contain focusable ' +
            'elements; tooltip is non-modal and not part of the Tab order ' +
            '(Round 1 OQ-TT-5 / §5.1 TT-A11Y-3).',
        );
      }
    });

    const composedRef = composeRefs<HTMLDivElement>(
      ctx.contentRef as React.RefObject<HTMLDivElement | null>,
      forwardedRef,
      refs.setFloating as React.Ref<HTMLDivElement>,
    );

    const mergedStyle: React.CSSProperties = {
      ...floatingStyles,
      ...style,
    };

    return (
      <Portal container={container}>
        <Presence open={ctx.open} forceMount={forceMount}>
          <div
            {...rest}
            ref={composedRef}
            id={id ?? ctx.contentId}
            // OQ-TT-5 = A · `role="tooltip"` is enforced (APG semantic
            // contract). Cannot be overridden by consumers · v0.4 §5.1.
            role="tooltip"
            style={mergedStyle}
          >
            {children}
          </div>
        </Presence>
      </Portal>
    );
  },
);

TooltipContent.displayName = 'Tooltip.Content';

// ─────────────────────────────────────────────────────────────────────────────
// Compound export (三件套 · OQ-TT-7 = A · 不交付 Anchor / Arrow)
// ─────────────────────────────────────────────────────────────────────────────

export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};

// ── ref helpers (mirror Popover.tsx) ───────────────────────────────────────

type AnyRef<T> = React.Ref<T> | undefined | null;

function setRef<T>(ref: AnyRef<T>, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref != null) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

function composeRefs<T>(...refs: Array<AnyRef<T>>): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) setRef(ref, value);
  };
}

function getElementRef(element: React.ReactElement): AnyRef<HTMLElement> {
  // React 19 — props.ref ; React 18 — element.ref
  const propsRef = (element.props as { ref?: React.Ref<HTMLElement> }).ref;
  if (propsRef !== undefined) return propsRef;
  return (element as unknown as { ref?: React.Ref<HTMLElement> }).ref;
}

function mergeAriaDescribedBy(
  existing: string | undefined,
  contentId: string,
): string {
  if (!existing) return contentId;
  if (existing.split(/\s+/).includes(contentId)) return existing;
  return `${existing} ${contentId}`;
}
