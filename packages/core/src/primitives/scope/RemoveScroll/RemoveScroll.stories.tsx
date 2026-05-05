/**
 * Stage-15 Phase 2 · LY-SCOPE-2 · RemoveScroll · Storybook.
 *
 * RemoveScroll produces NO visible DOM, so these stories demonstrate the
 * effect indirectly: a long-content page behind a toggle button. When
 * the toggle is on, `<RemoveScroll>` mounts and the page becomes
 * non-scrollable + layout stays fixed (no sideways jump from the
 * disappearing scrollbar).
 *
 * Story topology (3 stories)
 *   1. Default      · toggle button · body scroll locked while enabled
 *   2. Nested       · two nested RemoveScrolls · demonstrates ref-count
 *                     (closing the inner does NOT unlock until the outer closes)
 *   3. EnabledProp  · runtime toggle of the enabled flag on a mounted instance
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { RemoveScroll } from './RemoveScroll';

// ── Visual helpers ────────────────────────────────────────────────────────────

function LongContent() {
  return (
    <div style={{ padding: '16px 0', color: '#475569', lineHeight: 1.6 }}>
      <p style={{ marginTop: 0 }}>
        Scroll this page to verify behaviour. Enabling the scroll lock should
        freeze the page at its current scroll position and prevent further
        wheel / touch scrolling. The page layout should NOT jump sideways when
        the scrollbar disappears — that is the "scrollbar-gutter compensation"
        (padding-right equal to the scrollbar width).
      </p>
      {Array.from({ length: 30 }, (_, i) => (
        <p key={i} style={{ margin: '12px 0' }}>
          Paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing
          elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua.
        </p>
      ))}
    </div>
  );
}

function Button(props: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={props.onClick}
      style={{
        background: props.active ? '#0ea5e9' : '#e2e8f0',
        color: props.active ? 'white' : '#0f172a',
        border: 'none',
        borderRadius: 4,
        padding: '8px 14px',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {props.children}
    </button>
  );
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Primitives/Scope/RemoveScroll',
  component: RemoveScroll,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'RemoveScroll locks the page body scroll while at least one ' +
          '`<RemoveScroll enabled>` is mounted, and compensates for the ' +
          'disappearing scrollbar by adding `padding-right` equal to the ' +
          'scrollbar width. Nested instances are reference-counted: the ' +
          'body is unlocked only when the LAST instance unmounts / ' +
          'disables. RemoveScroll produces no visible DOM (LY-SCOPE-5).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RemoveScroll>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Basic toggle. Click the button to mount / unmount a `<RemoveScroll>`
 * instance. Observe: (1) page scroll wheel / touch is blocked while
 * locked, (2) page content does not jump sideways at toggle time
 * (scrollbar-gutter compensation).
 */
export const Default: Story = {
  render: () => {
    const [locked, setLocked] = React.useState(false);
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <div style={{ position: 'sticky', top: 0, background: '#f8fafc', padding: 12, zIndex: 1 }}>
          <Button onClick={() => setLocked((v) => !v)} active={locked}>
            {locked ? 'Unlock scroll' : 'Lock scroll'}
          </Button>
          <span style={{ marginLeft: 12, fontFamily: 'ui-monospace, monospace', color: '#64748b' }}>
            locked: {String(locked)}
          </span>
        </div>
        <LongContent />
        {locked ? <RemoveScroll>{null}</RemoveScroll> : null}
      </div>
    );
  },
};

/**
 * Nested ref-count demo. Two nested `<RemoveScroll>` layers. The inner
 * unmounts first, but the outer still holds the lock — body stays
 * locked. Unmounting the outer finally releases it. Try each button
 * in turn to see the contract.
 */
export const Nested: Story = {
  render: () => {
    const [outer, setOuter] = React.useState(false);
    const [inner, setInner] = React.useState(false);
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <div style={{ position: 'sticky', top: 0, background: '#f8fafc', padding: 12, zIndex: 1, display: 'flex', gap: 8 }}>
          <Button onClick={() => setOuter((v) => !v)} active={outer}>
            Toggle outer
          </Button>
          <Button
            onClick={() => setInner((v) => !v)}
            active={inner}
          >
            Toggle inner (requires outer)
          </Button>
          <span style={{ marginLeft: 12, fontFamily: 'ui-monospace, monospace', color: '#64748b' }}>
            outer: {String(outer)} · inner: {String(inner)}
          </span>
        </div>
        <LongContent />
        {outer ? (
          <RemoveScroll>
            {inner ? <RemoveScroll>{null}</RemoveScroll> : null}
          </RemoveScroll>
        ) : null}
      </div>
    );
  },
};

/**
 * The `enabled` prop lets a RemoveScroll stay mounted while its lock
 * toggles on / off. Useful when the owning overlay (e.g. a Dialog)
 * stays in the tree for exit animations but wants to release the body
 * scroll earlier. Flip the radio to see the lock acquire / release
 * without changing the mount state.
 */
export const EnabledProp: Story = {
  render: () => {
    const [enabled, setEnabled] = React.useState(false);
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <div style={{ position: 'sticky', top: 0, background: '#f8fafc', padding: 12, zIndex: 1, display: 'flex', gap: 8 }}>
          <Button onClick={() => setEnabled(false)} active={!enabled}>
            enabled = false
          </Button>
          <Button onClick={() => setEnabled(true)} active={enabled}>
            enabled = true
          </Button>
        </div>
        <LongContent />
        {/* Always mounted — only the `enabled` prop toggles. */}
        <RemoveScroll enabled={enabled}>{null}</RemoveScroll>
      </div>
    );
  },
};
