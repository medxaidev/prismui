// ---------------------------------------------------------------------------
// PrismUI CSS Baseline
//
// A comprehensive CSS reset combining best practices from Mantine and MUI.
// Uses CSS variables from the PrismUI theme system (--prismui-*).
// ---------------------------------------------------------------------------

export const BASELINE_CSS = `
:root {
  color-scheme: var(--prismui-scheme);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  tab-size: 4;
  line-height: 1.5;
}

body {
  margin: 0;
  font-family: var(--prismui-font-family);
  font-size: var(--prismui-font-size);
  line-height: 1.5;
  background-color: var(--prismui-background-default);
  color: var(--prismui-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6, p {
  margin: 0;
}

a {
  color: inherit;
  text-decoration: inherit;
}

img, svg, video, canvas, audio, iframe, embed, object {
  display: block;
  vertical-align: middle;
}

img, video {
  max-width: 100%;
  height: auto;
}

button, input, optgroup, select, textarea {
  font: inherit;
  color: inherit;
  margin: 0;
  padding: 0;
}

button, select {
  text-transform: none;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}

textarea {
  resize: vertical;
}

hr {
  height: 0;
  color: inherit;
  border-top-width: 1px;
}

b, strong {
  font-weight: bolder;
}

:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--prismui-primary-main);
  outline-offset: 2px;
}
`.trim();
