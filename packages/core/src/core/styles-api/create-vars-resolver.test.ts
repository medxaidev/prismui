import { describe, it, expect } from 'vitest';
import { createVarsResolver } from './create-vars-resolver';
import type { FactoryPayload } from '../factory';
import type { PrismuiTheme } from '../theme';
import { defaultTheme } from '../theme/default-theme';

// ---------------------------------------------------------------------------
// Test fixture types
// ---------------------------------------------------------------------------

type TestPayload = FactoryPayload & {
  props: { radius?: string; shadow?: string };
  vars: { root: '--test-radius' | '--test-shadow' };
  ctx: undefined;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createVarsResolver', () => {
  const theme = defaultTheme as PrismuiTheme;

  it('returns the resolver function unchanged (identity)', () => {
    const resolver = (_t: PrismuiTheme, _p: any) => ({
      root: { '--test-radius': '4px' as string | undefined, '--test-shadow': undefined },
    });
    const result = createVarsResolver<TestPayload>(resolver as any);
    expect(result).toBe(resolver);
  });

  it('returned resolver receives theme and props', () => {
    const resolver = createVarsResolver<TestPayload>((t, props) => ({
      root: {
        '--test-radius': props.radius ?? 'default',
        '--test-shadow': t.fontFamily ? 'has-theme' : 'no-theme',
      },
    }));

    const output = resolver(theme, { radius: '8px', shadow: 'md' }, undefined);
    expect(output.root['--test-radius']).toBe('8px');
    expect(output.root['--test-shadow']).toBe('has-theme');
  });

  it('resolver can return undefined values (filtered downstream)', () => {
    const resolver = createVarsResolver<TestPayload>((_t, props) => ({
      root: {
        '--test-radius': props.radius,
        '--test-shadow': undefined,
      },
    }));

    const output = resolver(theme, {}, undefined);
    expect(output.root['--test-radius']).toBeUndefined();
    expect(output.root['--test-shadow']).toBeUndefined();
  });

  it('resolver uses props to compute CSS variable values', () => {
    const resolver = createVarsResolver<TestPayload>((_t, props) => ({
      root: {
        '--test-radius': props.radius === 'lg' ? '16px' : '4px',
        '--test-shadow': props.shadow === 'md' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
      },
    }));

    const output = resolver(theme, { radius: 'lg', shadow: 'md' }, undefined);
    expect(output.root['--test-radius']).toBe('16px');
    expect(output.root['--test-shadow']).toBe('0 2px 4px rgba(0,0,0,0.1)');
  });
});
