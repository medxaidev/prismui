/**
 * Popover · Compound component (Root / Trigger / Content / Anchor).
 *
 * Contract: `@/devdocs/components/Popover/design.md` v0.1.2
 *
 * Phase 2 主交付：Stage-11 (Portal/Floating/Dismissal) + Stage-12 (Presence)
 * 五 primitive 联调首批落地点 · 验证 TR-CROSS-2 主链 + 评估 TR-CROSS-3 评估点 1。
 *
 * Architecture (§六 ref 流图):
 *   Popover.Root           — open 状态 + triggerRef / contentRef + Context
 *   Popover.Trigger        — asChild · 注入 onClick / aria-* / triggerRef
 *   Popover.Content        — Portal + Presence + Floating + Dismissal 装配点
 *   Popover.Anchor (opt)   — 与 Trigger 解耦的高级用法
 *
 * Observable invariants (§6.1 E1–E6 / X1–X6 表) are locked; primitive 内部
 * 实现路径（RAF / getComputedStyle / listener install）非合约。
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

import { PopoverContext, usePopoverContext } from './popover-context';
import { useDismissPopover } from './useDismissPopover';

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export interface PopoverRootProps {
  /** 受控 open。与 defaultOpen 互斥。 */
  open?: boolean;
  /** 非受控 open 初始值。 */
  defaultOpen?: boolean;
  /** open 变化回调（受控 / 非受控均触发）。 */
  onOpenChange?: (open: boolean) => void;
  /** Context Provider 子节点。 */
  children: React.ReactNode;
}

export interface PopoverTriggerProps {
  /**
   * asChild · 默认 true · 把 trigger 行为合并入用户传入的 element（仿 Radix）。
   * 当为 true 时 children 必须是单一 ReactElement (常见用法：`<button>`)。
   */
  asChild?: boolean;
  children: React.ReactElement;
}

export interface PopoverContentDismissOptions {
  pointerOutside?: boolean;
  escapeKey?: boolean;
  focusOutside?: boolean;
  scrollOutside?: boolean;
}

export interface PopoverContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Floating 定位 · 默认 `'bottom-start'` (OV-FLOAT-2)。 */
  placement?: FloatingPlacement;
  /** Reference ↔ floating 主轴间距 (px) · 默认 8。 */
  offset?: number;
  /** Portal container override · 透传给 `<Portal>` (OV-PORTAL-1)。 */
  container?: React.ComponentProps<typeof Portal>['container'];
  /** Presence forceMount opt-in · 透传给 `<Presence>` (TR-PRES-2)。 */
  forceMount?: boolean;
  /**
   * Dismissal 通道开关 · 与 `useDismissal` flat opt-in 对齐（无 channels 包裹·
   * 无 routeChange）。
   * 默认值: pointerOutside=true · escapeKey=true · scrollOutside=true ·
   * focusOutside=false（OQ-POP-8 临时默认 A · Round 1 锁后回写）。
   */
  dismiss?: PopoverContentDismissOptions;
  /**
   * Force Round 0 默认 `false` · 当为 true 时 children 必须是单一 ReactElement。
   * v0.1.2 Round 0 暂未实现 asChild 路径 · 占位符 · v1.x 视诉求展开。
   */
  asChild?: boolean;
  children?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Popover.Root
// ─────────────────────────────────────────────────────────────────────────────

function PopoverRoot(props: PopoverRootProps): React.ReactElement {
  const { open: openProp, defaultOpen, onOpenChange, children } = props;

  const [open, setOpenState] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLElement | null>(null);
  const triggerId = React.useId();
  const contentId = React.useId();

  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next);
    },
    [setOpenState],
  );

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      contentRef,
      triggerId,
      contentId,
    }),
    [open, setOpen, triggerId, contentId],
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

PopoverRoot.displayName = 'Popover.Root';

// ─────────────────────────────────────────────────────────────────────────────
// Popover.Trigger
// ─────────────────────────────────────────────────────────────────────────────

const PopoverTrigger = React.forwardRef<HTMLElement, PopoverTriggerProps>(
  function PopoverTrigger(props, forwardedRef) {
    const { asChild = true, children } = props;
    const ctx = usePopoverContext('Popover.Trigger');

    if (process.env.NODE_ENV !== 'production' && asChild === false) {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Popover] Popover.Trigger v1 only supports `asChild=true` ' +
          '(default). Pass a single ReactElement child (e.g. <button>).',
      );
    }

    if (!React.isValidElement(children)) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(
          '[PrismUI Popover] Popover.Trigger requires exactly one ReactElement child.',
        );
      }
      return null;
    }

    const child = children as React.ReactElement<
      React.HTMLAttributes<HTMLElement> & { id?: string; ref?: React.Ref<HTMLElement> }
    >;
    const childProps = child.props ?? {};

    const composedRef = composeRefs<HTMLElement>(
      ctx.triggerRef,
      forwardedRef,
      getElementRef(child),
    );

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      childProps.onClick?.(event as React.MouseEvent<HTMLElement>);
      if (event.defaultPrevented) return;
      ctx.setOpen(!ctx.open);
    };

    const merged: Record<string, unknown> = {
      ...childProps,
      id: childProps.id ?? ctx.triggerId,
      'aria-expanded': ctx.open,
      'aria-controls': ctx.contentId,
      'aria-haspopup': childProps['aria-haspopup'] ?? 'dialog',
      'data-state': ctx.open ? 'open' : 'closed',
      onClick: handleClick,
      ref: composedRef,
    };

    return React.cloneElement(child, merged);
  },
);

PopoverTrigger.displayName = 'Popover.Trigger';

// ─────────────────────────────────────────────────────────────────────────────
// Popover.Content
// ─────────────────────────────────────────────────────────────────────────────

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(props, forwardedRef) {
    const {
      placement = 'bottom-start',
      offset: offsetValue = 8,
      container,
      forceMount,
      dismiss,
      asChild,
      children,
      style,
      role,
      id,
      ...rest
    } = props;

    const ctx = usePopoverContext('Popover.Content');

    if (process.env.NODE_ENV !== 'production' && asChild === true) {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Popover] Popover.Content `asChild` is reserved for v1.x. ' +
          'v0.1.2 ships without an asChild path; this prop is currently a no-op.',
      );
    }

    // ── Floating positioning ────────────────────────────────────────────────
    const middleware = React.useMemo(
      () => buildDefaultMiddleware({ offset: offsetValue }),
      [offsetValue],
    );
    const { refs, floatingStyles } = useFloatingPosition({
      placement,
      middleware,
    });

    // Sync the trigger DOM element into vendor's reference channel. Runs after
    // every commit — cheap and ensures the floating-ui autoUpdate loop sees
    // the latest trigger node (e.g. when the trigger remounts).
    React.useLayoutEffect(() => {
      refs.setReference(ctx.triggerRef.current as FloatingReference | null);
    });

    // ── Dismissal (4 channel · flat opt-in) ─────────────────────────────────
    useDismissPopover({
      open: ctx.open,
      onOpenChange: ctx.setOpen,
      triggerRef: ctx.triggerRef,
      overlayRef: ctx.contentRef,
      pointerOutside: dismiss?.pointerOutside,
      escapeKey: dismiss?.escapeKey,
      focusOutside: dismiss?.focusOutside,
      scrollOutside: dismiss?.scrollOutside,
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
            role={role}
            tabIndex={rest.tabIndex ?? -1}
            style={mergedStyle}
            aria-labelledby={rest['aria-labelledby'] ?? ctx.triggerId}
          >
            {children}
          </div>
        </Presence>
      </Portal>
    );
  },
);

PopoverContent.displayName = 'Popover.Content';

// ─────────────────────────────────────────────────────────────────────────────
// Popover.Anchor (optional · explicit reference override · advanced usage)
// ─────────────────────────────────────────────────────────────────────────────

export interface PopoverAnchorProps {
  asChild?: boolean;
  children: React.ReactElement;
}

const PopoverAnchor = React.forwardRef<HTMLElement, PopoverAnchorProps>(
  function PopoverAnchor(props, forwardedRef) {
    const { children } = props;
    const ctx = usePopoverContext('Popover.Anchor');

    if (!React.isValidElement(children)) {
      return null;
    }

    const child = children as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>;
    const composedRef = composeRefs<HTMLElement>(
      ctx.triggerRef,
      forwardedRef,
      getElementRef(child),
    );

    return React.cloneElement(child, { ref: composedRef } as Record<string, unknown>);
  },
);

PopoverAnchor.displayName = 'Popover.Anchor';

// ─────────────────────────────────────────────────────────────────────────────
// Compound export
// ─────────────────────────────────────────────────────────────────────────────

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Anchor: PopoverAnchor,
};

// ── ref helpers ─────────────────────────────────────────────────────────────

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
