import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveColorRef, generateCSSVariables, applyDiffCSSVariables } from "./css-variables";
import { defaultTheme } from "../default-theme";

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
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
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
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    resolveColorRef("colors.invalid.500" as any, defaultTheme);

    expect(warn).not.toHaveBeenCalled();

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

  it("generates spacing variables", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-spacing-xs"]).toBe("0.25rem");
    expect(vars["--prismui-spacing-md"]).toBe("1rem");
    expect(vars["--prismui-spacing-xl"]).toBe("2rem");
  });

  it("generates radius variables", () => {
    const vars = generateCSSVariables(defaultTheme, "light");
    expect(vars["--prismui-radius-xs"]).toBe("0.125rem");
    expect(vars["--prismui-radius-md"]).toBe("0.5rem");
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
