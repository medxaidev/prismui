import { describe, it, expectTypeOf } from 'vitest';
import type { VariantProps, SizeProps, DisabledProps, PolymorphicSystemProps } from './types';
import type { Variant, ThemeColor } from '../variant/types';
import type { PrismuiSize } from '../size/types';

describe('Props Contract — Stage 5.3', () => {

  describe('VariantProps', () => {
    it('variant is optional Variant', () => {
      expectTypeOf<VariantProps['variant']>().toEqualTypeOf<Variant | undefined>();
    });

    it('color is optional ThemeColor', () => {
      expectTypeOf<VariantProps['color']>().toEqualTypeOf<ThemeColor | undefined>();
    });

    it('accepts valid variant + color combination', () => {
      const p: VariantProps = { variant: 'filled', color: 'primary' };
      expectTypeOf(p.variant).toEqualTypeOf<Variant | undefined>();
      expectTypeOf(p.color).toEqualTypeOf<ThemeColor | undefined>();
    });

    it('accepts empty object (all props optional)', () => {
      const p: VariantProps = {};
      expectTypeOf(p).toMatchTypeOf<VariantProps>();
    });
  });

  describe('SizeProps', () => {
    it('size is optional PrismuiSize', () => {
      expectTypeOf<SizeProps['size']>().toEqualTypeOf<PrismuiSize | undefined>();
    });

    it('accepts all 5 valid size tiers', () => {
      const sizes: PrismuiSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
      sizes.forEach((s) => {
        const p: SizeProps = { size: s };
        expectTypeOf(p.size).toEqualTypeOf<PrismuiSize | undefined>();
      });
    });

    it('accepts empty object (all props optional)', () => {
      const p: SizeProps = {};
      expectTypeOf(p).toMatchTypeOf<SizeProps>();
    });
  });

  describe('DisabledProps', () => {
    it('disabled is optional boolean', () => {
      expectTypeOf<DisabledProps['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('accepts true / false / undefined', () => {
      const a: DisabledProps = { disabled: true };
      const b: DisabledProps = { disabled: false };
      const c: DisabledProps = {};
      expectTypeOf(a.disabled).toEqualTypeOf<boolean | undefined>();
      expectTypeOf(b.disabled).toEqualTypeOf<boolean | undefined>();
      expectTypeOf(c.disabled).toEqualTypeOf<boolean | undefined>();
    });
  });

  describe('PolymorphicSystemProps', () => {
    it('is assignable from full system props intersection', () => {
      const p: PolymorphicSystemProps = {
        variant: 'outlined',
        color: 'secondary',
        size: 'lg',
        disabled: false,
      };
      expectTypeOf(p).toMatchTypeOf<VariantProps>();
      expectTypeOf(p).toMatchTypeOf<SizeProps>();
      expectTypeOf(p).toMatchTypeOf<DisabledProps>();
    });

    it('all fields are optional (accepts empty object)', () => {
      const p: PolymorphicSystemProps = {};
      expectTypeOf(p).toMatchTypeOf<PolymorphicSystemProps>();
    });

    it('component interface extending PolymorphicSystemProps is type-compatible', () => {
      interface ButtonLikeProps extends PolymorphicSystemProps {
        children?: React.ReactNode;
      }
      const p: ButtonLikeProps = {
        variant: 'filled',
        color: 'primary',
        size: 'md',
        disabled: false,
        children: null,
      };
      expectTypeOf(p).toMatchTypeOf<PolymorphicSystemProps>();
    });

    it('subset-only interface (SizeProps only) is also valid pattern', () => {
      interface SkeletonLikeProps extends SizeProps {
        radius?: PrismuiSize;
      }
      const p: SkeletonLikeProps = { size: 'md', radius: 'sm' };
      expectTypeOf(p.size).toEqualTypeOf<PrismuiSize | undefined>();
    });
  });

});
