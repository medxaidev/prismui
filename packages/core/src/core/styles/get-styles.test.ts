import { describe, it, expect } from 'vitest';
import { createGetStyles } from './get-styles';
import type { GetStylesInput } from './types';

// ─────────────────────────────────────────────────────────────────
// className merging
// ─────────────────────────────────────────────────────────────────

describe('createGetStyles — className', () => {
  it('merges className for root slot', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      varsChain: [],
      className: 'user-button',
      classNames: { root: 'user-root' },
    };
    const result = createGetStyles(input)('root');
    expect(result.className).toBe('btn-root user-root user-button');
  });

  it('merges className for non-root slot', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      varsChain: [],
      classNames: { label: 'user-label' },
    };
    const result = createGetStyles(input)('label');
    expect(result.className).toBe('btn-label user-label');
  });

  it('filters out undefined className values', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      varsChain: [],
      className: undefined,
      classNames: {},
    };
    expect(createGetStyles(input)('root').className).toBe('btn-root');
  });
});

// ─────────────────────────────────────────────────────────────────
// style merging (single layer, backwards-compat)
// ─────────────────────────────────────────────────────────────────

describe('createGetStyles — style (single-layer varsChain)', () => {
  it('applies system vars only to root slot', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      varsChain: [{ '--button-height': '48px' }],
      style: { padding: 0 } as any,
    };
    const getStyles = createGetStyles(input);
    expect(getStyles('root').style).toEqual({ '--button-height': '48px', padding: 0 });
    expect(getStyles('label').style).toBeUndefined();
  });

  it('merges style over system vars', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      varsChain: [{ '--button-height': '48px' }],
      style: { '--opacity': 0.5, padding: 0 } as any,
    };
    expect(createGetStyles(input)('root').style).toEqual({
      '--button-height': '48px',
      '--opacity': 0.5,
      padding: 0,
    });
  });

  it('handles empty varsChain', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      varsChain: [],
      style: { padding: 0 } as any,
    };
    expect(createGetStyles(input)('root').style).toEqual({ padding: 0 });
  });

  it('handles all-undefined-layer varsChain', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      varsChain: [undefined, undefined],
      style: { padding: 0 } as any,
    };
    expect(createGetStyles(input)('root').style).toEqual({ padding: 0 });
  });

  it('handles empty style', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      varsChain: [{ '--button-height': '48px' }],
    };
    expect(createGetStyles(input)('root').style).toEqual({ '--button-height': '48px' });
  });

  it('returns undefined style when varsChain and style are both empty', () => {
    const input: GetStylesInput<'root' | 'label'> = {
      classes: { root: 'btn-root', label: 'btn-label' },
      varsChain: [],
    };
    expect(createGetStyles(input)('root').style).toBeUndefined();
  });

  it('style prop overrides system vars (same key)', () => {
    const input: GetStylesInput<'root'> = {
      classes: { root: 'btn-root' },
      varsChain: [{ '--button-height': '48px' }],
      style: { '--button-height': '60px' } as any,
    };
    expect(createGetStyles(input)('root').style?.['--button-height' as any]).toBe('60px');
  });

  it('handles complex multi-slot scenario', () => {
    const input: GetStylesInput<'root' | 'inner' | 'label'> = {
      classes: { root: 'btn-root', inner: 'btn-inner', label: 'btn-label' },
      varsChain: [{ '--button-height': '48px', '--button-bg': 'blue' }],
      className: 'user-button',
      classNames: { root: 'user-root', inner: 'user-inner' },
      style: { '--opacity': 0.5, padding: 0, margin: '8px' } as any,
    };
    const getStyles = createGetStyles(input);
    expect(getStyles('root').className).toBe('btn-root user-root user-button');
    expect(getStyles('root').style).toEqual({
      '--button-height': '48px',
      '--button-bg': 'blue',
      '--opacity': 0.5,
      padding: 0,
      margin: '8px',
    });
    expect(getStyles('inner').style).toBeUndefined();
    expect(getStyles('label').style).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────
// varsChain priority (multi-layer — Stage 8.2 core behaviour)
// ─────────────────────────────────────────────────────────────────

describe('createGetStyles — varsChain priority', () => {
  it('layer 2 overrides layer 1 (same key)', () => {
    const input: GetStylesInput<'root'> = {
      classes: { root: 'r' },
      varsChain: [{ '--btn-h': '36px' }, { '--btn-h': '40px' }, undefined],
    };
    expect(createGetStyles(input)('root').style?.['--btn-h' as any]).toBe('40px');
  });

  it('layer 3 overrides layer 2 (same key)', () => {
    const input: GetStylesInput<'root'> = {
      classes: { root: 'r' },
      varsChain: [undefined, { '--btn-h': '40px' }, { '--btn-h': '60px' }],
    };
    expect(createGetStyles(input)('root').style?.['--btn-h' as any]).toBe('60px');
  });

  it('three layers all present — last layer wins', () => {
    const input: GetStylesInput<'root'> = {
      classes: { root: 'r' },
      varsChain: [{ '--btn-h': '36px' }, { '--btn-h': '40px' }, { '--btn-h': '60px' }],
    };
    expect(createGetStyles(input)('root').style?.['--btn-h' as any]).toBe('60px');
  });

  it('undefined layers are skipped without affecting other layers', () => {
    const input: GetStylesInput<'root'> = {
      classes: { root: 'r' },
      varsChain: [{ '--btn-h': '36px' }, undefined, undefined],
    };
    expect(createGetStyles(input)('root').style?.['--btn-h' as any]).toBe('36px');
  });

  it('empty varsChain → no vars in mergedStyle', () => {
    const input: GetStylesInput<'root'> = {
      classes: { root: 'r' },
      varsChain: [],
    };
    expect(createGetStyles(input)('root').style).toBeUndefined();
  });

  it('different keys across layers are all preserved', () => {
    const input: GetStylesInput<'root'> = {
      classes: { root: 'r' },
      varsChain: [
        { '--btn-h': '36px' },
        { '--btn-color': 'blue' },
        { '--btn-bg': 'white' },
      ],
    };
    expect(createGetStyles(input)('root').style).toEqual({
      '--btn-h': '36px',
      '--btn-color': 'blue',
      '--btn-bg': 'white',
    });
  });

  it('style prop wins over all varsChain layers (same key)', () => {
    const input: GetStylesInput<'root'> = {
      classes: { root: 'r' },
      varsChain: [{ '--btn-h': '36px' }, { '--btn-h': '40px' }, { '--btn-h': '60px' }],
      style: { '--btn-h': '99px' } as any,
    };
    expect(createGetStyles(input)('root').style?.['--btn-h' as any]).toBe('99px');
  });
});
