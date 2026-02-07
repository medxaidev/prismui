import type { PrismuiPaletteInput, PrismuiThemeInput } from './types';
import { defaultColorFamilies } from './default-colors';
import { rgba } from '../color-functions';

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
  },

  background: {
    paper: defaultColorFamilies.gray[50],
    default: defaultColorFamilies.gray[100],
    neutral: defaultColorFamilies.gray[200],
  },

  divider: rgba(defaultColorFamilies.gray[500], 0.2),

  action: {
    active: defaultColorFamilies.gray[600],
    hover: rgba(defaultColorFamilies.gray[500], 0.08),
    selected: rgba(defaultColorFamilies.gray[500], 0.16),
    focus: rgba(defaultColorFamilies.gray[500], 0.24),
    disabled: rgba(defaultColorFamilies.gray[500], 0.8),
    disabledBackground: rgba(defaultColorFamilies.gray[500], 0.24),

    hoverOpacity: 0.08,
    selectedOpacity: 0.08,
    focusOpacity: 0.12,
    activatedOpacity: 0.12,
    disabledOpacity: 0.48,
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
    icon: rgba('#FFFFFF', 0.5),
  },

  background: {
    paper: defaultColorFamilies.gray[800],
    default: defaultColorFamilies.gray[900],
    neutral: defaultColorFamilies.gray[700],
  },

  divider: rgba(defaultColorFamilies.gray[500], 0.2),

  action: {
    active: defaultColorFamilies.gray[500],
    hover: rgba(defaultColorFamilies.gray[500], 0.08),
    selected: rgba(defaultColorFamilies.gray[500], 0.16),
    focus: rgba(defaultColorFamilies.gray[500], 0.24),
    disabled: rgba(defaultColorFamilies.gray[500], 0.8),
    disabledBackground: rgba(defaultColorFamilies.gray[500], 0.24),

    hoverOpacity: 0.08,
    selectedOpacity: 0.08,
    focusOpacity: 0.12,
    activatedOpacity: 0.12,
    disabledOpacity: 0.48,
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

  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  fontFamilyMonospace:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  other: {},
};