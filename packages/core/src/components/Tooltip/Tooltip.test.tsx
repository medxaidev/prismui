/**
 * Tooltip · test matrix · Phase 3 实施验证。
 *
 * Contract: `@/devdocs/components/Tooltip/design.md` v0.5 §九 (15 tests +
 *           1 OQ-TT-10 合约测例 = 16 · v0.5 升格为合约).
 *
 * Round 1 + Phase 3 + OQ-TT-10 终锁 (10/10 OQ · 路 3 = APG either-may-close).
 *
 * Coverage map:
 *   · TT-LIFE × 4   (lifecycle: hover/focus/leave/blur paths)
 *   · TT-DELAY × 3  (cancelOpen / cancelClose / default 500ms)
 *   · TT-PRESENCE × 2 (TR-PRES-3 reverse · entering↔exiting no remount)
 *   · TT-A11Y × 3   (aria-describedby / role=tooltip / focusable child warn)
 *   · TT-DISMISS × 2 (Esc 独立场景 / scroll-outside)
 *   · TT-EDGE × 1   (pointerType='touch' filter)
 *   · TT-DISMISS-1b' (OQ-TT-10 合约 · v0.5 锁定 path 3 · Popover-nested Esc
 *     closes both = APG either-may-close · v1.x 不可退化)
 */

import * as React from 'react';
import { act, render, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Tooltip } from './Tooltip';
import { Popover } from '../Popover';
import { __resetDismissalStack } from '../../core/overlay/dismissal';

// ── helpers ──────────────────────────────────────────────────────────────

async function wait(ms = 0) {
  await act(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
  });
}

async function nextFrame() {
  await act(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

function dispatchPointerOver(target: Element, pointerType: 'mouse' | 'touch' | 'pen' = 'mouse') {
  target.dispatchEvent(
    new PointerEvent('pointerover', { bubbles: true, cancelable: true, pointerType }),
  );
}

function dispatchPointerOut(target: Element, pointerType: 'mouse' | 'touch' | 'pen' = 'mouse') {
  target.dispatchEvent(
    new PointerEvent('pointerout', {
      bubbles: true,
      cancelable: true,
      pointerType,
      relatedTarget: document.body,
    }),
  );
}

function dispatchScroll(target: EventTarget = document) {
  target.dispatchEvent(new Event('scroll', { bubbles: true }));
}

function getContent(): HTMLElement | null {
  return document.querySelector('[data-testid="content"]');
}

beforeEach(() => {
  __resetDismissalStack();
});

afterEach(() => {
  __resetDismissalStack();
});

// ── harness ─────────────────────────────────────────────────────────────

interface HarnessProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  forceMount?: boolean;
  dismiss?: { scrollOutside?: boolean };
  contentStyle?: React.CSSProperties;
  contentChildren?: React.ReactNode;
  triggerProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

function TooltipHarness(props: HarnessProps) {
  return (
    <Tooltip.Root
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      {...(props.openDelay !== undefined ? { openDelay: props.openDelay } : {})}
      {...(props.closeDelay !== undefined ? { closeDelay: props.closeDelay } : {})}
    >
      <Tooltip.Trigger>
        <button data-testid="trigger" type="button" {...(props.triggerProps ?? {})}>
          trigger
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content
        data-testid="content"
        forceMount={props.forceMount}
        dismiss={props.dismiss}
        style={props.contentStyle}
      >
        {props.contentChildren ?? 'tip'}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TT-LIFE × 4 · 生命周期
// ─────────────────────────────────────────────────────────────────────────────

describe('Tooltip · TT-LIFE-1 · hover trigger waits openDelay then mounts', () => {
  it('pointerover (mouse) on trigger · waits openDelay · then mounts', async () => {
    const { getByTestId } = render(<TooltipHarness openDelay={20} />);
    const trigger = getByTestId('trigger');
    act(() => dispatchPointerOver(trigger));
    expect(getContent()).toBeNull(); // openDelay still pending

    await wait(30);
    expect(getContent()).not.toBeNull();
  });
});

describe('Tooltip · TT-LIFE-2 · focus path is immediate (no openDelay)', () => {
  it('focus on trigger · content mounts synchronously even with large openDelay', () => {
    const { getByTestId } = render(<TooltipHarness openDelay={500} />);
    fireEvent.focus(getByTestId('trigger'));
    expect(getContent()).not.toBeNull();
  });
});

describe('Tooltip · TT-LIFE-3 · pointerleave waits closeDelay then exits + unmounts', () => {
  it('hover open · pointerout · waits closeDelay · exiting → unmount', async () => {
    const { getByTestId } = render(
      <TooltipHarness openDelay={20} closeDelay={20} />,
    );
    const trigger = getByTestId('trigger');
    act(() => dispatchPointerOver(trigger));
    await wait(30);
    await nextFrame();
    expect(getContent()).not.toBeNull();
    expect(getContent()!.getAttribute('data-state')).toBe('open');

    act(() => dispatchPointerOut(trigger));
    // closeDelay still pending — content remains open
    expect(getContent()!.getAttribute('data-state')).toBe('open');

    await wait(30);
    // setOpen(false) has fired → presence dispatched close → exiting
    expect(getContent()!.getAttribute('data-state')).toBe('exiting');

    await nextFrame();
    expect(getContent()).toBeNull();
  });
});

describe('Tooltip · TT-LIFE-4 · blur waits closeDelay then unmounts', () => {
  it('focus opens · blur · closeDelay · unmount', async () => {
    const { getByTestId } = render(<TooltipHarness closeDelay={20} />);
    const trigger = getByTestId('trigger');
    fireEvent.focus(trigger);
    await nextFrame();
    expect(getContent()).not.toBeNull();
    expect(getContent()!.getAttribute('data-state')).toBe('open');

    fireEvent.blur(trigger);
    expect(getContent()!.getAttribute('data-state')).toBe('open'); // closeDelay window

    await wait(30);
    expect(getContent()!.getAttribute('data-state')).toBe('exiting');
    await nextFrame();
    expect(getContent()).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TT-DELAY × 3 · 延迟协议
// ─────────────────────────────────────────────────────────────────────────────

describe('Tooltip · TT-DELAY-1 · pointerout during openDelay cancels open', () => {
  it('pointerover then pointerout before openDelay · content never mounts', async () => {
    const { getByTestId } = render(
      <TooltipHarness openDelay={50} closeDelay={50} />,
    );
    const trigger = getByTestId('trigger');
    act(() => dispatchPointerOver(trigger));
    await wait(20);
    expect(getContent()).toBeNull();

    act(() => dispatchPointerOut(trigger));
    // After cancel, the openDelay timer is cleared. closeDelay starts but
    // open is already false, so the close timeout will set false→false
    // (idempotent). Either way, content must not appear.
    await wait(120);
    expect(getContent()).toBeNull();
  });
});

describe('Tooltip · TT-DELAY-2 · re-enter during closeDelay cancels close', () => {
  it('pointerout then pointerover before closeDelay · content stays open', async () => {
    const { getByTestId } = render(
      <TooltipHarness openDelay={20} closeDelay={50} />,
    );
    const trigger = getByTestId('trigger');
    act(() => dispatchPointerOver(trigger));
    await wait(30);
    await nextFrame();
    expect(getContent()).not.toBeNull();
    expect(getContent()!.getAttribute('data-state')).toBe('open');

    act(() => dispatchPointerOut(trigger));
    await wait(20); // half of closeDelay — close still pending
    act(() => dispatchPointerOver(trigger)); // cancels close
    await wait(80); // wait past where close would have fired

    expect(getContent()).not.toBeNull();
    expect(getContent()!.getAttribute('data-state')).toBe('open');
  });
});

describe('Tooltip · TT-DELAY-3 · default openDelay = 500ms (Round 1 OQ-TT-1)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('no openDelay override · content stays closed at 499ms · mounts at 500ms', () => {
    const { getByTestId } = render(<TooltipHarness />);
    const trigger = getByTestId('trigger');
    act(() => dispatchPointerOver(trigger));

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(getContent()).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(getContent()).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TT-PRESENCE × 2 · TR-PRES-3 reverse paths
// ─────────────────────────────────────────────────────────────────────────────

describe('Tooltip · TT-PRESENCE-1 · entering → exiting reverse · same node', () => {
  it('mid-entering pointerout (after closeDelay) · reverses to exiting · no remount', async () => {
    const { getByTestId } = render(
      <TooltipHarness
        openDelay={10}
        closeDelay={10}
        contentStyle={{ transitionDuration: '200ms' }}
      />,
    );
    const trigger = getByTestId('trigger');
    act(() => dispatchPointerOver(trigger));
    await wait(15);
    const content = getContent();
    expect(content).not.toBeNull();
    expect(content!.getAttribute('data-state')).toBe('entering');

    act(() => dispatchPointerOut(trigger));
    await wait(15);
    // closeDelay fired → setOpen(false) · presence: entering + 'close' → exiting (TR-PRES-4)
    expect(getContent()).toBe(content); // SAME node — reverse, not remount
    expect(content!.getAttribute('data-state')).toBe('exiting');
  });
});

describe('Tooltip · TT-PRESENCE-2 · exiting → entering reverse · same node', () => {
  it('mid-exiting pointerover (after closeDelay+openDelay) · reverses to entering · no remount', async () => {
    const { getByTestId } = render(
      <TooltipHarness
        openDelay={10}
        closeDelay={10}
        contentStyle={{ transitionDuration: '200ms' }}
      />,
    );
    const trigger = getByTestId('trigger');
    // 1) Hover → mount (entering)
    act(() => dispatchPointerOver(trigger));
    await wait(15);
    const content = getContent();
    expect(content).not.toBeNull();

    // Wait for transitionend on entering → simulate completion to reach 'open'.
    act(() => {
      content!.dispatchEvent(
        new TransitionEvent('transitionend', { bubbles: true, propertyName: 'opacity' }),
      );
    });
    expect(content!.getAttribute('data-state')).toBe('open');

    // 2) Leave → schedule close
    act(() => dispatchPointerOut(trigger));
    await wait(15);
    expect(content!.getAttribute('data-state')).toBe('exiting');

    // 3) Re-enter mid-exit → schedule open → after openDelay, setOpen(true)
    //    presence: exiting + 'open' → entering (TR-PRES-4 reverse)
    act(() => dispatchPointerOver(trigger));
    await wait(15);
    expect(getContent()).toBe(content); // SAME node — reverse, not remount
    expect(content!.getAttribute('data-state')).toBe('entering');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TT-A11Y × 3
// ─────────────────────────────────────────────────────────────────────────────

describe('Tooltip · TT-A11Y-1 · trigger has aria-describedby = content.id', () => {
  it('content id matches trigger aria-describedby', () => {
    const { getByTestId } = render(<TooltipHarness defaultOpen />);
    const trigger = getByTestId('trigger');
    const content = getByTestId('content');
    expect(content.id).toBeTruthy();
    expect(trigger.getAttribute('aria-describedby')).toContain(content.id);
  });
});

describe('Tooltip · TT-A11Y-2 · content has role="tooltip"', () => {
  it('content always carries role="tooltip" (cannot be overridden)', () => {
    const { getByTestId } = render(<TooltipHarness defaultOpen />);
    const content = getByTestId('content');
    expect(content.getAttribute('role')).toBe('tooltip');
  });
});

describe('Tooltip · TT-A11Y-3 · DEV warn when content has focusable children', () => {
  it('focusable child (input) inside content · console.warn fires', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <TooltipHarness
        defaultOpen
        contentChildren={<input data-testid="bad-focusable" />}
      />,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('focusable elements'),
    );
    warnSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TT-DISMISS × 2 · 独立场景 + scrollOutside
// ─────────────────────────────────────────────────────────────────────────────

describe('Tooltip · TT-DISMISS-1 · independent · Esc on focused trigger closes', () => {
  it('focus-open · keydown Escape on trigger (React onKeyDown bubble) · onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(<TooltipHarness onOpenChange={onOpenChange} />);
    const trigger = getByTestId('trigger');
    fireEvent.focus(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Tooltip · TT-DISMISS-2 · scroll-outside default closes', () => {
  it('document scroll · onOpenChange(false) (scrollOutside default true)', async () => {
    const onOpenChange = vi.fn();
    render(<TooltipHarness defaultOpen onOpenChange={onOpenChange} />);
    await nextFrame();
    onOpenChange.mockClear();

    act(() => dispatchScroll(document));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TT-EDGE × 1 · touch filter
// ─────────────────────────────────────────────────────────────────────────────

describe('Tooltip · TT-EDGE-1 · pointerType="touch" does not open tooltip', () => {
  it('pointerover with pointerType=touch · content never mounts', async () => {
    const { getByTestId } = render(<TooltipHarness openDelay={20} />);
    const trigger = getByTestId('trigger');
    act(() => dispatchPointerOver(trigger, 'touch'));
    await wait(30);
    expect(getContent()).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TT-DISMISS-1b' · OQ-TT-10 合约（v0.5 锁定 path 3）· nested Esc closes both
// ─────────────────────────────────────────────────────────────────────────────

describe('Tooltip · TT-DISMISS-1b\' · OQ-TT-10 合约 · nested Esc closes both (path 3 locked v0.5)', () => {
  it('Popover-nested Tooltip · single Esc closes Tooltip + Popover (path 3 baseline)', () => {
    const onPopoverChange = vi.fn();
    const onTooltipChange = vi.fn();

    function NestedHarness() {
      return (
        <Popover.Root defaultOpen onOpenChange={onPopoverChange}>
          <Popover.Trigger>
            <button data-testid="popover-trigger" type="button">
              popoverTrigger
            </button>
          </Popover.Trigger>
          <Popover.Content data-testid="popover-content">
            <Tooltip.Root onOpenChange={onTooltipChange} closeDelay={20}>
              <Tooltip.Trigger>
                <button data-testid="tooltip-trigger" type="button">
                  tooltipTrigger
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content data-testid="content">tip</Tooltip.Content>
            </Tooltip.Root>
          </Popover.Content>
        </Popover.Root>
      );
    }

    const { getByTestId } = render(<NestedHarness />);
    const tooltipTrigger = getByTestId('tooltip-trigger');

    // Open tooltip via focus on its trigger.
    fireEvent.focus(tooltipTrigger);
    expect(onTooltipChange).toHaveBeenCalledWith(true);

    onTooltipChange.mockClear();
    onPopoverChange.mockClear();

    // Single Esc keydown — bubbles through window. Path 3 contract:
    //   1. window-capture phase  → Popover useDismissPopover.escapeKey closes Popover.
    //   2. React bubble phase    → Tooltip.Trigger.onKeyDown closes Tooltip.
    fireEvent.keyDown(tooltipTrigger, { key: 'Escape' });

    expect(onTooltipChange).toHaveBeenCalledWith(false);
    expect(onPopoverChange).toHaveBeenCalledWith(false);
  });
});
