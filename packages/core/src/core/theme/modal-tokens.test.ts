/**
 * Stage-11 Phase 7c · Modal token suite
 *
 * Validates the new `theme.layout.modal.*` + `theme.transition.modal.*` +
 * `theme.zIndex.*` CSS-variable emission landed in Phase 7c.
 *
 * Coverage (ADR-007 决策 20 测试覆盖兜底):
 *   · LY-MODAL-3 visual schema  — backdrop-color / backdrop-blur emit + match default
 *   · LY-MODAL-4 panel chrome   — border emit + shadows.xl / radius.lg / z.modal coexist
 *   · LY-MODAL-2 size preset    — 5 档 CSS-var emit + values match ADR lock (320/480/640/880/1200)
 *   · TR-MODAL-1 motion         — backdrop / content duration emit + default 200ms
 *   · PR-INTEROP-1 token guard  — createTheme DEV warns when backdrop < content
 *   · OV-FLOAT-3 z-index emit   — `--prismui-z-*` 4 vars emit + values match theme.zIndex
 */

import { describe, expect, it, vi, afterEach } from 'vitest';

import { generateCSSVariables } from './context/css-variables';
import { createTheme } from './create-theme';
import { defaultTheme } from './default-theme';

describe('Phase 7c · theme.layout.modal CSS variable emission', () => {
  it('emits 5 size preset vars with ADR-locked values (320/480/640/880/1200)', () => {
    const vars = generateCSSVariables(defaultTheme, 'light');
    expect(vars['--prismui-modal-size-xs']).toBe('320px');
    expect(vars['--prismui-modal-size-sm']).toBe('480px');
    expect(vars['--prismui-modal-size-md']).toBe('640px');
    expect(vars['--prismui-modal-size-lg']).toBe('880px');
    expect(vars['--prismui-modal-size-xl']).toBe('1200px');
  });

  it('emits LY-MODAL-3 backdrop visual vars (color includes alpha · blur defaults to none)', () => {
    const vars = generateCSSVariables(defaultTheme, 'light');
    expect(vars['--prismui-modal-backdrop-color']).toBe('rgba(0, 0, 0, 0.5)');
    expect(vars['--prismui-modal-backdrop-blur']).toBe('none');
  });

  it('emits LY-MODAL-4 panel border var with default `none` (override path · not className)', () => {
    const vars = generateCSSVariables(defaultTheme, 'light');
    expect(vars['--prismui-modal-border']).toBe('none');
  });

  it('LY-MODAL-4 chrome consumes existing global tokens (shadows.xl · radius.lg · zIndex.modal)', () => {
    // Modal does NOT mint Modal-only namespaces for these — it composes the
    // global tokens. Verify the global vars are emitted and Modal.module.css
    // can pick them up via the standard `--prismui-*` references.
    const vars = generateCSSVariables(defaultTheme, 'light');
    expect(vars['--prismui-shadow-xl']).toBeTruthy();
    expect(vars['--prismui-radius-lg']).toBeTruthy();
    expect(vars['--prismui-z-modal']).toBe('1400');
  });

  it('honours theme overrides for backdrop visual + border + size preset', () => {
    const custom = createTheme({
      layout: {
        modal: {
          size: { md: '720px' },
          backdrop: { color: 'rgba(20, 30, 40, 0.7)', blur: 'blur(8px)' },
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    });
    const vars = generateCSSVariables(custom, 'light');
    expect(vars['--prismui-modal-size-md']).toBe('720px');
    // Untouched siblings still get the default values (deepMerge contract).
    expect(vars['--prismui-modal-size-xs']).toBe('320px');
    expect(vars['--prismui-modal-backdrop-color']).toBe('rgba(20, 30, 40, 0.7)');
    expect(vars['--prismui-modal-backdrop-blur']).toBe('blur(8px)');
    expect(vars['--prismui-modal-border']).toBe('1px solid rgba(255, 255, 255, 0.08)');
  });
});

describe('Phase 7c · theme.transition.modal CSS variable emission', () => {
  it('emits backdrop + content duration vars with default 200ms', () => {
    const vars = generateCSSVariables(defaultTheme, 'light');
    expect(vars['--prismui-modal-backdrop-duration']).toBe('200ms');
    expect(vars['--prismui-modal-content-duration']).toBe('200ms');
  });

  it('honours theme overrides for both motion legs', () => {
    const custom = createTheme({
      transition: {
        modal: {
          backdrop: { duration: '260ms' },
          content:  { duration: '180ms' },
        },
      },
    });
    const vars = generateCSSVariables(custom, 'light');
    expect(vars['--prismui-modal-backdrop-duration']).toBe('260ms');
    expect(vars['--prismui-modal-content-duration']).toBe('180ms');
  });
});

describe('Phase 7c · theme.zIndex CSS variable emission (OV-FLOAT-3)', () => {
  it('emits 4 z-index vars mirroring theme.zIndex numeric values', () => {
    const vars = generateCSSVariables(defaultTheme, 'light');
    expect(vars['--prismui-z-tooltip']).toBe('1500');
    expect(vars['--prismui-z-popover']).toBe('1300');
    expect(vars['--prismui-z-modal']).toBe('1400');
    expect(vars['--prismui-z-toast']).toBe('1600');
  });

  it('preserves stacking-order invariant tooltip > toast(*) wait — actual order: popover < modal < tooltip < toast (per defaultTheme)', () => {
    // The numeric ordering is documented in `theme.types.ts` and Stage-11
    // floating-primitive.md §5.2. This test pins the contract so any
    // accidental swap (e.g. modal > tooltip) is caught.
    const vars = generateCSSVariables(defaultTheme, 'light');
    const tooltip = Number(vars['--prismui-z-tooltip']);
    const popover = Number(vars['--prismui-z-popover']);
    const modal   = Number(vars['--prismui-z-modal']);
    const toast   = Number(vars['--prismui-z-toast']);
    expect(popover).toBeLessThan(modal);
    expect(modal).toBeLessThan(tooltip);
    expect(tooltip).toBeLessThan(toast);
  });
});

describe('Phase 7c · createTheme PR-INTEROP-1 invariant guard', () => {
  // Each test mutates a fresh theme reference so the WeakSet latch in
  // create-theme.ts does not suppress the warn across tests.
  let warnSpy: ReturnType<typeof vi.spyOn>;
  afterEach(() => {
    warnSpy?.mockRestore();
  });

  it('does NOT warn for default theme (backdrop === content === 200ms)', () => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    createTheme({
      // Force a brand-new theme object so prior tests don't pollute the latch.
      transition: { modal: { backdrop: { duration: '200ms' }, content: { duration: '200ms' } } },
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when backdrop > content (invariant satisfied with slack)', () => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    createTheme({
      transition: { modal: { backdrop: { duration: '300ms' }, content: { duration: '200ms' } } },
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when backdrop < content (PR-INTEROP-1 violation)', () => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    createTheme({
      transition: { modal: { backdrop: { duration: '100ms' }, content: { duration: '200ms' } } },
    });
    expect(warnSpy).toHaveBeenCalled();
    const message = String(warnSpy.mock.calls[0]?.[0] ?? '');
    expect(message).toContain('PR-INTEROP-1');
    expect(message).toContain('backdrop.duration >= content.duration');
  });

  it('parses seconds vs milliseconds correctly (0.1s < 200ms triggers warn)', () => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    createTheme({
      transition: { modal: { backdrop: { duration: '0.1s' }, content: { duration: '200ms' } } },
    });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('skips check (no warn) when duration uses CSS var reference (cannot statically resolve)', () => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    createTheme({
      transition: {
        modal: {
          backdrop: { duration: 'var(--my-fast)' },
          content:  { duration: '200ms' },
        },
      },
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
