import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Portal } from './Portal';
import { OptionalPortal } from './OptionalPortal';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Portal> = {
  title: 'Components/Portal',
  component: Portal,
};

export default meta;
type Story = StoryObj<typeof Portal>;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 20,
  marginBottom: 16,
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 15,
  fontWeight: 700,
};

const note: React.CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
  margin: '0 0 16px',
};

const portalContent: React.CSSProperties = {
  background: '#dbeafe',
  border: '2px dashed #3b82f6',
  borderRadius: 6,
  padding: '12px 16px',
  fontSize: 14,
  color: '#1e40af',
  fontWeight: 500,
};

const inlineBox: React.CSSProperties = {
  background: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: 16,
  fontSize: 13,
};

// ---------------------------------------------------------------------------
// Story 1: Basic Portal
// ---------------------------------------------------------------------------

export const BasicPortal: Story = {
  name: '1. Basic Portal',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Basic Portal</h3>
      <p style={note}>
        The blue box below is rendered via <code>&lt;Portal&gt;</code> into a
        <code> &lt;div data-portal&gt;</code> appended to <code>document.body</code>.
        Open DevTools to verify it's outside this component's DOM tree.
      </p>
      <div style={inlineBox}>
        <p style={{ margin: 0 }}>This is inside the parent component.</p>
        <Portal>
          <div style={{ ...portalContent, position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
            ✨ I'm rendered via Portal (fixed bottom-right)
          </div>
        </Portal>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 2: Target — CSS Selector
// ---------------------------------------------------------------------------

export const TargetSelector: Story = {
  name: '2. Target — CSS Selector',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Portal with CSS Selector Target</h3>
      <p style={note}>
        Content is portaled into <code>#portal-target-demo</code> instead of document.body.
      </p>

      <div
        id="portal-target-demo"
        style={{ ...inlineBox, background: '#fef3c7', border: '2px solid #f59e0b', minHeight: 60 }}
      >
        <strong>Target container (#portal-target-demo):</strong>
      </div>

      <div style={{ ...inlineBox, marginTop: 12 }}>
        <p style={{ margin: 0 }}>Source component (content below is portaled ↑):</p>
        <Portal target="#portal-target-demo">
          <div style={{ ...portalContent, marginTop: 8 }}>
            I was portaled here via target="#portal-target-demo"
          </div>
        </Portal>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 3: Target — HTMLElement ref
// ---------------------------------------------------------------------------

function TargetRefDemo() {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <div style={card}>
      <h3 style={sectionTitle}>Portal with HTMLElement Target (ref)</h3>
      <p style={note}>
        Uses a React ref to pass an HTMLElement as the portal target.
      </p>

      <div
        ref={targetRef}
        style={{ ...inlineBox, background: '#dcfce7', border: '2px solid #22c55e', minHeight: 60 }}
      >
        <strong>Target container (ref):</strong>
      </div>

      <div style={{ ...inlineBox, marginTop: 12 }}>
        <p style={{ margin: 0 }}>Source component:</p>
        {targetRef.current && (
          <Portal target={targetRef.current}>
            <div style={{ ...portalContent, marginTop: 8, background: '#d1fae5', borderColor: '#16a34a', color: '#15803d' }}>
              I was portaled via HTMLElement ref
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
}

export const TargetRef: Story = {
  name: '3. Target — HTMLElement Ref',
  render: () => <TargetRefDemo />,
};

// ---------------------------------------------------------------------------
// Story 4: Target — Callback Function (MUI pattern)
// ---------------------------------------------------------------------------

function TargetCallbackDemo() {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <div style={card}>
      <h3 style={sectionTitle}>Portal with Callback Target (MUI pattern)</h3>
      <p style={note}>
        <code>target={'{() => element}'}</code> — callback is evaluated on mount.
        This pattern is from MUI and enables lazy container resolution.
      </p>

      <div
        ref={targetRef}
        style={{ ...inlineBox, background: '#fce7f3', border: '2px solid #ec4899', minHeight: 60 }}
      >
        <strong>Target container (callback):</strong>
      </div>

      <div style={{ ...inlineBox, marginTop: 12 }}>
        <p style={{ margin: 0 }}>Source component:</p>
        <Portal target={() => targetRef.current!}>
          <div style={{ ...portalContent, marginTop: 8, background: '#fce7f3', borderColor: '#ec4899', color: '#be185d' }}>
            I was portaled via callback target
          </div>
        </Portal>
      </div>
    </div>
  );
}

export const TargetCallback: Story = {
  name: '4. Target — Callback (MUI)',
  render: () => <TargetCallbackDemo />,
};

// ---------------------------------------------------------------------------
// Story 5: disablePortal (MUI pattern)
// ---------------------------------------------------------------------------

function DisablePortalDemo() {
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={card}>
      <h3 style={sectionTitle}>disablePortal (MUI pattern)</h3>
      <p style={note}>
        When <code>disablePortal=true</code>, children render in-place (no portal).
        Toggle below to see the difference.
      </p>

      <button
        onClick={() => setDisabled((v) => !v)}
        style={{
          padding: '8px 16px', marginBottom: 12, cursor: 'pointer',
          background: disabled ? '#fee2e2' : '#dbeafe',
          border: `1px solid ${disabled ? '#ef4444' : '#3b82f6'}`,
          borderRadius: 6, fontSize: 13, fontWeight: 600,
        }}
      >
        disablePortal = {String(disabled)} (click to toggle)
      </button>

      <div style={inlineBox}>
        <p style={{ margin: '0 0 8px' }}>Parent container:</p>
        <Portal disablePortal={disabled}>
          <div style={portalContent}>
            {disabled
              ? '📍 Rendered IN-PLACE (disablePortal=true)'
              : '🌀 Rendered via PORTAL (disablePortal=false)'}
          </div>
        </Portal>
      </div>
    </div>
  );
}

export const DisablePortal: Story = {
  name: '5. disablePortal',
  render: () => <DisablePortalDemo />,
};

// ---------------------------------------------------------------------------
// Story 6: reuseTargetNode
// ---------------------------------------------------------------------------

export const ReuseTargetNode: Story = {
  name: '6. reuseTargetNode',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>reuseTargetNode (Mantine pattern)</h3>
      <p style={note}>
        By default (<code>reuseTargetNode=true</code>), all Portals share a single
        <code> &lt;div data-prismui-portal-node&gt;</code> on document.body.
        Set to <code>false</code> to create a unique node per Portal instance.
      </p>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px', color: '#6b7280' }}>
            Shared (default)
          </h4>
          <div style={inlineBox}>
            <Portal>
              <div style={{ ...portalContent, fontSize: 12, padding: 8 }}>
                Shared Portal A
              </div>
            </Portal>
            <Portal>
              <div style={{ ...portalContent, fontSize: 12, padding: 8 }}>
                Shared Portal B
              </div>
            </Portal>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
              Both render into the same node
            </p>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px', color: '#6b7280' }}>
            Unique (reuseTargetNode=false)
          </h4>
          <div style={inlineBox}>
            <Portal reuseTargetNode={false}>
              <div style={{ ...portalContent, fontSize: 12, padding: 8, background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' }}>
                Unique Portal A
              </div>
            </Portal>
            <Portal reuseTargetNode={false}>
              <div style={{ ...portalContent, fontSize: 12, padding: 8, background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' }}>
                Unique Portal B
              </div>
            </Portal>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
              Each gets its own node
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 7: Node Attributes (className, style, id)
// ---------------------------------------------------------------------------

export const NodeAttributes: Story = {
  name: '7. Node Attributes',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Portal Node Attributes</h3>
      <p style={note}>
        When Portal creates its own node, you can pass <code>className</code>,
        <code> style</code>, and <code>id</code> to customize the wrapper.
        Inspect the DOM to see <code>data-portal</code> nodes with these attributes.
      </p>

      <Portal
        reuseTargetNode={false}
        className="my-portal-class"
        id="my-portal-id"
        style={{ zIndex: 9999 }}
      >
        <div style={{ ...portalContent, position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
          Portal with className="my-portal-class" id="my-portal-id" style.zIndex=9999
        </div>
      </Portal>

      <div style={inlineBox}>
        <p style={{ margin: 0 }}>
          Open DevTools → look for <code>#my-portal-id.my-portal-class[data-portal]</code>
        </p>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story 8: OptionalPortal
// ---------------------------------------------------------------------------

function OptionalPortalDemo() {
  const [withinPortal, setWithinPortal] = useState(true);

  return (
    <div style={card}>
      <h3 style={sectionTitle}>OptionalPortal</h3>
      <p style={note}>
        Convenience wrapper: <code>withinPortal=true</code> → renders in Portal;
        <code> withinPortal=false</code> → renders in-place.
        Used by Modal, Popover, Tooltip etc. for opt-out.
      </p>

      <button
        onClick={() => setWithinPortal((v) => !v)}
        style={{
          padding: '8px 16px', marginBottom: 12, cursor: 'pointer',
          background: withinPortal ? '#dbeafe' : '#fee2e2',
          border: `1px solid ${withinPortal ? '#3b82f6' : '#ef4444'}`,
          borderRadius: 6, fontSize: 13, fontWeight: 600,
        }}
      >
        withinPortal = {String(withinPortal)} (click to toggle)
      </button>

      <div style={inlineBox}>
        <p style={{ margin: '0 0 8px' }}>Parent container:</p>
        <OptionalPortal withinPortal={withinPortal} reuseTargetNode={false}>
          <div style={portalContent}>
            {withinPortal
              ? '🌀 Rendered via PORTAL (withinPortal=true)'
              : '📍 Rendered IN-PLACE (withinPortal=false)'}
          </div>
        </OptionalPortal>
      </div>
    </div>
  );
}

export const OptionalPortalStory: Story = {
  name: '8. OptionalPortal',
  render: () => <OptionalPortalDemo />,
};

// ---------------------------------------------------------------------------
// Story 9: API Reference
// ---------------------------------------------------------------------------

export const ApiReference: Story = {
  name: '9. API Reference',
  render: () => (
    <div style={card}>
      <h3 style={sectionTitle}>Portal API Reference</h3>
      <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Prop</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Type</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Default</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Source</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['children', 'ReactNode', '—', '—', 'Content to render in the portal'],
            ['target', 'HTMLElement | string | () => HTMLElement', 'document.body', 'Mantine + MUI', 'Target container (element, CSS selector, or callback)'],
            ['disablePortal', 'boolean', 'false', 'MUI', 'Render children in-place instead of portal'],
            ['reuseTargetNode', 'boolean', 'true', 'Mantine', 'Share a single portal node across instances'],
            ['className', 'string', '—', 'Mantine', 'CSS class on the created portal node'],
            ['style', 'CSSProperties', '—', 'Mantine', 'Inline styles on the created portal node'],
            ['id', 'string', '—', 'Mantine', 'HTML id on the created portal node'],
            ['ref', 'Ref<HTMLElement>', '—', 'Mantine', 'Ref forwarded to the resolved portal node'],
          ].map(([prop, type, def, source, desc], i) => (
            <tr key={i}>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{prop}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{type}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 12 }}>{def}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>{source}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ fontSize: 13, fontWeight: 600, margin: '20px 0 8px', color: '#6b7280' }}>OptionalPortal</h4>
      <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Prop</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Type</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Default</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>withinPortal</td>
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>boolean</td>
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 12 }}>true</td>
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>When false, renders children in-place (no Portal)</td>
          </tr>
          <tr>
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>...PortalProps</td>
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>—</td>
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 12 }}>—</td>
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>All Portal props are passed through</td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};
