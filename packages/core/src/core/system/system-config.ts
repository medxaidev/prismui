import type { CSSProperties } from 'react';
import type { Resolvers } from './resolvers';

type SystemPropConfig = {
  cssProperty: keyof CSSProperties;
  transform: keyof Resolvers;
};

export const SYSTEM_CONFIG = {
  m: { cssProperty: 'margin', transform: 'spacing' },
  mt: { cssProperty: 'marginTop', transform: 'spacing' },
  mb: { cssProperty: 'marginBottom', transform: 'spacing' },
  ml: { cssProperty: 'marginLeft', transform: 'spacing' },
  mr: { cssProperty: 'marginRight', transform: 'spacing' },
  ms: { cssProperty: 'marginInlineStart', transform: 'spacing' },
  me: { cssProperty: 'marginInlineEnd', transform: 'spacing' },
  mx: { cssProperty: 'marginInline', transform: 'spacing' },
  my: { cssProperty: 'marginBlock', transform: 'spacing' },

  p: { cssProperty: 'padding', transform: 'spacing' },
  pt: { cssProperty: 'paddingTop', transform: 'spacing' },
  pb: { cssProperty: 'paddingBottom', transform: 'spacing' },
  pl: { cssProperty: 'paddingLeft', transform: 'spacing' },
  pr: { cssProperty: 'paddingRight', transform: 'spacing' },
  ps: { cssProperty: 'paddingInlineStart', transform: 'spacing' },
  pe: { cssProperty: 'paddingInlineEnd', transform: 'spacing' },
  px: { cssProperty: 'paddingInline', transform: 'spacing' },
  py: { cssProperty: 'paddingBlock', transform: 'spacing' },

  bd: { cssProperty: 'border', transform: 'border' },
  bdrs: { cssProperty: 'borderRadius', transform: 'radius' },
  bg: { cssProperty: 'background', transform: 'color' },
  c: { cssProperty: 'color', transform: 'textColor' },
  opacity: { cssProperty: 'opacity', transform: 'identity' },

  ff: { cssProperty: 'fontFamily', transform: 'fontFamily' },
  fz: { cssProperty: 'fontSize', transform: 'fontSize' },
  fw: { cssProperty: 'fontWeight', transform: 'identity' },
  lts: { cssProperty: 'letterSpacing', transform: 'size' },
  ta: { cssProperty: 'textAlign', transform: 'identity' },
  lh: { cssProperty: 'lineHeight', transform: 'lineHeight' },
  fs: { cssProperty: 'fontStyle', transform: 'identity' },
  tt: { cssProperty: 'textTransform', transform: 'identity' },
  td: { cssProperty: 'textDecoration', transform: 'identity' },

  w: { cssProperty: 'width', transform: 'spacing' },
  miw: { cssProperty: 'minWidth', transform: 'spacing' },
  maw: { cssProperty: 'maxWidth', transform: 'spacing' },
  h: { cssProperty: 'height', transform: 'spacing' },
  mih: { cssProperty: 'minHeight', transform: 'spacing' },
  mah: { cssProperty: 'maxHeight', transform: 'spacing' },

  bgsz: { cssProperty: 'backgroundSize', transform: 'size' },
  bgp: { cssProperty: 'backgroundPosition', transform: 'identity' },
  bgr: { cssProperty: 'backgroundRepeat', transform: 'identity' },
  bga: { cssProperty: 'backgroundAttachment', transform: 'identity' },

  pos: { cssProperty: 'position', transform: 'identity' },
  top: { cssProperty: 'top', transform: 'size' },
  left: { cssProperty: 'left', transform: 'size' },
  bottom: { cssProperty: 'bottom', transform: 'size' },
  right: { cssProperty: 'right', transform: 'size' },
  inset: { cssProperty: 'inset', transform: 'size' },

  display: { cssProperty: 'display', transform: 'identity' },
  flex: { cssProperty: 'flex', transform: 'identity' },

  overflow: { cssProperty: 'overflow', transform: 'identity' },
  cursor: { cssProperty: 'cursor', transform: 'identity' },
  visibility: { cssProperty: 'visibility', transform: 'identity' },
  z: { cssProperty: 'zIndex', transform: 'identity' },
  gap: { cssProperty: 'gap', transform: 'spacing' },
  rowGap: { cssProperty: 'rowGap', transform: 'spacing' },
  columnGap: { cssProperty: 'columnGap', transform: 'spacing' },
  alignItems: { cssProperty: 'alignItems', transform: 'identity' },
  justifyContent: { cssProperty: 'justifyContent', transform: 'identity' },
  flexWrap: { cssProperty: 'flexWrap', transform: 'identity' },
  flexDirection: { cssProperty: 'flexDirection', transform: 'identity' },
  flexGrow: { cssProperty: 'flexGrow', transform: 'identity' },
  flexShrink: { cssProperty: 'flexShrink', transform: 'identity' },
} satisfies Record<string, SystemPropConfig>;
