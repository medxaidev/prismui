import { describe, it, expect } from 'vitest';
import { createGetStyles } from './get-styles';
import type { GetStylesInput } from './types';

describe('createGetStyles', () => {
  it('merges className for root slot', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      className: 'user-button',
      classNames: { root: 'user-root' },
      vars: {}
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    expect(result.className).toBe('btn-root user-root user-button');
  });

  it('merges className for non-root slot', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      vars: {},
      classNames: { label: 'user-label' },
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('label');

    expect(result.className).toBe('btn-label user-label');
  });

  it('applies style only to root slot', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      vars: { '--button-height': '48px' },
      style: { padding: 0 } as any,
    };

    const getStyles = createGetStyles(input);
    const rootResult = getStyles('root');
    const labelResult = getStyles('label');

    expect(rootResult.style).toEqual({
      '--button-height': '48px',
      padding: 0,
    });
    expect(labelResult.style).toBeUndefined();
  });

  it('merges user style with system vars (simple override)', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      vars: { '--button-height': '48px' },
      style: {
        '--opacity': 0.5,
        padding: 0,
      } as any,
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    // Simple override: { ...vars, ...style }
    expect(result.style).toEqual({
      '--button-height': '48px',
      '--opacity': 0.5,
      padding: 0,
    });
  });

  it('handles empty classNames', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      vars: {},
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    expect(result.className).toBe('btn-root');
  });

  it('handles empty vars', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      style: { padding: 0 } as any,
      vars: {},
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    expect(result.style).toEqual({ padding: 0 });
  });

  it('handles empty style', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      vars: { '--button-height': '48px' },
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    expect(result.style).toEqual({ '--button-height': '48px' });
  });

  it('returns undefined style when both vars and style are empty', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      vars: {},
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    // Avoid <div style={{}} /> - return undefined instead
    expect(result.style).toBeUndefined();
  });

  it('filters out undefined className values', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      vars: {},
      className: undefined,
      classNames: {},
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    expect(result.className).toBe('btn-root');
  });

  it('handles complex merge scenario', () => {
    const input: GetStylesInput<'root' | 'inner' | 'label'> = {
      classes: {
        root: 'btn-root',
        inner: 'btn-inner',
        label: 'btn-label',
      },
      vars: {
        '--button-height': '48px',
        '--button-bg': 'blue',
      },
      className: 'user-button',
      classNames: {
        root: 'user-root',
        inner: 'user-inner',
      },
      style: {
        '--opacity': 0.5,
        padding: 0,
        margin: '8px',
      } as any,
    };

    const getStyles = createGetStyles(input);

    const rootResult = getStyles('root');
    expect(rootResult.className).toBe('btn-root user-root user-button');
    expect(rootResult.style).toEqual({
      '--button-height': '48px',
      '--button-bg': 'blue',
      '--opacity': 0.5,
      padding: 0,
      margin: '8px',
    });

    const innerResult = getStyles('inner');
    expect(innerResult.className).toBe('btn-inner user-inner');
    expect(innerResult.style).toBeUndefined();

    const labelResult = getStyles('label');
    expect(labelResult.className).toBe('btn-label');
    expect(labelResult.style).toBeUndefined();
  });

  it('user override takes precedence over system vars', () => {
    const input: GetStylesInput<'root'> = {
      classes: { root: 'btn-root' },
      vars: { '--button-height': '48px' },
      style: { '--button-height': '60px' } as any,
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    // User override wins: { ...vars, ...style }
    expect(result.style?.['--button-height' as any]).toBe('60px');
  });
});
