import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import { SectionPrimitive } from '../_internal/SectionPrimitive';

/**
 * `<SectionFooter>` — Stage-15 Phase 3 Section primitive · footer band.
 *
 * The action / button row of a Section composition. Default element
 * is `<footer>` (HTML semantic match).
 *
 * Consumes `theme.layout.section.footer.justify` (LY-SEC-1):
 *   - `'end'`     → `justify-content: flex-end`     (primary action right · default)
 *   - `'between'` → `justify-content: space-between` (secondary left · primary right)
 *   - `'start'`   → `justify-content: flex-start`   (left-aligned · CN convention)
 *
 * The footer also reuses `--prismui-section-gap` as the inter-button
 * spacing so the footer's internal rhythm matches the band-to-band
 * rhythm of the Section root.
 */

export interface SectionFooterOwnProps {}

export type SectionFooterProps<C extends ElementType = 'footer'> = PolymorphicProps<
  C,
  SectionFooterOwnProps
>;

export type SectionFooterComponent = <C extends ElementType = 'footer'>(
  props: SectionFooterProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

const SectionFooterImpl = React.forwardRef<unknown, SectionFooterOwnProps & {
  component?: ElementType;
  children?: React.ReactNode;
  className?: string;
}>(function SectionFooter(props, ref) {
  return (
    <SectionPrimitive ref={ref as React.Ref<HTMLElement>} slot="footer" {...props} />
  );
});

SectionFooterImpl.displayName = 'SectionFooter';

export const SectionFooter = SectionFooterImpl as unknown as SectionFooterComponent & {
  displayName?: string;
};
