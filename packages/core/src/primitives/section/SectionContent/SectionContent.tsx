import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import { SectionPrimitive } from '../_internal/SectionPrimitive';

/**
 * `<SectionContent>` — Stage-15 Phase 3 Section primitive · content band.
 *
 * The middle band of a Section composition. Default element is `<div>`
 * (no native HTML semantic for "content", and `<main>` is too strong —
 * Section/Card may not be the page's main landmark).
 *
 * Consumes `theme.layout.section.content.scroll` (LY-SEC-1):
 *   - `'auto'`  → `overflow-y: auto`   (default · long content scrolls)
 *   - `'never'` → `overflow-y: visible`
 *
 * The CSS layer also wires `flex: 1 1 auto` + `min-height: 0` so the
 * content band correctly claims remaining height inside a flex-column
 * Section root and reveals an internal scrollbar instead of pushing
 * the footer out of view (the classic Modal scrolling bug).
 */

export interface SectionContentOwnProps {}

export type SectionContentProps<C extends ElementType = 'div'> = PolymorphicProps<
  C,
  SectionContentOwnProps
>;

export type SectionContentComponent = <C extends ElementType = 'div'>(
  props: SectionContentProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

const SectionContentImpl = React.forwardRef<unknown, SectionContentOwnProps & {
  component?: ElementType;
  children?: React.ReactNode;
  className?: string;
}>(function SectionContent(props, ref) {
  return (
    <SectionPrimitive ref={ref as React.Ref<HTMLElement>} slot="content" {...props} />
  );
});

SectionContentImpl.displayName = 'SectionContent';

export const SectionContent = SectionContentImpl as unknown as SectionContentComponent & {
  displayName?: string;
};
