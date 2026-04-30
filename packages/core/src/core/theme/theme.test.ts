import { describe, it, expect } from 'vitest';
import { defaultTheme } from './default-theme';
import type {
  PrismUITheme,
  CSSLength,
  TokenRef,
  SpacingValue,
  FontSizeValue,
  RadiusValue,
  BreakpointValue,
} from './types';

describe('Theme System', () => {
  describe('defaultTheme', () => {
    it('should have correct structure', () => {
      expect(defaultTheme).toBeDefined();
      expect(defaultTheme.colors).toBeDefined();
      expect(defaultTheme.palette).toBeDefined();
      expect(defaultTheme.typography).toBeDefined();
      expect(defaultTheme.spacing).toBeDefined();
      expect(defaultTheme.radius).toBeDefined();
      expect(defaultTheme.shadows).toBeDefined();
      expect(defaultTheme.breakpoints).toBeDefined();
      expect(defaultTheme.scale).toBe(1);
    });

    it('should have correct typography', () => {
      expect(defaultTheme.typography.fontFamily).toContain('Public Sans Variable');
      expect(defaultTheme.typography.fontFamily).toContain('sans-serif');
      expect(defaultTheme.typography.fontSize.md).toBe('1rem');
      expect(defaultTheme.typography.fontWeight.regular).toBe(400);
      expect(defaultTheme.typography.fontWeight.extrabold).toBe(800);
      expect(defaultTheme.typography.lineHeight.xs).toBe(1.25);
      expect(defaultTheme.typography.lineHeight.md).toBe(1.5);
    });

    it('should use rem for spacing (8-step Stage-14 SZ-SCALE-4)', () => {
      expect(defaultTheme.spacing.none).toBe('0px');
      expect(defaultTheme.spacing.xs).toBe('0.25rem');
      expect(defaultTheme.spacing.sm).toBe('0.5rem');
      expect(defaultTheme.spacing.md).toBe('1rem');
      expect(defaultTheme.spacing.lg).toBe('1.5rem');
      expect(defaultTheme.spacing.xl).toBe('2rem');
      expect(defaultTheme.spacing['2xl']).toBe('2.5rem');
      expect(defaultTheme.spacing['3xl']).toBe('3rem');
    });

    it('should use rem for radius (and px for full)', () => {
      expect(defaultTheme.radius.xs).toBe('0.25rem');
      expect(defaultTheme.radius.sm).toBe('0.375rem');
      expect(defaultTheme.radius.md).toBe('0.5rem');
      expect(defaultTheme.radius.lg).toBe('0.75rem');
      expect(defaultTheme.radius.xl).toBe('1rem');
      expect(defaultTheme.radius.full).toBe('9999px');
    });

    it('should have numeric breakpoints (px values as numbers)', () => {
      expect(defaultTheme.breakpoints.xs).toBe(576);
      expect(defaultTheme.breakpoints.sm).toBe(768);
      expect(defaultTheme.breakpoints.md).toBe(992);
      expect(defaultTheme.breakpoints.lg).toBe(1200);
      expect(defaultTheme.breakpoints.xl).toBe(1400);
    });

    it('should have transition duration tokens', () => {
      expect(defaultTheme.transition.duration.fast).toBe('120ms');
      expect(defaultTheme.transition.duration.base).toBe('150ms');
      expect(defaultTheme.transition.duration.slow).toBe('200ms');
    });

    it('should have transition easing tokens', () => {
      expect(defaultTheme.transition.easing.standard).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
      expect(defaultTheme.transition.easing.in).toBe('cubic-bezier(0.4, 0, 1, 1)');
      expect(defaultTheme.transition.easing.out).toBe('cubic-bezier(0, 0, 0.2, 1)');
    });

    it('should have shadow definitions', () => {
      expect(defaultTheme.shadows.xs).toContain('rgba');
      expect(defaultTheme.shadows.md).toContain('rgba');
      expect(defaultTheme.shadows.xl).toContain('rgba');
    });

    it('should use MUI-style gray-tinted shadows for xs/sm/md/lg', () => {
      expect(defaultTheme.shadows.xs).toContain('145, 158, 171');
      expect(defaultTheme.shadows.sm).toContain('145, 158, 171');
      expect(defaultTheme.shadows.md).toContain('145, 158, 171');
      expect(defaultTheme.shadows.lg).toContain('145, 158, 171');
    });

    it('should have all 5 font weights including extrabold', () => {
      expect(defaultTheme.typography.fontWeight.regular).toBe(400);
      expect(defaultTheme.typography.fontWeight.medium).toBe(500);
      expect(defaultTheme.typography.fontWeight.semibold).toBe(600);
      expect(defaultTheme.typography.fontWeight.bold).toBe(700);
      expect(defaultTheme.typography.fontWeight.extrabold).toBe(800);
    });
  });

  // ── Stage-14 SZ-TYPE-2 Family Layer (v1.0 lock) ───────────────────────────
  describe('Stage-14 Typography Family Layer (SZ-TYPE-2 v1.0)', () => {
    const families = ['body', 'title', 'label'] as const;
    const sizes = ['sm', 'md', 'lg'] as const;

    it('should have all 9 family tokens (3 families × 3 sizes)', () => {
      for (const family of families) {
        for (const size of sizes) {
          const token = defaultTheme.typography[family][size];
          expect(token, `${family}.${size}`).toBeDefined();
          expect(token.fontSize, `${family}.${size}.fontSize`).toBeDefined();
          expect(token.lineHeight, `${family}.${size}.lineHeight`).toBeDefined();
          expect(token.fontWeight, `${family}.${size}.fontWeight`).toBeDefined();
        }
      }
    });

    it('SZ-TYPE-1: every lineHeight is a px integer divisible by 4', () => {
      for (const family of families) {
        for (const size of sizes) {
          const lh = defaultTheme.typography[family][size].lineHeight;
          expect(Number.isInteger(lh), `${family}.${size}.lineHeight should be integer`).toBe(true);
          expect(lh % 4, `${family}.${size}.lineHeight=${lh} must satisfy % 4 === 0`).toBe(0);
        }
      }
    });

    it('SZ-TYPE-3: every token declares fontSize + lineHeight + fontWeight together', () => {
      for (const family of families) {
        for (const size of sizes) {
          const token = defaultTheme.typography[family][size];
          // Single-declaration rule: all three fields must be present
          expect(typeof token.fontSize === 'string' || typeof token.fontSize === 'number').toBe(true);
          expect(typeof token.lineHeight).toBe('number');
          expect(typeof token.fontWeight).toBe('number');
        }
      }
    });

    it('Stage-14 anchor: body.md = 14/20', () => {
      expect(defaultTheme.typography.body.md.fontSize).toBe('14px');
      expect(defaultTheme.typography.body.md.lineHeight).toBe(20);
      expect(defaultTheme.typography.body.md.fontWeight).toBe(400);
    });

    it('Stage-14 anchor: title.md = 20/28 (Section §3.7.1 titleSize)', () => {
      expect(defaultTheme.typography.title.md.fontSize).toBe('20px');
      expect(defaultTheme.typography.title.md.lineHeight).toBe(28);
      expect(defaultTheme.typography.title.md.fontWeight).toBe(600);
    });

    it('Stage-14 anchor: label.md = 14/20 (OQ-SZ-1 = B Button label)', () => {
      expect(defaultTheme.typography.label.md.fontSize).toBe('14px');
      expect(defaultTheme.typography.label.md.lineHeight).toBe(20);
      expect(defaultTheme.typography.label.md.fontWeight).toBe(500);
    });

    it('family fontWeight defaults: body=400 / title=600 / label=500', () => {
      // All sizes within a family share the family's default weight
      for (const size of sizes) {
        expect(defaultTheme.typography.body[size].fontWeight).toBe(400);
        expect(defaultTheme.typography.title[size].fontWeight).toBe(600);
        expect(defaultTheme.typography.label[size].fontWeight).toBe(500);
      }
    });

    it('size ramps are monotonically non-decreasing within each family', () => {
      // fontSize and lineHeight should not regress as size grows sm → md → lg
      for (const family of families) {
        const sm = defaultTheme.typography[family].sm;
        const md = defaultTheme.typography[family].md;
        const lg = defaultTheme.typography[family].lg;
        // lineHeight monotonic
        expect(sm.lineHeight, `${family}.sm.lh ≤ md.lh`).toBeLessThanOrEqual(md.lineHeight);
        expect(md.lineHeight, `${family}.md.lh ≤ lg.lh`).toBeLessThanOrEqual(lg.lineHeight);
      }
    });
  });

  // ── Stage-14 Phase 4 · Section Layout Tokens (SZ-SEC-1 / SZ-SEC-2 v1.0) ──
  // STAGE-14-OVERVIEW.md §3.7.1 schema = 8 fields:
  //   spacing(3)  · paddingX, paddingY, gap
  //   typography  · titleSize (size key)
  //   alignment(4)· header.align, header.justify, footer.justify, content.scroll
  //
  // The tests below guard schema completeness, anchor values, and resolution
  // through the typography family layer (titleSize → theme.typography.title[size]
  // — the single-source-of-truth chain that SZ-SEC-1 promises).
  describe('Stage-14 Section Layout (SZ-SEC-1 / SZ-SEC-2 v1.0)', () => {
    it('schema completeness · all 8 fields present (3 spacing + 1 typography + 4 alignment)', () => {
      const section = defaultTheme.layout.section;
      // Spacing (3)
      expect(section.paddingX, 'section.paddingX').toBeDefined();
      expect(section.paddingY, 'section.paddingY').toBeDefined();
      expect(section.gap, 'section.gap').toBeDefined();
      // Typography (1) — size key, not the resolved triplet
      expect(section.titleSize, 'section.titleSize').toBeDefined();
      // Alignment (4) — D-2 nested per "section" semantic
      expect(section.header.align, 'section.header.align').toBeDefined();
      expect(section.header.justify, 'section.header.justify').toBeDefined();
      expect(section.footer.justify, 'section.footer.justify').toBeDefined();
      expect(section.content.scroll, 'section.content.scroll').toBeDefined();
    });

    it('§3.7.1 anchor values · spacing default = lg/md/md (24/16/16 px)', () => {
      // Defaults follow the §3.7.1 spec verbatim. Values come from
      // theme.spacing.lg (1.5rem = 24px) and theme.spacing.md (1rem = 16px).
      expect(defaultTheme.layout.section.paddingX).toBe('1.5rem');
      expect(defaultTheme.layout.section.paddingY).toBe('1rem');
      expect(defaultTheme.layout.section.gap).toBe('1rem');
      // Cross-reference: paddingX should equal theme.spacing.lg (SZ-SEC-1
      // "tokens not hardcoded" guard — values must be discoverable in the
      // spacing scale).
      expect(defaultTheme.layout.section.paddingX).toBe(defaultTheme.spacing.lg);
      expect(defaultTheme.layout.section.paddingY).toBe(defaultTheme.spacing.md);
      expect(defaultTheme.layout.section.gap).toBe(defaultTheme.spacing.md);
    });

    it('§3.7.1 anchor: titleSize = "md" (resolves to typography.title.md = 20/28)', () => {
      // titleSize is a size key (TypographySize), not the resolved triplet.
      // The §3.6 "title.md = 20/28" anchor used across Stage-14 docs is
      // realized by titleSize='md' indexing into theme.typography.title.md.
      expect(defaultTheme.layout.section.titleSize).toBe('md');
      const titleToken =
        defaultTheme.typography.title[defaultTheme.layout.section.titleSize];
      expect(titleToken.fontSize, 'resolved titleFontSize').toBe('20px');
      expect(titleToken.lineHeight, 'resolved titleLineHeight').toBe(28);
      expect(titleToken.fontWeight, 'resolved titleFontWeight').toBe(600);
    });

    it('§3.7.1 anchor alignment defaults · Modal/Dialog convention', () => {
      const section = defaultTheme.layout.section;
      // header.align: 'center' — Title vs CloseButton vertically centered
      expect(section.header.align).toBe('center');
      // header.justify: 'between' — Title flush-left, Close flush-right
      expect(section.header.justify).toBe('between');
      // footer.justify: 'end' — primary action button rightmost
      expect(section.footer.justify).toBe('end');
      // content.scroll: 'auto' — long content scrolls within Content band
      expect(section.content.scroll).toBe('auto');
    });

    it('SZ-SEC-1 resolution chain · titleSize indexes into a real typography family token', () => {
      // The "typography 1 field = titleSize" design only works if the size
      // key actually resolves to a token. This test makes the chain explicit
      // so a future refactor that drops the title family from typography
      // (or renames sizes) fails with a clear diagnostic.
      const sizeKey = defaultTheme.layout.section.titleSize;
      const titleFamily = defaultTheme.typography.title;
      expect(titleFamily, 'theme.typography.title family must exist').toBeDefined();
      expect(
        titleFamily[sizeKey],
        `theme.typography.title.${sizeKey} must resolve to a token`,
      ).toBeDefined();
      // The resolved token shape (SZ-TYPE-3 single-declaration rule)
      expect(titleFamily[sizeKey].fontSize).toBeDefined();
      expect(titleFamily[sizeKey].lineHeight).toBeDefined();
      expect(titleFamily[sizeKey].fontWeight).toBeDefined();
    });
  });

  describe('Type System', () => {
    it('should allow CSSLength values', () => {
      const values: CSSLength[] = [
        12,
        '12px',
        '1rem',
        '50%',
      ];
      expect(values).toHaveLength(4);
    });

    it('should allow SpacingValue', () => {
      const values: SpacingValue[] = [
        'xs',
        'md',
        'xl',
        12,
        '12px',
        '1rem',
      ];
      expect(values).toHaveLength(6);
    });

    it('should allow FontSizeValue', () => {
      const values: FontSizeValue[] = [
        'xs',
        'md',
        'xl',
        14,
        '14px',
        '0.875rem',
      ];
      expect(values).toHaveLength(6);
    });

    it('should allow RadiusValue', () => {
      const values: RadiusValue[] = [
        'xs',
        'md',
        'xl',
        8,
        '8px',
        '0.5rem',
      ];
      expect(values).toHaveLength(6);
    });

    it('should allow BreakpointValue', () => {
      const values: BreakpointValue[] = [
        'xs',
        'md',
        'xl',
        768,
        1200,
      ];
      expect(values).toHaveLength(5);
    });
  });

  describe('Type Safety', () => {
    it('should enforce PrismUITheme structure', () => {
      const theme: PrismUITheme = {
        colors: {} as any,
        palette: {
          light: {} as any,
          dark: {} as any,
        },
        typography: {
          fontFamily: 'Arial',
          fontFamilyMonospace: 'Courier',
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
          },
          fontWeight: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
          },
          lineHeight: {
            xs: 1.4,
            sm: 1.45,
            md: 1.5,
            lg: 1.55,
            xl: 1.6,
          },
          body: {
            sm: { fontSize: '13px', lineHeight: 20, fontWeight: 400 },
            md: { fontSize: '14px', lineHeight: 20, fontWeight: 400 },
            lg: { fontSize: '16px', lineHeight: 24, fontWeight: 400 },
          },
          title: {
            sm: { fontSize: '16px', lineHeight: 24, fontWeight: 600 },
            md: { fontSize: '20px', lineHeight: 28, fontWeight: 600 },
            lg: { fontSize: '24px', lineHeight: 32, fontWeight: 600 },
          },
          label: {
            sm: { fontSize: '12px', lineHeight: 16, fontWeight: 500 },
            md: { fontSize: '14px', lineHeight: 20, fontWeight: 500 },
            lg: { fontSize: '16px', lineHeight: 24, fontWeight: 500 },
          },
        },
        spacing: {
          none: '0px',
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '2.5rem',
          '3xl': '3rem',
        },
        radius: {
          xs: '0.25rem',
          sm: '0.375rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem',
          full: '9999px',
        },
        shadows: {
          xs: 'none',
          sm: 'none',
          md: 'none',
          lg: 'none',
          xl: 'none',
        },
        breakpoints: {
          xs: 576,
          sm: 768,
          md: 992,
          lg: 1200,
          xl: 1400,
        },
        transition: {
          duration: { fast: '120ms', base: '150ms', slow: '200ms' },
          easing: {
            standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
            in: 'cubic-bezier(0.4, 0, 1, 1)',
            out: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        size: {
          // Stage-14 Phase 3: SZ-COMP-1 三项公式输入字段（lineHeight / paddingY / borderY）
          // 与 default-size-tokens.ts 对齐 · 详见公式 height = lineHeight + paddingY*2 + borderY。
          xs: { height: '24px', paddingX:  '8px', fontSize: '12px', slotSize: '14px', innerGap:  '4px',
                lineHeight: 16, paddingY:  '4px', borderY: 2 },
          sm: { height: '30px', paddingX: '10px', fontSize: '13px', slotSize: '16px', innerGap:  '6px',
                lineHeight: 20, paddingY:  '4px', borderY: 2 },
          md: { height: '36px', paddingX: '12px', fontSize: '14px', slotSize: '18px', innerGap:  '8px',
                lineHeight: 20, paddingY:  '8px', borderY: 2 },
          lg: { height: '42px', paddingX: '14px', fontSize: '15px', slotSize: '20px', innerGap: '10px',
                lineHeight: 24, paddingY:  '8px', borderY: 2 },
          xl: { height: '48px', paddingX: '16px', fontSize: '16px', slotSize: '22px', innerGap: '12px',
                lineHeight: 24, paddingY: '12px', borderY: 2 },
        },
        state: {
          disabled: { opacity: 0.5, cursor: 'not-allowed' },
        },
        focusPointerHalo: {
          width: '2px',
          color: 'rgba(0, 0, 0, 0.16)',
        },
        focusRing: {
          width: '2px',
          offset: '2px',
          color: 'var(--prismui-color-primary)',
        },
        // Stage-14 Phase 4 · Section Layout Tokens (SZ-SEC-1 / SZ-SEC-2)
        layout: {
          section: {
            paddingX: '1.5rem',
            paddingY: '1rem',
            gap:      '1rem',
            titleSize: 'md',
            header:  { align: 'center', justify: 'between' },
            footer:  { justify: 'end' },
            content: { scroll: 'auto' },
          },
        },
        scale: 1,
        textRoles: {
          primary:   { semantic: 'neutral', role: 'high', field: 'fg' },
          secondary: { semantic: 'neutral', role: 'low',  field: 'fg' },
          disabled:  { semantic: 'neutral', role: 'low',  field: 'fg' },
          danger:    { semantic: 'error',   role: 'high', field: 'bg' },
          warning:   { semantic: 'warning', role: 'high', field: 'bg' },
          success:   { semantic: 'success', role: 'high', field: 'bg' },
          info:      { semantic: 'info',    role: 'high', field: 'bg' },
        },
        zIndex: {
          tooltip: 1500,
          popover: 1300,
          modal: 1400,
          toast: 1600,
        },
      };

      expect(theme).toBeDefined();
    });

    it('should allow TokenRef as string', () => {
      const ref1: TokenRef = 'colors.blue.6';
      const ref2: TokenRef = 'spacing.md';
      const ref3: TokenRef = 'typography.fontSize.lg';

      expect(ref1).toBe('colors.blue.6');
      expect(ref2).toBe('spacing.md');
      expect(ref3).toBe('typography.fontSize.lg');
    });
  });
});
