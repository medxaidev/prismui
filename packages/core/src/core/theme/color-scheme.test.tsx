import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { ColorSchemeProvider, useColorScheme, useColorSchemeOptional } from "./color-scheme.context";
import { PrismUIProvider } from "./provider/PrismUIProvider";
import { createTheme } from "./create-theme";
import { selectPalette } from "./context/css-variables";
import { defaultTheme } from "./default-theme";
import { defaultLightPalette, defaultDarkPalette } from "./default-palette";
import type { PrismUITheme } from "./types";
import type { DefaultColorFamily } from "./types";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function SchemeReadout() {
  const { colorScheme } = useColorScheme();
  return <div data-testid="scheme">{colorScheme}</div>;
}

function SchemeOptionalReadout() {
  const scheme = useColorSchemeOptional();
  return <div data-testid="optional-scheme">{scheme}</div>;
}

function ToggleButton() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  return (
    <button data-testid="toggle" onClick={toggleColorScheme}>
      {colorScheme}
    </button>
  );
}

function SetButton({ scheme }: { scheme: string }) {
  const { setColorScheme } = useColorScheme();
  return (
    <button data-testid="set" onClick={() => setColorScheme(scheme)}>
      set
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// PrismUITheme dual generic
// ─────────────────────────────────────────────────────────────────

describe("PrismUITheme dual generic", () => {
  it("createTheme() default — backward compatible (light | dark)", () => {
    const theme = createTheme();
    expect(theme.palette.light).toBeDefined();
    expect(theme.palette.dark).toBeDefined();
  });

  it("createTheme<C, 'light'|'dark'|'dim'> — three schemes", () => {
    type MySchemes = "light" | "dark" | "dim";
    const dimPalette = { ...defaultLightPalette };
    const theme = createTheme<DefaultColorFamily, MySchemes>({
      palette: {
        light: defaultLightPalette,
        dark: defaultDarkPalette,
        dim: dimPalette,
      },
    });
    expect(theme.palette.light).toBeDefined();
    expect(theme.palette.dark).toBeDefined();
    expect(theme.palette.dim).toBeDefined();
  });

  it("selectPalette(theme, 'dim') → dim palette", () => {
    type MySchemes = "light" | "dark" | "dim";
    const dimPalette = { ...defaultDarkPalette };
    const theme = createTheme<DefaultColorFamily, MySchemes>({
      palette: {
        light: defaultLightPalette,
        dark: defaultDarkPalette,
        dim: dimPalette,
      },
    });
    const result = selectPalette(theme as PrismUITheme<string, string>, "dim");
    expect(result).toBe(dimPalette);
  });

  it("selectPalette with unknown key → warns + returns first palette", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
    const result = selectPalette(defaultTheme as PrismUITheme<string, string>, "unknown");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('"unknown" not found in theme.palette'),
    );
    expect(result).toBeDefined();
    warnSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────
// ColorSchemeProvider — defaults
// ─────────────────────────────────────────────────────────────────

describe("ColorSchemeProvider — defaults", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("defaults to 'light' with no props", () => {
    const { getByTestId } = render(
      <ColorSchemeProvider>
        <SchemeReadout />
      </ColorSchemeProvider>,
    );
    expect(getByTestId("scheme").textContent).toBe("light");
  });

  it("accepts defaultColorScheme='dark'", () => {
    const { getByTestId } = render(
      <ColorSchemeProvider defaultColorScheme="dark">
        <SchemeReadout />
      </ColorSchemeProvider>,
    );
    expect(getByTestId("scheme").textContent).toBe("dark");
  });

  it("wraps PrismUIProvider internally (ThemeContext available inside)", () => {
    const { getByTestId } = render(
      <ColorSchemeProvider>
        <SchemeReadout />
      </ColorSchemeProvider>,
    );
    expect(getByTestId("scheme")).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────
// useColorScheme
// ─────────────────────────────────────────────────────────────────

describe("useColorScheme", () => {
  it("throws when used outside ColorSchemeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => { });
    expect(() => render(<SchemeReadout />)).toThrow(
      "[PrismUI] useColorScheme must be used within <ColorSchemeProvider>",
    );
    spy.mockRestore();
  });

  it("returns colorScheme, setColorScheme, toggleColorScheme", () => {
    let result: ReturnType<typeof useColorScheme> | null = null;
    function Capture() {
      result = useColorScheme();
      return null;
    }
    render(
      <ColorSchemeProvider>
        <Capture />
      </ColorSchemeProvider>,
    );
    expect(result!.colorScheme).toBe("light");
    expect(typeof result!.setColorScheme).toBe("function");
    expect(typeof result!.toggleColorScheme).toBe("function");
  });

  it("setColorScheme('dark') updates colorScheme", async () => {
    const { getByTestId } = render(
      <ColorSchemeProvider>
        <SchemeReadout />
        <SetButton scheme="dark" />
      </ColorSchemeProvider>,
    );
    expect(getByTestId("scheme").textContent).toBe("light");
    await act(async () => {
      getByTestId("set").click();
    });
    expect(getByTestId("scheme").textContent).toBe("dark");
  });

  it("toggleColorScheme() cycles light → dark → light", async () => {
    localStorage.clear();
    const { getByTestId } = render(
      <ColorSchemeProvider>
        <ToggleButton />
      </ColorSchemeProvider>,
    );
    expect(getByTestId("toggle").textContent).toBe("light");
    await act(async () => { getByTestId("toggle").click(); });
    expect(getByTestId("toggle").textContent).toBe("dark");
    await act(async () => { getByTestId("toggle").click(); });
    expect(getByTestId("toggle").textContent).toBe("light");
  });

  it("toggleColorScheme with 3-scheme theme cycles through all keys", async () => {
    localStorage.clear();
    type MySchemes = "light" | "dark" | "dim";
    const dimPalette = { ...defaultLightPalette };
    const myTheme = createTheme<DefaultColorFamily, MySchemes>({
      palette: {
        light: defaultLightPalette,
        dark: defaultDarkPalette,
        dim: dimPalette,
      },
    });
    const { getByTestId } = render(
      <ColorSchemeProvider theme={myTheme as PrismUITheme<string, string>}>
        <ToggleButton />
      </ColorSchemeProvider>,
    );
    expect(getByTestId("toggle").textContent).toBe("light");
    await act(async () => { getByTestId("toggle").click(); });
    expect(getByTestId("toggle").textContent).toBe("dark");
    await act(async () => { getByTestId("toggle").click(); });
    expect(getByTestId("toggle").textContent).toBe("dim");
    await act(async () => { getByTestId("toggle").click(); });
    expect(getByTestId("toggle").textContent).toBe("light");
  });
});

// ─────────────────────────────────────────────────────────────────
// useColorSchemeOptional
// ─────────────────────────────────────────────────────────────────

describe("useColorSchemeOptional", () => {
  it("returns 'light' outside ColorSchemeProvider (no throw)", () => {
    const { getByTestId } = render(<SchemeOptionalReadout />);
    expect(getByTestId("optional-scheme").textContent).toBe("light");
  });

  it("returns context colorScheme when inside provider", () => {
    const { getByTestId } = render(
      <ColorSchemeProvider defaultColorScheme="dark" storageKey={null}>
        <SchemeOptionalReadout />
      </ColorSchemeProvider>,
    );
    expect(getByTestId("optional-scheme").textContent).toBe("dark");
  });
});

// ─────────────────────────────────────────────────────────────────
// localStorage persistence
// ─────────────────────────────────────────────────────────────────

describe("localStorage persistence", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("setColorScheme writes to storageKey", async () => {
    const { getByTestId } = render(
      <ColorSchemeProvider storageKey="test-key">
        <SetButton scheme="dark" />
      </ColorSchemeProvider>,
    );
    await act(async () => { getByTestId("set").click(); });
    expect(localStorage.getItem("test-key")).toBe("dark");
  });

  it("storageKey=null → no localStorage write", async () => {
    const { getByTestId } = render(
      <ColorSchemeProvider storageKey={null}>
        <SetButton scheme="dark" />
      </ColorSchemeProvider>,
    );
    await act(async () => { getByTestId("set").click(); });
    expect(localStorage.getItem("prismui-color-scheme")).toBeNull();
  });

  it("initial value reads from localStorage when available", () => {
    localStorage.setItem("test-key", "dark");
    const { getByTestId } = render(
      <ColorSchemeProvider storageKey="test-key">
        <SchemeReadout />
      </ColorSchemeProvider>,
    );
    expect(getByTestId("scheme").textContent).toBe("dark");
  });
});

// ─────────────────────────────────────────────────────────────────
// toggleOrder prop (优化 2)
// ─────────────────────────────────────────────────────────────────

describe("toggleOrder prop", () => {
  it("respects explicit toggleOrder instead of palette insertion order", async () => {
    localStorage.clear();
    type MySchemes = "light" | "dark" | "dim";
    const dimPalette = { ...defaultLightPalette };
    // palette keys inserted in reverse order: dark, light, dim
    const myTheme = createTheme<DefaultColorFamily, MySchemes>({
      palette: {
        dark: defaultDarkPalette,
        light: defaultLightPalette,
        dim: dimPalette,
      },
    });
    const { getByTestId } = render(
      <ColorSchemeProvider
        theme={myTheme as PrismUITheme<string, string>}
        toggleOrder={["light", "dark", "dim"]}
      >
        <ToggleButton />
      </ColorSchemeProvider>,
    );
    // Without toggleOrder, first key would be 'dark' (insertion order)
    // With toggleOrder=['light','dark','dim'], starts at index of current='light'
    expect(getByTestId("toggle").textContent).toBe("light");
    await act(async () => { getByTestId("toggle").click(); });
    expect(getByTestId("toggle").textContent).toBe("dark");
    await act(async () => { getByTestId("toggle").click(); });
    expect(getByTestId("toggle").textContent).toBe("dim");
  });

  it("without toggleOrder, uses palette insertion order", async () => {
    localStorage.clear();
    type MySchemes = "dark" | "light";  // dark first in insertion order
    const myTheme = createTheme<DefaultColorFamily, MySchemes>({
      palette: {
        dark: defaultDarkPalette,
        light: defaultLightPalette,
      },
    });
    const { getByTestId } = render(
      <ColorSchemeProvider
        theme={myTheme as PrismUITheme<string, string>}
        defaultColorScheme="dark"
        storageKey={null}
      >
        <ToggleButton />
      </ColorSchemeProvider>,
    );
    expect(getByTestId("toggle").textContent).toBe("dark");
    await act(async () => { getByTestId("toggle").click(); });
    // insertion order: dark(0) → light(1)
    expect(getByTestId("toggle").textContent).toBe("light");
  });
});

// ─────────────────────────────────────────────────────────────────
// ColorSchemeStrategy type (优化 3)
// ─────────────────────────────────────────────────────────────────

describe("ColorSchemeStrategy — 'system' is not a running colorScheme", () => {
  it("defaultColorScheme='system' resolves to 'light' or 'dark', not 'system'", () => {
    localStorage.clear();
    const { getByTestId } = render(
      <ColorSchemeProvider defaultColorScheme="system" storageKey={null}>
        <SchemeReadout />
      </ColorSchemeProvider>,
    );
    const scheme = getByTestId("scheme").textContent;
    expect(scheme === "light" || scheme === "dark").toBe(true);
    expect(scheme).not.toBe("system");
  });
});

// ─────────────────────────────────────────────────────────────────
// PrismUIProvider static mode (backward compat)
// ─────────────────────────────────────────────────────────────────

describe("PrismUIProvider static mode (backward compat)", () => {
  it("<PrismUIProvider colorScheme='dark'> still works standalone", () => {
    expect(() =>
      render(
        <PrismUIProvider colorScheme="dark">
          <div>ok</div>
        </PrismUIProvider>,
      ),
    ).not.toThrow();
  });
});
