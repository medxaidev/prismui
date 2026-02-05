export type PrismuiVariant = 'solid' | 'soft' | 'outlined' | 'plain';
export type DefaultPrismuiVariant = PrismuiVariant;

export interface PrismuiThemeVariantsOverride { }

export type PrismuiVariantKey =
  keyof PrismuiThemeVariantsOverride extends never
  ? DefaultPrismuiVariant
  : DefaultPrismuiVariant | keyof PrismuiThemeVariantsOverride;