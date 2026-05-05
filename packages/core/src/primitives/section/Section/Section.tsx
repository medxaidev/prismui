import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import { SectionPrimitive, type SectionSurface } from '../_internal/SectionPrimitive';

/**
 * `<Section>` — Stage-15 Phase 3 Section primitive · root slot.
 *
 * Authority: STAGE-15-OVERVIEW §3.8 + ADR-006 Q4.
 *
 * Section is the **root** of a three-band layout (Header / Content /
 * Footer). It owns the flex-column container that gives the bands
 * their inter-band gap, and emits `data-surface` so styling can pivot
 * between page and overlay surfaces (the Modal Round 0 contract that
 * LY-SEC-2 / LY-SEC-6 codify).
 *
 * Contracts:
 *   - **LY-SEC-1** — consumes only `theme.layout.section.gap` here;
 *     no hardcoded spacing.
 *   - **LY-SEC-2** — `surface` prop · `'page'` (default) | `'overlay'`
 *     (reserved for Stage-11 Modal Round 0). Always emitted as
 *     `data-surface` (honest-default mirrors Stack/Inline/Grid).
 *   - **LY-SEC-3** — Section is the optional outer wrapper; Header /
 *     Content / Footer can be used standalone. Section never *requires*
 *     all three bands — any subset (or none) is valid.
 *   - **LY-SEC-4** — Section is a page-level semantic region; it does
 *     NOT include FocusScope / RemoveScroll / Portal (those are
 *     Modal-overlay concerns, layered separately by Stage-11 Phase 7).
 *   - **LY-CORE-2** — polymorphic via `component` prop. Default
 *     element is `<section>` (HTML semantic match).
 *   - **LY-CORE-1** — zero runtime style; CSS Module owns layout.
 */

export interface SectionOwnProps {
  /**
   * Visual surface variant. `'page'` (default · this primitive's
   * primary use) gets `data-surface="page"`; `'overlay'` is reserved
   * for Stage-11 Phase 7 Modal Round 0.
   */
  surface?: SectionSurface;
}

/** Full Section prop type (polymorphic, defaults to `<section>`). */
export type SectionProps<C extends ElementType = 'section'> = PolymorphicProps<C, SectionOwnProps>;

/** Polymorphic Section component type. */
export type SectionComponent = <C extends ElementType = 'section'>(
  props: SectionProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

export const SECTION_DEFAULT_SURFACE: SectionSurface = 'page';

const SectionImpl = React.forwardRef<unknown, SectionOwnProps & {
  component?: ElementType;
  children?: React.ReactNode;
  className?: string;
}>(function Section(props, ref) {
  const { surface = SECTION_DEFAULT_SURFACE, ...rest } = props;
  return (
    <SectionPrimitive
      ref={ref as React.Ref<HTMLElement>}
      slot="root"
      surface={surface}
      {...rest}
    />
  );
});

SectionImpl.displayName = 'Section';

export const Section = SectionImpl as unknown as SectionComponent & { displayName?: string };
