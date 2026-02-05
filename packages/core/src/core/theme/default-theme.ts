import type {
  PrismuiPalette,
  PrismuiColorFamily,
  PrismuiResolvedColorScheme,
  PrismuiShadeIndex,
  PrismuiTheme,
} from './types';
import { defaultColorFamilies } from './default-colors';

const shadeSteps = [
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
] as const;

const DEFAULT_PRIMARY_COLOR: PrismuiColorFamily = 'blue';
const DEFAULT_SECONDARY_COLOR: PrismuiColorFamily = 'violet';
const DEFAULT_PRIMARY_SHADE = {
  light: 5,
  dark: 6,
} as const satisfies { light: PrismuiShadeIndex; dark: PrismuiShadeIndex };

function clampShadeIndex(index: number): PrismuiShadeIndex {
  return Math.min(9, Math.max(0, index)) as PrismuiShadeIndex;
}

function indexToShade(index: PrismuiShadeIndex) {
  return shadeSteps[index];
}

function paletteColorFromFamily(
  family: keyof typeof defaultColorFamilies,
  scheme: PrismuiResolvedColorScheme,
  options?: {
    contrastText?: string;
    mainIndex?: PrismuiShadeIndex;
  }
) {
  const scale = defaultColorFamilies[family];
  const mainIndex = options?.mainIndex ?? (scheme === 'dark' ? 6 : 5);

  const lighterIndex = clampShadeIndex(mainIndex - 2);
  const lightIndex = clampShadeIndex(mainIndex - 1);
  const darkIndex = clampShadeIndex(mainIndex + 1);
  const darkerIndex = clampShadeIndex(mainIndex + 2);

  const lighterShade = indexToShade(lighterIndex);
  const lightShade = indexToShade(lightIndex);
  const mainShade = indexToShade(mainIndex);
  const darkShade = indexToShade(darkIndex);
  const darkerShade = indexToShade(darkerIndex);

  const contrastText =
    options?.contrastText ?? (scheme === 'dark' ? '#0B0D0E' : '#FFFFFF');

  return {
    lighter: scale[lighterShade],
    light: scale[lightShade],
    main: scale[mainShade],
    dark: scale[darkShade],
    darker: scale[darkerShade],
    contrastText,
  };
}

function createPalette<S extends PrismuiResolvedColorScheme>(
  scheme: S
): PrismuiPalette<S> {
  const isDark = scheme === 'dark';

  const mainIndex = isDark ? DEFAULT_PRIMARY_SHADE.dark : DEFAULT_PRIMARY_SHADE.light;

  return {
    scheme,

    common: {
      black: '#000000',
      white: '#FFFFFF',
    },

    primary: paletteColorFromFamily(DEFAULT_PRIMARY_COLOR, scheme, {
      mainIndex,
    }),
    secondary: paletteColorFromFamily(DEFAULT_SECONDARY_COLOR, scheme, {
      mainIndex,
    }),

    info: paletteColorFromFamily('cyan', scheme, {
      mainIndex,
    }),
    success: paletteColorFromFamily('green', scheme, {
      mainIndex,
    }),
    warning: paletteColorFromFamily('yellow', scheme, {
      contrastText: '#0B0D0E',
      mainIndex,
    }),
    error: paletteColorFromFamily('red', scheme, {
      mainIndex,
    }),

    neutral: paletteColorFromFamily('neutral', scheme, {
      mainIndex: isDark ? 5 : 7,
      contrastText: '#FFFFFF',
    }),

    text: isDark
      ? {
        primary: '#FFFFFF',
        secondary: '#919EAB',
        disabled: '#637381',
        icon: 'rgba(255, 255, 255, 0.5)',

        primaryChannel: '255 255 255',
        secondaryChannel: '145 158 171',
        disabledChannel: '99 115 129',
      }
      : {
        primary: '#1C252E',
        secondary: '#637381',
        disabled: '#919EAB',

        primaryChannel: '28 37 46',
        secondaryChannel: '99 115 129',
        disabledChannel: '145 158 171',
      },

    background: isDark
      ? {
        paper: '#1C252E',
        default: '#141A21',
        neutral: '#28323D',

        paperChannel: '28 37 46',
        defaultChannel: '20 26 33',
        neutralChannel: '40 50 61',
      }
      : {
        paper: '#FFFFFF',
        default: '#FFFFFF',
        neutral: '#F4F6F8',

        paperChannel: '255 255 255',
        defaultChannel: '255 255 255',
        neutralChannel: '244 246 248',
      },

    divider: isDark ? 'rgba(145 158 171 / 20%)' : 'rgba(0, 0, 0, 0.12)',

    action: isDark
      ? {
        active: '#919EAB',
        hover: 'rgba(145 158 171 / 8%)',
        selected: 'rgba(145 158 171 / 16%)',
        focus: 'rgba(145 158 171 / 24%)',
        disabled: 'rgba(145 158 171 / 80%)',
        disabledBackground: 'rgba(145 158 171 / 24%)',

        hoverOpacity: 0.08,
        selectedOpacity: 0.08,
        focusOpacity: 0.12,
        activatedOpacity: 0.12,
        disabledOpacity: 0.48,

        activeChannel: '145 158 171',
        selectedChannel: '145 158 171',
      }
      : {
        active: '#637381',
        hover: 'rgba(145 158 171 / 8%)',
        selected: 'rgba(145 158 171 / 16%)',
        focus: 'rgba(145 158 171 / 24%)',
        disabled: 'rgba(145 158 171 / 80%)',
        disabledBackground: 'rgba(145 158 171 / 24%)',

        hoverOpacity: 0.08,
        selectedOpacity: 0.08,
        focusOpacity: 0.12,
        activatedOpacity: 0.12,
        disabledOpacity: 0.48,

        activeChannel: '99 115 129',
        selectedChannel: '145 158 171',
      },

    contrastThreshold: 3,
    tonalOffset: 0.2,
  };
}

export const defaultTheme: PrismuiTheme = {
  colorFamilies: defaultColorFamilies,

  colorSchemes: {
    light: { palette: createPalette('light') },
    dark: { palette: createPalette('dark') },
  },

  primaryColor: DEFAULT_PRIMARY_COLOR,
  secondaryColor: DEFAULT_SECONDARY_COLOR,
  primaryShade: DEFAULT_PRIMARY_SHADE,

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  other: {},
};