/**
 * Textarea · component-level contract tests.
 *
 * Scope: DOM shape · data-attrs · variant token layer · CSS var writes ·
 * Field integration · T-4-B SSR baseline · T-5 resize single-writer ·
 * T-7 not-exposed regression guards · FE-1/2/3 CSS structural guards.
 *
 * Autosize algorithm internals (scrollHeight clamp · cleanup) live in
 * `useAutosizeMeasure.test.tsx` — jsdom cannot simulate real layout, so
 * this file only asserts integration-level autosize markers (data-autosize,
 * forced resize:none, --input-min-rows write).
 *
 * Mirrors Input.test.tsx conventions (describe-group layout, fs-read CSS
 * structural assertions, Field integration block) to keep the two tests
 * visually aligned for reviewers.
 */

import * as React from 'react';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, fireEvent } from '@testing-library/react';
import { Textarea, normalizeRowBounds } from './Textarea';
import { Field } from '../Field';

describe('Textarea', () => {
  // ── Basic rendering ──────────────────────────────────────────────────────
  describe('Basic Rendering', () => {
    it('renders a native <textarea> inside a <div> wrapper', () => {
      const { container } = render(<Textarea placeholder="write…" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.tagName).toBe('DIV');
      const ta = root.querySelector('textarea');
      expect(ta).toBeInTheDocument();
      expect(ta?.placeholder).toBe('write…');
    });

    it('forwards ref to the <textarea> element (not the wrapper)', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      const { container } = render(<Textarea ref={ref} />);
      expect(ref.current?.tagName).toBe('TEXTAREA');
      expect(ref.current).toBe(container.querySelector('textarea'));
    });

    it('passes user className to the root wrapper', () => {
      const { container } = render(<Textarea className="my-wrapper" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.className).toContain('my-wrapper');
    });

    it('outputs data-variant and data-size on the root', () => {
      const { container } = render(<Textarea size="lg" variant="filled" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.getAttribute('data-variant')).toBe('filled');
      expect(root.getAttribute('data-size')).toBe('lg');
    });

    it('defaults: variant=outlined, size=md, radius=md', () => {
      const { container } = render(<Textarea />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.getAttribute('data-variant')).toBe('outlined');
      expect(root.getAttribute('data-size')).toBe('md');
      // radius → --input-radius resolves via Radius System (non-empty var)
      expect(root.style.getPropertyValue('--input-radius')).not.toBe('');
    });
  });

  // ── HTML props passthrough ───────────────────────────────────────────────
  describe('HTML props passthrough', () => {
    it('forwards onChange to the textarea', () => {
      const onChange = vi.fn();
      const { container } = render(<Textarea onChange={onChange} />);
      const ta = container.querySelector('textarea')!;
      fireEvent.change(ta, { target: { value: 'hello' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('supports controlled value', () => {
      const { container, rerender } = render(
        <Textarea value="a" onChange={() => {}} />,
      );
      const ta = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(ta.value).toBe('a');
      rerender(<Textarea value="b" onChange={() => {}} />);
      expect(ta.value).toBe('b');
    });

    it('forwards rows to the textarea (native attribute survives)', () => {
      const { container } = render(<Textarea rows={5} />);
      expect(container.querySelector('textarea')?.rows).toBe(5);
    });

    it('forwards name / defaultValue / placeholder', () => {
      const { container } = render(
        <Textarea name="bio" defaultValue="hi" placeholder="tell us" />,
      );
      const ta = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(ta.name).toBe('bio');
      expect(ta.value).toBe('hi');
      expect(ta.placeholder).toBe('tell us');
    });
  });

  // ── normalizeRowBounds (T-8 · 4 sub-clauses) ─────────────────────────────
  describe('normalizeRowBounds (T-8)', () => {
    it('minRows: NaN → 1', () => {
      expect(normalizeRowBounds(NaN, 10).minRows).toBe(1);
    });

    it('minRows: negative → 1', () => {
      expect(normalizeRowBounds(-5, 10).minRows).toBe(1);
    });

    it('minRows: 0 → 1', () => {
      expect(normalizeRowBounds(0, 10).minRows).toBe(1);
    });

    it('minRows: 2.7 → 2 (floor)', () => {
      expect(normalizeRowBounds(2.7, 10).minRows).toBe(2);
    });

    it('maxRows: Infinity preserved (special case)', () => {
      expect(normalizeRowBounds(1, Infinity).maxRows).toBe(Infinity);
    });

    it('maxRows: NaN → 1', () => {
      expect(normalizeRowBounds(1, NaN).maxRows).toBe(1);
    });

    it('maxRows: 4.9 → 4 (floor)', () => {
      expect(normalizeRowBounds(1, 4.9).maxRows).toBe(4);
    });

    it('maxRows < minRows after normalization → coerce + DEV warn', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = normalizeRowBounds(5, 3);
      expect(result.minRows).toBe(5);
      expect(result.maxRows).toBe(5);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toMatch(/maxRows/i);
      warn.mockRestore();
    });

    it('consistent result (-5, -3) after both normalized to 1 → no warn', () => {
      // -5 → 1, -3 → 1 · equal · no violation · no warn
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = normalizeRowBounds(-5, -3);
      expect(result.minRows).toBe(1);
      expect(result.maxRows).toBe(1);
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  // ── T-4-B · SSR-safe --input-min-rows baseline ──────────────────────────
  describe('--input-min-rows inline var (T-4-B)', () => {
    it('default minRows=1 → --input-min-rows="1"', () => {
      const { container } = render(<Textarea />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--input-min-rows')).toBe('1');
    });

    it('minRows=4 → --input-min-rows="4"', () => {
      const { container } = render(<Textarea minRows={4} />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--input-min-rows')).toBe('4');
    });

    it('minRows=NaN (normalized) → --input-min-rows="1"', () => {
      // T-8 normalization means render sees 1
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { container } = render(<Textarea minRows={NaN} />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--input-min-rows')).toBe('1');
      warn.mockRestore();
    });
  });

  // ── T-5 · resize single-writer contract ─────────────────────────────────
  describe('resize single-writer (T-5)', () => {
    it('default (autosize=false, no resize prop) → inline resize="vertical"', () => {
      const { container } = render(<Textarea />);
      const ta = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(ta.style.resize).toBe('vertical');
    });

    it('autosize=true hard-forces resize="none" even if resize prop passed', () => {
      const { container } = render(<Textarea autosize resize="horizontal" />);
      const ta = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(ta.style.resize).toBe('none');
    });

    it('autosize=false + resize prop wins over user style.resize (T-5 P0-2)', () => {
      const { container } = render(
        <Textarea resize="horizontal" style={{ resize: 'both' }} />,
      );
      const ta = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(ta.style.resize).toBe('horizontal');
    });

    it('autosize=true strips user inline style.resize (belt-and-suspenders)', () => {
      const { container } = render(
        <Textarea autosize style={{ resize: 'both' }} />,
      );
      const ta = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(ta.style.resize).toBe('none');
    });
  });

  // ── data-autosize emission (design.md §二 Step 6) ────────────────────────
  describe('data-autosize attr', () => {
    it('emits data-autosize="true" on root when autosize=true', () => {
      const { container } = render(<Textarea autosize />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.getAttribute('data-autosize')).toBe('true');
    });

    it('does NOT emit data-autosize when autosize=false (default)', () => {
      const { container } = render(<Textarea />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.hasAttribute('data-autosize')).toBe(false);
    });
  });

  // ── Standalone usage (no Field) ──────────────────────────────────────────
  describe('Standalone usage (no Field)', () => {
    it('does not inject id / aria-describedby / aria-required / aria-invalid', () => {
      const { container } = render(<Textarea />);
      const ta = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(ta.id).toBe('');
      expect(ta.getAttribute('aria-describedby')).toBeNull();
      expect(ta.getAttribute('aria-required')).toBeNull();
      expect(ta.getAttribute('aria-invalid')).toBeNull();
    });

    it('respects user-provided id when used standalone', () => {
      const { container } = render(<Textarea id="standalone" />);
      expect(container.querySelector('textarea')?.id).toBe('standalone');
    });
  });

  // ── Field integration · 1:1 mirror of Input.test.tsx Field block ─────────
  describe('Field integration', () => {
    it('injects inputId from Field', () => {
      const { container } = render(
        <Field id="email">
          <Textarea />
        </Field>,
      );
      expect(container.querySelector('textarea')?.id).toBe('email-input');
    });

    it('Label htmlFor connects to Textarea id (end-to-end)', () => {
      const { container } = render(
        <Field id="user">
          <Field.Label>Username</Field.Label>
          <Textarea />
        </Field>,
      );
      const label = container.querySelector('label');
      const ta = container.querySelector('textarea');
      expect(label?.getAttribute('for')).toBe('user-input');
      expect(ta?.id).toBe('user-input');
    });

    it('injects aria-describedby with descriptionId and errorId (always)', () => {
      const { container } = render(
        <Field id="foo">
          <Textarea />
        </Field>,
      );
      const describedby = container
        .querySelector('textarea')!
        .getAttribute('aria-describedby');
      expect(describedby).toContain('foo-description');
      expect(describedby).toContain('foo-error');
    });

    it('injects aria-required from Field.required', () => {
      const { container } = render(
        <Field required>
          <Textarea />
        </Field>,
      );
      expect(
        container.querySelector('textarea')?.getAttribute('aria-required'),
      ).toBe('true');
    });

    it('injects aria-invalid from Field.invalid', () => {
      const { container } = render(
        <Field invalid>
          <Textarea />
        </Field>,
      );
      expect(
        container.querySelector('textarea')?.getAttribute('aria-invalid'),
      ).toBe('true');
    });

    it('propagates disabled from Field to textarea and root[data-disabled]', () => {
      const { container } = render(
        <Field disabled>
          <Textarea />
        </Field>,
      );
      const ta = container.querySelector('textarea') as HTMLTextAreaElement;
      const root = container.querySelector('[data-variant]') as HTMLElement;
      expect(ta.disabled).toBe(true);
      expect(root.hasAttribute('data-disabled')).toBe(true);
    });

    it('propagates readOnly from Field to textarea and root[data-readonly]', () => {
      const { container } = render(
        <Field readOnly>
          <Textarea />
        </Field>,
      );
      const ta = container.querySelector('textarea') as HTMLTextAreaElement;
      const root = container.querySelector('[data-variant]') as HTMLElement;
      expect(ta.readOnly).toBe(true);
      expect(root.hasAttribute('data-readonly')).toBe(true);
    });

    it('Textarea props override Field context (disabled)', () => {
      const { container } = render(
        <Field disabled>
          <Textarea disabled={false} />
        </Field>,
      );
      expect(
        (container.querySelector('textarea') as HTMLTextAreaElement).disabled,
      ).toBe(false);
    });

    it('Textarea props override Field context (id)', () => {
      const { container } = render(
        <Field id="foo">
          <Textarea id="mine" />
        </Field>,
      );
      expect(container.querySelector('textarea')?.id).toBe('mine');
    });

    it('does NOT derive aria-invalid from <Field.Error> existence', () => {
      const { container } = render(
        <Field id="x">
          <Textarea />
          <Field.Error>bad</Field.Error>
        </Field>,
      );
      expect(
        container.querySelector('textarea')?.getAttribute('aria-invalid'),
      ).toBeNull();
    });
  });

  // ── aria placement · attributes live on <textarea>, not wrapper ──────────
  describe('aria placement', () => {
    it('aria-* attributes go on <textarea>, not on the wrapper', () => {
      const { container } = render(
        <Field required invalid id="z">
          <Textarea />
        </Field>,
      );
      const root = container.querySelector('[data-variant]') as HTMLElement;
      const ta = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(root.getAttribute('aria-required')).toBeNull();
      expect(root.getAttribute('aria-invalid')).toBeNull();
      expect(root.getAttribute('aria-describedby')).toBeNull();
      expect(ta.getAttribute('aria-required')).toBe('true');
      expect(ta.getAttribute('aria-invalid')).toBe('true');
      expect(ta.getAttribute('aria-describedby')).toBeTruthy();
    });
  });

  // ── Variant Token Layer (variant.md §1.1 · IV-1 · IV-4) · mirrors Input ──
  describe('Variant Token Layer', () => {
    it('outlined → --prismui-variant-* routed to VariantRole.bordered (neutral)', () => {
      const { container } = render(<Textarea variant="outlined" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--prismui-variant-bg')).toBe(
        'var(--prismui-color-neutral-bordered-bg)',
      );
      expect(root.style.getPropertyValue('--prismui-variant-border')).toBe(
        'var(--prismui-color-neutral-bordered-border)',
      );
    });

    it('filled → --prismui-variant-* routed to VariantRole.low (neutral)', () => {
      const { container } = render(<Textarea variant="filled" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--prismui-variant-bg')).toBe(
        'var(--prismui-color-neutral-low-bg)',
      );
      expect(root.style.getPropertyValue('--prismui-variant-hover-bg')).toBe(
        'var(--prismui-color-neutral-low-hover-bg)',
      );
      // low role has transparent border
      expect(root.style.getPropertyValue('--prismui-variant-border')).toBe(
        'transparent',
      );
    });

    it('unstyled is token-free: NO --prismui-variant-* injected (IV-4)', () => {
      const { container } = render(<Textarea variant="unstyled" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--prismui-variant-bg')).toBe('');
      expect(root.style.getPropertyValue('--prismui-variant-border')).toBe('');
      expect(root.style.getPropertyValue('--prismui-variant-hover-bg')).toBe('');
      expect(root.style.getPropertyValue('--prismui-variant-hover-border')).toBe(
        '',
      );
    });

    it('default (no variant prop) equals explicit variant="outlined"', () => {
      const { container: a } = render(<Textarea />);
      const { container: b } = render(<Textarea variant="outlined" />);
      const rootA = a.firstElementChild as HTMLElement;
      const rootB = b.firstElementChild as HTMLElement;
      expect(rootA.style.getPropertyValue('--prismui-variant-border')).toBe(
        rootB.style.getPropertyValue('--prismui-variant-border'),
      );
    });
  });

  // ── Size vars (component-local · size=vars:false) ────────────────────────
  describe('Size var contract (design.md §6)', () => {
    it('size=md writes --input-padding-x and --input-font-size', () => {
      const { container } = render(<Textarea size="md" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--input-padding-x')).toBe('12px');
      expect(root.style.getPropertyValue('--input-font-size')).toBe('14px');
    });

    it('size=xl scales padding-x / font-size / padding-y', () => {
      const { container } = render(<Textarea size="xl" />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--input-padding-x')).toBe('16px');
      expect(root.style.getPropertyValue('--input-font-size')).toBe('16px');
      expect(root.style.getPropertyValue('--input-padding-y')).toBe('12px');
    });

    it('--input-min-height formula references both line-height and --input-min-rows', () => {
      const { container } = render(<Textarea minRows={3} />);
      const root = container.firstElementChild as HTMLElement;
      const minHeightExpr = root.style.getPropertyValue('--input-min-height');
      expect(minHeightExpr).toContain('var(--prismui-line-height-md)');
      expect(minHeightExpr).toContain('var(--input-min-rows, 1)');
    });
  });

  // ── Not-exposed props regression guards (T-7) ───────────────────────────
  describe('Not-exposed props (T-7 regression guard)', () => {
    it('no [data-position="left"] / [data-position="right"] section slots rendered', () => {
      // TS prevents leftSection/rightSection props; runtime: no section DOM.
      const { container } = render(<Textarea />);
      expect(container.querySelector('[data-position="left"]')).toBeNull();
      expect(container.querySelector('[data-position="right"]')).toBeNull();
    });

    it('no data-pointer attribute on root (pointer prop not exposed)', () => {
      const { container } = render(<Textarea />);
      expect(container.firstElementChild?.hasAttribute('data-pointer')).toBe(
        false,
      );
    });
  });

  // ── Focus Behavior Contract (focus-behavior.md FE-1/FE-2/FE-3 · v1.1) ────
  //
  // Structural assertions on CSS source — mirrors Input.test.tsx rationale.
  // jsdom cannot simulate UA :focus-visible heuristics, so the selector
  // SHAPE is the contract. Any edit that breaks these patterns would reintroduce
  // the FE-2 duplicate-signal bug or remove FE-1 keyboard-ring mandate.
  describe('Focus Behavior Contract CSS (FE-1 / FE-2 / FE-3)', () => {
    const cssPath = path.resolve(__dirname, './Textarea.module.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    it('FE-2 · pointer-focus border rule is narrowed to non-:focus-visible', () => {
      expect(css).toMatch(
        /\.root:focus-within:has\(\s*>\s*\.input:not\(:focus-visible\)\s*\)[^{]*\{[^}]*border-color\s*:/,
      );
    });

    it('FE-1 · keyboard-focus layer uses :focus-visible + outline ring', () => {
      expect(css).toMatch(
        /\.root:has\(\s*>\s*\.input:focus-visible\s*\)[^{]*\{[^}]*outline\s*:/,
      );
    });

    it('FE-2 regression · every .root:focus-within border-color rule is pointer-scoped', () => {
      const ruleRegex = /\.root:focus-within[^{]*\{[^}]*\}/g;
      const rules = css.match(ruleRegex) ?? [];
      const bordered = rules.filter((r) => /border-color\s*:/.test(r));
      expect(bordered.length).toBeGreaterThan(0);
      for (const rule of bordered) {
        expect(rule).toMatch(/:has\(\s*>\s*\.input:not\(:focus-visible\)\s*\)/);
      }
    });

    it('FE-3 · invalid + keyboard focus swaps outline-color → danger (preserves channel)', () => {
      expect(css).toMatch(
        /aria-invalid[^{]*:focus-visible[^{]*\{[^}]*outline-color\s*:[^;}]*--prismui-text-danger/,
      );
    });

    it('FE-1 · keyboard-focus rule respects disabled + unstyled guards', () => {
      const ringRule = css.match(
        /\.root:has\(\s*>\s*\.input:focus-visible\s*\)[^{]*\{/,
      );
      expect(ringRule).not.toBeNull();
      const ringSelector = ringRule![0];
      expect(ringSelector).toMatch(/:not\(\[data-disabled\]\)/);
      expect(ringSelector).toMatch(/:not\(\[data-variant='unstyled'\]\)/);
    });

    it('CSS source does NOT declare resize on .input (T-5 single-writer guard)', () => {
      // T-5: resize is written by render inline style only. Re-introducing a
      // CSS `resize:` declaration would race against the inline style on
      // specificity / cascade boundaries and break the hard-force for autosize.
      const inputBlockMatch = css.match(/\.input\s*\{[^}]*\}/);
      expect(inputBlockMatch).not.toBeNull();
      // Allow resize in OTHER blocks (e.g. .root[data-disabled] .input) but
      // the bare .input {} block must not set resize.
      expect(inputBlockMatch![0]).not.toMatch(/^[^}]*\bresize\s*:/);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Stage-14 v1.x · SZ-COMP-1 + SZ-COMP-6 structural CSS guard (Wave 1)
  //
  // Textarea is Field-enterable (SZ-COMP-6 borderY=2). Unlike Input it
  // declares `min-height` rather than fixed `height`, but the same border-box
  // invariant applies — the SSR-safe baseline `--input-min-height` and any
  // consumer-supplied `height` prop must include the 1px border on both
  // sides, not push it outside. Without border-box, autosize-driven height
  // mutations would also drift +2px on every keystroke that triggers a
  // line wrap.
  //
  // See: STAGE-14-OVERVIEW.md §3.3 SZ-COMP-1 / §3.4 SZ-COMP-6 / Wave 1
  // ─────────────────────────────────────────────────────────────────────────
  describe('Stage-14 v1.x · SZ-COMP-1 CSS guard', () => {
    const cssPath = path.resolve(__dirname, './Textarea.module.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    it('SZ-COMP-1 · `.root` declares `box-sizing: border-box`', () => {
      // RegExp tolerates whitespace + comment-block placement variations
      // inside the `.root` rule body.
      expect(css).toMatch(/\.root\s*\{[^}]*box-sizing\s*:\s*border-box/);
    });
  });
});
