import { spacingResolver } from './spacing-resolver/spacing-resolver';
import { identityResolver } from './identity-resolver/identity-resolver';
import { sizeResolver } from './size-resolver/size-resolver';
import { radiusResolver } from './radius-resolver/radius-resolver';
import { borderResolver } from './border-resolver/border-resolver';
import { colorResolver } from './color-resolver/color-resolver';
import { textColorResolver } from './text-color-resolver/text-color-resolver';
import { fontFamilyResolver } from './font-family-resolver/font-family-resolver';
import { fontSizeResolver } from './font-size-resolver/font-size-resolver';
import { lineHeightResolver } from './line-height-resolver/line-height-resolver';

export const resolvers = {
  spacing: spacingResolver,
  identity: identityResolver,
  size: sizeResolver,
  radius: radiusResolver,
  border: borderResolver,
  color: colorResolver,
  textColor: textColorResolver,
  fontFamily: fontFamilyResolver,
  fontSize: fontSizeResolver,
  lineHeight: lineHeightResolver,
};

export type Resolvers = typeof resolvers;
