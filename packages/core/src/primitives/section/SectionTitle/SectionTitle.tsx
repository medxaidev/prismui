import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import { SectionPrimitive } from '../_internal/SectionPrimitive';

/**
 * `<SectionTitle>` — Stage-15 Phase 3 Section primitive · title slot.
 *
 * The 5th public Section primitive, added in v1.0.8 to close the
 * SZ-SEC-1 typography end-to-end loop. Stage-14 Phase 4 emits the
 * resolved title triplet (`--prismui-section-title-font-size /
 * -line-height / -font-weight`), but heading element browser defaults
 * (`<h2>` font-size 1.5em / weight 700 / generous margin-block)
 * **override** band-level inheritance unless the title element is
 * explicitly typography-locked. `<SectionTitle>` is that explicit lock.
 *
 * Default element is `<h2>` — the Modal/Dialog/Section title convention.
 * Consumers that need a different heading level (nested sections, page
 * outline correctness, non-heading semantics) override via `component`:
 *
 * ```tsx
 * <SectionHeader>
 *   <SectionTitle>Settings</SectionTitle>
 *   <CloseButton />
 * </SectionHeader>
 *
 * <SectionTitle component="h3">Subsection</SectionTitle>
 * <SectionTitle component="div" role="heading" aria-level={2}>...</SectionTitle>
 * ```
 *
 * Standalone: like every other Section band, SectionTitle consumes
 * `theme.layout.section.title-*` CSS vars directly, so it can be used
 * outside a SectionHeader / Section composition (e.g. inside a Card
 * surface or a custom modal arrangement) without losing its typography.
 *
 * Token chain (LY-SEC-1):
 *   - `theme.layout.section.titleSize`  (size key)
 *      → resolved to `theme.typography.title[titleSize]` triplet
 *      → emitted as `--prismui-section-title-{font-size,line-height,font-weight}`
 *      → consumed by `.title` CSS module class.
 *
 * The `.title` class also resets `margin: 0` and `font-family/color: inherit`
 * to neutralize browser heading defaults — see Section.module.css `.title`.
 */

export interface SectionTitleOwnProps {}

export type SectionTitleProps<C extends ElementType = 'h2'> = PolymorphicProps<
  C,
  SectionTitleOwnProps
>;

export type SectionTitleComponent = <C extends ElementType = 'h2'>(
  props: SectionTitleProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

const SectionTitleImpl = React.forwardRef<unknown, SectionTitleOwnProps & {
  component?: ElementType;
  children?: React.ReactNode;
  className?: string;
}>(function SectionTitle(props, ref) {
  return (
    <SectionPrimitive ref={ref as React.Ref<HTMLElement>} slot="title" {...props} />
  );
});

SectionTitleImpl.displayName = 'SectionTitle';

export const SectionTitle = SectionTitleImpl as unknown as SectionTitleComponent & {
  displayName?: string;
};
