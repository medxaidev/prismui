import type { PrismuiPaletteInput, PrismuiThemeInput } from './types';
import { defaultColorFamilies } from './default-colors';

const lightPalette: PrismuiPaletteInput<'light'> = {
  scheme: 'light',

  common: {
    black: '#000000',
    white: '#FFFFFF',
  },


  neutral: {
    lighter: defaultColorFamilies.neutral[500],
    light: defaultColorFamilies.neutral[600],
    main: defaultColorFamilies.neutral[700],
    dark: defaultColorFamilies.neutral[800],
    darker: defaultColorFamilies.neutral[900],
    contrastText: '#FFFFFF',
  },

  text: {
    primary: defaultColorFamilies.gray[800],
    secondary: defaultColorFamilies.gray[600],
    disabled: defaultColorFamilies.gray[500],

    primaryChannel: '28 37 46',
    secondaryChannel: '99 115 129',
    disabledChannel: '145 158 171',
  },

  background: {
    paper: defaultColorFamilies.gray[50],
    default: defaultColorFamilies.gray[100],
    neutral: defaultColorFamilies.gray[200],

    paperChannel: '252 253 253',
    defaultChannel: '249 250 251',
    neutralChannel: '244 246 248',
  },

  divider: 'rgba(145 158 171 / 20%)',

  action: {
    active: defaultColorFamilies.gray[600],
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
};

const darkPalette: PrismuiPaletteInput<'dark'> = {
  scheme: 'dark',

  common: {
    black: '#000000',
    white: '#FFFFFF',
  },


  neutral: {
    lighter: defaultColorFamilies.neutral[300],
    light: defaultColorFamilies.neutral[400],
    main: defaultColorFamilies.neutral[500],
    dark: defaultColorFamilies.neutral[600],
    darker: defaultColorFamilies.neutral[700],
    contrastText: '#FFFFFF',
  },

  text: {
    primary: defaultColorFamilies.gray[50],
    secondary: defaultColorFamilies.gray[500],
    disabled: defaultColorFamilies.gray[600],
    icon: 'rgba(255, 255, 255, 0.5)',

    primaryChannel: '252 253 253',
    secondaryChannel: '145 158 171',
    disabledChannel: '99 115 129',
  },

  background: {
    paper: defaultColorFamilies.gray[800],
    default: defaultColorFamilies.gray[900],
    neutral: defaultColorFamilies.gray[700],

    paperChannel: '28 37 46',
    defaultChannel: '20 26 33',
    neutralChannel: '69 79 91',
  },

  divider: 'rgba(145 158 171 / 20%)',

  action: {
    active: defaultColorFamilies.gray[500],
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
  },
};

export const defaultTheme: PrismuiThemeInput = {
  colorFamilies: defaultColorFamilies,

  primaryShade: { light: 5, dark: 6 },
  colorSchemes: {
    light: { palette: lightPalette },
    dark: { palette: darkPalette },
  },

  primaryColor: 'blue',
  secondaryColor: 'violet',
  infoColor: 'cyan',
  successColor: 'green',
  warningColor: 'yellow',
  errorColor: 'red',
  neutralColor: 'neutral',

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  other: {},
};