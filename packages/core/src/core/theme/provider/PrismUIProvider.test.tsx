import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { PrismUIProvider } from "./PrismUIProvider";
import { useTheme, useThemeOptional } from "../context/theme.context";
import { defaultTheme } from "../default-theme";
import type { PrismUITheme } from "../types";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function ThemeReadout() {
  const theme = useTheme();
  return <div data-testid="theme-readout">{theme.spacing.md}</div>;
}

function OptionalThemeReadout() {
  const theme = useThemeOptional();
  return <div data-testid="optional-readout">{theme.spacing.md}</div>;
}

// ─────────────────────────────────────────────────────────────────
// ThemeContext / useTheme / useThemeOptional
// ─────────────────────────────────────────────────────────────────

describe("useTheme", () => {
  it("throws when used outside PrismUIProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeReadout />)).toThrow(
      "[PrismUI] useTheme must be used within <PrismUIProvider>",
    );
    spy.mockRestore();
  });

  it("returns the theme when used inside PrismUIProvider", () => {
    const { getByTestId } = render(
      <PrismUIProvider theme={defaultTheme}>
        <ThemeReadout />
      </PrismUIProvider>,
    );
    expect(getByTestId("theme-readout").textContent).toBe(defaultTheme.spacing.md);
  });
});

describe("useThemeOptional", () => {
  it("returns defaultTheme when used outside PrismUIProvider", () => {
    const { getByTestId } = render(<OptionalThemeReadout />);
    expect(getByTestId("optional-readout").textContent).toBe(defaultTheme.spacing.md);
  });

  it("returns provided theme when inside PrismUIProvider", () => {
    const { getByTestId } = render(
      <PrismUIProvider theme={defaultTheme}>
        <OptionalThemeReadout />
      </PrismUIProvider>,
    );
    expect(getByTestId("optional-readout").textContent).toBe(defaultTheme.spacing.md);
  });
});

// ─────────────────────────────────────────────────────────────────
// PrismUIProvider — DOM node
// ─────────────────────────────────────────────────────────────────

describe("PrismUIProvider — no DOM node", () => {
  it("does not produce an extra DOM wrapper element", () => {
    const { container } = render(
      <PrismUIProvider theme={defaultTheme}>
        <div data-testid="child">child</div>
      </PrismUIProvider>,
    );
    // Direct child of container should be our div, not a wrapper
    expect(container.firstChild).not.toBeNull();
    expect((container.firstChild as HTMLElement).getAttribute("data-testid")).toBe("child");
  });
});

// ─────────────────────────────────────────────────────────────────
// PrismUIProvider — CSS Variables injection
// ─────────────────────────────────────────────────────────────────

describe("PrismUIProvider — CSS Variables injection", () => {
  it("injects --prismui-color-primary to document.documentElement by default", () => {
    render(
      <PrismUIProvider theme={defaultTheme} colorScheme="light">
        <div />
      </PrismUIProvider>,
    );
    const value = document.documentElement.style.getPropertyValue("--prismui-color-primary");
    expect(value).toBe("#0C68E9");
  });

  it("injects spacing variables", () => {
    render(
      <PrismUIProvider theme={defaultTheme} colorScheme="light">
        <div />
      </PrismUIProvider>,
    );
    expect(
      document.documentElement.style.getPropertyValue("--prismui-spacing-md"),
    ).toBe("1rem");
  });

  it("injects to custom target element", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    render(
      <PrismUIProvider theme={defaultTheme} colorScheme="light" target={target}>
        <div />
      </PrismUIProvider>,
    );

    expect(target.style.getPropertyValue("--prismui-color-primary")).toBe("#0C68E9");
    document.body.removeChild(target);
  });

  it("cleans up old target when target prop changes", () => {
    const targetA = document.createElement("div");
    const targetB = document.createElement("div");
    document.body.appendChild(targetA);
    document.body.appendChild(targetB);

    const { rerender } = render(
      <PrismUIProvider theme={defaultTheme} colorScheme="light" target={targetA}>
        <div />
      </PrismUIProvider>,
    );
    expect(targetA.style.getPropertyValue("--prismui-color-primary")).toBe("#0C68E9");

    act(() => {
      rerender(
        <PrismUIProvider theme={defaultTheme} colorScheme="light" target={targetB}>
          <div />
        </PrismUIProvider>,
      );
    });

    // Old target should be cleaned up
    expect(targetA.style.getPropertyValue("--prismui-color-primary")).toBe("");
    // New target should have variables
    expect(targetB.style.getPropertyValue("--prismui-color-primary")).toBe("#0C68E9");

    document.body.removeChild(targetA);
    document.body.removeChild(targetB);
  });
});

// ─────────────────────────────────────────────────────────────────
// PrismUIProvider — props
// ─────────────────────────────────────────────────────────────────

describe("PrismUIProvider — defaults", () => {
  it("uses defaultTheme when theme prop is omitted", () => {
    const { getByTestId } = render(
      <PrismUIProvider>
        <ThemeReadout />
      </PrismUIProvider>,
    );
    expect(getByTestId("theme-readout").textContent).toBe(defaultTheme.spacing.md);
  });

  it("defaults colorScheme to 'light'", () => {
    render(
      <PrismUIProvider theme={defaultTheme}>
        <div />
      </PrismUIProvider>,
    );
    // light palette primary = colors.blue.500 = #0C68E9
    expect(
      document.documentElement.style.getPropertyValue("--prismui-color-primary"),
    ).toBe("#0C68E9");
  });
});
