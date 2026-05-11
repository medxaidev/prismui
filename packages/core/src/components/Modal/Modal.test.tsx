/**
 * Modal · Phase 7b integration test suite.
 *
 * Authority: ADR-007 决策 1-20 + Round 1 收尾 smoke test (决策 20).
 *
 * Test topology (mapped back to invariants / decisions):
 *   - Modal.Root · controllable state (defaultOpen / controlled / onOpenChange) ─ 3
 *   - Modal.Trigger · asChild + ARIA wiring (aria-haspopup / expanded / controls) ─ 3
 *   - Modal.Content · ARIA wiring (role / aria-modal / labelledby / describedby) ─ 3
 *   - Modal.Backdrop · Portal + Presence + aria-hidden + click dismisses ─ 2
 *   - Dismiss channels · ESC / backdrop click / opt-out + bubble swallow (决策 8-11) ─ 4
 *   - Modal.Close · click closes + type=button auto ─ 2
 *   - Round 1 收尾 smoke (决策 20) ─ 2
 *
 * Total: 19 tests.
 *
 * **jsdom note**: Stage-11 `useDismissal` document listeners + Stage-12
 * Presence first-commit transition both work in jsdom. We reset the
 * `DismissalStack` between tests (mirrors `useDismissal.test.tsx`
 * convention).
 */

import * as React from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { act, render } from '@testing-library/react';

import { Modal } from './Modal';
import { __resetDismissalStack } from '../../core/overlay/dismissal';

// ── helpers ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  __resetDismissalStack();
});
afterEach(() => {
  __resetDismissalStack();
});

function dispatchPointerDown(target: Element): void {
  const event = new PointerEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    pointerType: 'mouse',
  });
  target.dispatchEvent(event);
}

function dispatchEscape(): void {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
}

function findInBody(testId: string): HTMLElement | null {
  return document.body.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Root · controllable state (3 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('Modal.Root · controllable state', () => {
  it('renders Content when defaultOpen=true (uncontrolled)', () => {
    render(
      <Modal.Root defaultOpen>
        <Modal.Trigger>
          <button>open</button>
        </Modal.Trigger>
        <Modal.Backdrop />
        <Modal.Content data-testid="content">body</Modal.Content>
      </Modal.Root>,
    );
    expect(findInBody('content')).not.toBeNull();
  });

  it('controlled `open` prop toggles Content rendering', () => {
    function Harness({ open }: { open: boolean }): React.ReactElement {
      return (
        <Modal.Root open={open}>
          <Modal.Trigger>
            <button>open</button>
          </Modal.Trigger>
          <Modal.Backdrop />
          <Modal.Content data-testid="content">body</Modal.Content>
        </Modal.Root>
      );
    }
    const { rerender } = render(<Harness open={false} />);
    expect(findInBody('content')).toBeNull();
    rerender(<Harness open={true} />);
    expect(findInBody('content')).not.toBeNull();
  });

  it('calls onOpenChange when Trigger clicked (uncontrolled state still drives the change)', () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(
      <Modal.Root onOpenChange={onOpenChange}>
        <Modal.Trigger>
          <button data-testid="trigger">open</button>
        </Modal.Trigger>
        <Modal.Content data-testid="content">body</Modal.Content>
      </Modal.Root>,
    );
    act(() => {
      getByTestId('trigger').click();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Trigger · asChild + ARIA wiring (3 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('Modal.Trigger · asChild + ARIA wiring', () => {
  it('asChild merges onClick · clicking opens the modal', () => {
    const userClick = vi.fn();
    const { getByTestId } = render(
      <Modal.Root>
        <Modal.Trigger>
          <button data-testid="trigger" onClick={userClick}>
            open
          </button>
        </Modal.Trigger>
        <Modal.Content data-testid="content">body</Modal.Content>
      </Modal.Root>,
    );
    expect(findInBody('content')).toBeNull();
    act(() => getByTestId('trigger').click());
    expect(userClick).toHaveBeenCalledTimes(1);
    expect(findInBody('content')).not.toBeNull();
  });

  it('forwards aria-haspopup="dialog" by default and "alertdialog" when role="alertdialog"', () => {
    const { getByTestId, rerender } = render(
      <Modal.Root>
        <Modal.Trigger>
          <button data-testid="trigger">open</button>
        </Modal.Trigger>
        <Modal.Content>body</Modal.Content>
      </Modal.Root>,
    );
    expect(getByTestId('trigger').getAttribute('aria-haspopup')).toBe('dialog');

    rerender(
      <Modal.Root role="alertdialog">
        <Modal.Trigger>
          <button data-testid="trigger">open</button>
        </Modal.Trigger>
        <Modal.Content>body</Modal.Content>
      </Modal.Root>,
    );
    expect(getByTestId('trigger').getAttribute('aria-haspopup')).toBe('alertdialog');
  });

  it('wires aria-controls and aria-expanded on the Trigger', () => {
    const { getByTestId } = render(
      <Modal.Root defaultOpen>
        <Modal.Trigger>
          <button data-testid="trigger">open</button>
        </Modal.Trigger>
        <Modal.Content data-testid="content">body</Modal.Content>
      </Modal.Root>,
    );
    const trigger = getByTestId('trigger');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const controlsId = trigger.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    const content = findInBody('content');
    expect(content).not.toBeNull();
    expect(content!.id).toBe(controlsId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Content · ARIA wiring (3 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('Modal.Content · ARIA wiring (议题 E 决策 16)', () => {
  it('emits role="dialog" + aria-modal="true" by default', () => {
    render(
      <Modal.Root defaultOpen>
        <Modal.Content data-testid="content">body</Modal.Content>
      </Modal.Root>,
    );
    const content = findInBody('content');
    expect(content!.getAttribute('role')).toBe('dialog');
    expect(content!.getAttribute('aria-modal')).toBe('true');
  });

  it('forwards role="alertdialog" when set on Modal.Root (决策 16)', () => {
    render(
      <Modal.Root defaultOpen role="alertdialog">
        <Modal.Content data-testid="content">body</Modal.Content>
      </Modal.Root>,
    );
    const content = findInBody('content');
    expect(content!.getAttribute('role')).toBe('alertdialog');
  });

  it('auto-wires aria-labelledby → Modal.Title id and aria-describedby → Modal.Description id', () => {
    render(
      <Modal.Root defaultOpen>
        <Modal.Content data-testid="content">
          <Modal.Title data-testid="title">My Title</Modal.Title>
          <Modal.Description data-testid="desc">My Desc</Modal.Description>
        </Modal.Content>
      </Modal.Root>,
    );
    const content = findInBody('content')!;
    const title = findInBody('title')!;
    const desc = findInBody('desc')!;
    expect(content.getAttribute('aria-labelledby')).toBe(title.id);
    expect(content.getAttribute('aria-describedby')).toBe(desc.id);
    expect(title.tagName).toBe('H2');
    expect(desc.tagName).toBe('P');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Backdrop · Portal + aria-hidden + click dismisses (2 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('Modal.Backdrop · OV-MODAL-3 独立 DOM child', () => {
  it('renders into Portal (document.body) with aria-hidden="true"', () => {
    render(
      <Modal.Root defaultOpen>
        <Modal.Backdrop data-testid="backdrop" />
        <Modal.Content>body</Modal.Content>
      </Modal.Root>,
    );
    const backdrop = findInBody('backdrop');
    expect(backdrop).not.toBeNull();
    expect(backdrop!.getAttribute('aria-hidden')).toBe('true');
  });

  it('clicking on Backdrop dismisses by default (决策 8 dismissOnBackdropClick)', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal.Root defaultOpen onOpenChange={onOpenChange}>
        <Modal.Backdrop data-testid="backdrop" />
        <Modal.Content>body</Modal.Content>
      </Modal.Root>,
    );
    const backdrop = findInBody('backdrop')!;
    act(() => dispatchPointerDown(backdrop));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Dismiss channels · ESC / backdrop / opt-out / bubble swallow (4 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('Modal · dismiss channels (议题 C 决策 8-11)', () => {
  it('ESC dismisses by default (决策 9)', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal.Root defaultOpen onOpenChange={onOpenChange}>
        <Modal.Backdrop />
        <Modal.Content>body</Modal.Content>
      </Modal.Root>,
    );
    act(() => dispatchEscape());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('dismissOnEscape=false · ESC does NOT dismiss', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal.Root defaultOpen dismissOnEscape={false} onOpenChange={onOpenChange}>
        <Modal.Backdrop />
        <Modal.Content data-testid="content">
          <button data-testid="inside">x</button>
        </Modal.Content>
      </Modal.Root>,
    );
    act(() => dispatchEscape());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('dismissOnEscape=false · ESC at Modal.Content stops propagation (决策 11 顶层吞)', () => {
    const outerHandler = vi.fn();
    document.addEventListener('keydown', outerHandler);
    try {
      const { getByTestId } = render(
        <Modal.Root defaultOpen dismissOnEscape={false}>
          <Modal.Backdrop />
          <Modal.Content data-testid="content">
            <button data-testid="inside">x</button>
          </Modal.Content>
        </Modal.Root>,
      );
      // Dispatch from inside Content so the capture-phase swallow can run.
      const inside = getByTestId('inside');
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      act(() => {
        inside.dispatchEvent(event);
      });
      // Modal.Content onKeyDownCapture stopPropagation → outer document
      // listener does NOT fire.
      expect(outerHandler).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('keydown', outerHandler);
    }
  });

  it('dismissOnBackdropClick=false · backdrop click does NOT dismiss', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal.Root defaultOpen dismissOnBackdropClick={false} onOpenChange={onOpenChange}>
        <Modal.Backdrop data-testid="backdrop" />
        <Modal.Content>body</Modal.Content>
      </Modal.Root>,
    );
    const backdrop = findInBody('backdrop')!;
    act(() => dispatchPointerDown(backdrop));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Modal.Close · click closes + type=button (2 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('Modal.Close · close action', () => {
  it('clicking Close closes the modal (asChild + onClick merge)', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal.Root defaultOpen onOpenChange={onOpenChange}>
        <Modal.Content>
          <Modal.Close>
            <button data-testid="close-btn">close</button>
          </Modal.Close>
        </Modal.Content>
      </Modal.Root>,
    );
    const closeBtn = findInBody('close-btn')!;
    act(() => closeBtn.click());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Modal.Close auto-sets type="button" when not provided', () => {
    render(
      <Modal.Root defaultOpen>
        <Modal.Content>
          <Modal.Close>
            <button data-testid="close-btn">close</button>
          </Modal.Close>
        </Modal.Content>
      </Modal.Root>,
    );
    const closeBtn = findInBody('close-btn')! as HTMLButtonElement;
    expect(closeBtn.type).toBe('button');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Round 1 收尾 smoke (决策 20) (2 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('Modal · Round 1 收尾 smoke (决策 20)', () => {
  it('full compound (Trigger + Backdrop + Content + Title + Description + Close) renders without console.warn / error', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Modal.Root defaultOpen>
        <Modal.Trigger>
          <button>open</button>
        </Modal.Trigger>
        <Modal.Backdrop />
        <Modal.Content data-testid="content">
          <Modal.Title>Title</Modal.Title>
          <Modal.Description>Description</Modal.Description>
          <button>action</button>
          <Modal.Close>
            <button>close</button>
          </Modal.Close>
        </Modal.Content>
      </Modal.Root>,
    );

    expect(findInBody('content')).not.toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('integration · auto-focus first tabbable on open (Phase 7a useFocusTrap consumed in compound)', () => {
    render(
      <Modal.Root defaultOpen>
        <Modal.Backdrop />
        <Modal.Content>
          <button data-testid="first-inside">first</button>
          <button data-testid="second-inside">second</button>
        </Modal.Content>
      </Modal.Root>,
    );
    // useFocusTrap auto-focus runs in useEffect after first commit. Modal.Content
    // is rendered through a Portal; React commits the inner tree synchronously
    // during the same flush as the outer render(), so the trap effect has run
    // by the time render() returns.
    expect(document.activeElement).toBe(findInBody('first-inside'));
  });
});
