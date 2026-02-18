import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PrismuiProvider } from '../../PrismuiProvider/PrismuiProvider';
import { overlayModule } from './overlayModule';
import { useOverlay } from './useOverlay';
import { useOverlayManager } from './useOverlayManager';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const cardStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

const btnStyle: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: 6,
  border: '1px solid #ccc',
  cursor: 'pointer',
  fontSize: 13,
  background: '#fff',
};

const primaryBtn: React.CSSProperties = {
  ...btnStyle,
  background: '#1976d2',
  color: '#fff',
  border: 'none',
};

const overlayBackdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const overlayContent: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 24,
  minWidth: 320,
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
};

const codeStyle: React.CSSProperties = {
  background: '#1e1e2e',
  color: '#cdd6f4',
  padding: 12,
  borderRadius: 8,
  fontSize: 12,
  lineHeight: 1.6,
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
};

// ---------------------------------------------------------------------------
// Provider wrapper
// ---------------------------------------------------------------------------

function OverlayProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
      {children}
    </PrismuiProvider>
  );
}

// ============================================================================
// Meta
// ============================================================================

const meta: Meta = {
  title: 'Core/OverlayRuntime',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// 1. Single Overlay — basic open/close with z-index
// ============================================================================

function SimpleOverlay({ onClose }: { onClose: () => void }) {
  const { zIndex } = useOverlay({ opened: true, onClose });

  return (
    <div style={{ ...overlayBackdrop, zIndex }} onClick={onClose}>
      <div style={overlayContent} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 12px' }}>Overlay</h3>
        <div style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 12 }}>
          z-index: {zIndex}
        </div>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
          Press <kbd>Escape</kbd> or click the backdrop to close.
        </p>
        <button style={btnStyle} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function SingleOverlayDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <h3>Single Overlay</h3>
      <p style={{ fontSize: 13, color: '#666' }}>
        Demonstrates basic overlay registration with the OverlayManager.
        The overlay gets a z-index from the stack and responds to Escape.
      </p>
      <button style={primaryBtn} onClick={() => setOpen(true)}>Open Overlay</button>
      {open && <SimpleOverlay onClose={() => setOpen(false)} />}
    </div>
  );
}

export const SingleOverlay: Story = {
  name: 'Single Overlay',
  render: () => (
    <OverlayProvider>
      <SingleOverlayDemo />
    </OverlayProvider>
  ),
};

// ============================================================================
// 2. Nested Overlays — stacked z-index + escape closes topmost
// ============================================================================

function NestedOverlay({
  level,
  onClose,
  onOpenNext,
}: {
  level: number;
  onClose: () => void;
  onOpenNext?: () => void;
}) {
  const { zIndex, isActive } = useOverlay({ opened: true, onClose });
  const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f'];
  const color = colors[level % colors.length];

  return (
    <div style={{ ...overlayBackdrop, zIndex }} onClick={onClose}>
      <div
        style={{
          ...overlayContent,
          borderTop: `4px solid ${color}`,
          transform: `translate(${level * 20}px, ${level * 20}px)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 8px', color }}>Overlay Level {level + 1}</h3>
        <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8 }}>
          <div>z-index: <strong>{zIndex}</strong></div>
          <div>isActive: <strong>{String(isActive)}</strong></div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {onOpenNext && (
            <button style={primaryBtn} onClick={onOpenNext}>
              Open Level {level + 2}
            </button>
          )}
          <button style={btnStyle} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function NestedOverlaysDemo() {
  const [levels, setLevels] = useState<number[]>([]);

  const openNext = () => setLevels((prev) => [...prev, prev.length]);
  const closeLast = () => setLevels((prev) => prev.slice(0, -1));

  return (
    <div>
      <h3>Nested Overlays</h3>
      <p style={{ fontSize: 13, color: '#666' }}>
        Each overlay gets an incrementing z-index. Pressing <kbd>Escape</kbd> closes
        only the topmost overlay. Open multiple levels to see the stack in action.
      </p>
      <button style={primaryBtn} onClick={openNext}>Open First Overlay</button>
      {levels.map((level, i) => (
        <NestedOverlay
          key={level}
          level={level}
          onClose={closeLast}
          onOpenNext={i === levels.length - 1 && levels.length < 4 ? openNext : undefined}
        />
      ))}
    </div>
  );
}

export const NestedOverlays: Story = {
  name: 'Nested Overlays (Stack)',
  render: () => (
    <OverlayProvider>
      <NestedOverlaysDemo />
    </OverlayProvider>
  ),
};

// ============================================================================
// 3. Stack Inspector — real-time view of the overlay stack
// ============================================================================

function StackInspector() {
  const manager = useOverlayManager();
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate((n) => n + 1);

  const stack = manager.getStack();
  const active = manager.getActive();

  return (
    <div style={cardStyle}>
      <h4 style={{ margin: '0 0 8px' }}>Stack Inspector</h4>
      <button style={{ ...btnStyle, marginBottom: 8, fontSize: 11 }} onClick={refresh}>
        Refresh
      </button>
      <div style={codeStyle}>
        <div>stackSize: {stack.length}</div>
        <div>shouldLockScroll: {String(manager.shouldLockScroll())}</div>
        <div>active: {active?.id ?? 'none'}</div>
        <div style={{ marginTop: 8 }}>
          {stack.length === 0
            ? '(empty stack)'
            : stack.map((item, i) => (
              <div key={item.id}>
                [{i}] id={item.id} z={item.zIndex} esc={String(item.closeOnEscape)} scroll={String(item.lockScroll)}
                {item.id === active?.id ? ' ← ACTIVE' : ''}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function StackInspectorDemo() {
  const [overlays, setOverlays] = useState<string[]>([]);

  const addOverlay = () => {
    const id = `overlay-${Date.now()}`;
    setOverlays((prev) => [...prev, id]);
  };

  const removeOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o !== id));
  };

  return (
    <div>
      <h3>Stack Inspector</h3>
      <p style={{ fontSize: 13, color: '#666' }}>
        Real-time view of the OverlayManager stack. Add/remove overlays to see
        z-index allocation and stack state changes.
      </p>
      <button style={primaryBtn} onClick={addOverlay}>Add Overlay</button>
      <StackInspector />
      {overlays.map((id) => (
        <InspectedOverlay key={id} overlayId={id} onClose={() => removeOverlay(id)} />
      ))}
    </div>
  );
}

function InspectedOverlay({ overlayId, onClose }: { overlayId: string; onClose: () => void }) {
  const { zIndex } = useOverlay({ opened: true, onClose });
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex,
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: 12,
        fontFamily: 'monospace',
      }}
    >
      <div>{overlayId} (z: {zIndex})</div>
      <button style={{ ...btnStyle, fontSize: 11, marginTop: 4 }} onClick={onClose}>
        Close
      </button>
    </div>
  );
}

export const StackInspectorStory: Story = {
  name: 'Stack Inspector',
  render: () => (
    <OverlayProvider>
      <StackInspectorDemo />
    </OverlayProvider>
  ),
};

// ============================================================================
// 4. Escape Key Behavior — demonstrates closeOnEscape option
// ============================================================================

function EscapeOverlay({
  label,
  closeOnEscape,
  onClose,
}: {
  label: string;
  closeOnEscape: boolean;
  onClose: () => void;
}) {
  const { zIndex } = useOverlay({ opened: true, onClose, closeOnEscape });

  return (
    <div style={{ ...overlayBackdrop, zIndex }}>
      <div style={overlayContent} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 8px' }}>{label}</h3>
        <div style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 12 }}>
          closeOnEscape: <strong>{String(closeOnEscape)}</strong>
        </div>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
          {closeOnEscape
            ? 'Press Escape to close this overlay.'
            : 'Escape key is disabled for this overlay. Use the button.'}
        </p>
        <button style={btnStyle} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function EscapeDemo() {
  const [mode, setMode] = useState<'enabled' | 'disabled' | null>(null);

  return (
    <div>
      <h3>Escape Key Behavior</h3>
      <p style={{ fontSize: 13, color: '#666' }}>
        Compare overlays with <code>closeOnEscape: true</code> vs <code>false</code>.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={primaryBtn} onClick={() => setMode('enabled')}>
          Open (Escape enabled)
        </button>
        <button style={btnStyle} onClick={() => setMode('disabled')}>
          Open (Escape disabled)
        </button>
      </div>
      {mode === 'enabled' && (
        <EscapeOverlay label="Escape Enabled" closeOnEscape={true} onClose={() => setMode(null)} />
      )}
      {mode === 'disabled' && (
        <EscapeOverlay label="Escape Disabled" closeOnEscape={false} onClose={() => setMode(null)} />
      )}
    </div>
  );
}

export const EscapeKeyBehavior: Story = {
  name: 'Escape Key Behavior',
  render: () => (
    <OverlayProvider>
      <EscapeDemo />
    </OverlayProvider>
  ),
};

// ============================================================================
// 5. Custom Base Z-Index — demonstrates overlayModule options
// ============================================================================

function ZIndexDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <h3>Custom Base Z-Index (5000)</h3>
      <p style={{ fontSize: 13, color: '#666' }}>
        This provider uses <code>overlayModule({'{'} baseZIndex: 5000 {'}'})</code>.
        Overlays start at z-index 5000 instead of the default 1000.
      </p>
      <button style={primaryBtn} onClick={() => setOpen(true)}>Open Overlay</button>
      {open && <SimpleOverlay onClose={() => setOpen(false)} />}
    </div>
  );
}

export const CustomBaseZIndex: Story = {
  name: 'Custom Base Z-Index',
  render: () => (
    <PrismuiProvider
      withCssVars={false}
      withCssBaseline={false}
      modules={[overlayModule({ baseZIndex: 5000 })]}
    >
      <ZIndexDemo />
    </PrismuiProvider>
  ),
};
