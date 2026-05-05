import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import classes from './Section.module.css';

/**
 * `SectionPrimitive` — Stage-15 Phase 3 **PRIVATE** shared engine.
 *
 * Authority: STAGE-15-OVERVIEW §3.8 (LY-SEC-5).
 *
 * **This helper MUST NOT be exported from `primitives/section/index.ts`.**
 * It is the common implementation behind the four public Section
 * primitives (Section / SectionHeader / SectionContent / SectionFooter)
 * AND will eventually back Stage-11 Phase 7 Modal Round 0's overlay
 * surface. Both consumers receive identical token-driven layout via
 * `theme.layout.section.*` (LY-SEC-1) — only the `data-surface` value
 * differs (LY-SEC-2).
 *
 * Per LY-SEC-5 the helper is private to keep the v1 contract surface
 * narrow: future refactors (e.g. adding sub-grid behaviour, internal
 * resize observers, or breaking the slot system into separate engines)
 * remain non-breaking precisely because no consumer can `import` this
 * file from the package barrel. The barrel-contract test
 * (`primitives/section/index.test.ts`) actively guards this rule.
 *
 * ## Slot model
 *
 * One of `'root' | 'header' | 'content' | 'footer'`. Each slot picks
 * the corresponding CSS Module class — that is the SOLE structural
 * difference between the four resulting public primitives. Default
 * elements differ (chosen by each public wrapper · `<section>` /
 * `<header>` / `<div>` / `<footer>`), but the styling and ref / API
 * pipeline are unified here.
 *
 * ## Surface model (LY-SEC-2)
 *
 * Only the **root** slot emits `data-surface`. Bands deliberately do
 * NOT inherit the surface attribute via React context — they consume
 * `theme.layout.section.*` directly and the visual differentiation
 * between page and overlay surfaces (background, border, shadow) is
 * the OUTER component's responsibility (Section root · Modal Surface).
 * Bands are surface-agnostic by design, which keeps them composable
 * outside the canonical Section context (e.g. a Card with only a
 * header band).
 */

export type SectionSlot = 'root' | 'header' | 'content' | 'footer';

/**
 * Surface variant for the root slot. `'page'` is the default emitted
 * by `<Section>`; `'overlay'` is reserved for Stage-11 Phase 7 Modal
 * Round 0 (the Modal Surface component will pass it through). Bands
 * (`header` / `content` / `footer`) ignore this prop — see surface
 * model note above.
 */
export type SectionSurface = 'page' | 'overlay';

export interface SectionPrimitiveOwnProps {
  /** Which slot of the section composition this element represents. */
  slot: SectionSlot;
  /**
   * Visual surface (root slot only). Forwarded as `data-surface` so
   * CSS callers can pivot on it (e.g. `[data-surface="overlay"]`).
   * Ignored on band slots.
   */
  surface?: SectionSurface;
}

type SectionPrimitiveImplProps = SectionPrimitiveOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof SectionPrimitiveOwnProps> & {
    component?: ElementType;
  };

const SLOT_CLASS: Record<SectionSlot, string> = {
  root: classes.root,
  header: classes.header,
  content: classes.content,
  footer: classes.footer,
};

const SLOT_DEFAULT_ELEMENT: Record<SectionSlot, ElementType> = {
  root: 'section',
  header: 'header',
  content: 'div',
  footer: 'footer',
};

function mergeClassName(slotClass: string, userClassName: string | undefined): string {
  return userClassName ? `${slotClass} ${userClassName}` : slotClass;
}

const SectionPrimitiveImpl = React.forwardRef<unknown, SectionPrimitiveImplProps>(
  function SectionPrimitive(props, ref) {
    const {
      component,
      className,
      slot,
      surface,
      ...rest
    } = props;

    const Element = (component ?? SLOT_DEFAULT_ELEMENT[slot]) as React.ElementType;

    // ── data-attrs ─────────────────────────────────────────────────────
    // Only the root slot emits data-surface. Bands ignore the prop even
    // if (incorrectly) provided — surface is a root concern (LY-SEC-2).
    const dataAttrs: Record<string, string> = {};
    if (slot === 'root') {
      // Default to 'page' so the rendered DOM is self-documenting (mirrors
      // Stage-15 honest-default policy from Stack/Inline/Grid/Divider).
      dataAttrs['data-surface'] = surface ?? 'page';
    }

    return (
      <Element
        ref={ref as React.Ref<HTMLElement>}
        className={mergeClassName(SLOT_CLASS[slot], className)}
        {...dataAttrs}
        {...rest}
      />
    );
  },
);

SectionPrimitiveImpl.displayName = 'SectionPrimitive';

/**
 * Polymorphic SectionPrimitive component type — recovers the `<C>`
 * generic that `React.forwardRef` erases.
 */
export type SectionPrimitiveComponent = <C extends ElementType = 'section'>(
  props: PolymorphicProps<C, SectionPrimitiveOwnProps> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

/** Internal export · NOT re-exported from the namespace barrel. */
export const SectionPrimitive = SectionPrimitiveImpl as unknown as SectionPrimitiveComponent & {
  displayName?: string;
};
