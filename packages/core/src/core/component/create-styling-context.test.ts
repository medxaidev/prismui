import { describe, it, expect, vi } from 'vitest';
import { createStylingContext, omitComponentProps } from './create-styling-context';
import type { ComponentPayload } from './types';

describe('createStylingContext', () => {
  describe('without styling system', () => {
    it('returns fallback getStyles and getRootProps', () => {
      const props = {
        className: 'user-class',
        style: { color: 'red' },
      };

      const ctx = createStylingContext(undefined, props);

      expect(ctx.getStyles).toBeDefined();
      expect(ctx.getRootProps).toBeDefined();

      const rootStyles = ctx.getStyles('root' as any);
      expect(rootStyles.className).toBe('user-class');
      expect(rootStyles.style).toEqual({ color: 'red' });

      const nonRootStyles = ctx.getStyles('inner' as any);
      expect(nonRootStyles.className).toBe('');
      expect(nonRootStyles.style).toBeUndefined();
    });

    it('getRootProps merges styles correctly', () => {
      const props = {
        className: 'user-class',
        style: { color: 'red' },
      };

      const ctx = createStylingContext(undefined, props);
      const rootProps = ctx.getRootProps();

      expect(rootProps.className).toBe('user-class');
      expect(rootProps.style).toEqual({ color: 'red' });
    });
  });

  describe('with styling system', () => {
    it('creates styling context with classes', () => {
      const styling: ComponentPayload['styling'] = {
        structure: { stylesNames: ['root', 'inner'] as const },
        resources: {
          classes: { root: 'btn-root', inner: 'btn-inner' },
        },
      };

      const props = {
        className: 'user-class',
        style: { color: 'red' },
      };

      const ctx = createStylingContext(styling, props);

      const rootStyles = ctx.getStyles('root' as any);
      expect(rootStyles.className).toContain('btn-root');
      expect(rootStyles.className).toContain('user-class');

      const innerStyles = ctx.getStyles('inner' as any);
      expect(innerStyles.className).toBe('btn-inner');
    });

    it('applies varsResolver with component props isolation', () => {
      const varsResolver = vi.fn((props: any) => ({
        '--button-height': props.size === 'lg' ? '48px' : '36px',
      }));

      const styling: ComponentPayload['styling'] = {
        structure: { stylesNames: ['root'] as const },
        resources: { classes: { root: 'btn-root' } },
        logic: { varsResolver },
      };

      const props = {
        size: 'lg',
        onClick: vi.fn(),
        className: 'user-class',
      };

      const componentPropKeys = ['size'] as const;

      const ctx = createStylingContext(styling, props, componentPropKeys);

      // varsResolver should only receive component props (size), not DOM props (onClick)
      expect(varsResolver).toHaveBeenCalledWith({ size: 'lg' });
      expect(varsResolver).toHaveBeenCalledTimes(1);

      const rootStyles = ctx.getStyles('root' as any);
      expect(rootStyles.style).toMatchObject({
        '--button-height': '48px',
      });
    });

    it('supports classNames override', () => {
      const styling: ComponentPayload['styling'] = {
        structure: { stylesNames: ['root', 'inner'] as const },
        resources: {
          classes: { root: 'btn-root', inner: 'btn-inner' },
        },
      };

      const props = {
        className: 'user-class',
        classNames: { inner: 'custom-inner' },
      };

      const ctx = createStylingContext(styling, props);

      const innerStyles = ctx.getStyles('inner' as any);
      expect(innerStyles.className).toContain('btn-inner');
      expect(innerStyles.className).toContain('custom-inner');
    });

    it('getRootProps merges user style with highest priority', () => {
      const styling: ComponentPayload['styling'] = {
        structure: { stylesNames: ['root'] as const },
        resources: { classes: { root: 'btn-root' } },
        logic: {
          varsResolver: () => ({
            '--button-bg': 'blue',
          }),
        },
      };

      const props = {
        className: 'user-class',
        style: { '--button-bg': 'red', color: 'white' },
      };

      const ctx = createStylingContext(styling, props);
      const rootProps = ctx.getRootProps();

      expect(rootProps.className).toContain('btn-root');
      expect(rootProps.className).toContain('user-class');
      expect(rootProps.style).toMatchObject({
        '--button-bg': 'red', // user style wins
        color: 'white',
      });
    });

    it('warns in dev mode when getStyles("root") is called directly', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const styling: ComponentPayload['styling'] = {
        structure: { stylesNames: ['root'] as const },
        resources: { classes: { root: 'btn-root' } },
      };

      const ctx = createStylingContext(styling, {});

      // Call getStyles('root') directly (wrong)
      ctx.getStyles('root' as any);

      // Wait for microtask
      return new Promise<void>((resolve) => {
        queueMicrotask(() => {
          expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Do not use getStyles("root") directly'),
          );
          warnSpy.mockRestore();
          process.env.NODE_ENV = originalEnv;
          resolve();
        });
      });
    });

    it('does not warn when getRootProps is used (correct path)', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const styling: ComponentPayload['styling'] = {
        structure: { stylesNames: ['root'] as const },
        resources: { classes: { root: 'btn-root' } },
      };

      const ctx = createStylingContext(styling, {});

      // Use getRootProps (correct)
      ctx.getRootProps();

      return new Promise<void>((resolve) => {
        queueMicrotask(() => {
          expect(warnSpy).not.toHaveBeenCalled();
          warnSpy.mockRestore();
          process.env.NODE_ENV = originalEnv;
          resolve();
        });
      });
    });

    it('throws error in dev mode if root class is missing', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const styling: ComponentPayload['styling'] = {
        structure: { stylesNames: ['root'] as const },
        resources: { classes: {} as any }, // Missing root
      };

      expect(() => {
        createStylingContext(styling, {});
      }).toThrow(/Missing 'root' class/);

      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('omitComponentProps', () => {
  it('removes declared component props', () => {
    const props = {
      size: 'lg',
      variant: 'solid',
      onClick: vi.fn(),
      children: 'Click me',
    };

    const componentPropKeys = ['size', 'variant'] as const;
    const domProps = omitComponentProps(props, componentPropKeys);

    expect(domProps).toEqual({
      onClick: props.onClick,
      children: 'Click me',
    });
    expect(domProps.size).toBeUndefined();
    expect(domProps.variant).toBeUndefined();
  });

  it('returns all props if no keys provided', () => {
    const props = {
      size: 'lg',
      onClick: vi.fn(),
    };

    const domProps = omitComponentProps(props, []);

    expect(domProps).toEqual(props);
  });

  it('handles empty props object', () => {
    const domProps = omitComponentProps({}, ['size', 'variant']);

    expect(domProps).toEqual({});
  });
});
