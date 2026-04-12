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
    const spy = vi.spyOn(console, "error").mockImplementation(() => { });
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

// ─────────────────────────────────────────────────────────────────
// Token Extension — color family shades
// ─────────────────────────────────────────────────────────────────

describe("Token Extension — color family shades", () => {
  it("injects default color family shades as CSS variables", () => {
    render(
      <PrismUIProvider theme={defaultTheme} colorScheme="light">
        <div />
      </PrismUIProvider>,
    );
    // blue[500] from defaultColorFamilies
    expect(
      document.documentElement.style.getPropertyValue("--prismui-color-blue-500"),
    ).toBe(defaultTheme.colors.blue[500]);
  });

  it("shade vars and semantic role vars coexist without conflict", () => {
    render(
      <PrismUIProvider theme={defaultTheme} colorScheme="light">
        <div />
      </PrismUIProvider>,
    );
    const shadeVar = document.documentElement.style.getPropertyValue("--prismui-color-blue-500");
    const roleVar = document.documentElement.style.getPropertyValue("--prismui-color-primary-high-bg");
    // Both exist and are different CSS variables
    expect(shadeVar).toBeTruthy();
    expect(roleVar).toBeTruthy();
    // shade var is raw hex, role var is also resolved hex — but different names
    expect(shadeVar).not.toBe("");
    expect(roleVar).not.toBe("");
  });

  it("injects custom color family shades", () => {
    type MyColors = "blue" | "cyan" | "green" | "yellow" | "violet" | "red" | "indigo" | "purple" | "pink" | "orange" | "teal" | "gray" | "brand";
    const brandShade500 = "#2563EB";
    const themeWithBrand: PrismUITheme<MyColors> = {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: brandShade500,
          600: "#2563EB",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
    };
    render(
      <PrismUIProvider theme={themeWithBrand} colorScheme="light">
        <div />
      </PrismUIProvider>,
    );
    expect(
      document.documentElement.style.getPropertyValue("--prismui-color-brand-500"),
    ).toBe(brandShade500);
    expect(
      document.documentElement.style.getPropertyValue("--prismui-color-brand-50"),
    ).toBe("#eff6ff");
  });
});

// ─────────────────────────────────────────────────────────────────
// Token Extension — customTokens
// ─────────────────────────────────────────────────────────────────

describe("Token Extension — customTokens", () => {
  it("injects customTokens as CSS variables", () => {
    const theme: PrismUITheme = {
      ...defaultTheme,
      customTokens: {
        "--app-sidebar-width": "240px",
        "--app-header-height": "64px",
      },
    };
    render(
      <PrismUIProvider theme={theme} colorScheme="light">
        <div />
      </PrismUIProvider>,
    );
    expect(
      document.documentElement.style.getPropertyValue("--app-sidebar-width"),
    ).toBe("240px");
    expect(
      document.documentElement.style.getPropertyValue("--app-header-height"),
    ).toBe("64px");
  });

  it("DEV: warns when customToken key starts with --prismui-", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
    const theme: PrismUITheme = {
      ...defaultTheme,
      customTokens: { "--prismui-spacing-md": "99px" },
    };
    render(
      <PrismUIProvider theme={theme} colorScheme="light">
        <div />
      </PrismUIProvider>,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("--prismui-spacing-md"),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("--prismui-"),
    );
    warnSpy.mockRestore();
  });

  it("still injects value even when --prismui- prefix triggers warn", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
    const theme: PrismUITheme = {
      ...defaultTheme,
      customTokens: { "--prismui-spacing-md": "99px" },
    };
    render(
      <PrismUIProvider theme={theme} colorScheme="light">
        <div />
      </PrismUIProvider>,
    );
    expect(
      document.documentElement.style.getPropertyValue("--prismui-spacing-md"),
    ).toBe("99px");
    warnSpy.mockRestore();
  });
});
