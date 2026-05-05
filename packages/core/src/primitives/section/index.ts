/**
 * Stage-15 Phase 3 · Section primitives namespace barrel.
 *
 * Exports (Phase 3 · COMPLETE · v1.0.8 added SectionTitle as 5th primitive):
 *   - Section        · ✅ landed (LY-SEC-1/2/3/4 · root slot · default <section>)
 *   - SectionHeader  · ✅ landed (LY-SEC-1/3 · header slot · default <header>)
 *   - SectionTitle   · ✅ landed (LY-SEC-1/3 · title slot · default <h2> · v1.0.8)
 *   - SectionContent · ✅ landed (LY-SEC-1/3 · content slot · default <div>)
 *   - SectionFooter  · ✅ landed (LY-SEC-1/3 · footer slot · default <footer>)
 *
 * Contract (ADR-006 §6.1 + LY-SEC-5): this barrel MUST NOT re-export
 * `SectionPrimitive` — that helper is private to keep the v1 contract
 * surface narrow. Future refactors of the shared engine remain non-
 * breaking precisely because no consumer can import it from `@prismui/
 * core`. The shape of this barrel is part of the R-1 P0 dissolution
 * condition (Phase 3 PR diff must match §6.1 whitelist exactly).
 *
 * The Phase 3 namespace also serves Stage-11 Phase 7 Modal Round 0
 * (LY-SEC-6): the same SectionPrimitive engine will back the Modal
 * Surface component, with `surface="overlay"` instead of the default
 * `"page"`. Section landing closes the v1 token-consumer story for
 * `theme.layout.section.*` (Stage-14 SZ-SEC-1).
 */

export { Section, SECTION_DEFAULT_SURFACE } from './Section';
export type { SectionOwnProps, SectionProps, SectionComponent } from './Section';

export { SectionHeader } from './SectionHeader';
export type {
  SectionHeaderOwnProps,
  SectionHeaderProps,
  SectionHeaderComponent,
} from './SectionHeader';

export { SectionTitle } from './SectionTitle';
export type {
  SectionTitleOwnProps,
  SectionTitleProps,
  SectionTitleComponent,
} from './SectionTitle';

export { SectionContent } from './SectionContent';
export type {
  SectionContentOwnProps,
  SectionContentProps,
  SectionContentComponent,
} from './SectionContent';

export { SectionFooter } from './SectionFooter';
export type {
  SectionFooterOwnProps,
  SectionFooterProps,
  SectionFooterComponent,
} from './SectionFooter';
