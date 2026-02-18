import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { ModalBase } from './ModalBase';
import { ModalBaseOverlay } from './ModalBaseOverlay';
import { ModalBaseContent } from './ModalBaseContent';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const btnStyle: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  background: '#1976d2',
  color: '#fff',
};

const secondaryBtn: React.CSSProperties = {
  ...btnStyle,
  background: '#e0e0e0',
  color: '#333',
};

const contentStyle: React.CSSProperties = {
  padding: 24,
  minWidth: 360,
  maxWidth: 480,
};

// ---------------------------------------------------------------------------
// Provider wrapper
// ---------------------------------------------------------------------------

function Wrapper({ children }: { children: React.ReactNode }) {
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
  title: 'Components/ModalBase',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// 1. Basic Modal — open/close with overlay + content
// ============================================================================

function BasicModalDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Basic ModalBase</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Demonstrates the fundamental ModalBase with overlay backdrop and content panel.
        Click the backdrop or press <kbd>Escape</kbd> to close.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Modal</button>

      <ModalBase
        opened={opened}
        onClose={() => setOpened(false)}
        overlaySlot={<ModalBaseOverlay />}
      >
        <ModalBaseContent shadow="xl" radius="md">
          <div style={contentStyle}>
            <h3 style={{ margin: '0 0 8px' }}>Basic Modal</h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
              This is a basic ModalBase with an overlay backdrop and a Paper-based content area.
              It integrates with the Overlay Runtime for z-index management and escape key handling.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button style={btnStyle} onClick={() => setOpened(false)}>Close</button>
            </div>
          </div>
        </ModalBaseContent>
      </ModalBase>
    </div>
  );
}

export const BasicModal: Story = {
  name: 'Basic Modal',
  render: () => (
    <Wrapper>
      <BasicModalDemo />
    </Wrapper>
  ),
};

// ============================================================================
// 2. Nested Modals — stacked z-index behavior
// ============================================================================

function NestedModalContent({ level, onClose }: { level: number; onClose: () => void }) {
  const [childOpened, setChildOpened] = useState(false);
  const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f'];
  const color = colors[level % colors.length];

  return (
    <>
      <ModalBase
        opened
        onClose={onClose}
        overlaySlot={<ModalBaseOverlay backgroundOpacity={0.3} />}
      >
        <ModalBaseContent shadow="xl" radius="md">
          <div style={{ ...contentStyle, borderTop: `4px solid ${color}` }}>
            <h3 style={{ margin: '0 0 8px', color }}>Modal Level {level + 1}</h3>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
              Each nested modal gets its own z-index from the OverlayManager.
              Escape closes only the topmost modal.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {level < 3 && (
                <button style={btnStyle} onClick={() => setChildOpened(true)}>
                  Open Level {level + 2}
                </button>
              )}
              <button style={secondaryBtn} onClick={onClose}>Close</button>
            </div>
          </div>
        </ModalBaseContent>
      </ModalBase>
      {childOpened && (
        <NestedModalContent level={level + 1} onClose={() => setChildOpened(false)} />
      )}
    </>
  );
}

function NestedModalsDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Nested Modals</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Open multiple levels of modals. Each gets a unique z-index.
        Pressing <kbd>Escape</kbd> closes only the topmost modal.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open First Modal</button>
      {opened && <NestedModalContent level={0} onClose={() => setOpened(false)} />}
    </div>
  );
}

export const NestedModals: Story = {
  name: 'Nested Modals',
  render: () => (
    <Wrapper>
      <NestedModalsDemo />
    </Wrapper>
  ),
};

// ============================================================================
// 3. No Escape Close — closeOnEscape=false
// ============================================================================

function NoEscapeDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Escape Disabled</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        This modal has <code>closeOnEscape=false</code>. You must use the close button.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Modal</button>

      <ModalBase
        opened={opened}
        onClose={() => setOpened(false)}
        closeOnEscape={false}
        overlaySlot={<ModalBaseOverlay />}
      >
        <ModalBaseContent shadow="xl" radius="md">
          <div style={contentStyle}>
            <h3 style={{ margin: '0 0 8px' }}>Escape Disabled</h3>
            <p style={{ fontSize: 14, color: '#666' }}>
              Pressing Escape will <strong>not</strong> close this modal.
              Use the button below.
            </p>
            <button style={btnStyle} onClick={() => setOpened(false)}>Close</button>
          </div>
        </ModalBaseContent>
      </ModalBase>
    </div>
  );
}

export const EscapeDisabled: Story = {
  name: 'Escape Disabled',
  render: () => (
    <Wrapper>
      <NoEscapeDemo />
    </Wrapper>
  ),
};

// ============================================================================
// 4. No Click Outside Close
// ============================================================================

function NoClickOutsideDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Click Outside Disabled</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        This modal has <code>closeOnClickOutside=false</code>.
        Clicking the backdrop will not close it.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Modal</button>

      <ModalBase
        opened={opened}
        onClose={() => setOpened(false)}
        closeOnClickOutside={false}
        overlaySlot={<ModalBaseOverlay />}
      >
        <ModalBaseContent shadow="xl" radius="md">
          <div style={contentStyle}>
            <h3 style={{ margin: '0 0 8px' }}>Click Outside Disabled</h3>
            <p style={{ fontSize: 14, color: '#666' }}>
              Clicking the backdrop will <strong>not</strong> close this modal.
              Press Escape or use the button.
            </p>
            <button style={btnStyle} onClick={() => setOpened(false)}>Close</button>
          </div>
        </ModalBaseContent>
      </ModalBase>
    </div>
  );
}

export const ClickOutsideDisabled: Story = {
  name: 'Click Outside Disabled',
  render: () => (
    <Wrapper>
      <NoClickOutsideDemo />
    </Wrapper>
  ),
};

// ============================================================================
// 5. Inline (No Portal)
// ============================================================================

function InlineDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Inline (No Portal)</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        This modal uses <code>withinPortal=false</code> and renders in-place in the DOM.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Inline Modal</button>

      <div style={{ position: 'relative', marginTop: 12, minHeight: 200, border: '2px dashed #ccc', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Parent container (modal renders here)</div>
        <ModalBase
          opened={opened}
          onClose={() => setOpened(false)}
          withinPortal={false}
          overlaySlot={<ModalBaseOverlay />}
        >
          <ModalBaseContent shadow="xl" radius="md">
            <div style={contentStyle}>
              <h3 style={{ margin: '0 0 8px' }}>Inline Modal</h3>
              <p style={{ fontSize: 14, color: '#666' }}>
                This modal is rendered inside its parent container, not in a portal.
              </p>
              <button style={btnStyle} onClick={() => setOpened(false)}>Close</button>
            </div>
          </ModalBaseContent>
        </ModalBase>
      </div>
    </div>
  );
}

export const InlineNoPortal: Story = {
  name: 'Inline (No Portal)',
  render: () => (
    <Wrapper>
      <InlineDemo />
    </Wrapper>
  ),
};
