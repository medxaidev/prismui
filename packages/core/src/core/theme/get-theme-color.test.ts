import { describe, it, expect } from 'vitest';
import { getThemeColor } from './get-theme-color';
import { createTheme } from './create-theme';
import type { PrismuiTheme } from './types';

const theme = createTheme() as PrismuiTheme;

describe('getThemeColor', () => {
  // --- undefined / empty ---

  it('returns undefined for undefined input', () => {
    expect(getThemeColor(undefined, theme)).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getThemeColor('', theme)).toBeUndefined();
  });

  // --- Semantic color keys ---

  it('resolves "primary" to var(--prismui-primary-main)', () => {
    expect(getThemeColor('primary', theme)).toBe('var(--prismui-primary-main)');
  });

  it('resolves "secondary" to var(--prismui-secondary-main)', () => {
    expect(getThemeColor('secondary', theme)).toBe('var(--prismui-secondary-main)');
  });

  it('resolves "info" to var(--prismui-info-main)', () => {
    expect(getThemeColor('info', theme)).toBe('var(--prismui-info-main)');
  });

  it('resolves "success" to var(--prismui-success-main)', () => {
    expect(getThemeColor('success', theme)).toBe('var(--prismui-success-main)');
  });

  it('resolves "warning" to var(--prismui-warning-main)', () => {
    expect(getThemeColor('warning', theme)).toBe('var(--prismui-warning-main)');
  });

  it('resolves "error" to var(--prismui-error-main)', () => {
    expect(getThemeColor('error', theme)).toBe('var(--prismui-error-main)');
  });

  it('resolves "neutral" to var(--prismui-neutral-main)', () => {
    expect(getThemeColor('neutral', theme)).toBe('var(--prismui-neutral-main)');
  });

  // --- Semantic color + field ---

  it('resolves "primary.dark" to var(--prismui-primary-dark)', () => {
    expect(getThemeColor('primary.dark', theme)).toBe('var(--prismui-primary-dark)');
  });

  it('resolves "primary.light" to var(--prismui-primary-light)', () => {
    expect(getThemeColor('primary.light', theme)).toBe('var(--prismui-primary-light)');
  });

  it('resolves "error.contrastText" to var(--prismui-error-contrastText)', () => {
    expect(getThemeColor('error.contrastText', theme)).toBe('var(--prismui-error-contrastText)');
  });

  it('resolves "primary.mainChannel" to var(--prismui-primary-mainChannel)', () => {
    expect(getThemeColor('primary.mainChannel', theme)).toBe('var(--prismui-primary-mainChannel)');
  });

  // --- Color family + shade ---

  it('resolves "blue.500" to var(--prismui-color-blue-500)', () => {
    expect(getThemeColor('blue.500', theme)).toBe('var(--prismui-color-blue-500)');
  });

  it('resolves "red.300" to var(--prismui-color-red-300)', () => {
    expect(getThemeColor('red.300', theme)).toBe('var(--prismui-color-red-300)');
  });

  it('resolves "gray.50" to var(--prismui-color-gray-50)', () => {
    expect(getThemeColor('gray.50', theme)).toBe('var(--prismui-color-gray-50)');
  });

  // --- Color family without shade (uses primaryShade.light) ---

  it('resolves "blue" to var(--prismui-color-blue-500) (light center=5)', () => {
    expect(getThemeColor('blue', theme)).toBe('var(--prismui-color-blue-500)');
  });

  it('resolves "red" to var(--prismui-color-red-500)', () => {
    expect(getThemeColor('red', theme)).toBe('var(--prismui-color-red-500)');
  });

  // --- Palette tokens ---

  it('resolves "text.primary" to var(--prismui-text-primary)', () => {
    expect(getThemeColor('text.primary', theme)).toBe('var(--prismui-text-primary)');
  });

  it('resolves "text.secondary" to var(--prismui-text-secondary)', () => {
    expect(getThemeColor('text.secondary', theme)).toBe('var(--prismui-text-secondary)');
  });

  it('resolves "background.paper" to var(--prismui-background-paper)', () => {
    expect(getThemeColor('background.paper', theme)).toBe('var(--prismui-background-paper)');
  });

  it('resolves "background.default" to var(--prismui-background-default)', () => {
    expect(getThemeColor('background.default', theme)).toBe('var(--prismui-background-default)');
  });

  it('resolves "common.black" to var(--prismui-common-black)', () => {
    expect(getThemeColor('common.black', theme)).toBe('var(--prismui-common-black)');
  });

  it('resolves "common.white" to var(--prismui-common-white)', () => {
    expect(getThemeColor('common.white', theme)).toBe('var(--prismui-common-white)');
  });

  it('resolves "divider" to var(--prismui-divider)', () => {
    expect(getThemeColor('divider', theme)).toBe('var(--prismui-divider)');
  });

  // --- CSS passthrough ---

  it('passes through hex color "#ff0000"', () => {
    expect(getThemeColor('#ff0000', theme)).toBe('#ff0000');
  });

  it('passes through rgb color', () => {
    expect(getThemeColor('rgb(255, 0, 0)', theme)).toBe('rgb(255, 0, 0)');
  });

  it('passes through hsl color', () => {
    expect(getThemeColor('hsl(0, 100%, 50%)', theme)).toBe('hsl(0, 100%, 50%)');
  });

  it('passes through CSS variable', () => {
    expect(getThemeColor('var(--custom-color)', theme)).toBe('var(--custom-color)');
  });

  it('passes through "transparent"', () => {
    expect(getThemeColor('transparent', theme)).toBe('transparent');
  });

  it('passes through "inherit"', () => {
    expect(getThemeColor('inherit', theme)).toBe('inherit');
  });

  it('passes through "currentColor"', () => {
    expect(getThemeColor('currentColor', theme)).toBe('currentColor');
  });
});
