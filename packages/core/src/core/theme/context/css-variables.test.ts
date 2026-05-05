import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveColorRef, resolveColorExpression, resolveTextRole, selectPalette, generateCSSVariables, applyDiffCSSVariables } from "./css-variables";
import { defaultTheme } from "../default-theme";
import type { TextRoleRef } from "../types";

// ─────────────────────────────────────────────────────────────────
// resolveColorRef
// ─────────────────────────────────────────────────────────────────

describe("resolveColorRef", () => {
  it("resolves a valid ColorRef to hex value", () => {
    expect(resolveColorRef("colors.blue.500", defaultTheme)).toBe("#0C68E9");
  });

  it("resolves blue.600 and blue.700", () => {
    expect(resolveColorRef("colors.blue.600", defaultTheme)).toBe("#0850C8");
    expect(resolveColorRef("colors.blue.700", defaultTheme)).toBe("#063BA7");
  });

  it("returns 'transparent' for unknown family", () => {
    const result = resolveColorRef("colors.unknown.500" as any, defaultTheme);
    expect(result).toBe("transparent");
  });

  it("returns 'transparent' for unknown shade", () => {
    const result = resolveColorRef("colors.blue.999" as any, defaultTheme);
    expect(result).toBe("transparent");
  });

  it("console.warns in dev for invalid ref", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => { });
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    resolveColorRef("colors.invalid.500" as any, defaultTheme);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[PrismUI] Invalid ColorRef"),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("colors.invalid.500"),
    );

    process.env.NODE_ENV = originalEnv;
    warn.mockRestore();
  });

  it("does NOT console.warn in production for invalid ref", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => { });
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    resolveColorRef("colors.invalid.500" as any, defaultTheme);

    expect(warn).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
    warn.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────
// resolveColorExpression (ADR-001)
// ─────────────────────────────────────────────────────────────────

describe("resolveColorExpression", () => {
  it("resolves shade expression to hex value", () => {
    expect(resolveColorExpression({ type: 'shade', shade: 500 }, 'blue', defaultTheme)).toBe("#0C68E9");
  });

  it("resolves alpha expression to color-mix()", () => {
    const result = resolveColorExpression({ type: 'alpha', shade: 500, alpha: 0.08 }, 'blue', defaultTheme);
    expect(result).toBe("color-mix(in srgb, #0C68E9 8%, transparent)");
  });

  it("resolves alpha=0.32 correctly", () => {
    const result = resolveColorExpression({ type: 'alpha', shade: 500, alpha: 0.32 }, 'blue', defaultTheme);
    expect(result).toBe("color-mix(in srgb, #0C68E9 32%, transparent)");
  });

  it("resolves raw expression as-is", () => {
    expect(resolveColorExpression({ type: 'raw', value: 'transparent' }, 'blue', defaultTheme)).toBe("transparent");
    expect(resolveColorExpression({ type: 'raw', value: 'currentcolor' }, 'blue', defaultTheme)).toBe("currentcolor");
    expect(resolveColorExpression({ type: 'raw', value: '#FFFFFF' }, 'blue', defaultTheme)).toBe("#FFFFFF");
  });

  it("returns 'transparent' for unknown shade family", () => {
    const result = resolveColorExpression({ type: 'shade', shade: 500 }, 'unknown', defaultTheme);
    expect(result).toBe("transparent");
  });

  it("returns 'transparent' for alpha with unknown family", () => {
    const result = resolveColorExpression({ type: 'alpha', shade: 500, alpha: 0.5 }, 'unknown', defaultTheme);
    expect(result).toBe("transparent");
  });

  it("console.warns in dev for invalid shade family", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => { });
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    resolveColorExpression({ type: 'shade', shade: 500 }, 'unknown', defaultTheme);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[PrismUI] resolveColorExpression"),
    );

    process.env.NODE_ENV = originalEnv;
    warn.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────
// generateCSSVariables
// ─────────────────────────────────────────────────────────────────

describe("generateCSSVariables", () => {
  it("is a pure function — returns a Record<string, string>", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(typeof vars).toBe("object");
    for (const value of Object.values(vars)) {
      expect(typeof value).toBe("string");
    }
  });

  it("generates --prismui-color-primary from palette.light.primary.base", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    // palette.light.primary.base = "colors.blue.500" → "#0C68E9"
    expect(vars["--prismui-color-primary"]).toBe("#0C68E9");
  });

  it("generates hover and active variants", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-color-primary-hover"]).toBe("#0850C8");
    expect(vars["--prismui-color-primary-active"]).toBe("#063BA7");
  });

  it("generates all 7 semantic color groups", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    const names = ["primary", "secondary", "info", "success", "warning", "error", "neutral"];
    for (const name of names) {
      expect(vars).toHaveProperty(`--prismui-color-${name}`);
      expect(vars).toHaveProperty(`--prismui-color-${name}-hover`);
      expect(vars).toHaveProperty(`--prismui-color-${name}-active`);
    }
  });

  it("generates spacing variables (8-step Stage-14 SZ-SCALE-4)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-spacing-none"]).toBe("0px");
    expect(vars["--prismui-spacing-xs"]).toBe("0.25rem");
    expect(vars["--prismui-spacing-sm"]).toBe("0.5rem");
    expect(vars["--prismui-spacing-md"]).toBe("1rem");
    expect(vars["--prismui-spacing-lg"]).toBe("1.5rem");
    expect(vars["--prismui-spacing-xl"]).toBe("2rem");
    expect(vars["--prismui-spacing-2xl"]).toBe("2.5rem");
    expect(vars["--prismui-spacing-3xl"]).toBe("3rem");
  });

  it("generates radius variables", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-radius-xs"]).toBe("0.25rem");
    expect(vars["--prismui-radius-sm"]).toBe("0.375rem");
    expect(vars["--prismui-radius-md"]).toBe("0.5rem");
    expect(vars["--prismui-radius-full"]).toBe("9999px");
  });

  it("generates transition duration variables", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-duration-fast"]).toBe("120ms");
    expect(vars["--prismui-duration-base"]).toBe("150ms");
    expect(vars["--prismui-duration-slow"]).toBe("200ms");
  });

  it("generates transition easing variables", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-ease-standard"]).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
    expect(vars["--prismui-ease-in"]).toBe("cubic-bezier(0.4, 0, 1, 1)");
    expect(vars["--prismui-ease-out"]).toBe("cubic-bezier(0, 0, 0.2, 1)");
  });

  it("generates transition shorthand variables (CSS var composition)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-transition-fast"]).toBe(
      "var(--prismui-duration-fast) var(--prismui-ease-standard)",
    );
    expect(vars["--prismui-transition-base"]).toBe(
      "var(--prismui-duration-base) var(--prismui-ease-standard)",
    );
    expect(vars["--prismui-transition-slow"]).toBe(
      "var(--prismui-duration-slow) var(--prismui-ease-standard)",
    );
  });

  it("generates font-size variables", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-font-size-xs"]).toBe("0.75rem");
    expect(vars["--prismui-font-size-md"]).toBe("1rem");
  });

  it("generates font-weight variables", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-font-weight-regular"]).toBe("400");
    expect(vars["--prismui-font-weight-bold"]).toBe("700");
  });

  it("generates line-height variables", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-line-height-md"]).toBe("1.5");
  });

  // ── Stage-14 SZ-TYPE-2 Family Layer (v1.0 lock) ─────────────────────────
  it("emits Stage-14 typography family vars (3 families × 3 sizes × 3 fields = 27)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    const families = ["body", "title", "label"] as const;
    const sizes = ["sm", "md", "lg"] as const;
    const fields = ["font-size", "line-height", "font-weight"] as const;

    for (const family of families) {
      for (const size of sizes) {
        for (const field of fields) {
          const key = `--prismui-typography-${family}-${size}-${field}`;
          expect(vars, key).toHaveProperty(key);
          expect(vars[key], `${key} should be a non-empty string`).toBeDefined();
          expect(typeof vars[key]).toBe("string");
          expect(vars[key].length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("Stage-14 anchor: typography body.md = 14/20 / 400 in CSS vars", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-typography-body-md-font-size"]).toBe("14px");
    expect(vars["--prismui-typography-body-md-line-height"]).toBe("20px");
    expect(vars["--prismui-typography-body-md-font-weight"]).toBe("400");
  });

  it("Stage-14 anchor: typography title.md = 20/28 / 600 in CSS vars (Section titleSize)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-typography-title-md-font-size"]).toBe("20px");
    expect(vars["--prismui-typography-title-md-line-height"]).toBe("28px");
    expect(vars["--prismui-typography-title-md-font-weight"]).toBe("600");
  });

  it("Stage-14 anchor: typography label.md = 14/20 / 500 in CSS vars (OQ-SZ-1=B Button)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-typography-label-md-font-size"]).toBe("14px");
    expect(vars["--prismui-typography-label-md-line-height"]).toBe("20px");
    expect(vars["--prismui-typography-label-md-font-weight"]).toBe("500");
  });

  it("SZ-TYPE-1: every family lineHeight CSS var ends with 'px' (px integer · % 4 === 0)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    const families = ["body", "title", "label"] as const;
    const sizes = ["sm", "md", "lg"] as const;
    for (const family of families) {
      for (const size of sizes) {
        const key = `--prismui-typography-${family}-${size}-line-height`;
        const value = vars[key];
        expect(value, key).toMatch(/^\d+px$/);
        const px = parseInt(value, 10);
        expect(px % 4, `${key}=${value} must be % 4 === 0`).toBe(0);
      }
    }
  });

  // ── Stage-14 Phase 4 · Section Layout vars (SZ-SEC-1 / SZ-SEC-2 v1.1) ────
  // 10 type fields → 12 CSS vars (typography size key resolves to a triplet).
  // STAGE-14-OVERVIEW.md §3.7.1 (v1.1) / css-variables.ts emission block.
  // ADR-005 v1.0.7 audit entry: paddingY moved from a single global field to
  // per-band fields (header / content / footer), so the emitted var list
  // changed from `--prismui-section-padding-y` to three band-specific vars.
  it("emits all 12 Stage-14 Section Layout vars (v1.1 · 2 spacing + 3 per-band paddingY + 3 resolved typography + 4 alignment)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    const expectedKeys = [
      // spacing (2 · top-level shared across bands)
      "--prismui-section-padding-x",
      "--prismui-section-gap",
      // per-band paddingY (3 · v1.1 · was a single global var in v1.0)
      "--prismui-section-header-padding-y",
      "--prismui-section-content-padding-y",
      "--prismui-section-footer-padding-y",
      // resolved typography triplet (3 — derived from titleSize size key)
      "--prismui-section-title-font-size",
      "--prismui-section-title-line-height",
      "--prismui-section-title-font-weight",
      // alignment (4)
      "--prismui-section-header-align",
      "--prismui-section-header-justify",
      "--prismui-section-footer-justify",
      "--prismui-section-content-scroll",
    ];
    for (const key of expectedKeys) {
      expect(vars, key).toHaveProperty(key);
      expect(vars[key], `${key} should be a non-empty string`).toBeTruthy();
      expect(typeof vars[key]).toBe("string");
    }
    // The retired v1.0 global paddingY var MUST NOT leak through — emitting
    // it would break Stage-15 CSS consumers that have switched to the per-band
    // vars. (If a future v1.x reintroduces a global paddingY field this test
    // is the canary that forces an explicit decision.)
    expect(vars).not.toHaveProperty("--prismui-section-padding-y");
  });

  it("Section spacing vars match theme.spacing.* anchors (SZ-SEC-1 derivation · v1.1)", () => {
    // SZ-SEC-1 promises Section paddings derive from spacing tokens. v1.1
    // moves paddingY into per-band fields; the emitted CSS values must
    // still literally equal the spacing scale entries.
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-section-padding-x"]).toBe("1.5rem");          // spacing.lg
    expect(vars["--prismui-section-gap"]).toBe("0px");                    // spacing.none (v1.1 default)
    expect(vars["--prismui-section-header-padding-y"]).toBe("1.5rem");   // spacing.lg (v1.1)
    expect(vars["--prismui-section-content-padding-y"]).toBe("0px");      // spacing.none (v1.1)
    expect(vars["--prismui-section-footer-padding-y"]).toBe("1.5rem");   // spacing.lg (v1.1)
  });

  it("Section title triplet resolves via theme.typography.title[titleSize] (default md → 20/28/600)", () => {
    // The "1 typography field expands to 3 vars" promise: titleSize='md'
    // indexes into theme.typography.title.md and the emitter writes the
    // resolved fontSize / lineHeight / fontWeight as Section-scoped vars.
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-section-title-font-size"]).toBe("20px");
    expect(vars["--prismui-section-title-line-height"]).toBe("28px");
    expect(vars["--prismui-section-title-font-weight"]).toBe("600");
  });

  it("Section title-line-height ends with 'px' and is % 4 === 0 (inherits SZ-TYPE-1 from typography family)", () => {
    // The Section title triplet inherits SZ-TYPE-1 because it is *resolved
    // from* the typography family which already enforces the invariant.
    // This guard catches any future direct hardcoding or unit drift in
    // the Section emission path.
    const vars = generateCSSVariables(defaultTheme, "light");
    const lh = vars["--prismui-section-title-line-height"];
    expect(lh, "section-title-line-height shape").toMatch(/^\d+px$/);
    const px = parseInt(lh, 10);
    expect(px % 4, `section title lineHeight=${lh} must satisfy % 4 === 0`).toBe(0);
  });

  it("Section alignment vars are CSS Flexbox literals (D-4 mapping table)", () => {
    // Default theme: header.align=center / header.justify=between /
    // footer.justify=end / content.scroll=auto. Verify the type-level
    // unions are correctly mapped to canonical CSS Flexbox values.
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-section-header-align"]).toBe("center");
    expect(vars["--prismui-section-header-justify"]).toBe("space-between");
    expect(vars["--prismui-section-footer-justify"]).toBe("flex-end");
    expect(vars["--prismui-section-content-scroll"]).toBe("auto");
  });

  it("Section title triplet auto-propagates when theme overrides titleSize ('md' → 'lg')", () => {
    // SZ-SEC-1 single-source-of-truth promise: changing titleSize at the
    // theme layer must flow through to the resolved CSS vars without any
    // emitter or container CSS edit. This test substitutes a custom theme
    // with titleSize='lg' and asserts the emission picks up the new size's
    // typography family token (title.lg = 24/32/600 per Stage-14 anchors).
    const customTheme = {
      ...defaultTheme,
      layout: {
        ...defaultTheme.layout,
        section: { ...defaultTheme.layout.section, titleSize: "lg" as const },
      },
    };
    const vars = generateCSSVariables(customTheme, "light");
    expect(vars["--prismui-section-title-font-size"]).toBe("24px");
    expect(vars["--prismui-section-title-line-height"]).toBe("32px");
    expect(vars["--prismui-section-title-font-weight"]).toBe("600");
  });

  it("Section alignment vars adapt to non-default footer.justify ('between' / 'start')", () => {
    // Verify the D-4 mapping table covers all footer.justify branches.
    const themeBetween = {
      ...defaultTheme,
      layout: {
        section: {
          ...defaultTheme.layout.section,
          footer: { ...defaultTheme.layout.section.footer, justify: "between" as const },
        },
      },
    };
    const themeStart = {
      ...defaultTheme,
      layout: {
        section: {
          ...defaultTheme.layout.section,
          footer: { ...defaultTheme.layout.section.footer, justify: "start" as const },
        },
      },
    };
    expect(generateCSSVariables(themeBetween, "light")["--prismui-section-footer-justify"])
      .toBe("space-between");
    expect(generateCSSVariables(themeStart, "light")["--prismui-section-footer-justify"])
      .toBe("flex-start");
  });

  it("Section content.scroll='never' maps to 'visible' (D-4 mapping)", () => {
    const themeNever = {
      ...defaultTheme,
      layout: {
        section: {
          ...defaultTheme.layout.section,
          content: { ...defaultTheme.layout.section.content, scroll: "never" as const },
        },
      },
    };
    expect(generateCSSVariables(themeNever, "light")["--prismui-section-content-scroll"])
      .toBe("visible");
  });

  it("Section header.align='start' maps to 'flex-start' (D-4 mapping)", () => {
    const themeStart = {
      ...defaultTheme,
      layout: {
        section: {
          ...defaultTheme.layout.section,
          header: { ...defaultTheme.layout.section.header, align: "start" as const },
        },
      },
    };
    expect(generateCSSVariables(themeStart, "light")["--prismui-section-header-align"])
      .toBe("flex-start");
  });

  it("generates shadow variables", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-shadow-xs"]).toContain("rgba");
    expect(vars["--prismui-shadow-md"]).toContain("rgba");
  });

  it("dark colorScheme uses palette.dark", () => {
    const lightVars = generateCSSVariables(defaultTheme, "light");
    const darkVars = generateCSSVariables(defaultTheme, "dark");
    // light and dark palettes may differ — at minimum both should generate primary
    expect(darkVars).toHaveProperty("--prismui-color-primary");
    // spacing/radius are theme-wide (same for both)
    expect(darkVars["--prismui-spacing-md"]).toBe(lightVars["--prismui-spacing-md"]);
  });

  it("defaults colorScheme to 'light' when omitted", () => {
    const withDefault = generateCSSVariables(defaultTheme);
    const withLight = generateCSSVariables(defaultTheme, "light");
    expect(withDefault).toEqual(withLight);
  });

  it("does not generate --prismui-component-* variables (reserved for Stage 4)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    const hasComponent = Object.keys(vars).some((k) => k.startsWith("--prismui-component-"));
    expect(hasComponent).toBe(false);
  });

  it("generates color role variables — high emphasis for primary", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    // primary.high: bg=shade(500), hoverBg=shade(700), activeBg=shade(800), fg=raw('#FFFFFF')
    expect(vars["--prismui-color-primary-high-bg"]).toBeDefined();
    expect(vars["--prismui-color-primary-high-hover-bg"]).toBeDefined();
    expect(vars["--prismui-color-primary-high-active-bg"]).toBeDefined();
    expect(vars["--prismui-color-primary-high-fg"]).toBeDefined();
    expect(vars["--prismui-color-primary-high-hover-shadow"]).toBeDefined();
    // high-bg resolves blue.500 (same as base)
    expect(vars["--prismui-color-primary-high-bg"]).toBe(vars["--prismui-color-primary"]);
    // high-hover-bg resolves blue.700 (same as active — hoverShade=7, +2 from bg)
    expect(vars["--prismui-color-primary-high-hover-bg"]).toBe(vars["--prismui-color-primary-active"]);
    // fg is raw '#FFFFFF'
    expect(vars["--prismui-color-primary-high-fg"]).toBe("#FFFFFF");
    // hoverShadow is ShadowExpression → contains var() reference + color-mix
    const shadow = vars["--prismui-color-primary-high-hover-shadow"];
    expect(shadow).toContain("color-mix");
    expect(shadow).toContain("var(--prismui-color-blue-600)");
    expect(shadow).toContain("24%");
    expect(shadow).toContain("8px");
    expect(shadow).toContain("16px");
    // Must NOT contain raw hex (ensures var() path, not hex resolution)
    expect(shadow).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });

  it("generates color role variables — low emphasis for primary", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-color-primary-low-bg"]).toBeDefined();
    expect(vars["--prismui-color-primary-low-hover-bg"]).toBeDefined();
    expect(vars["--prismui-color-primary-low-active-bg"]).toBeDefined();
    expect(vars["--prismui-color-primary-low-fg"]).toBeDefined();
    // low.bg uses alpha expression → color-mix
    expect(vars["--prismui-color-primary-low-bg"]).toContain("color-mix");
  });

  it("generates color role variables — bordered for primary", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-color-primary-bordered-bg"]).toBeDefined();
    expect(vars["--prismui-color-primary-bordered-border"]).toBeDefined();
    expect(vars["--prismui-color-primary-bordered-fg"]).toBeDefined();
    expect(vars["--prismui-color-primary-bordered-hover-bg"]).toBeDefined();
    expect(vars["--prismui-color-primary-bordered-active-bg"]).toBeDefined();
    expect(vars["--prismui-color-primary-bordered-hover-border"]).toBeDefined();
    expect(vars["--prismui-color-primary-bordered-hover-shadow"]).toBeDefined();
    // bordered.bg is raw 'transparent'
    expect(vars["--prismui-color-primary-bordered-bg"]).toBe("transparent");
    // bordered.hoverBorder is raw 'currentcolor'
    expect(vars["--prismui-color-primary-bordered-hover-border"]).toBe("currentcolor");
  });

  it("generates color role variables — minimal for primary", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-color-primary-minimal-fg"]).toBeDefined();
    expect(vars["--prismui-color-primary-minimal-hover-bg"]).toBeDefined();
    expect(vars["--prismui-color-primary-minimal-active-bg"]).toBeDefined();
  });

  it("generates all color role variables for all 7 semantic names", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    const names = ["primary", "secondary", "info", "success", "warning", "error", "neutral"];
    const roleSuffixes = [
      "high-bg", "high-hover-bg", "high-active-bg", "high-fg", "high-hover-shadow",
      "low-bg", "low-hover-bg", "low-active-bg", "low-fg",
      "bordered-bg", "bordered-fg", "bordered-border", "bordered-hover-bg",
      "bordered-active-bg", "bordered-hover-border", "bordered-hover-shadow",
      "minimal-fg", "minimal-hover-bg", "minimal-active-bg",
    ];
    for (const name of names) {
      for (const suffix of roleSuffixes) {
        const key = `--prismui-color-${name}-${suffix}`;
        expect(vars).toHaveProperty(key);
        expect(typeof vars[key]).toBe("string");
        expect(vars[key].length).toBeGreaterThan(0);
      }
    }
  });

  it("neutral achromatic: high-bg resolves to gray.900 (solid, not alpha)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    // gray.900 = #141A21 — highest contrast for achromatic filled
    expect(vars["--prismui-color-neutral-high-bg"]).toBe("#141A21");
    // fg is white
    expect(vars["--prismui-color-neutral-high-fg"]).toBe("#FFFFFF");
    // hover goes LIGHTER (float up) — gray.800
    expect(vars["--prismui-color-neutral-high-hover-bg"]).toBe("#1C252E");
    // active is lightest — gray.700
    expect(vars["--prismui-color-neutral-high-active-bg"]).toBe("#454F5B");
  });

  it("neutral achromatic: low uses solid shades (not color-mix alpha)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    // low.bg = shade 100 (solid), NOT color-mix
    expect(vars["--prismui-color-neutral-low-bg"]).toBe("#F9FAFB");
    expect(vars["--prismui-color-neutral-low-bg"]).not.toContain("color-mix");
    // low.hoverBg = shade 200
    expect(vars["--prismui-color-neutral-low-hover-bg"]).toBe("#F4F6F8");
    // low.fg = shade 800 (deep text)
    expect(vars["--prismui-color-neutral-low-fg"]).toBe("#1C252E");
  });

  it("neutral achromatic: bordered uses solid border (not alpha)", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    // border = shade 300 (solid)
    expect(vars["--prismui-color-neutral-bordered-border"]).toBe("#DFE3E8");
    expect(vars["--prismui-color-neutral-bordered-border"]).not.toContain("color-mix");
    // hoverBorder = shade 400
    expect(vars["--prismui-color-neutral-bordered-hover-border"]).toBe("#C4CDD5");
    // fg = shade 800
    expect(vars["--prismui-color-neutral-bordered-fg"]).toBe("#1C252E");
  });

  it("neutral achromatic: minimal fg = shade 700", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-color-neutral-minimal-fg"]).toBe("#454F5B");
    // hoverBg = shade 100 (solid)
    expect(vars["--prismui-color-neutral-minimal-hover-bg"]).toBe("#F9FAFB");
  });

  it("generates focus ring variables from defaultTheme", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-focus-ring-width"]).toBe("2px");
    expect(vars["--prismui-focus-ring-offset"]).toBe("2px");
    expect(vars["--prismui-focus-ring-color"]).toBe("var(--prismui-color-primary)");
  });

  it("generates focus ring variables from custom focusRing theme override", () => {
    const customTheme = {
      ...defaultTheme,
      focusRing: {
        width: '3px' as const,
        offset: '4px' as const,
        color: '#0055ff',
      },
    };
    const vars = generateCSSVariables(customTheme, "light");
    expect(vars["--prismui-focus-ring-width"]).toBe("3px");
    expect(vars["--prismui-focus-ring-offset"]).toBe("4px");
    expect(vars["--prismui-focus-ring-color"]).toBe("#0055ff");
  });

  it("generates focus pointer-halo variables from defaultTheme (dark-mode adaptive)", () => {
    // 🔴 v1.0.2 Round 1 cleanup: halo color is `color-mix` of currentColor,
    // which self-adapts to the ambient text color (invisible fixed-black
    // default was replaced). See `default-theme.ts` focusPointerHalo comment
    // block for the dark-mode gap reasoning.
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-focus-pointer-halo-width"]).toBe("2px");
    expect(vars["--prismui-focus-pointer-halo-color"]).toBe(
      "color-mix(in srgb, currentColor 16%, transparent)",
    );
  });

  it("halo color default is NOT a hardcoded rgb/hex literal (self-adapts to theme)", () => {
    // Regression guard for the Round 1 cleanup: if the default ever regresses
    // back to `rgba(0,0,0,...)` or `#xxx` literals, the halo is light-mode-only
    // and becomes invisible in dark mode. Any future refactor that hardcodes a
    // color here should be accompanied by either (a) per-palette halo tokens
    // or (b) an explicit waiver in focus-behavior.md.
    const vars = generateCSSVariables(defaultTheme, "light");
    const haloColor = vars["--prismui-focus-pointer-halo-color"];
    // Allow color-mix() / var() / hsl() / oklch() — reject bare rgb/rgba/hex.
    expect(haloColor).not.toMatch(/^rgba?\(\s*\d/);
    expect(haloColor).not.toMatch(/^#[0-9a-f]{3,8}$/i);
  });

  it("generates focus pointer-halo variables from custom focusPointerHalo override", () => {
    const customTheme = {
      ...defaultTheme,
      focusPointerHalo: {
        width: '4px' as const,
        color: 'rgba(0, 85, 255, 0.25)',
      },
    };
    const vars = generateCSSVariables(customTheme, "light");
    expect(vars["--prismui-focus-pointer-halo-width"]).toBe("4px");
    expect(vars["--prismui-focus-pointer-halo-color"]).toBe(
      "rgba(0, 85, 255, 0.25)",
    );
  });
});

// ─────────────────────────────────────────────────────────────────
// selectPalette
// ─────────────────────────────────────────────────────────────────

describe("selectPalette", () => {
  it("returns light palette for colorScheme=light", () => {
    const palette = selectPalette(defaultTheme, "light");
    expect(palette).toBe(defaultTheme.palette.light);
  });

  it("returns dark palette for colorScheme=dark", () => {
    const palette = selectPalette(defaultTheme, "dark");
    expect(palette).toBe(defaultTheme.palette.dark);
  });

  it("returns palette with all 7 semantic tokens", () => {
    const palette = selectPalette(defaultTheme, "light");
    const names = ["primary", "secondary", "info", "success", "warning", "error", "neutral"];
    for (const name of names) {
      expect(palette).toHaveProperty(name);
    }
  });
});

// ─────────────────────────────────────────────────────────────────
// applyDiffCSSVariables
// ─────────────────────────────────────────────────────────────────

describe("applyDiffCSSVariables", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("div");
  });

  afterEach(() => {
    element = null as any;
  });

  it("sets new CSS variables", () => {
    applyDiffCSSVariables(element, { "--color-a": "red" });
    expect(element.style.getPropertyValue("--color-a")).toBe("red");
  });

  it("does not call setProperty if value is unchanged (diff)", () => {
    const setProperty = vi.spyOn(element.style, "setProperty");
    applyDiffCSSVariables(element, { "--color-a": "red" }, { "--color-a": "red" });
    expect(setProperty).not.toHaveBeenCalled();
  });

  it("calls setProperty only for changed variables", () => {
    const setProperty = vi.spyOn(element.style, "setProperty");
    applyDiffCSSVariables(
      element,
      { "--color-a": "red", "--color-b": "blue" },
      { "--color-a": "red", "--color-b": "green" },
    );
    expect(setProperty).toHaveBeenCalledTimes(1);
    expect(setProperty).toHaveBeenCalledWith("--color-b", "blue");
  });

  it("removes variables that no longer exist in next", () => {
    const removeProperty = vi.spyOn(element.style, "removeProperty");
    applyDiffCSSVariables(
      element,
      { "--color-b": "blue" },
      { "--color-a": "red", "--color-b": "blue" },
    );
    expect(removeProperty).toHaveBeenCalledWith("--color-a");
    expect(removeProperty).toHaveBeenCalledTimes(1);
  });

  it("removes all variables when next is empty (full cleanup)", () => {
    applyDiffCSSVariables(element, { "--color-a": "red", "--color-b": "blue" });
    applyDiffCSSVariables(
      element,
      {},
      { "--color-a": "red", "--color-b": "blue" },
    );
    expect(element.style.getPropertyValue("--color-a")).toBe("");
    expect(element.style.getPropertyValue("--color-b")).toBe("");
  });

  it("treats missing prev as empty (first apply)", () => {
    applyDiffCSSVariables(element, { "--color-a": "red" });
    expect(element.style.getPropertyValue("--color-a")).toBe("red");
  });
});

// ─────────────────────────────────────────────────────────────────
// resolveTextRole (Step 3.8 — Text Role Layer)
// ─────────────────────────────────────────────────────────────────

describe("resolveTextRole", () => {
  const lightPalette = defaultTheme.palette.light;

  it("resolves { neutral, high, fg } to the neutral high foreground color", () => {
    const ref: TextRoleRef = { semantic: "neutral", role: "high", field: "fg" };
    const result = resolveTextRole(ref, lightPalette, defaultTheme);
    // neutral.high.fg is a ColorExpression; should NOT be 'transparent'
    expect(result).not.toBe("transparent");
    expect(typeof result).toBe("string");
  });

  it("resolves { error, high, bg } to the red.high.bg color (danger text)", () => {
    const ref: TextRoleRef = { semantic: "error", role: "high", field: "bg" };
    const result = resolveTextRole(ref, lightPalette, defaultTheme);
    expect(result).not.toBe("transparent");
    // error family maps to 'red', high.bg is typically shade 500
    // we don't assert the exact hex to stay resilient to palette tuning
    expect(result).toMatch(/^#|rgb|color-mix/);
  });

  it("returns 'transparent' for unknown semantic", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const ref = { semantic: "bogus", role: "high", field: "bg" } as unknown as TextRoleRef;
    const result = resolveTextRole(ref, lightPalette, defaultTheme);

    expect(result).toBe("transparent");
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('semantic "bogus" not found'),
    );

    process.env.NODE_ENV = originalEnv;
    warn.mockRestore();
  });

  it("returns 'transparent' when field is missing on the selected role (e.g. minimal.bg)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    // minimal role has fg but no bg — a deliberate misuse
    const ref = { semantic: "neutral", role: "minimal", field: "bg" } as unknown as TextRoleRef;
    const result = resolveTextRole(ref, lightPalette, defaultTheme);

    expect(result).toBe("transparent");
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('field "bg" not found'),
    );

    process.env.NODE_ENV = originalEnv;
    warn.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────
// generateCSSVariables — Text Role output (Step 3.8)
// ─────────────────────────────────────────────────────────────────

describe("generateCSSVariables — Text Roles", () => {
  it("emits --prismui-text-{role} for every TextRoleName in theme.textRoles", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    const expectedRoles = [
      "primary",
      "secondary",
      "disabled",
      "danger",
      "warning",
      "success",
      "info",
    ];
    for (const role of expectedRoles) {
      expect(vars[`--prismui-text-${role}`]).toBeDefined();
      expect(vars[`--prismui-text-${role}`]).not.toBe("");
    }
  });

  it("--prismui-text-danger equals resolved error.high.bg value", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    const danger = vars["--prismui-text-danger"];
    const directErrorBg = vars["--prismui-color-error-high-bg"];
    expect(danger).toBe(directErrorBg);
  });

  it("--prismui-text-primary equals resolved neutral.bordered.fg value", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    const primary = vars["--prismui-text-primary"];
    const directNeutralFg = vars["--prismui-color-neutral-bordered-fg"];
    expect(primary).toBe(directNeutralFg);
  });

  it("text role variables differ between light and dark palettes", () => {
    const light = generateCSSVariables(defaultTheme, "light");
    const dark = generateCSSVariables(defaultTheme, "dark");
    // primary (neutral.bordered.fg) flips between light (gray.800) and dark (gray.100)
    expect(light["--prismui-text-primary"]).not.toBe(dark["--prismui-text-primary"]);
  });
});
