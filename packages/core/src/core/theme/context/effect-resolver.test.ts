import { describe, it, expect } from "vitest";
import { resolveShadowExpression } from "./effect-resolver";

// ─────────────────────────────────────────────────────────────────
// resolveShadowExpression (Effect System)
// ─────────────────────────────────────────────────────────────────

describe("resolveShadowExpression", () => {
  it("resolves shadow to box-shadow with var() reference", () => {
    const result = resolveShadowExpression(
      { type: 'shadow', shade: 600, opacity: 0.24, offsetY: 8, blur: 16 },
      'blue',
    );
    expect(result).toBe(
      "0px 8px 16px 0px color-mix(in srgb, var(--prismui-color-blue-600) 24%, transparent)",
    );
  });

  it("defaults offsetX and spread to 0", () => {
    const result = resolveShadowExpression(
      { type: 'shadow', shade: 500, opacity: 0.32, offsetY: 4, blur: 8 },
      'red',
    );
    expect(result).toMatch(/^0px 4px 8px 0px/);
    expect(result).toContain("var(--prismui-color-red-500)");
  });

  it("uses custom offsetX and spread when provided", () => {
    const result = resolveShadowExpression(
      { type: 'shadow', shade: 500, opacity: 0.32, offsetX: 2, offsetY: 4, blur: 8, spread: 1 },
      'blue',
    );
    expect(result).toBe(
      "2px 4px 8px 1px color-mix(in srgb, var(--prismui-color-blue-500) 32%, transparent)",
    );
  });

  it("does not resolve hex — only emits var() references", () => {
    const result = resolveShadowExpression(
      { type: 'shadow', shade: 600, opacity: 0.24, offsetY: 8, blur: 16 },
      'blue',
    );
    expect(result).not.toContain('#');
    expect(result).toContain('var(--prismui-color-blue-600)');
  });

  it("rounds opacity percentage to integer", () => {
    const result = resolveShadowExpression(
      { type: 'shadow', shade: 500, opacity: 0.333, offsetY: 4, blur: 8 },
      'green',
    );
    expect(result).toContain("33%");
    expect(result).not.toContain("33.3");
  });

  it("works with different color families", () => {
    const families = ['violet', 'cyan', 'green', 'yellow', 'red', 'gray'];
    for (const family of families) {
      const result = resolveShadowExpression(
        { type: 'shadow', shade: 600, opacity: 0.24, offsetY: 8, blur: 16 },
        family,
      );
      expect(result).toContain(`var(--prismui-color-${family}-600)`);
    }
  });

  it("does not require theme parameter (pure string template)", () => {
    // Verification that the function signature only needs expr + family
    const result = resolveShadowExpression(
      { type: 'shadow', shade: 600, opacity: 0.24, offsetY: 8, blur: 16 },
      'nonexistent',
    );
    // Still produces output — browser resolves var() at runtime
    expect(result).toContain('var(--prismui-color-nonexistent-600)');
  });
});
