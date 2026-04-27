/**
 * Radio + RadioGroup · integration tests
 *
 * Design reference: `@/devdocs/components/Radio/design.md` v0.2.
 * Contract references:
 *   - `component-contract.md` SR-1~9 + §3.7 Action Behavior
 *   - `control-surface.md` §2.3 C-2 + §四 FCP-1~6
 *   - `focus-behavior.md` v1.2 §4.3 C-2 mode-B variant
 *   - `feedback-contract.md` §5 / §11 L4 dual-source
 *
 * Organization mirrors design.md §9 invariants (R-1 ~ R-11 + RG-*). Hook-level
 * behavior (useControllableState / resolvePolymorphicActionBehavior / Field
 * hooks) is NOT re-covered — this file samples the integration paths that
 * uniquely emerge at Radio + RadioGroup + Field + Feedback intersection.
 */
import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, fireEvent } from '@testing-library/react';
import {
  RadioGroup,
  Radio,
  RADIO_DEFAULT_FEEDBACKS,
  __resetRadioInvariantWarnings,
} from './index';
import { Field } from '../Field';

// ─────────────────────────────────────────────────────────────────────
// Test helpers
// ─────────────────────────────────────────────────────────────────────
function Group3(
  props: Omit<
    React.ComponentProps<typeof RadioGroup>,
    'children'
  > & { extraDisabled?: boolean },
) {
  const { extraDisabled, ...rest } = props;
  return (
    <RadioGroup {...rest}>
      <Radio value="a" data-testid="a" />
      <Radio value="b" data-testid="b" />
      <Radio value="c" data-testid="c" disabled={extraDisabled} />
    </RadioGroup>
  );
}

describe('Radio + RadioGroup', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetRadioInvariantWarnings();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  // ─────────────────────────────────────────────────────────────────────
  // 1 · Basic render (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('Basic render', () => {
    it('RadioGroup renders a host with role="radiogroup"', () => {
      const { container } = render(<Group3 />);
      expect(
        container.querySelector('[role="radiogroup"]'),
      ).toBeInTheDocument();
    });

    it('Radio children render as <button role="radio">', () => {
      const { getAllByRole } = render(<Group3 />);
      const radios = getAllByRole('radio');
      expect(radios).toHaveLength(3);
      radios.forEach((r) => expect(r.tagName).toBe('BUTTON'));
    });

    it('each Radio has aria-checked="false" initially', () => {
      const { getAllByRole } = render(<Group3 />);
      getAllByRole('radio').forEach((r) =>
        expect(r.getAttribute('aria-checked')).toBe('false'),
      );
    });

    it('defaultValue selects the matching Radio (aria-checked="true")', () => {
      const { getByTestId } = render(<Group3 defaultValue="b" />);
      expect(getByTestId('b').getAttribute('aria-checked')).toBe('true');
      expect(getByTestId('a').getAttribute('aria-checked')).toBe('false');
    });

    it('renders .circle + .indicator span tree inside each Radio', () => {
      const { getByTestId } = render(<Group3 />);
      const a = getByTestId('a');
      const circle = a.querySelector('span');
      expect(circle).toBeInTheDocument();
      expect(circle!.querySelector('span')).toBeInTheDocument();
    });

    it('type="button" forced on all group children (R-11)', () => {
      const { getAllByRole } = render(<Group3 />);
      getAllByRole('radio').forEach((r) =>
        expect(r.getAttribute('type')).toBe('button'),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 2 · ARIA contract — R-1 / R-1a (6)
  // ─────────────────────────────────────────────────────────────────────
  describe('ARIA contract (R-1 / R-1a)', () => {
    it('role="radio" always present on children', () => {
      const { getAllByRole } = render(<Group3 />);
      expect(getAllByRole('radio')).toHaveLength(3);
    });

    it('user role is discarded on Radio (R-1 single-writer)', () => {
      const { getByTestId } = render(
        <RadioGroup>
          <Radio value="a" data-testid="a" role="option" />
        </RadioGroup>,
      );
      expect(getByTestId('a').getAttribute('role')).toBe('radio');
    });

    it('aria-pressed is filtered out of DOM (R-1a)', () => {
      const { getByTestId } = render(
        <RadioGroup>
          <Radio value="a" data-testid="a" aria-pressed="true" />
        </RadioGroup>,
      );
      expect(getByTestId('a').getAttribute('aria-pressed')).toBeNull();
    });

    it('aria-selected is filtered out of DOM (R-1a)', () => {
      const { getByTestId } = render(
        <RadioGroup>
          <Radio value="a" data-testid="a" aria-selected="true" />
        </RadioGroup>,
      );
      expect(getByTestId('a').getAttribute('aria-selected')).toBeNull();
    });

    it('user aria-checked is discarded (R-1 single-writer)', () => {
      const { getByTestId } = render(
        <RadioGroup defaultValue="a">
          <Radio value="b" data-testid="b" aria-checked="true" />
        </RadioGroup>,
      );
      expect(getByTestId('b').getAttribute('aria-checked')).toBe('false');
    });

    it('radiogroup root exposes aria-orientation', () => {
      const { container } = render(<Group3 orientation="horizontal" />);
      expect(
        container
          .querySelector('[role="radiogroup"]')!
          .getAttribute('aria-orientation'),
      ).toBe('horizontal');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 3 · Click selection (R-2) (5)
  // ─────────────────────────────────────────────────────────────────────
  describe('Click selection (R-2)', () => {
    it('click on an unchecked Radio selects it', () => {
      const { getByTestId } = render(<Group3 />);
      fireEvent.click(getByTestId('b'));
      expect(getByTestId('b').getAttribute('aria-checked')).toBe('true');
      expect(getByTestId('a').getAttribute('aria-checked')).toBe('false');
    });

    it('onValueChange fires with the new value', () => {
      const handler = vi.fn();
      const { getByTestId } = render(<Group3 onValueChange={handler} />);
      fireEvent.click(getByTestId('a'));
      expect(handler).toHaveBeenCalledWith('a');
    });

    it('clicking the already-selected Radio is a no-op (H-9)', () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <Group3 defaultValue="a" onValueChange={handler} />,
      );
      fireEvent.click(getByTestId('a'));
      expect(handler).not.toHaveBeenCalled();
    });

    it('controlled value ignores internal state (value prop wins)', () => {
      const { getByTestId, rerender } = render(<Group3 value="a" />);
      fireEvent.click(getByTestId('b'));
      expect(getByTestId('a').getAttribute('aria-checked')).toBe('true');
      rerender(<Group3 value="b" />);
      expect(getByTestId('b').getAttribute('aria-checked')).toBe('true');
    });

    it('selection commit chains user onClick BEFORE the group commit', () => {
      const userClick = vi.fn();
      const handler = vi.fn();
      const { getByTestId } = render(
        <RadioGroup onValueChange={handler}>
          <Radio value="a" data-testid="a" onClick={userClick} />
          <Radio value="b" />
        </RadioGroup>,
      );
      fireEvent.click(getByTestId('a'));
      expect(userClick).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('a');
      // Order: user handler first (per design.md §3.1), commit second.
      const userOrder = userClick.mock.invocationCallOrder[0];
      const commitOrder = handler.mock.invocationCallOrder[0];
      expect(userOrder).toBeLessThan(commitOrder);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 4 · Roving tabindex (R-10) (5)
  // ─────────────────────────────────────────────────────────────────────
  describe('Roving tabindex (R-10)', () => {
    it('when no value is set, only the first enabled Radio has tabIndex=0', () => {
      const { getByTestId } = render(<Group3 />);
      expect(getByTestId('a').tabIndex).toBe(0);
      expect(getByTestId('b').tabIndex).toBe(-1);
      expect(getByTestId('c').tabIndex).toBe(-1);
    });

    it('when a value is set, the selected Radio holds tabIndex=0', () => {
      const { getByTestId } = render(<Group3 defaultValue="b" />);
      expect(getByTestId('a').tabIndex).toBe(-1);
      expect(getByTestId('b').tabIndex).toBe(0);
      expect(getByTestId('c').tabIndex).toBe(-1);
    });

    it('disabled Radio always holds tabIndex=-1', () => {
      const { getByTestId } = render(<Group3 extraDisabled />);
      expect(getByTestId('c').tabIndex).toBe(-1);
    });

    it('user tabIndex override is discarded (R-10 forces roving)', () => {
      const { getByTestId } = render(
        <RadioGroup defaultValue="a">
          <Radio value="a" data-testid="a" />
          <Radio value="b" data-testid="b" tabIndex={5} />
        </RadioGroup>,
      );
      expect(getByTestId('b').tabIndex).toBe(-1);
    });

    it('if the selected value points to a disabled Radio, falls back to first enabled', () => {
      const { getByTestId } = render(
        <RadioGroup defaultValue="b">
          <Radio value="a" data-testid="a" />
          <Radio value="b" data-testid="b" disabled />
        </RadioGroup>,
      );
      expect(getByTestId('a').tabIndex).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 5 · Arrow-key navigation (R-10) (8)
  // ─────────────────────────────────────────────────────────────────────
  describe('Arrow-key navigation (R-10)', () => {
    it('vertical · ArrowDown moves focus + selects next', () => {
      const { getByTestId } = render(<Group3 defaultValue="a" />);
      getByTestId('a').focus();
      fireEvent.keyDown(getByTestId('a'), { key: 'ArrowDown' });
      expect(document.activeElement).toBe(getByTestId('b'));
      expect(getByTestId('b').getAttribute('aria-checked')).toBe('true');
    });

    it('vertical · ArrowUp moves focus + selects previous', () => {
      const { getByTestId } = render(<Group3 defaultValue="b" />);
      getByTestId('b').focus();
      fireEvent.keyDown(getByTestId('b'), { key: 'ArrowUp' });
      expect(document.activeElement).toBe(getByTestId('a'));
      expect(getByTestId('a').getAttribute('aria-checked')).toBe('true');
    });

    it('horizontal · ArrowRight moves to next', () => {
      const { getByTestId } = render(
        <Group3 orientation="horizontal" defaultValue="a" />,
      );
      getByTestId('a').focus();
      fireEvent.keyDown(getByTestId('a'), { key: 'ArrowRight' });
      expect(document.activeElement).toBe(getByTestId('b'));
    });

    it('horizontal · ArrowLeft moves to previous', () => {
      const { getByTestId } = render(
        <Group3 orientation="horizontal" defaultValue="b" />,
      );
      getByTestId('b').focus();
      fireEvent.keyDown(getByTestId('b'), { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(getByTestId('a'));
    });

    it('vertical · ArrowRight / ArrowLeft are no-ops', () => {
      const { getByTestId } = render(<Group3 defaultValue="a" />);
      getByTestId('a').focus();
      fireEvent.keyDown(getByTestId('a'), { key: 'ArrowRight' });
      expect(document.activeElement).toBe(getByTestId('a'));
    });

    it('loop=true · ArrowDown at last wraps to first', () => {
      const { getByTestId } = render(<Group3 loop defaultValue="c" />);
      getByTestId('c').focus();
      fireEvent.keyDown(getByTestId('c'), { key: 'ArrowDown' });
      expect(document.activeElement).toBe(getByTestId('a'));
    });

    it('loop=false · ArrowDown at last stays at last', () => {
      const { getByTestId } = render(
        <Group3 loop={false} defaultValue="c" />,
      );
      getByTestId('c').focus();
      fireEvent.keyDown(getByTestId('c'), { key: 'ArrowDown' });
      expect(document.activeElement).toBe(getByTestId('c'));
    });

    it('navigation skips disabled Radios', () => {
      const { getByTestId } = render(
        <RadioGroup defaultValue="a">
          <Radio value="a" data-testid="a" />
          <Radio value="b" data-testid="b" disabled />
          <Radio value="c" data-testid="c" />
        </RadioGroup>,
      );
      getByTestId('a').focus();
      fireEvent.keyDown(getByTestId('a'), { key: 'ArrowDown' });
      expect(document.activeElement).toBe(getByTestId('c'));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 6 · Home / End navigation (3)
  // ─────────────────────────────────────────────────────────────────────
  describe('Home / End navigation (R-10)', () => {
    it('Home jumps to first enabled Radio + selects', () => {
      const { getByTestId } = render(<Group3 defaultValue="c" />);
      getByTestId('c').focus();
      fireEvent.keyDown(getByTestId('c'), { key: 'Home' });
      expect(document.activeElement).toBe(getByTestId('a'));
      expect(getByTestId('a').getAttribute('aria-checked')).toBe('true');
    });

    it('End jumps to last enabled Radio + selects', () => {
      const { getByTestId } = render(<Group3 defaultValue="a" />);
      getByTestId('a').focus();
      fireEvent.keyDown(getByTestId('a'), { key: 'End' });
      expect(document.activeElement).toBe(getByTestId('c'));
      expect(getByTestId('c').getAttribute('aria-checked')).toBe('true');
    });

    it('End skips trailing disabled Radios', () => {
      const { getByTestId } = render(
        <RadioGroup defaultValue="a">
          <Radio value="a" data-testid="a" />
          <Radio value="b" data-testid="b" />
          <Radio value="c" data-testid="c" disabled />
        </RadioGroup>,
      );
      getByTestId('a').focus();
      fireEvent.keyDown(getByTestId('a'), { key: 'End' });
      expect(document.activeElement).toBe(getByTestId('b'));
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 7 · Standalone Radio (P0-1 A · 5)
  // ─────────────────────────────────────────────────────────────────────
  describe('Standalone Radio (P0-1 A)', () => {
    it('renders without a RadioGroup parent', () => {
      const { container } = render(<Radio />);
      expect(container.querySelector('[role="radio"]')).toBeInTheDocument();
    });

    it('aria-checked reflects `checked` prop (controlled)', () => {
      const { container, rerender } = render(<Radio checked={false} />);
      const el = container.querySelector('[role="radio"]')!;
      expect(el.getAttribute('aria-checked')).toBe('false');
      rerender(<Radio checked={true} />);
      expect(el.getAttribute('aria-checked')).toBe('true');
    });

    it('click flips uncontrolled defaultChecked (true → stays true, single-select)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Radio defaultChecked={false} onCheckedChange={handler} />,
      );
      const el = container.querySelector('[role="radio"]')!;
      fireEvent.click(el);
      expect(handler).toHaveBeenCalledWith(true);
      expect(el.getAttribute('aria-checked')).toBe('true');
    });

    it('tabIndex always 0 in standalone (no roving)', () => {
      const { container } = render(<Radio />);
      expect(
        (container.querySelector('[role="radio"]') as HTMLElement).tabIndex,
      ).toBe(0);
    });

    it('arrow keys on standalone are no-ops (no peers)', () => {
      const { container } = render(<Radio />);
      const el = container.querySelector('[role="radio"]') as HTMLElement;
      el.focus();
      fireEvent.keyDown(el, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(el);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 8 · Disabled / Loading propagation (R-7) (5)
  // ─────────────────────────────────────────────────────────────────────
  describe('Disabled / Loading (R-7)', () => {
    it('group-level disabled freezes every child', () => {
      const { getAllByRole } = render(<Group3 disabled />);
      getAllByRole('radio').forEach((r) => {
        expect(r.hasAttribute('data-disabled')).toBe(true);
      });
    });

    it('group-level disabled blocks clicks', () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <Group3 disabled onValueChange={handler} />,
      );
      fireEvent.click(getByTestId('b'));
      expect(handler).not.toHaveBeenCalled();
    });

    it('per-item disabled coexists with enabled siblings', () => {
      const { getByTestId } = render(<Group3 extraDisabled />);
      expect(getByTestId('a').hasAttribute('data-disabled')).toBe(false);
      expect(getByTestId('c').hasAttribute('data-disabled')).toBe(true);
    });

    it('group-level loading fans out to children', () => {
      const { getAllByRole } = render(<Group3 loading />);
      getAllByRole('radio').forEach((r) => {
        expect(r.getAttribute('aria-busy')).toBe('true');
      });
    });

    it('disabled Radio does not commit on click', () => {
      const handler = vi.fn();
      const { getByTestId } = render(
        <Group3 extraDisabled onValueChange={handler} />,
      );
      fireEvent.click(getByTestId('c'));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 9 · Feedback resolution (L4 · §5.4) (4)
  // ─────────────────────────────────────────────────────────────────────
  describe('Feedback resolution (L4)', () => {
    it('RADIO_DEFAULT_FEEDBACKS exposes ripple + glow names', () => {
      const names = RADIO_DEFAULT_FEEDBACKS.map((f) => f.name);
      expect(names).toContain('ripple');
      expect(names).toContain('glow');
    });

    it('renders cleanly with default feedbacks active', () => {
      expect(() => render(<Group3 />)).not.toThrow();
    });

    it('renders cleanly with group-level feedbacks=[] opt-out', () => {
      expect(() => render(<Group3 feedbacks={[]} />)).not.toThrow();
    });

    it('per-radio feedbacks override takes precedence over group', () => {
      // No throw is the observable behavior — ordering is asserted by the
      // shared `useFeedback` test suite elsewhere. This just proves the
      // per-instance prop is accepted by the typed surface at runtime.
      expect(() =>
        render(
          <RadioGroup feedbacks={[]}>
            <Radio value="a" feedbacks={RADIO_DEFAULT_FEEDBACKS} />
          </RadioGroup>,
        ),
      ).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 10 · Field integration (FCP-1~6) (7)
  // ─────────────────────────────────────────────────────────────────────
  describe('Field integration (FCP-1~6)', () => {
    it('standalone RadioGroup does NOT inject Field attributes', () => {
      const { container } = render(<Group3 />);
      const host = container.querySelector('[role="radiogroup"]')!;
      expect(host.getAttribute('aria-describedby')).toBeNull();
      expect(host.getAttribute('aria-required')).toBeNull();
      expect(host.getAttribute('aria-invalid')).toBeNull();
    });

    it('Field injects id onto radiogroup root (FCP-1)', () => {
      const { container } = render(
        <Field id="rg">
          <Group3 />
        </Field>,
      );
      expect(
        container.querySelector('[role="radiogroup"]')!.id,
      ).toBe('rg-input');
    });

    it('Field.required=true injects aria-required="true"', () => {
      const { container } = render(
        <Field required>
          <Group3 />
        </Field>,
      );
      expect(
        container
          .querySelector('[role="radiogroup"]')!
          .getAttribute('aria-required'),
      ).toBe('true');
    });

    it('Field.invalid=true injects aria-invalid="true" (FCP-5)', () => {
      const { container } = render(
        <Field invalid>
          <Group3 />
        </Field>,
      );
      expect(
        container
          .querySelector('[role="radiogroup"]')!
          .getAttribute('aria-invalid'),
      ).toBe('true');
    });

    it('Field.invalid sets data-invalid on radiogroup root for CSS cascade (RG-1 descendant)', () => {
      const { container } = render(
        <Field invalid>
          <Group3 />
        </Field>,
      );
      expect(
        container
          .querySelector('[role="radiogroup"]')!
          .getAttribute('data-invalid'),
      ).toBe('true');
    });

    it('Field disabled freezes every child Radio', () => {
      const { getAllByRole } = render(
        <Field disabled>
          <Group3 />
        </Field>,
      );
      getAllByRole('radio').forEach((r) =>
        expect(r.hasAttribute('data-disabled')).toBe(true),
      );
    });

    it('Field.Error existence does NOT auto-derive aria-invalid (FI-4)', () => {
      const { container } = render(
        <Field id="rg">
          <Group3 />
          <Field.Error>bad</Field.Error>
        </Field>,
      );
      expect(
        container
          .querySelector('[role="radiogroup"]')!
          .getAttribute('aria-invalid'),
      ).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 11 · Field.Label delegation (P0-2 A) (3)
  // ─────────────────────────────────────────────────────────────────────
  describe('Field.Label delegation (P0-2 A)', () => {
    it('label click focuses + selects the first enabled Radio', () => {
      const handler = vi.fn();
      const { container, getByTestId } = render(
        <Field>
          <Field.Label data-testid="lbl">Pick one</Field.Label>
          <RadioGroup onValueChange={handler}>
            <Radio value="a" data-testid="a" />
            <Radio value="b" data-testid="b" />
          </RadioGroup>
        </Field>,
      );
      fireEvent.click(container.querySelector('[data-testid="lbl"]')!);
      expect(document.activeElement).toBe(getByTestId('a'));
      expect(handler).toHaveBeenCalledWith('a');
    });

    it('label click skips disabled first Radio, delegates to next enabled', () => {
      const handler = vi.fn();
      const { container, getByTestId } = render(
        <Field>
          <Field.Label data-testid="lbl">Pick one</Field.Label>
          <RadioGroup onValueChange={handler}>
            <Radio value="a" data-testid="a" disabled />
            <Radio value="b" data-testid="b" />
          </RadioGroup>
        </Field>,
      );
      fireEvent.click(container.querySelector('[data-testid="lbl"]')!);
      expect(document.activeElement).toBe(getByTestId('b'));
      expect(handler).toHaveBeenCalledWith('b');
    });

    it('label click on disabled Field does NOT select (S-7 freeze)', () => {
      const handler = vi.fn();
      const { container } = render(
        <Field disabled>
          <Field.Label data-testid="lbl">Pick one</Field.Label>
          <RadioGroup onValueChange={handler}>
            <Radio value="a" />
            <Radio value="b" />
          </RadioGroup>
        </Field>,
      );
      fireEvent.click(container.querySelector('[data-testid="lbl"]')!);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 12 · DEV invariants (Commit 9 · 8)
  // ─────────────────────────────────────────────────────────────────────
  describe('DEV invariants', () => {
    const countCalls = (needle: string): number =>
      errorSpy.mock.calls.filter((c: unknown[]) =>
        String(c[0]).includes(needle),
      ).length;

    it('R-1a · aria-pressed triggers a warn', () => {
      render(
        <RadioGroup>
          <Radio value="a" aria-pressed="true" />
        </RadioGroup>,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('aria-pressed'),
      );
    });

    it('R-1a · aria-selected triggers a warn', () => {
      render(
        <RadioGroup>
          <Radio value="a" aria-selected="true" />
        </RadioGroup>,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('aria-selected'),
      );
    });

    it('R-11 · type="submit" on <button> host triggers a warn', () => {
      render(
        <RadioGroup>
          <Radio value="a" type="submit" />
        </RadioGroup>,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/type="submit"/),
      );
    });

    it('R-11 · warn latches (fires once per process until reset)', () => {
      render(
        <RadioGroup>
          <Radio value="a" type="submit" />
        </RadioGroup>,
      );
      expect(countCalls('type="submit"')).toBe(1);
      render(
        <RadioGroup>
          <Radio value="a" type="submit" />
        </RadioGroup>,
      );
      expect(countCalls('type="submit"')).toBe(1); // still 1 — latched
    });

    it('R-2 · group child missing `value` triggers a warn', () => {
      render(
        <RadioGroup>
          <Radio />
        </RadioGroup>,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing its `value`'),
      );
    });

    it('R-2 · standalone Radio without value does NOT warn', () => {
      render(<Radio />);
      expect(countCalls('missing its `value`')).toBe(0);
    });

    it('RG-1 · duplicate values trigger a warn', () => {
      render(
        <RadioGroup>
          <Radio value="a" />
          <Radio value="b" />
          <Radio value="a" />
        </RadioGroup>,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('same value="a"'),
      );
    });

    it('RG-1 · no duplicates ⇒ no warn', () => {
      render(<Group3 />);
      expect(countCalls('same value=')).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 13 · System data attrs + CSS hooks (3)
  // ─────────────────────────────────────────────────────────────────────
  describe('System data attrs', () => {
    it('group data-orientation mirrors the prop', () => {
      const { container } = render(<Group3 orientation="horizontal" />);
      expect(
        container
          .querySelector('[role="radiogroup"]')!
          .getAttribute('data-orientation'),
      ).toBe('horizontal');
    });

    it('Radio data-size / data-color are output on root', () => {
      const { getByTestId } = render(
        <RadioGroup defaultValue="a">
          <Radio value="a" data-testid="a" size="lg" color="success" />
        </RadioGroup>,
      );
      const a = getByTestId('a');
      expect(a.getAttribute('data-size')).toBe('lg');
      expect(a.getAttribute('data-color')).toBe('success');
    });

    it('data-checked="true" on selected Radio (CSS hook · mirrors aria-checked)', () => {
      const { getByTestId } = render(<Group3 defaultValue="b" />);
      expect(getByTestId('b').getAttribute('data-checked')).toBe('true');
      expect(getByTestId('a').getAttribute('data-checked')).toBe('false');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 14 · Ref + forwarding (2)
  // ─────────────────────────────────────────────────────────────────────
  describe('Ref forwarding', () => {
    it('RadioGroup forwards ref to the radiogroup host', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Group3 ref={ref as unknown as React.Ref<HTMLDivElement>} />);
      expect(ref.current).not.toBeNull();
      expect(ref.current!.getAttribute('role')).toBe('radiogroup');
    });

    it('Radio forwards ref to the radio button', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <RadioGroup>
          <Radio value="a" ref={ref} />
        </RadioGroup>,
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current!.getAttribute('role')).toBe('radio');
    });
  });
});
