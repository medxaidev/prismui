import type {
  PrismuiColorFamily,
  PrismuiColorScale,
  PrismuiColorShade,
  PrismuiPaletteColor,
  PrismuiResolvedColorScheme,
  PrismuiShadeIndex,
  PrismuiTheme,
  PrismuiPalette,
} from '../theme/types';
import { PRISMUI_SHADE_STEPS } from '../theme/types';
import { getColorChannels } from '../color-functions';
import { getContrastText } from '../color-functions';

// ---------------------------------------------------------------------------
// Shade resolver (resolves semantic palette colors from colorFamilies)
// ---------------------------------------------------------------------------

function clampIndex(index: number): PrismuiShadeIndex {
  return Math.max(0, Math.min(9, index)) as PrismuiShadeIndex;
}

function indexToShade(index: PrismuiShadeIndex): PrismuiColorShade {
  return PRISMUI_SHADE_STEPS[index];
}

/**
 * Resolves a `PrismuiPaletteColor` from a color scale + center shade index.
 * `contrastText` is auto-computed from the `main` color via WCAG luminance
 * unless explicitly provided by the caller.
 */
function resolvePaletteColor(
  scale: PrismuiColorScale,
  center: PrismuiShadeIndex,
): PrismuiPaletteColor {
  const main = scale[indexToShade(center)];
  return {
    lighter: scale[indexToShade(clampIndex(center - 4))],
    light: scale[indexToShade(clampIndex(center - 2))],
    main,
    dark: scale[indexToShade(clampIndex(center + 2))],
    darker: scale[indexToShade(clampIndex(center + 4))],
    contrastText: getContrastText(main),
  };
}

// ---------------------------------------------------------------------------
// Semantic color key mapping
// ---------------------------------------------------------------------------

const SEMANTIC_COLOR_KEYS = [
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
] as const;

type SemanticColorKey = (typeof SEMANTIC_COLOR_KEYS)[number];

const SEMANTIC_TO_CONFIG: Record<SemanticColorKey, keyof PrismuiTheme> = {
  primary: 'primaryColor',
  secondary: 'secondaryColor',
  info: 'infoColor',
  success: 'successColor',
  warning: 'warningColor',
  error: 'errorColor',
};

// ---------------------------------------------------------------------------
// Palette color fields and their Channel counterparts
// ---------------------------------------------------------------------------

const PALETTE_COLOR_FIELDS = [
  'lighter',
  'light',
  'main',
  'dark',
  'darker',
  'contrastText',
] as const;

type PaletteColorField = (typeof PALETTE_COLOR_FIELDS)[number];

function channelKey(field: PaletteColorField): string {
  return `${field}Channel`;
}

// ---------------------------------------------------------------------------
// Palette CSS variable generation
// ---------------------------------------------------------------------------

/**
 * Emits CSS variables for a single `PrismuiPaletteColor` under the given
 * `--prismui-{name}-*` prefix.
 *
 * For each field (lighter, light, main, dark, darker, contrastText):
 * - Emits the color value
 * - Emits the `*Channel` (RGB triplet) — uses user-provided value if present,
 *   otherwise auto-computes via `getColorChannels()`
 */
function emitPaletteColorVars(
  vars: Record<string, string>,
  name: string,
  value: PrismuiPaletteColor,
): void {
  for (const field of PALETTE_COLOR_FIELDS) {
    const colorValue = value[field];
    vars[`--prismui-${name}-${field}`] = colorValue;

    // Channel: use user-provided if present, otherwise auto-compute
    const userChannel = value[channelKey(field) as keyof PrismuiPaletteColor] as
      | string
      | undefined;
    const channel = userChannel || getColorChannels(colorValue);
    if (channel) {
      vars[`--prismui-${name}-${channelKey(field)}`] = channel;
    }
  }
}

// ---------------------------------------------------------------------------
// Shadow CSS variable generation
// ---------------------------------------------------------------------------

/**
 * Shadow geometry templates.
 *
 * Each template defines the offsets/spread for a shadow key.
 * The actual color is computed at generation time from:
 * - `palette.shadow.color` channel → size & component shadows
 * - `palette.shadow.dialogColor` or `palette.common.black` → dialog shadow
 * - resolved semantic `mainChannel` → semantic color shadows
 *
 * Format: `rgba(R, G, B, opacity) offsets`
 */

interface ShadowLayer {
  opacity: number;
  offsets: string;
}

interface ShadowTemplate {
  layers: ShadowLayer[];
}

const SIZE_SHADOW_TEMPLATES: Record<string, ShadowTemplate> = {
  xxs: { layers: [{ opacity: 0.16, offsets: '0px 1px 2px 0px' }] },
  xs: { layers: [{ opacity: 0.16, offsets: '0px 4px 8px 0px' }] },
  sm: { layers: [{ opacity: 0.16, offsets: '0px 8px 16px 0px' }] },
  md: { layers: [{ opacity: 0.16, offsets: '0px 12px 24px -4px' }] },
  lg: { layers: [{ opacity: 0.16, offsets: '0px 16px 32px -4px' }] },
  xl: { layers: [{ opacity: 0.16, offsets: '0px 20px 40px -4px' }] },
  xxl: { layers: [{ opacity: 0.16, offsets: '0px 24px 48px 0px' }] },
};

const COMPONENT_SHADOW_TEMPLATES: Record<string, { layers: Array<ShadowLayer & { useDialogColor?: boolean }> }> = {
  dialog: { layers: [{ opacity: 0.24, offsets: '-40px 40px 80px -8px', useDialogColor: true }] },
  card: { layers: [{ opacity: 0.2, offsets: '0px 0px 2px 0px' }, { opacity: 0.12, offsets: '0px 12px 24px -4px' }] },
  dropdown: { layers: [{ opacity: 0.24, offsets: '0px 0px 2px 0px' }, { opacity: 0.24, offsets: '-20px 20px 40px -4px' }] },
};

const SEMANTIC_SHADOW_OFFSETS = '0 8px 16px 0';
const SEMANTIC_SHADOW_OPACITY = 0.24;

function buildShadowValue(channel: string, layers: ShadowLayer[]): string {
  return layers
    .map((l) => `rgba(${channel}, ${l.opacity}) ${l.offsets}`)
    .join(', ');
}

function channelToComma(ch: string): string {
  return ch.replace(/ /g, ', ');
}

/**
 * Emits `--prismui-shadow-*` CSS variables.
 *
 * Size & component shadows use `palette.shadow.color` channel.
 * Dialog shadow uses `palette.shadow.dialogColor` (fallback: `palette.common.black`).
 * Semantic shadows use the resolved semantic color's `mainChannel`.
 */
function emitShadowVars(
  vars: Record<string, string>,
  palette: PrismuiPalette,
  resolvedSemantic: Record<string, PrismuiPaletteColor>,
): void {
  const baseChannel = getColorChannels(palette.shadow.color) ?? '145, 158, 171';
  const baseComma = channelToComma(baseChannel);

  const dialogColorSource = palette.shadow.dialogColor ?? palette.common.black;
  const dialogChannel = getColorChannels(dialogColorSource) ?? '0, 0, 0';
  const dialogComma = channelToComma(dialogChannel);

  // Size shadows
  for (const [key, tmpl] of Object.entries(SIZE_SHADOW_TEMPLATES)) {
    vars[`--prismui-shadow-${key}`] = buildShadowValue(baseComma, tmpl.layers);
  }

  // Component shadows
  for (const [key, tmpl] of Object.entries(COMPONENT_SHADOW_TEMPLATES)) {
    const value = tmpl.layers
      .map((l) => {
        const ch = l.useDialogColor ? dialogComma : baseComma;
        return `rgba(${ch}, ${l.opacity}) ${l.offsets}`;
      })
      .join(', ');
    vars[`--prismui-shadow-${key}`] = value;
  }

  // Semantic color shadows (primary, secondary, info, success, warning, error)
  for (const key of SEMANTIC_COLOR_KEYS) {
    const color = resolvedSemantic[key];
    if (color) {
      const userChannel = color.mainChannel;
      const ch = userChannel || getColorChannels(color.main);
      if (ch) {
        const commaChannel = channelToComma(ch);
        vars[`--prismui-shadow-${key}`] =
          `rgba(${commaChannel}, ${SEMANTIC_SHADOW_OPACITY}) ${SEMANTIC_SHADOW_OFFSETS}`;
      }
    }
  }
}

/**
 * Generates all palette-related CSS variables from the theme and resolved
 * color scheme.
 *
 * This includes:
 * - Semantic colors (primary, secondary, info, success, warning, error)
 *   with auto-resolution from `colorFamilies` + `primaryShade` if not
 *   explicitly defined in the palette
 * - Neutral color
 * - Auto-computed `contrastText` via WCAG luminance (if not user-defined)
 * - Auto-computed `*Channel` RGB triplets for all color fields
 * - Text, background, divider, action tokens
 */
export function getPaletteVars(
  theme: PrismuiTheme,
  scheme: PrismuiResolvedColorScheme,
): Record<string, string> {
  const vars: Record<string, string> = {};
  const palette = theme.colorSchemes[scheme].palette;

  // --- Common ---
  vars['--prismui-common-black'] = palette.common.black;
  vars['--prismui-common-white'] = palette.common.white;

  // Common channels: user-provided or auto-computed
  const blackChannel =
    palette.common.blackChannel || getColorChannels(palette.common.black);
  if (blackChannel) {
    vars['--prismui-common-blackChannel'] = blackChannel;
  }
  const whiteChannel =
    palette.common.whiteChannel || getColorChannels(palette.common.white);
  if (whiteChannel) {
    vars['--prismui-common-whiteChannel'] = whiteChannel;
  }

  // Gray-500 channel (used by variant system for inherit/neutral borders)
  const gray500 = theme.colorFamilies.gray?.[500];
  if (gray500) {
    const gray500Channel = getColorChannels(gray500);
    if (gray500Channel) {
      vars['--prismui-color-gray-500Channel'] = gray500Channel;
    }
  }

  // --- Semantic palette colors ---
  const center = theme.primaryShade[scheme];
  const resolvedSemantic: Record<string, PrismuiPaletteColor> = {};

  for (const key of SEMANTIC_COLOR_KEYS) {
    if (palette[key]) {
      // User-provided palette — auto-fill contrastText if missing
      const userPalette = palette[key]!;
      if (!userPalette.contrastText) {
        userPalette.contrastText = getContrastText(userPalette.main);
      }
      resolvedSemantic[key] = userPalette;
    } else {
      const familyName = theme[SEMANTIC_TO_CONFIG[key]] as PrismuiColorFamily;
      const scale = theme.colorFamilies[familyName];
      if (scale) {
        resolvedSemantic[key] = resolvePaletteColor(scale, center);
      }
    }
  }

  // Neutral (always present, not auto-resolved from primaryShade)
  const neutralPalette = { ...palette.neutral };
  if (!neutralPalette.contrastText) {
    neutralPalette.contrastText = getContrastText(neutralPalette.main);
  }

  const paletteColors = {
    ...resolvedSemantic,
    neutral: neutralPalette,
  };

  for (const [name, value] of Object.entries(paletteColors)) {
    emitPaletteColorVars(vars, name, value);
  }

  // --- Text ---
  vars['--prismui-text-primary'] = palette.text.primary;
  vars['--prismui-text-secondary'] = palette.text.secondary;
  vars['--prismui-text-disabled'] = palette.text.disabled;

  if (palette.text.icon) {
    vars['--prismui-text-icon'] = palette.text.icon;
  }

  // Text channels: user-provided or auto-computed
  const textChannelFields = ['primary', 'secondary', 'disabled'] as const;
  for (const field of textChannelFields) {
    const userChannel = palette.text[`${field}Channel` as keyof typeof palette.text] as
      | string
      | undefined;
    const channel = userChannel || getColorChannels(palette.text[field]);
    if (channel) {
      vars[`--prismui-text-${field}Channel`] = channel;
    }
  }

  // --- Background ---
  vars['--prismui-background-paper'] = palette.background.paper;
  vars['--prismui-background-default'] = palette.background.default;
  vars['--prismui-background-neutral'] = palette.background.neutral;

  // Background channels: user-provided or auto-computed
  const bgChannelFields = ['paper', 'default', 'neutral'] as const;
  for (const field of bgChannelFields) {
    const userChannel = palette.background[
      `${field}Channel` as keyof typeof palette.background
    ] as string | undefined;
    const channel = userChannel || getColorChannels(palette.background[field]);
    if (channel) {
      vars[`--prismui-background-${field}Channel`] = channel;
    }
  }

  // --- Divider ---
  vars['--prismui-divider'] = palette.divider;

  // --- Action ---
  vars['--prismui-action-hover'] = palette.action.hover;
  vars['--prismui-action-selected'] = palette.action.selected;
  vars['--prismui-action-active'] = palette.action.active;
  vars['--prismui-action-focus'] = palette.action.focus;
  vars['--prismui-action-disabled'] = palette.action.disabled;
  vars['--prismui-action-disabledBackground'] =
    palette.action.disabledBackground;

  if (palette.action.hoverOpacity != null) {
    vars['--prismui-action-hoverOpacity'] = String(palette.action.hoverOpacity);
  }
  if (palette.action.selectedOpacity != null) {
    vars['--prismui-action-selectedOpacity'] = String(
      palette.action.selectedOpacity,
    );
  }
  if (palette.action.focusOpacity != null) {
    vars['--prismui-action-focusOpacity'] = String(palette.action.focusOpacity);
  }
  if (palette.action.activatedOpacity != null) {
    vars['--prismui-action-activatedOpacity'] = String(
      palette.action.activatedOpacity,
    );
    vars['--prismui-action-activeOpacity'] = String(
      palette.action.activatedOpacity,
    );
  }

  // Action channels: user-provided or auto-computed
  const activeChannel =
    palette.action.activeChannel || getColorChannels(palette.action.active);
  if (activeChannel) {
    vars['--prismui-action-activeChannel'] = activeChannel;
  }
  const selectedChannel =
    palette.action.selectedChannel || getColorChannels(palette.action.selected);
  if (selectedChannel) {
    vars['--prismui-action-selectedChannel'] = selectedChannel;
  }

  // --- Variant Opacity ---
  if (palette.variantOpacity) {
    const vo = palette.variantOpacity;
    if (vo['solid-commonHoverBg'] != null) {
      vars['--prismui-opacity-solid-commonHoverBg'] = String(vo['solid-commonHoverBg']);
    }
    if (vo['outlined-border'] != null) {
      vars['--prismui-opacity-outlined-border'] = String(vo['outlined-border']);
    }
    if (vo['soft-bg'] != null) {
      vars['--prismui-opacity-soft-bg'] = String(vo['soft-bg']);
    }
    if (vo['soft-hoverBg'] != null) {
      vars['--prismui-opacity-soft-hoverBg'] = String(vo['soft-hoverBg']);
    }
    if (vo['soft-commonBg'] != null) {
      vars['--prismui-opacity-soft-commonBg'] = String(vo['soft-commonBg']);
    }
    if (vo['soft-commonHoverBg'] != null) {
      vars['--prismui-opacity-soft-commonHoverBg'] = String(vo['soft-commonHoverBg']);
    }
    if (vo['soft-border'] != null) {
      vars['--prismui-opacity-soft-border'] = String(vo['soft-border']);
    }
  }

  // --- Shadows (generated from palette.shadow.color + semantic mainChannel) ---
  emitShadowVars(vars, palette, resolvedSemantic);

  return vars;
}
