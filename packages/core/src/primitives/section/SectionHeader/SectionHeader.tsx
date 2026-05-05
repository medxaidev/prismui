import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import { SectionPrimitive } from '../_internal/SectionPrimitive';

/**
 * `<SectionHeader>` — Stage-15 Phase 3 Section primitive · header band.
 *
 * Renders the title + actions row of a Section composition. Default
 * element is `<header>` (HTML semantic match). Consumes the
 * `theme.layout.section.header.*` chain (LY-SEC-1):
 *   - `header.align`     → CSS `align-items`     (band cross-axis)
 *   - `header.justify`   → CSS `justify-content` (band main-axis · default 'space-between')
 *   - `header.titleSize` → resolved typography triplet applied to the band itself
 *
 * Children rendered inside SectionHeader inherit the title typography
 * unless they override it. The canonical pattern is:
 * ```tsx
 * <SectionHeader>
 *   <h2>{title}</h2>
 *   <CloseButton />
 * </SectionHeader>
 * ```
 *
 * SectionHeader stands alone: it works inside `<Section>` *or* on its
 * own (e.g. inside a Card surface) — it consumes section CSS vars
 * directly and has no dependence on a parent Section element.
 */

export interface SectionHeaderOwnProps {}

export type SectionHeaderProps<C extends ElementType = 'header'> = PolymorphicProps<
  C,
  SectionHeaderOwnProps
>;

export type SectionHeaderComponent = <C extends ElementType = 'header'>(
  props: SectionHeaderProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

const SectionHeaderImpl = React.forwardRef<unknown, SectionHeaderOwnProps & {
  component?: ElementType;
  children?: React.ReactNode;
  className?: string;
}>(function SectionHeader(props, ref) {
  return (
    <SectionPrimitive ref={ref as React.Ref<HTMLElement>} slot="header" {...props} />
  );
});

SectionHeaderImpl.displayName = 'SectionHeader';

export const SectionHeader = SectionHeaderImpl as unknown as SectionHeaderComponent & {
  displayName?: string;
};
