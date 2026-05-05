/**
 * Stage-15 Phase 3 · Section primitive composition · Storybook.
 *
 * The 4 Section primitives are presented in a single stories file
 * because their value lies in COMPOSITION — viewing them in isolation
 * would obscure the three-band rhythm and the surface-pivoted CSS
 * variables they all consume.
 *
 * Story topology (6 stories)
 *   1. Default            · canonical 4-band Section (page surface)
 *   2. SurfacePage        · explicit page surface · with visible boundary
 *   3. SurfaceOverlay     · overlay surface · simulates a Modal-like panel
 *   4. PolymorphicArticle · component="article" · semantic flexibility
 *   5. PartialBands       · header-only · LY-SEC-3 optional slots
 *   6. ScrollableContent  · long content · content.scroll = 'auto' demo
 *
 * Note: the Section primitives consume `theme.layout.section.*` tokens.
 * Visual rhythm (padding, gap, title typography) is fully driven by
 * the theme — these stories showcase the layout shape, not bespoke
 * visuals. Wrap each Section in a styled container to add background
 * / border / shadow as your application surface requires.
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Section } from './Section';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { SectionContent } from '../SectionContent/SectionContent';
import { SectionFooter } from '../SectionFooter/SectionFooter';
import { Inline } from '../../layout/Inline/Inline';

// ── Visual helpers (local · not exported) ─────────────────────────────────────

const PANEL_STYLE: React.CSSProperties = {
  background: 'white',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
  width: 480,
};

const OVERLAY_STYLE: React.CSSProperties = {
  background: '#0f172a',
  color: '#e2e8f0',
  borderRadius: 12,
  boxShadow: '0 16px 48px rgba(15,23,42,0.4)',
  width: 480,
};

function ActionButton(props: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      style={{
        background: props.primary ? '#0ea5e9' : '#e2e8f0',
        color: props.primary ? 'white' : '#0f172a',
        border: 'none',
        borderRadius: 4,
        padding: '6px 14px',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {props.children}
    </button>
  );
}

function CloseButton() {
  return (
    <button
      aria-label="close"
      style={{
        background: 'transparent',
        border: 'none',
        fontSize: 18,
        color: 'inherit',
        cursor: 'pointer',
        lineHeight: 1,
      }}
    >
      ×
    </button>
  );
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Primitives/Section/Section',
  component: Section,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Section is the root of a token-driven three-band layout ' +
          '(Header / Content / Footer). All four Section primitives ' +
          'consume `theme.layout.section.*` exclusively — no hardcoded ' +
          'spacing or typography (LY-SEC-1). The `surface` prop on ' +
          'Section pivots between page (default) and overlay (Stage-11 ' +
          'Phase 7 Modal Round 0) via `data-surface`. Header / Content ' +
          '/ Footer bands are surface-agnostic and can be used ' +
          'standalone outside a Section (LY-SEC-3 · LY-SEC-4).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    surface: { control: 'radio', options: ['page', 'overlay'] },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Canonical 4-band Section · page surface. */
export const Default: Story = {
  render: () => (
    <Section style={PANEL_STYLE}>
      <SectionHeader>
        <h2 style={{ margin: 0 }}>Settings</h2>
        <CloseButton />
      </SectionHeader>
      <SectionContent>
        <p style={{ margin: 0 }}>
          Configure your workspace preferences. All sections of this
          Section consume <code>theme.layout.section.*</code> for padding,
          typography, alignment, and overflow.
        </p>
      </SectionContent>
      <SectionFooter>
        <Inline gap="sm">
          <ActionButton>Cancel</ActionButton>
          <ActionButton primary>Save</ActionButton>
        </Inline>
      </SectionFooter>
    </Section>
  ),
};

/**
 * Explicit `surface="page"`. Identical to Default visually — the
 * surface attribute is a hook for downstream CSS to differentiate.
 * Inspect the DOM to verify `data-surface="page"` on the Section root.
 */
export const SurfacePage: Story = {
  args: { surface: 'page' },
  render: (args) => (
    <Section {...args} style={PANEL_STYLE}>
      <SectionHeader>
        <h2 style={{ margin: 0 }}>Page surface</h2>
      </SectionHeader>
      <SectionContent>
        <p style={{ margin: 0 }}>
          <code>data-surface=&quot;page&quot;</code> is the default. Use
          this for in-page sections (settings panels, card surfaces,
          form sections).
        </p>
      </SectionContent>
      <SectionFooter>
        <ActionButton primary>OK</ActionButton>
      </SectionFooter>
    </Section>
  ),
};

/**
 * `surface="overlay"` — the Stage-11 Modal Round 0 contract. Same
 * SectionPrimitive engine, different `data-surface` value. CSS
 * targeting `[data-surface="overlay"]` can layer overlay-specific
 * visuals (the dark background here is purely demonstrative — Modal
 * Round 0 will define the actual overlay surface tokens).
 */
export const SurfaceOverlay: Story = {
  args: { surface: 'overlay' },
  render: (args) => (
    <Section {...args} style={OVERLAY_STYLE}>
      <SectionHeader>
        <h2 style={{ margin: 0 }}>Confirm action</h2>
        <CloseButton />
      </SectionHeader>
      <SectionContent>
        <p style={{ margin: 0 }}>
          Same Section primitive with <code>surface=&quot;overlay&quot;</code>
          {' '}— the overlay variant reserved for Stage-11 Phase 7 Modal
          Round 0. The two surfaces share token-driven layout but allow
          divergent visuals through the <code>data-surface</code>
          {' '}attribute hook.
        </p>
      </SectionContent>
      <SectionFooter>
        <Inline gap="sm">
          <ActionButton>Cancel</ActionButton>
          <ActionButton primary>Confirm</ActionButton>
        </Inline>
      </SectionFooter>
    </Section>
  ),
};

/**
 * Polymorphic component prop. Section renders as `<article>` instead
 * of `<section>` for a blog-post-like context. Footer becomes article
 * meta. Same layout, different semantic element.
 */
export const PolymorphicArticle: Story = {
  render: () => (
    <Section component="article" style={PANEL_STYLE}>
      <SectionHeader component="div">
        <h2 style={{ margin: 0 }}>Polymorphic Section</h2>
      </SectionHeader>
      <SectionContent>
        <p style={{ margin: 0 }}>
          When the page semantic doesn&apos;t fit, flip the underlying
          element with <code>component</code>: this Section renders as
          <code>&lt;article&gt;</code>, and the header band as
          <code>&lt;div&gt;</code>. <code>data-surface</code> is still
          emitted on the article root.
        </p>
      </SectionContent>
    </Section>
  ),
};

/**
 * LY-SEC-3 · any subset of bands is valid. This Section uses only a
 * header — no content or footer. Useful for compact information cards
 * or breadcrumb headers.
 */
export const PartialBands: Story = {
  render: () => (
    <Section style={PANEL_STYLE}>
      <SectionHeader>
        <h2 style={{ margin: 0 }}>Header only</h2>
        <CloseButton />
      </SectionHeader>
    </Section>
  ),
};

/**
 * Long content · the content band consumes `content.scroll = "auto"`.
 * Combined with the `flex: 1 1 auto` + `min-height: 0` rules in
 * Section.module.css, the content band shows an internal scrollbar
 * instead of pushing the footer out of view (the classic Modal
 * scrolling bug).
 */
export const ScrollableContent: Story = {
  render: () => (
    <Section style={{ ...PANEL_STYLE, height: 360 }}>
      <SectionHeader>
        <h2 style={{ margin: 0 }}>Long content</h2>
        <CloseButton />
      </SectionHeader>
      <SectionContent>
        {Array.from({ length: 18 }, (_, i) => (
          <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0', color: '#475569' }}>
            Paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit. Sed do eiusmod tempor incididunt ut labore
            et dolore magna aliqua.
          </p>
        ))}
      </SectionContent>
      <SectionFooter>
        <Inline gap="sm">
          <ActionButton>Close</ActionButton>
          <ActionButton primary>Confirm</ActionButton>
        </Inline>
      </SectionFooter>
    </Section>
  ),
};
