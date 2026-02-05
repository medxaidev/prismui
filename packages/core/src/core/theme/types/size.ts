export type DefaultPrismuiSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface PrismuiThemeSizesOverride { }

export type PrismuiSize =
  keyof PrismuiThemeSizesOverride extends never
  ? DefaultPrismuiSize
  : DefaultPrismuiSize | keyof PrismuiThemeSizesOverride;