/**
 * Stage-15 Phase 2 · LY-SCOPE-1 · FocusScope · Storybook.
 *
 * FocusScope produces no visible DOM (LY-SCOPE-5). These stories
 * demonstrate the trap behaviour by:
 *   1. Showing focus moving inside a "dialog" panel on open
 *   2. Tabbing past the last button → focus wraps to the first
 *   3. Shift+Tabbing past the first → focus wraps to the last
 *   4. Closing the panel → focus restores to the trigger button
 *
 * Story topology (3 stories)
 *   1. Default       · single panel · open/close from a trigger
 *   2. Nested        · two layered panels · inner restores into outer
 *   3. EmptyScope    · panel with no tabbable inside · graceful no-op
 */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { FocusScope } from './FocusScope';

// ── Visual helpers ────────────────────────────────────────────────────────────

function Panel(props: { children: React.ReactNode; label?: string }) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'white',
        border: '1px solid #cbd5e1',
        borderRadius: 6,
        padding: 16,
        marginTop: 8,
        boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
      }}
    >
      {props.label ? (
        <div
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 11,
            color: '#64748b',
            marginBottom: 10,
          }}
        >
          {props.label}
        </div>
      ) : null}
      {props.children}
    </div>
  );
}

function PanelButton(props: {
  onClick?: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={props.onClick}
      style={{
        background: props.active ? '#0ea5e9' : '#e2e8f0',
        color: props.active ? 'white' : '#0f172a',
        border: 'none',
        borderRadius: 4,
        padding: '6px 12px',
        marginRight: 8,
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
  title: 'Primitives/Scope/FocusScope',
  component: FocusScope,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'FocusScope traps Tab / Shift+Tab keyboard focus inside its ' +
          'children, and restores focus to the originating trigger on ' +
          'unmount. It does NOT render a wrapper element around its ' +
          'children — instead, two visually invisible sentinel `<span>` ' +
          'guards bracket the children to detect focus escape (LY-SCOPE-1 ' +
          '+ LY-SCOPE-5). FocusScope does NOT handle escape / outside ' +
          'click — that is Stage-11 Dismissal\'s job.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FocusScope>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Click "Open dialog" to mount a panel with `<FocusScope>`. Focus
 * automatically moves to the first button inside. Press Tab repeatedly
 * — focus cycles through the panel's buttons and wraps from the last
 * back to the first (and Shift+Tab from the first wraps to the last).
 * Click "Close" — focus returns to the original "Open dialog" button.
 */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div style={{ fontFamily: 'system-ui' }}>
        <p style={{ color: '#475569' }}>
          Use Tab / Shift+Tab to verify the trap. Buttons OUTSIDE the
          panel must NOT receive focus while the panel is open.
        </p>
        <PanelButton onClick={() => setOpen(true)} active={open}>
          Open dialog
        </PanelButton>
        <PanelButton>Outside button A</PanelButton>
        <PanelButton>Outside button B</PanelButton>
        {open ? (
          <FocusScope>
            <Panel label="<FocusScope> active">
              <PanelButton>Confirm</PanelButton>
              <PanelButton>Cancel</PanelButton>
              <PanelButton onClick={() => setOpen(false)}>Close</PanelButton>
            </Panel>
          </FocusScope>
        ) : null}
      </div>
    );
  },
};

/**
 * Two layered panels demonstrate that nested FocusScopes correctly
 * restore focus through the layer stack:
 *   trigger → outer-first (mount outer)
 *   outer-first → outer-open-inner (user navigates)
 *   outer-open-inner → inner-first (mount inner)
 *   inner-first → inner-close → outer-open-inner (unmount inner)
 *   outer-close → trigger (unmount outer)
 */
export const Nested: Story = {
  render: () => {
    const [outer, setOuter] = React.useState(false);
    const [inner, setInner] = React.useState(false);
    return (
      <div style={{ fontFamily: 'system-ui' }}>
        <PanelButton onClick={() => setOuter(true)} active={outer}>
          Open outer
        </PanelButton>
        {outer ? (
          <FocusScope>
            <Panel label="outer scope">
              <PanelButton>Outer A</PanelButton>
              <PanelButton onClick={() => setInner(true)}>
                Open inner
              </PanelButton>
              <PanelButton
                onClick={() => {
                  setInner(false);
                  setOuter(false);
                }}
              >
                Close outer
              </PanelButton>
              {inner ? (
                <FocusScope>
                  <Panel label="inner scope">
                    <PanelButton>Inner A</PanelButton>
                    <PanelButton onClick={() => setInner(false)}>
                      Close inner
                    </PanelButton>
                  </Panel>
                </FocusScope>
              ) : null}
            </Panel>
          </FocusScope>
        ) : null}
      </div>
    );
  },
};

/**
 * Edge case: scope contains no tabbable element. FocusScope mounts
 * without throwing and without auto-focusing anything. Tab / Shift+Tab
 * inside the scope is a no-op (the guards have nothing to redirect to).
 * In a real overlay this is rare, but ensures the primitive degrades
 * gracefully when content is purely informational.
 */
export const EmptyScope: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div style={{ fontFamily: 'system-ui' }}>
        <PanelButton onClick={() => setOpen((v) => !v)} active={open}>
          {open ? 'Close empty scope' : 'Open empty scope'}
        </PanelButton>
        {open ? (
          <FocusScope>
            <Panel label="<FocusScope> with no tabbable content">
              <p style={{ margin: 0, color: '#475569' }}>
                This panel has no buttons or focusable content. Tab does
                nothing while the scope is mounted (no internal target
                to wrap to). Click the toggle above to dismiss.
              </p>
            </Panel>
          </FocusScope>
        ) : null}
      </div>
    );
  },
};
