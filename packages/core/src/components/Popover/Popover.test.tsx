/**
 * Popover · Phase 2 联调测试矩阵.
 *
 * Contract: `@/devdocs/components/Popover/design.md` v0.1.2 §�?(PV-LIFE /
 * PV-DISMISS / PV-TIMING / PV-A11Y · ~15-20 tests).
 *
 * Each test covers a §9 row; the test title prefix maps 1:1 to the matrix id.
 */

import * as React from 'react';
import { act, render, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Popover } from './Popover';
import { __resetDismissalStack } from '../../core/overlay/dismissal';

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Advance one rAF inside `act`. jsdom's `getComputedStyle.transitionDuration`
 * is 0 by default, so Presence's duration=0 self-check schedules an rAF
 * `dispatch('end')` rather than installing a `transitionend` listener
 * (presence-primitive.md §�?layer-1). One rAF tick is therefore the canonical
 * way to flush `entering �?open` / `exiting �?closed` in tests.
 */
async function nextFrame() {
  await act(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

function dispatchKeyDown(key: string, init: KeyboardEventInit = {}) {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  );
}

function dispatchPointerDown(target: Element) {
  target.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerType: 'mouse',
    }),
  );
}

function dispatchScroll(target: EventTarget = document) {
  target.dispatchEvent(new Event('scroll', { bubbles: true }));
}

beforeEach(() => {
  __resetDismissalStack();
});

afterEach(() => {
  __resetDismissalStack();
});

// ─────────────────────────────────────────────────────────────────────────────
// Convenience harness �?uncontrolled by default.
// ─────────────────────────────────────────────────────────────────────────────

function PopoverHarness(props: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  forceMount?: boolean;
  dismiss?: React.ComponentProps<typeof Popover.Content>['dismiss'];
  contentRole?: string;
}) {
  const { defaultOpen, open, onOpenChange, forceMount, dismiss, contentRole } = props;
  return (
    <Popover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <Popover.Trigger>
        <button type="button" data-testid="trigger">
          Open
        </button>
      </Popover.Trigger>
      <Popover.Content
        data-testid="content"
        forceMount={forceMount}
        dismiss={dismiss}
        role={contentRole}
      >
        <span data-testid="content-child">hello</span>
        <button type="button" data-testid="content-button">
          act
        </button>
      </Popover.Content>
    </Popover.Root>
  );
}

function getContent(): HTMLElement | null {
  return document.querySelector('[data-testid="content"]');
}

// ─────────────────────────────────────────────────────────────────────────────
// PV-LIFE · �?primitive 编排基线
// ─────────────────────────────────────────────────────────────────────────────

describe('Popover · PV-LIFE-1 · initial closed', () => {
  it('open=false · content not rendered (Presence closed unmounts)', () => {
    render(<PopoverHarness />);
    expect(getContent()).toBeNull();
  });
});

describe('Popover · PV-LIFE-2 · open transitions through entering', () => {
  it('click trigger · content mounts with data-state="entering" then "open"', async () => {
    const { getByTestId } = render(<PopoverHarness />);
    fireEvent.click(getByTestId('trigger'));

    const content = getContent();
    expect(content).not.toBeNull();
    expect(content!.getAttribute('data-state')).toBe('entering');

    await nextFrame();
    expect(content!.getAttribute('data-state')).toBe('open');
  });
});

describe('Popover · PV-LIFE-3 · close transitions through exiting then unmounts', () => {
  it('open→close · content stays during exiting · unmounts after transitionend', async () => {
    const { getByTestId } = render(<PopoverHarness defaultOpen />);
    const content = getContent();
    expect(content).not.toBeNull();

    await nextFrame();
    expect(content!.getAttribute('data-state')).toBe('open');

    fireEvent.click(getByTestId('trigger'));
    expect(content!.getAttribute('data-state')).toBe('exiting');
    expect(getContent()).not.toBeNull(); // still mounted during exit

    await nextFrame();
    expect(getContent()).toBeNull(); // now unmounted
  });
});

describe('Popover · PV-LIFE-4 · forceMount keeps closed-state DOM rendered', () => {
  it('forceMount=true · content present when closed (data-state="closed")', () => {
    render(<PopoverHarness forceMount />);
    const content = getContent();
    expect(content).not.toBeNull();
    expect(content!.getAttribute('data-state')).toBe('closed');
  });
});

describe('Popover · PV-LIFE-5 · unmount cleanup', () => {
  it('Root unmount · content removed · stack cleared (no orphan listeners)', async () => {
    const { unmount, getByTestId } = render(<PopoverHarness />);
    fireEvent.click(getByTestId('trigger'));
    await nextFrame();
    expect(getContent()).not.toBeNull();

    unmount();
    expect(getContent()).toBeNull();
    // Subsequent Escape must not throw (no leftover listener firing on
    // disposed React state).
    expect(() => dispatchKeyDown('Escape')).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PV-DISMISS · 4 channel × Popover defaults
// ─────────────────────────────────────────────────────────────────────────────

describe('Popover · PV-DISMISS-1 · pointer-outside default closes', () => {
  it('pointerdown outside content+trigger · onOpenChange(false) · content unmounts after exit', async () => {
    const onOpenChange = vi.fn();
    render(<PopoverHarness defaultOpen onOpenChange={onOpenChange} />);
    await nextFrame();

    // anywhere outside content/trigger
    act(() => dispatchPointerDown(document.body));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(getContent()!.getAttribute('data-state')).toBe('exiting');
  });
});

describe('Popover · PV-DISMISS-2 · Escape default closes (top-of-stack)', () => {
  it('Escape · onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    render(<PopoverHarness defaultOpen onOpenChange={onOpenChange} />);
    await nextFrame();

    act(() => dispatchKeyDown('Escape'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Popover · PV-DISMISS-3 · scroll-outside default closes', () => {
  it('document scroll · onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    render(<PopoverHarness defaultOpen onOpenChange={onOpenChange} />);
    await nextFrame();

    act(() => dispatchScroll(document));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Popover · PV-DISMISS-4 · focus-outside opt-in path', () => {
  it('default focusOutside=false · focus moves outside · stays open', async () => {
    const onOpenChange = vi.fn();
    render(<PopoverHarness defaultOpen onOpenChange={onOpenChange} />);
    await nextFrame();
    onOpenChange.mockClear();

    // Move focus to body �?default focusOutside=false should NOT trigger.
    act(() => {
      const outside = document.createElement('button');
      outside.setAttribute('data-testid', 'outside-focus-target');
      document.body.appendChild(outside);
      outside.focus();
      outside.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('focusOutside=true opt-in · focus outside fires onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    render(
      <PopoverHarness
        defaultOpen
        onOpenChange={onOpenChange}
        dismiss={{ focusOutside: true }}
      />,
    );
    await nextFrame();
    onOpenChange.mockClear();

    act(() => {
      const outside = document.createElement('button');
      document.body.appendChild(outside);
      outside.focus();
      outside.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Popover · PV-DISMISS-5 · trigger self-reflexive exclusion', () => {
  it('pointerdown on trigger does NOT trigger pointer-outside dismiss', async () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(<PopoverHarness defaultOpen onOpenChange={onOpenChange} />);
    await nextFrame();
    onOpenChange.mockClear();

    act(() => dispatchPointerDown(getByTestId('trigger')));

    // Note: a click event is what toggles the trigger; pointerdown alone must
    // NOT dispatch a dismissal (OV-DISMISS-3).
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PV-TIMING · sync dispatch + return-focus order
// ─────────────────────────────────────────────────────────────────────────────

describe('Popover · PV-TIMING-1 · onDismiss sync · setOpen synchronous in same tick', () => {
  it('Escape synchronously flips open=false (controlled mode)', async () => {
    const onOpenChange = vi.fn();
    const Controlled = () => {
      const [open, setOpen] = React.useState(true);
      return (
        <PopoverHarness
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        />
      );
    };
    render(<Controlled />);
    await nextFrame();

    act(() => dispatchKeyDown('Escape'));

    // synchronously flipped �?onOpenChange already received false
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});

describe('Popover · PV-TIMING-3 · trigger.focus precedes setOpen(false)', () => {
  it('return-focus runs · trigger has focus when onOpenChange fires', async () => {
    let triggerFocusedAtCall = false;
    const onOpenChange = vi.fn().mockImplementation(() => {
      triggerFocusedAtCall =
        document.activeElement === document.querySelector('[data-testid="trigger"]');
    });
    const { getByTestId } = render(
      <PopoverHarness defaultOpen onOpenChange={onOpenChange} />,
    );
    await nextFrame();
    // Move focus into the content first, then dismiss.
    act(() => getByTestId('content-button').focus());

    act(() => dispatchKeyDown('Escape'));

    expect(triggerFocusedAtCall).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PV-A11Y · APG popup contract
// ─────────────────────────────────────────────────────────────────────────────

describe('Popover · PV-A11Y-1 · ARIA wiring on trigger + content', () => {
  it('trigger has aria-expanded / aria-controls / aria-haspopup="dialog" · matches contentId', async () => {
    const { getByTestId } = render(<PopoverHarness defaultOpen />);
    await nextFrame();

    const trigger = getByTestId('trigger');
    const content = getContent()!;

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-controls')).toBe(content.id);
    expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('aria-expanded reflects open state (false when closed)', () => {
    const { getByTestId } = render(<PopoverHarness />);
    expect(getByTestId('trigger').getAttribute('aria-expanded')).toBe('false');
  });
});

describe('Popover · PV-A11Y-2 · default focusOutside=false allows Tab outside without close', () => {
  it('Tab focus to outside element · content remains open (focusOutside default A)', async () => {
    const onOpenChange = vi.fn();
    render(<PopoverHarness defaultOpen onOpenChange={onOpenChange} />);
    await nextFrame();
    onOpenChange.mockClear();

    act(() => {
      const outside = document.createElement('button');
      document.body.appendChild(outside);
      outside.focus();
      outside.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(getContent()!.getAttribute('data-state')).not.toBe('exiting');
  });
});

describe('Popover · PV-A11Y-3 · role not forced · explicit role honoured', () => {
  it('no role by default', async () => {
    render(<PopoverHarness defaultOpen />);
    await nextFrame();
    expect(getContent()!.hasAttribute('role')).toBe(false);
  });

  it('user-supplied role="dialog" preserved', async () => {
    render(<PopoverHarness defaultOpen contentRole="dialog" />);
    await nextFrame();
    expect(getContent()!.getAttribute('role')).toBe('dialog');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Controlled / uncontrolled basics
// ─────────────────────────────────────────────────────────────────────────────

describe('Popover · controlled mode honours `open` prop', () => {
  it('open=true renders content; flipping to false unmounts after exit', async () => {
    const { rerender } = render(<PopoverHarness open />);
    expect(getContent()).not.toBeNull();
    await nextFrame();

    rerender(<PopoverHarness open={false} />);
    // Now in exiting; finish exit transition.
    await nextFrame();
    expect(getContent()).toBeNull();
  });
});

describe('Popover · uncontrolled mode tracks defaultOpen', () => {
  it('defaultOpen=true · click trigger toggles closed', async () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(
      <PopoverHarness defaultOpen onOpenChange={onOpenChange} />,
    );
    await nextFrame();

    fireEvent.click(getByTestId('trigger'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(getContent()!.getAttribute('data-state')).toBe('exiting');
  });
});
