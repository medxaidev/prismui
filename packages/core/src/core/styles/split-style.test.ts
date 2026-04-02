import { describe, it, expect } from 'vitest';
import { splitStyle } from './split-style';

describe('splitStyle', () => {
  it('splits CSS Variables and inline styles', () => {
    const style = {
      '--button-height': '60px',
      '--opacity': 0.5,
      padding: 0,
      margin: '8px',
    } as any;

    const { vars, inline } = splitStyle(style);

    expect(vars).toEqual({
      '--button-height': '60px',
      '--opacity': 0.5,
    });
    expect(inline).toEqual({
      padding: 0,
      margin: '8px',
    });
  });

  it('handles only CSS Variables', () => {
    const style = {
      '--button-height': '60px',
      '--button-bg': 'blue',
    } as any;

    const { vars, inline } = splitStyle(style);

    expect(vars).toEqual({
      '--button-height': '60px',
      '--button-bg': 'blue',
    });
    expect(inline).toEqual({});
  });

  it('handles only inline styles', () => {
    const style = {
      padding: 0,
      borderRadius: 4,
    };

    const { vars, inline } = splitStyle(style);

    expect(vars).toEqual({});
    expect(inline).toEqual({
      padding: 0,
      borderRadius: 4,
    });
  });

  it('returns empty objects when style is undefined', () => {
    const { vars, inline } = splitStyle(undefined);

    expect(vars).toEqual({});
    expect(inline).toEqual({});
  });

  it('returns empty objects when style is empty object', () => {
    const { vars, inline } = splitStyle({});

    expect(vars).toEqual({});
    expect(inline).toEqual({});
  });
});
