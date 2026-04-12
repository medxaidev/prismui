import { describe, it, expect } from 'vitest';
import type { VarsResolver } from '../styles/types';
import { withStateVars, STATE_CSS_VARS } from './with-state-vars';
import { WITH_STATE_MARK } from '../component/system-marks';
import { defaultStateTokens } from './default-state-tokens';
import type { PrismUITheme } from '../theme/types';

const STATE_THEME = { state: defaultStateTokens } as unknown as PrismUITheme;
const EMPTY_THEME = {} as unknown as PrismUITheme;

describe('STATE_CSS_VARS constant', () => {
  it('exports exactly 2 variable names', () => {
    expect(Object.keys(STATE_CSS_VARS)).toHaveLength(2);
  });

  it('all names start with --prismui-state-', () => {
    Object.values(STATE_CSS_VARS).forEach((v) => {
      expect(v).toMatch(/^--prismui-state-/);
    });
  });

  it('contains opacityDisabled and cursorDisabled keys', () => {
    expect(STATE_CSS_VARS).toHaveProperty('opacityDisabled');
    expect(STATE_CSS_VARS).toHaveProperty('cursorDisabled');
  });

  it('variable names follow dimension-first convention', () => {
    expect(STATE_CSS_VARS.opacityDisabled).toBe('--prismui-state-opacity-disabled');
    expect(STATE_CSS_VARS.cursorDisabled).toBe('--prismui-state-cursor-disabled');
  });
});

describe('withStateVars — output structure', () => {
  const base: VarsResolver<any> = () => ({ '--btn-extra': 'value' });

  it('returns a function (VarsResolver)', () => {
    const resolver = withStateVars(base);
    expect(typeof resolver).toBe('function');
  });

  it('output contains both state CSS variable keys', () => {
    const resolver = withStateVars(base);
    const result = resolver({}, STATE_THEME);
    expect(result).toHaveProperty(STATE_CSS_VARS.opacityDisabled);
    expect(result).toHaveProperty(STATE_CSS_VARS.cursorDisabled);
  });

  it('WITH_STATE_MARK is stamped on returned resolver', () => {
    const resolver = withStateVars(base);
    expect((resolver as any)[WITH_STATE_MARK]).toBe(true);
  });
});

describe('withStateVars — default token values', () => {
  const base: VarsResolver<any> = () => ({});

  it('injects opacity 0.5 by default', () => {
    const resolver = withStateVars(base);
    const result = resolver({}, STATE_THEME);
    expect(result[STATE_CSS_VARS.opacityDisabled]).toBe(0.5);
  });

  it('injects cursor not-allowed by default', () => {
    const resolver = withStateVars(base);
    const result = resolver({}, STATE_THEME);
    expect(result[STATE_CSS_VARS.cursorDisabled]).toBe('not-allowed');
  });

  it('falls back to defaultStateTokens when theme.state is absent', () => {
    const resolver = withStateVars(base);
    const result = resolver({}, EMPTY_THEME);
    expect(result[STATE_CSS_VARS.opacityDisabled]).toBe(defaultStateTokens.disabled.opacity);
    expect(result[STATE_CSS_VARS.cursorDisabled]).toBe(defaultStateTokens.disabled.cursor);
  });
});

describe('withStateVars — theme.state override', () => {
  const base: VarsResolver<any> = () => ({});

  it('custom theme.state.disabled.opacity overrides default', () => {
    const customTheme = {
      state: { disabled: { opacity: 0.38, cursor: 'not-allowed' } },
    } as unknown as PrismUITheme;
    const resolver = withStateVars(base);
    const result = resolver({}, customTheme);
    expect(result[STATE_CSS_VARS.opacityDisabled]).toBe(0.38);
  });

  it('custom theme.state.disabled.cursor overrides default', () => {
    const customTheme = {
      state: { disabled: { opacity: 0.5, cursor: 'default' } },
    } as unknown as PrismUITheme;
    const resolver = withStateVars(base);
    const result = resolver({}, customTheme);
    expect(result[STATE_CSS_VARS.cursorDisabled]).toBe('default');
  });
});

describe('withStateVars — enabled guard', () => {
  const base: VarsResolver<any> = () => ({ '--btn-base': 'base' });

  it('enabled=false → returns only baseVars, no state vars', () => {
    const resolver = withStateVars(base, { enabled: () => false });
    const result = resolver({}, STATE_THEME);
    expect(result).not.toHaveProperty(STATE_CSS_VARS.opacityDisabled);
    expect(result).not.toHaveProperty(STATE_CSS_VARS.cursorDisabled);
    expect(result['--btn-base']).toBe('base');
  });

  it('enabled=true → state vars injected normally', () => {
    const resolver = withStateVars(base, { enabled: () => true });
    const result = resolver({}, STATE_THEME);
    expect(result).toHaveProperty(STATE_CSS_VARS.opacityDisabled);
    expect(result).toHaveProperty(STATE_CSS_VARS.cursorDisabled);
  });
});

describe('withStateVars — spread order (baseVars priority)', () => {
  it('baseVars can override state vars by same key', () => {
    const overridingBase: VarsResolver<any> = () => ({
      [STATE_CSS_VARS.opacityDisabled]: 0.9,
    });
    const resolver = withStateVars(overridingBase);
    const result = resolver({}, STATE_THEME);
    expect(result[STATE_CSS_VARS.opacityDisabled]).toBe(0.9);
  });

  it('baseVars are preserved alongside state vars', () => {
    const base: VarsResolver<any> = () => ({ '--btn-extra': 'extra' });
    const resolver = withStateVars(base);
    const result = resolver({}, STATE_THEME);
    expect(result['--btn-extra']).toBe('extra');
    expect(result[STATE_CSS_VARS.opacityDisabled]).toBe(0.5);
  });
});

