export type PrismuiColorScheme = 'light' | 'dark' | 'auto';

export type PrismuiResolvedColorScheme = Exclude<PrismuiColorScheme, 'auto'>;