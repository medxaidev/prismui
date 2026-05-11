import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import { SectionPrimitive } from '../_internal/SectionPrimitive';

/**
 * `<SectionDescription>` — Stage-15 Phase 3 Section primitive · description slot.
 *
 * The 6th public Section primitive, added in v1.0.10 by **reverse-
 * derivation** from Stage-11 Phase 7 Modal Round 1 (ADR-007 议题 E 决策
 * 16 · 留口 "待 Stage-15 v1.0.10 SectionDescription 反推后切换"). Modal
 * required an `aria-describedby` target with the canonical `<p>` element,
 * but plain `<p>` ships with `margin-block: 1em` that breaks Modal /
 * Section band layouts. Introducing the primitive at Stage-15 level
 * keeps the reset honest (single source of truth · usable outside Modal
 * inside any Section / Card surface).
 *
 * Default element is `<p>` — matches the WAI-ARIA dialog pattern
 * `aria-describedby` consumer expectation (flow-text paragraph).
 * Consumers who need a different element (a `<span>` inside a tighter
 * layout, a `<div>` to host block children) override via `component`:
 *
 * ```tsx
 * <SectionHeader>
 *   <SectionTitle>Settings</SectionTitle>
 *   <SectionDescription>Update your preferences.</SectionDescription>
 * </SectionHeader>
 *
 * <SectionDescription component="span">inline</SectionDescription>
 * ```
 *
 * Standalone: like every other Section band, SectionDescription works
 * outside a SectionHeader / Section composition (e.g. inside a Card
 * surface or a custom Modal arrangement) — it just emits the `.description`
 * reset class.
 *
 * ## Style scope (v1.0.10)
 *
 * The `.description` class applies a MINIMAL reset:
 *   - `margin: 0`            — neutralize default `<p>` margin-block
 *   - `font-family: inherit` — pick up the band font
 *   - `color: inherit`       — band-level color stays in charge
 *
 * It does **not** introduce a new typography CSS variable chain in
 * v1.0.10 (no `theme.layout.section.description-*` tokens). Description
 * text inherits typography from its parent band. If a future visual
 * review identifies the need for a dedicated description typography
 * triplet, it will land as a second step (mirroring how SectionTitle
 * acquired its triplet in v1.0.8) — this v1.0.10 surface is forward-
 * compatible.
 */

export interface SectionDescriptionOwnProps {}

export type SectionDescriptionProps<C extends ElementType = 'p'> = PolymorphicProps<
  C,
  SectionDescriptionOwnProps
>;

export type SectionDescriptionComponent = <C extends ElementType = 'p'>(
  props: SectionDescriptionProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

const SectionDescriptionImpl = React.forwardRef<unknown, SectionDescriptionOwnProps & {
  component?: ElementType;
  children?: React.ReactNode;
  className?: string;
}>(function SectionDescription(props, ref) {
  return (
    <SectionPrimitive ref={ref as React.Ref<HTMLElement>} slot="description" {...props} />
  );
});

SectionDescriptionImpl.displayName = 'SectionDescription';

export const SectionDescription = SectionDescriptionImpl as unknown as SectionDescriptionComponent & {
  displayName?: string;
};
