/**
 * Stage-15 Phase 3 · Section namespace barrel contract test.
 *
 * Locks the `@/primitives/section` public surface to the ADR-006 §6.1
 * whitelist. Critically: enforces **LY-SEC-5** — `SectionPrimitive` is
 * a private internal helper and MUST NOT be exported from this barrel.
 * Future refactors of the shared engine remain non-breaking precisely
 * because no consumer can import it from `@prismui/core`.
 *
 * Composition guard: a pseudo-integration test renders the canonical
 * 4-band shape (Section + Header + Content + Footer) to verify the
 * primitives compose cleanly without context wiring.
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as SectionBarrel from './index';

// This file is `.ts` (not `.tsx`) so we use React.createElement instead
// of JSX in the composition tests below. Keeping the file as `.ts`
// avoids depending on the JSX runtime for what is fundamentally a
// barrel-shape contract test — the React renders here are sanity
// checks that the public surface composes correctly, not visual tests.
const h = React.createElement;

describe('primitives/section · barrel contract (ADR-006 §6.1 whitelist)', () => {
  it('exports exactly the Phase 3 value-level symbols (COMPLETE · v1.0.10 · 6 primitives)', () => {
    const expected = [
      'Section',
      'SECTION_DEFAULT_SURFACE',
      'SectionContent',
      'SectionDescription',
      'SectionFooter',
      'SectionHeader',
      'SectionTitle',
    ].sort();
    const actual = Object.keys(SectionBarrel).sort();
    expect(actual).toEqual(expected);
  });

  it('all 6 public Section primitives are callable (forwardRef shape)', () => {
    for (const name of [
      'Section',
      'SectionHeader',
      'SectionTitle',
      'SectionDescription',
      'SectionContent',
      'SectionFooter',
    ] as const) {
      const Comp = SectionBarrel[name];
      const t = typeof Comp;
      expect(
        t === 'function' || (t === 'object' && Comp !== null),
        `${name} must be a callable / forwardRef-shaped value (got ${t})`,
      ).toBe(true);
    }
  });

  it('SECTION_DEFAULT_SURFACE constant is "page" (honest-default contract)', () => {
    expect(SectionBarrel.SECTION_DEFAULT_SURFACE).toBe('page');
  });

  it('compile-time: all documented type names are importable', () => {
    type _SideEffect =
      | import('./index').SectionOwnProps
      | import('./index').SectionProps
      | import('./index').SectionComponent
      | import('./index').SectionHeaderOwnProps
      | import('./index').SectionHeaderProps
      | import('./index').SectionHeaderComponent
      | import('./index').SectionTitleOwnProps
      | import('./index').SectionTitleProps
      | import('./index').SectionTitleComponent
      | import('./index').SectionDescriptionOwnProps
      | import('./index').SectionDescriptionProps
      | import('./index').SectionDescriptionComponent
      | import('./index').SectionContentOwnProps
      | import('./index').SectionContentProps
      | import('./index').SectionContentComponent
      | import('./index').SectionFooterOwnProps
      | import('./index').SectionFooterProps
      | import('./index').SectionFooterComponent;
    const _: _SideEffect | undefined = undefined;
    expect(_).toBeUndefined();
  });
});

describe('primitives/section · LY-SEC-5 SectionPrimitive privacy invariant', () => {
  it('does NOT export SectionPrimitive (private helper · LY-SEC-5)', () => {
    // The crown jewel of LY-SEC-5: SectionPrimitive is the shared
    // engine behind all 4 public primitives, but it must remain
    // private so future internal refactors are non-breaking. Any PR
    // that adds it to the namespace barrel violates ADR-006 and
    // forfeits the v1 architectural commitment.
    const keys = Object.keys(SectionBarrel);
    expect(keys).not.toContain('SectionPrimitive');
  });

  it('does NOT export internal slot / surface union types', () => {
    // The `SectionSlot` / `SectionSurface` types are defined in
    // `_internal/SectionPrimitive.tsx` for the helper's signature
    // and must not leak into the public type surface — the 4 public
    // primitives expose surface only via Section's own `SectionOwnProps`.
    const keys = Object.keys(SectionBarrel);
    // Value-level check (the types themselves are erased at runtime;
    // their leakage would manifest as a value re-export which is
    // observable here via Object.keys).
    expect(keys).not.toContain('SectionSlot');
    expect(keys).not.toContain('SectionSurface');
  });
});

describe('primitives/section · forbidden leak audit', () => {
  it('does NOT re-export Layout / Scope symbols', () => {
    const keys = Object.keys(SectionBarrel);
    const forbidden = [
      'Box',
      'Stack',
      'Inline',
      'Center',
      'Grid',
      'Divider',
      'FocusScope',
      'RemoveScroll',
      'ScopePortal',
      'Portal',
    ];
    for (const name of forbidden) {
      expect(keys, `${name} must NOT leak into the section barrel`).not.toContain(name);
    }
  });
});

describe('primitives/section · composition integration', () => {
  it('renders the canonical 6-slot shape with correct semantic elements (v1.0.10)', () => {
    const {
      Section,
      SectionHeader,
      SectionTitle,
      SectionDescription,
      SectionContent,
      SectionFooter,
    } = SectionBarrel;
    const tree = h(
      Section,
      null,
      h(
        SectionHeader,
        null,
        h(SectionTitle, null, 'Title'),
        h(SectionDescription, null, 'Subtitle text'),
      ),
      h(SectionContent, null, h('p', null, 'Body')),
      h(SectionFooter, null, h('button', null, 'OK')),
    );
    const { container } = render(tree);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe('SECTION');
    expect(root.getAttribute('data-surface')).toBe('page');
    expect(root.querySelector('header')!.textContent).toBe('TitleSubtitle text');
    // SectionTitle renders <h2> as the canonical default — verifies the
    // 5th primitive composes inside SectionHeader and forwards the slot
    // class without breaking the Header's composition.
    expect(root.querySelector('h2')!.textContent).toBe('Title');
    // SectionDescription (6th primitive · v1.0.10) renders <p> by default
    // and composes alongside SectionTitle inside SectionHeader.
    const headerPs = Array.from(
      root.querySelector('header')!.querySelectorAll('p'),
    );
    expect(headerPs.length).toBe(1);
    expect(headerPs[0].textContent).toBe('Subtitle text');
    // First non-header / non-footer descendant <div> is the SectionContent.
    const contentDiv = Array.from(root.querySelectorAll('div')).find(
      (el) => el.textContent === 'Body',
    );
    expect(contentDiv).toBeDefined();
    expect(root.querySelector('footer')!.textContent).toBe('OK');
  });

  it('Section accepts any subset of bands (LY-SEC-3 · slots are optional)', () => {
    const { Section, SectionHeader } = SectionBarrel;
    const tree = h(Section, null, h(SectionHeader, null, h('h2', null, 'Header only')));
    const { container } = render(tree);
    const root = container.firstElementChild!;
    expect(root.children.length).toBe(1);
    expect(root.firstElementChild!.tagName).toBe('HEADER');
  });

  it('Section surface="overlay" propagates the contract for Stage-11 Modal', () => {
    const { Section } = SectionBarrel;
    const tree = h(Section, { surface: 'overlay' }, h('div', null, 'modal-like'));
    const { container } = render(tree);
    expect(container.firstElementChild!.getAttribute('data-surface')).toBe('overlay');
  });
});
