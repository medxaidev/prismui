export type PrismuiColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

export const PRISMUI_SHADE_STEPS = [
  50,
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900,
] as const satisfies readonly PrismuiColorShade[];

export type PrismuiColorScale = Record<PrismuiColorShade, string>;

export type PrismuiColorFamilyName =
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'violet'
  | 'gray'
  | 'neutral'
  | 'dark';

export interface PrismuiThemeColorFamiliesOverride { }

export type PrismuiColorFamily =
  keyof PrismuiThemeColorFamiliesOverride extends never
  ? PrismuiColorFamilyName
  : PrismuiColorFamilyName | keyof PrismuiThemeColorFamiliesOverride;

export type PrismuiColorFamilies = Record<PrismuiColorFamily, PrismuiColorScale>;