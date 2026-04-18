/**
 * Stage 3 Step 10 · Phase 2-bis · A-1 / A-6
 *
 * Tests the Field-aware overlay hook that sits between the `state` system's
 * base output (`systemDataAttrs`) and the DOM. Validates the single-writer
 * hierarchy's overlay contract:
 *
 *   systemDataAttrs  ← useFieldDataAttrs  ← (component local attrs)
 *
 * Invariants:
 *   1. No Field in tree   → behaves identically to stateDataAttrs (pass-through).
 *   2. Field-only state   → attrs derived from ctx (overlay "turns on" keys).
 *   3. Props override Field → explicit false on Control wins over Field true.
 *   4. strategy honored   → 'control' includes readOnly in interactive-disabled.
 *   5. Produces no keys other than the 3 state keys (subset restriction).
 */
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { Field } from './Field';
import { useFieldDataAttrs } from './useFieldDataAttrs';

function Probe({
  disabled,
  readOnly,
  loading,
}: { disabled?: boolean; readOnly?: boolean; loading?: boolean }) {
  const attrs = useFieldDataAttrs(
    { disabled, readOnly, loading },
    { interactiveStrategy: 'control' },
  );
  return <div data-testid="probe" {...attrs} />;
}

describe('useFieldDataAttrs · no Field in tree (pass-through)', () => {
  it('returns {} when all state props are falsy/undefined', () => {
    const { getByTestId } = render(<Probe />);
    const el = getByTestId('probe');
    expect(el.hasAttribute('data-disabled')).toBe(false);
    expect(el.hasAttribute('data-readonly')).toBe(false);
    expect(el.hasAttribute('data-interactive-disabled')).toBe(false);
  });

  it('raw disabled=true produces the 3 keys (control strategy)', () => {
    const { getByTestId } = render(<Probe disabled />);
    const el = getByTestId('probe');
    expect(el.getAttribute('data-disabled')).toBe('true');
    expect(el.getAttribute('data-interactive-disabled')).toBe('true');
  });

  it('raw readOnly=true triggers data-interactive-disabled (control strategy)', () => {
    const { getByTestId } = render(<Probe readOnly />);
    const el = getByTestId('probe');
    expect(el.getAttribute('data-readonly')).toBe('true');
    expect(el.getAttribute('data-interactive-disabled')).toBe('true');
  });
});

describe('useFieldDataAttrs · Field overlay', () => {
  it('Field.disabled propagates to data-disabled on probe', () => {
    const { getByTestId } = render(
      <Field disabled>
        <Probe />
      </Field>,
    );
    const el = getByTestId('probe');
    expect(el.getAttribute('data-disabled')).toBe('true');
    expect(el.getAttribute('data-interactive-disabled')).toBe('true');
  });

  it('Field.readOnly propagates to data-readonly', () => {
    const { getByTestId } = render(
      <Field readOnly>
        <Probe />
      </Field>,
    );
    const el = getByTestId('probe');
    expect(el.getAttribute('data-readonly')).toBe('true');
    expect(el.getAttribute('data-interactive-disabled')).toBe('true');
  });

  it('Field + control both false: overlay is quiet', () => {
    const { getByTestId } = render(
      <Field>
        <Probe />
      </Field>,
    );
    const el = getByTestId('probe');
    expect(el.hasAttribute('data-disabled')).toBe(false);
    expect(el.hasAttribute('data-readonly')).toBe(false);
    expect(el.hasAttribute('data-interactive-disabled')).toBe(false);
  });
});

describe('useFieldDataAttrs · control prop override (priority: Control > Field)', () => {
  it('explicit disabled={false} defeats Field.disabled', () => {
    const { getByTestId } = render(
      <Field disabled>
        <Probe disabled={false} />
      </Field>,
    );
    const el = getByTestId('probe');
    // §6.5 priority rule: Control props always win. `disabled={false}` is a
    // concrete value (not undefined), so Field.disabled does not apply.
    expect(el.hasAttribute('data-disabled')).toBe(false);
    expect(el.hasAttribute('data-interactive-disabled')).toBe(false);
  });

  it('explicit disabled=true overrides Field.disabled=false (trivially agrees)', () => {
    const { getByTestId } = render(
      <Field>
        <Probe disabled />
      </Field>,
    );
    const el = getByTestId('probe');
    expect(el.getAttribute('data-disabled')).toBe('true');
  });
});

describe('useFieldDataAttrs · subset restriction', () => {
  it('does NOT produce data-variant / data-size / data-color (base-layer keys)', () => {
    const { getByTestId } = render(
      <Field disabled>
        <Probe />
      </Field>,
    );
    const el = getByTestId('probe');
    expect(el.hasAttribute('data-variant')).toBe(false);
    expect(el.hasAttribute('data-size')).toBe(false);
    expect(el.hasAttribute('data-color')).toBe(false);
  });
});
