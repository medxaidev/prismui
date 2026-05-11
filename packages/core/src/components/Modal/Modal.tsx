/**
 * Modal · Compound component (Root / Trigger / Backdrop / Content / Title /
 * Description / Close).
 *
 * Authority: ADR-007 决策 15 (compound API · 7 subcomponents) +
 * 决策 13 (TR-MODAL-1 双 Presence) + 决策 4 (Section schema 复用) +
 * 决策 8-11 (dismiss 2 channel + role 转发) + 决策 6 (size 5 档) +
 * 决策 16 (role 属性路径 · 不引独立 AlertDialog 组件).
 *
 * Architecture (议题 E 决策 15 + 议题 D 决策 13):
 *   Modal.Root          — open 状态 + refs + 4 ids + role + dismiss flags + Context
 *   Modal.Trigger       — asChild · 注入 onClick / aria-* / triggerRef
 *   Modal.Backdrop      — Portal + 独立 Presence + 默认 visual (LY-MODAL-3)
 *   Modal.Content       — Portal + 独立 Presence + ModalScrollLock + useFocusTrap
 *                         + useDismissModal + Section(surface="overlay") +
 *                         ARIA wiring + size + onKeyDownCapture (决策 11)
 *   Modal.Title         — SectionTitle(component="h2", id=titleId) alias (决策 4)
 *   Modal.Description   — SectionDescription(component="p", id=descriptionId)
 *                         alias (决策 16 · v1.0.10 反推已落 · ADR-007 留口闭环)
 *   Modal.Close         — asChild · 注入 onClick / type=button
 *
 * Observable invariants locked: OV-MODAL-1 (trap focus 三子合约 · Phase 7a) +
 * OV-MODAL-2 (scroll-lock body) + OV-MODAL-3/4 (backdrop 独立 + dismiss 2 channel) +
 * LY-MODAL-1/2/3/4 + SZ-MODAL-1 + TR-MODAL-1.
 */

import * as React from 'react';

import { Portal } from '../../core/overlay/portal';
import { Presence } from '../../core/transition/presence';
import { useControllableState } from '../../hooks/use-controllable-state';
import { Section, SectionDescription, SectionTitle } from '../../primitives/section';

import { ModalContext, useModalContext, type ModalRole } from './modal-context';
import { useFocusTrap } from './_internal/useFocusTrap';
import { ModalScrollLock } from './_internal/scrollLock';
import { useStackingContextWarning } from './_internal/useStackingContextWarning';
import { useDismissModal } from './useDismissModal';
import classes from './Modal.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export interface ModalRootProps {
  /** 受控 open。与 defaultOpen 互斥。 */
  open?: boolean;
  /** 非受控 open 初始值。 */
  defaultOpen?: boolean;
  /** open 变化回调（受控 / 非受控均触发）。 */
  onOpenChange?: (open: boolean) => void;
  /**
   * ARIA role · `'dialog'` (default) | `'alertdialog'` (议题 E 决策 16 ·
   * 不引独立 AlertDialog 组件 · `<Modal role="alertdialog">` 转发 ARIA)。
   */
  role?: ModalRole;
  /**
   * ESC dismissal 通道开关 · 默认 `true` (议题 C 决策 9 · 5/5 库 default-on
   * consensus)。设 `false` 时 Modal 在 ESC 上不关闭 · 但仍阻止事件冒泡至外层
   * 页面 keydown 处理（决策 11 OV-MODAL-4 顶层吞）。
   */
  dismissOnEscape?: boolean;
  /**
   * Backdrop click dismissal 通道开关 · 默认 `true` (议题 C 决策 8)。
   * 实现 = 委托 `useDismissal.pointerOutside` · backdrop 作 Portal sibling 后
   * 自然触发 pointer-outside (overlayRef = contentRef · target 不在 contentRef 内)。
   */
  dismissOnBackdropClick?: boolean;
  /** Context Provider 子节点。 */
  children: React.ReactNode;
}

export interface ModalTriggerProps {
  /**
   * asChild · 默认 true · 把 trigger 行为合并入用户传入 element (mirror Radix /
   * Popover.Trigger)。当 true 时 children 必须是单一 ReactElement。
   */
  asChild?: boolean;
  children: React.ReactElement;
}

export interface ModalBackdropProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  /** Portal container override · 透传给 `<Portal>` (OV-PORTAL-1)。 */
  container?: React.ComponentProps<typeof Portal>['container'];
  /** Presence forceMount opt-in · 透传给 `<Presence>` (TR-PRES-2)。 */
  forceMount?: boolean;
  /**
   * asChild · v1 reserved · 当前 no-op + dev warning (议题 E 决策 15
   * 「全节点支持 asChild」前向兼容形态 · 同 Popover.Content asChild 范式)。
   */
  asChild?: boolean;
}

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number | string;

export interface ModalContentProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'role'> {
  /**
   * Panel size · 5 档 preset (`xs/sm/md/lg/xl`) + numeric/string fallback ·
   * 默认 `md` (议题 B 决策 6 LY-MODAL-2)。Preset 走 `data-size` 属性 + CSS
   * var (`--prismui-modal-size-*` Phase 7c 锁数值)。Numeric/string 走
   * `style.width` inline。
   */
  size?: ModalSize;
  /** Portal container override · 透传给 `<Portal>` (OV-PORTAL-1)。 */
  container?: React.ComponentProps<typeof Portal>['container'];
  /** Presence forceMount opt-in · 透传给 `<Presence>`。 */
  forceMount?: boolean;
  /**
   * asChild · v1 reserved · 当前 no-op + dev warning (前向兼容形态)。
   */
  asChild?: boolean;
  children?: React.ReactNode;
}

export interface ModalTitleProps {
  /** Heading element override · 默认 `<h2>` (Stage-15 SectionTitle 默认)。 */
  component?: React.ElementType;
  /** asChild · v1 reserved · no-op + dev warning。 */
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export interface ModalDescriptionProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'children'> {
  /**
   * Element override · 默认 `<p>` (Stage-15 SectionDescription 默认)。
   * Parity with `ModalTitleProps.component`. Use a different element when
   * the description must sit inline (`component="span"`) or host block
   * children (`component="div"`).
   */
  component?: React.ElementType;
  /** asChild · v1 reserved · no-op + dev warning。 */
  asChild?: boolean;
  children?: React.ReactNode;
}

export interface ModalCloseProps {
  /** asChild · 默认 true · 把 close 行为合并入用户传入 element。 */
  asChild?: boolean;
  children: React.ReactElement;
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Root
// ─────────────────────────────────────────────────────────────────────────────

function ModalRoot(props: ModalRootProps): React.ReactElement {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    role = 'dialog',
    dismissOnEscape = true,
    dismissOnBackdropClick = true,
    children,
  } = props;

  const [open, setOpenState] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLElement | null>(null);
  const backdropRef = React.useRef<HTMLElement | null>(null);
  const triggerId = React.useId();
  const contentId = React.useId();
  const titleId = React.useId();
  const descriptionId = React.useId();

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
      backdropRef,
      triggerId,
      contentId,
      titleId,
      descriptionId,
      role,
      dismissOnEscape,
      dismissOnBackdropClick,
    }),
    [
      open,
      setOpen,
      triggerId,
      contentId,
      titleId,
      descriptionId,
      role,
      dismissOnEscape,
      dismissOnBackdropClick,
    ],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

ModalRoot.displayName = 'Modal.Root';

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Trigger
// ─────────────────────────────────────────────────────────────────────────────

const ModalTrigger = React.forwardRef<HTMLElement, ModalTriggerProps>(
  function ModalTrigger(props, forwardedRef) {
    const { asChild = true, children } = props;
    const ctx = useModalContext('Modal.Trigger');

    if (process.env.NODE_ENV !== 'production' && asChild === false) {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Modal] Modal.Trigger v1 only supports `asChild=true` ' +
          '(default). Pass a single ReactElement child (e.g. <button>).',
      );
    }

    if (!React.isValidElement(children)) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(
          '[PrismUI Modal] Modal.Trigger requires exactly one ReactElement child.',
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

    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
      childProps.onClick?.(event);
      if (event.defaultPrevented) return;
      ctx.setOpen(!ctx.open);
    };

    // WAI-ARIA 1.2 §6.6.7 · valid aria-haspopup tokens are
    //   false | true | menu | listbox | tree | grid | dialog
    // `alertdialog` is **not** a valid haspopup value (axe a11y rule
    // `aria-valid-attr-value` flags it as critical · ADR-007 决策 16 ARIA
    // wiring · 议题 E B 路径 role 转发只走 `role` attribute). We always emit
    // `'dialog'` here regardless of `ctx.role`; the `role="alertdialog"`
    // semantic is conveyed through `Modal.Content[role]` and the Trigger's
    // `aria-controls` pointing at that content.
    const merged: Record<string, unknown> = {
      ...childProps,
      id: childProps.id ?? ctx.triggerId,
      'aria-haspopup': childProps['aria-haspopup'] ?? 'dialog',
      'aria-expanded': ctx.open,
      'aria-controls': ctx.contentId,
      'data-state': ctx.open ? 'open' : 'closed',
      onClick: handleClick,
      ref: composedRef,
    };

    return React.cloneElement(child, merged);
  },
);

ModalTrigger.displayName = 'Modal.Trigger';

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Backdrop
// ─────────────────────────────────────────────────────────────────────────────

const ModalBackdrop = React.forwardRef<HTMLDivElement, ModalBackdropProps>(
  function ModalBackdrop(props, forwardedRef) {
    const {
      container,
      forceMount,
      asChild,
      className,
      style,
      ...rest
    } = props;

    const ctx = useModalContext('Modal.Backdrop');

    if (process.env.NODE_ENV !== 'production' && asChild === true) {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Modal] Modal.Backdrop `asChild` is reserved for v1.x. ' +
          'v1 ships without an asChild path; this prop is currently a no-op.',
      );
    }

    const composedRef = composeRefs<HTMLDivElement>(
      ctx.backdropRef as React.RefObject<HTMLDivElement | null>,
      forwardedRef,
    );

    const mergedClassName = className ? `${classes.backdrop} ${className}` : classes.backdrop;

    return (
      <Portal container={container}>
        <Presence open={ctx.open} forceMount={forceMount}>
          <div
            {...rest}
            ref={composedRef}
            aria-hidden="true"
            className={mergedClassName}
            style={style}
          />
        </Presence>
      </Portal>
    );
  },
);

ModalBackdrop.displayName = 'Modal.Backdrop';

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Content
// ─────────────────────────────────────────────────────────────────────────────

const SIZE_PRESETS: ReadonlySet<string> = new Set(['xs', 'sm', 'md', 'lg', 'xl']);

function isPresetSize(size: ModalSize): size is 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
  return typeof size === 'string' && SIZE_PRESETS.has(size);
}

const ModalContent = React.forwardRef<HTMLElement, ModalContentProps>(
  function ModalContent(props, forwardedRef) {
    const {
      size = 'md',
      container,
      forceMount,
      asChild,
      className,
      style,
      id,
      children,
      onKeyDownCapture: userKeyDownCapture,
      ...rest
    } = props;

    const ctx = useModalContext('Modal.Content');

    if (process.env.NODE_ENV !== 'production' && asChild === true) {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Modal] Modal.Content `asChild` is reserved for v1.x. ' +
          'v1 ships without an asChild path; this prop is currently a no-op.',
      );
    }

    // ── Dismissal (议题 C 决策 8-11) ───────────────────────────────────────
    // Stays at outer layer · useDismissal reads refs lazily on each event ·
    // does NOT require contentRef to be populated at first effect run.
    useDismissModal({
      open: ctx.open,
      onOpenChange: ctx.setOpen,
      triggerRef: ctx.triggerRef,
      contentRef: ctx.contentRef,
      dismissOnEscape: ctx.dismissOnEscape,
      dismissOnBackdropClick: ctx.dismissOnBackdropClick,
    });

    // ── Size resolution (议题 B 决策 6 LY-MODAL-2) ─────────────────────────
    const sizePreset = isPresetSize(size) ? size : null;
    const inlineWidth =
      !sizePreset && (typeof size === 'number' || typeof size === 'string')
        ? typeof size === 'number'
          ? `${size}px`
          : size
        : undefined;

    const mergedStyle: React.CSSProperties = inlineWidth
      ? { ...style, width: inlineWidth }
      : style ?? {};

    const mergedClassName = className ? `${classes.content} ${className}` : classes.content;

    // ── ARIA wiring (议题 E 决策 16) ────────────────────────────────────────
    const ariaLabelledBy = rest['aria-labelledby'] ?? ctx.titleId;
    const ariaDescribedBy = rest['aria-describedby'] ?? ctx.descriptionId;

    // **Architecture note** — ModalScrollLock placed OUTSIDE Presence so the
    // Slot inside Presence can clone Section directly (data-state + ref merge
    // routed through Section's polymorphic forwardRef). useFocusTrap is moved
    // to `<ModalContentPanel>` (inner component) which mounts only after
    // Presence transitions from 'closed' → 'entering' → renders the Section
    // subtree → contentRef populated → trap effect fires correctly.
    return (
      <Portal container={container}>
        <ModalScrollLock active={ctx.open}>
          <Presence open={ctx.open} forceMount={forceMount}>
            <ModalContentPanel
              ref={forwardedRef}
              userRest={rest}
              userId={id}
              ariaLabelledBy={ariaLabelledBy}
              ariaDescribedBy={ariaDescribedBy}
              sizePreset={sizePreset}
              userKeyDownCapture={userKeyDownCapture}
              className={mergedClassName}
              style={mergedStyle}
            >
              {children}
            </ModalContentPanel>
          </Presence>
        </ModalScrollLock>
      </Portal>
    );
  },
);

ModalContent.displayName = 'Modal.Content';

// ─────────────────────────────────────────────────────────────────────────────
// ModalContentPanel — internal · renders inside <Presence> Slot · receives
//   `data-state` injected by Slot.cloneElement and forwards to <Section>.
//   useFocusTrap lives here so its useEffect fires AFTER Section mounts
//   (i.e. after Presence transitions to 'entering' on first commit).
// ─────────────────────────────────────────────────────────────────────────────

interface ModalContentPanelProps {
  userRest: Omit<
    React.HTMLAttributes<HTMLElement>,
    'children' | 'role' | 'className' | 'style' | 'id'
  >;
  userId: string | undefined;
  ariaLabelledBy: string;
  ariaDescribedBy: string;
  sizePreset: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | null;
  userKeyDownCapture:
    | ((event: React.KeyboardEvent<HTMLElement>) => void)
    | undefined;
  className: string;
  style: React.CSSProperties;
  children?: React.ReactNode;
  /** Injected by Stage-12 Presence Slot (TR-PROTO-1). */
  'data-state'?: string;
}

const ModalContentPanel = React.forwardRef<HTMLElement, ModalContentPanelProps>(
  function ModalContentPanel(props, presenceRef) {
    const {
      userRest,
      userId,
      ariaLabelledBy,
      ariaDescribedBy,
      sizePreset,
      userKeyDownCapture,
      className,
      style,
      children,
      'data-state': dataState,
    } = props;

    const ctx = useModalContext('Modal.Content');

    // Focus trap (议题 A 决策 1-3 · OV-MODAL-1). Mounts here = inside Presence
    // subtree · contentRef is populated by composedRef before this effect fires.
    useFocusTrap({
      active: ctx.open,
      containerRef: ctx.contentRef,
    });

    // PR-INTEROP-4 dev-mode anti-pattern warning (ADR-007 决策 20 · V2 path).
    // Mounted here for the same reason as useFocusTrap: contentRef must be
    // populated before the effect runs. The hook is a strict no-op in
    // production (NODE_ENV gate inside · tree-shaken at build).
    useStackingContextWarning({
      active: ctx.open,
      contentRef: ctx.contentRef,
    });

    const composedRef = composeRefs<HTMLElement>(ctx.contentRef, presenceRef);

    // onKeyDownCapture (决策 11 OV-MODAL-4 顶层吞 keydown).
    const handleKeyDownCapture = (event: React.KeyboardEvent<HTMLElement>): void => {
      userKeyDownCapture?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'Escape' && !ctx.dismissOnEscape) {
        event.stopPropagation();
      }
    };

    return (
      <Section
        {...(userRest as React.HTMLAttributes<HTMLElement>)}
        ref={composedRef as React.Ref<HTMLElement>}
        surface="overlay"
        id={userId ?? ctx.contentId}
        role={ctx.role}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={userRest.tabIndex ?? -1}
        data-size={sizePreset ?? undefined}
        data-state={dataState}
        className={className}
        style={style}
        onKeyDownCapture={handleKeyDownCapture}
      >
        {children}
      </Section>
    );
  },
);

ModalContentPanel.displayName = 'Modal.ContentPanel';

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Title — SectionTitle alias (议题 B 决策 4)
// ─────────────────────────────────────────────────────────────────────────────

const ModalTitle = React.forwardRef<HTMLElement, ModalTitleProps>(
  function ModalTitle(props, forwardedRef) {
    const { component, asChild, className, children, id, ...rest } = props;
    const ctx = useModalContext('Modal.Title');

    if (process.env.NODE_ENV !== 'production' && asChild === true) {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Modal] Modal.Title `asChild` is reserved for v1.x. ' +
          'v1 ships without an asChild path; this prop is currently a no-op.',
      );
    }

    return (
      <SectionTitle
        {...rest}
        ref={forwardedRef as React.Ref<HTMLElement>}
        component={component ?? 'h2'}
        id={id ?? ctx.titleId}
        className={className}
      >
        {children}
      </SectionTitle>
    );
  },
);

ModalTitle.displayName = 'Modal.Title';

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Description — SectionDescription alias (议题 E 决策 16 · v1.0.10 反推已落)
// ─────────────────────────────────────────────────────────────────────────────
//
// Until Stage-15 v1.0.10 landed the SectionDescription primitive, this slot
// rendered a raw `<p>` (议题 E 决策 16 "不对称处理 · 待反推后切换"). v1.0.10
// closed that 留口 (`@/packages/core/src/primitives/section/SectionDescription`)
// so we now alias it identically to how Modal.Title aliases SectionTitle —
// single source of truth for the `.description` margin reset, re-usable
// outside Modal in any Section / Card surface.

const ModalDescription = React.forwardRef<HTMLElement, ModalDescriptionProps>(
  function ModalDescription(props, forwardedRef) {
    const { asChild, children, component, id, className, ...rest } = props;
    const ctx = useModalContext('Modal.Description');

    if (process.env.NODE_ENV !== 'production' && asChild === true) {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Modal] Modal.Description `asChild` is reserved for v1.x. ' +
          'v1 ships without an asChild path; this prop is currently a no-op. ' +
          'Use `component={Element}` to override the rendered tag (default <p>).',
      );
    }

    return (
      <SectionDescription
        {...rest}
        ref={forwardedRef as React.Ref<HTMLElement>}
        component={component ?? 'p'}
        id={id ?? ctx.descriptionId}
        className={className}
      >
        {children}
      </SectionDescription>
    );
  },
);

ModalDescription.displayName = 'Modal.Description';

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Close
// ─────────────────────────────────────────────────────────────────────────────

const ModalClose = React.forwardRef<HTMLElement, ModalCloseProps>(
  function ModalClose(props, forwardedRef) {
    const { asChild = true, children } = props;
    const ctx = useModalContext('Modal.Close');

    if (process.env.NODE_ENV !== 'production' && asChild === false) {
      // eslint-disable-next-line no-console
      console.error(
        '[PrismUI Modal] Modal.Close v1 only supports `asChild=true` ' +
          '(default). Pass a single ReactElement child (e.g. <button>).',
      );
    }

    if (!React.isValidElement(children)) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(
          '[PrismUI Modal] Modal.Close requires exactly one ReactElement child.',
        );
      }
      return null;
    }

    const child = children as React.ReactElement<
      React.ButtonHTMLAttributes<HTMLButtonElement> & {
        ref?: React.Ref<HTMLElement>;
      }
    >;
    const childProps = child.props ?? {};

    const composedRef = composeRefs<HTMLElement>(forwardedRef, getElementRef(child));

    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
      // Cast since user's child is constrained to button-like element.
      childProps.onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;
      ctx.setOpen(false);
    };

    const merged: Record<string, unknown> = {
      ...childProps,
      type: childProps.type ?? 'button',
      onClick: handleClick,
      ref: composedRef,
    };

    return React.cloneElement(child, merged);
  },
);

ModalClose.displayName = 'Modal.Close';

// ─────────────────────────────────────────────────────────────────────────────
// Compound export (议题 E 决策 15 · 7 subcomponents)
// ─────────────────────────────────────────────────────────────────────────────

export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Backdrop: ModalBackdrop,
  Content: ModalContent,
  Title: ModalTitle,
  Description: ModalDescription,
  Close: ModalClose,
};

// ── ref helpers (mirror Popover.tsx) ────────────────────────────────────────

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
