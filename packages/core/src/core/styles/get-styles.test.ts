import { describe, it, expect } from 'vitest';
import { createGetStyles } from './get-styles';
import type { GetStylesInput } from './types';

describe('createGetStyles', () => {
  it('merges className for root slot', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      className: 'user-button',
      classNames: { root: 'user-root' },
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    expect(result.className).toBe('btn-root user-root user-button');
  });

  it('merges className for non-root slot', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
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

  it('splits user style into CSS Variables and inline styles', () => {
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

    expect(result.style).toEqual({
      '--button-height': '48px',
      '--opacity': 0.5,
      padding: 0,
    });
  });

  it('handles empty classNames', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    expect(result.className).toBe('btn-root');
  });

  it('handles empty vars', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      style: { padding: 0 } as any,
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

  it('filters out undefined className values', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
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

  it('preserves merge order for style', () => {
    const input: GetStylesInput<'root'> = {
      classes: { root: 'btn-root' },
      vars: { '--button-height': '48px' },
      style: { '--button-height': '60px' } as any,
    };

    const getStyles = createGetStyles(input);
    const result = getStyles('root');

    // User vars should override system vars
    expect(result.style?.['--button-height' as any]).toBe('60px');
  });
});
