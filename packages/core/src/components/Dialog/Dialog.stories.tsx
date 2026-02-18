import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { Dialog } from './Dialog';
import { DialogHeader } from './DialogHeader';
import { DialogTitle } from './DialogTitle';
import { DialogBody } from './DialogBody';
import { DialogFooter } from './DialogFooter';
import { DialogCloseButton } from './DialogCloseButton';

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

const dangerBtn: React.CSSProperties = {
  ...btnStyle,
  background: '#d32f2f',
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
  title: 'Components/Dialog',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// 1. Basic Dialog
// ============================================================================

function BasicDialogDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Basic Dialog</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        A simple dialog with title, body content, and a close button.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Dialog</button>

      <Dialog opened={opened} onClose={() => setOpened(false)} title="Welcome">
        <p style={{ fontSize: 16, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This is a basic Dialog component built on top of ModalBase.
          It provides semantic structure with a header, body, and optional footer.
        </p>
      </Dialog>
    </div>
  );
}

export const BasicDialog: Story = {
  name: 'Basic Dialog',
  render: () => <Wrapper><BasicDialogDemo /></Wrapper>,
};

// ============================================================================
// 2. Confirmation Dialog
// ============================================================================

function ConfirmDialogDemo() {
  const [opened, setOpened] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  return (
    <div>
      <h3>Confirmation Dialog</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        A dialog with confirm/cancel actions in the footer.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Delete Item</button>
      {result && <p style={{ fontSize: 13, marginTop: 8, color: result === 'confirmed' ? '#388e3c' : '#999' }}>Result: {result}</p>}

      <Dialog opened={opened} onClose={() => setOpened(false)} title="Confirm Deletion" closeOnClickOutside={false}>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
        <DialogFooter>
          <button style={secondaryBtn} onClick={() => { setResult('cancelled'); setOpened(false); }}>
            Cancel
          </button>
          <button style={dangerBtn} onClick={() => { setResult('confirmed'); setOpened(false); }}>
            Delete
          </button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export const ConfirmDialog: Story = {
  name: 'Confirmation Dialog',
  render: () => <Wrapper><ConfirmDialogDemo /></Wrapper>,
};

// ============================================================================
// 3. Centered Dialog
// ============================================================================

function CenteredDialogDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Centered Dialog</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Dialog with <code>centered</code> prop — vertically centered in the viewport.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Centered</button>

      <Dialog opened={opened} onClose={() => setOpened(false)} title="Centered Dialog" centered>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This dialog is vertically centered in the viewport instead of offset from the top.
        </p>
      </Dialog>
    </div>
  );
}

export const CenteredDialog: Story = {
  name: 'Centered',
  render: () => <Wrapper><CenteredDialogDemo /></Wrapper>,
};

// ============================================================================
// 4. Full Screen Dialog
// ============================================================================

function FullScreenDialogDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Full Screen Dialog</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Dialog with <code>fullScreen</code> prop — takes up the entire viewport.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Full Screen</button>

      <Dialog opened={opened} onClose={() => setOpened(false)} title="Full Screen Dialog" fullScreen>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This dialog takes up the entire viewport. Useful for complex forms or content
          that needs maximum screen real estate.
        </p>
        <DialogFooter>
          <button style={btnStyle} onClick={() => setOpened(false)}>Done</button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export const FullScreenDialog: Story = {
  name: 'Full Screen',
  render: () => <Wrapper><FullScreenDialogDemo /></Wrapper>,
};

// ============================================================================
// 5. Custom Size
// ============================================================================

function CustomSizeDemo() {
  const [size, setSize] = useState<number | string>(440);
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Custom Size</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Dialog width can be set with the <code>size</code> prop (number in px or string).
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button style={size === 320 ? btnStyle : secondaryBtn} onClick={() => setSize(320)}>320px</button>
        <button style={size === 440 ? btnStyle : secondaryBtn} onClick={() => setSize(440)}>440px (default)</button>
        <button style={size === 640 ? btnStyle : secondaryBtn} onClick={() => setSize(640)}>640px</button>
        <button style={size === '80%' ? btnStyle : secondaryBtn} onClick={() => setSize('80%')}>80%</button>
      </div>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Dialog (size: {String(size)})</button>

      <Dialog opened={opened} onClose={() => setOpened(false)} title={`Size: ${size}`} size={size}>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This dialog has a custom width of <strong>{String(size)}</strong>.
        </p>
      </Dialog>
    </div>
  );
}

export const CustomSize: Story = {
  name: 'Custom Size',
  render: () => <Wrapper><CustomSizeDemo /></Wrapper>,
};

// ============================================================================
// 6. Compound Components
// ============================================================================

function CompoundDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Compound Components</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Use <code>Dialog.Header</code>, <code>Dialog.Title</code>, <code>Dialog.Body</code>,
        <code>Dialog.Footer</code>, and <code>Dialog.CloseButton</code> for full control.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Compound Dialog</button>

      <Dialog opened={opened} onClose={() => setOpened(false)} withCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Custom Layout</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogBody>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
            This dialog uses compound components for full layout control.
            The header, body, and footer are composed individually.
          </p>
        </DialogBody>
        <DialogFooter>
          <button style={secondaryBtn} onClick={() => setOpened(false)}>Cancel</button>
          <button style={btnStyle} onClick={() => setOpened(false)}>Save</button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export const CompoundComponents: Story = {
  name: 'Compound Components',
  render: () => <Wrapper><CompoundDemo /></Wrapper>,
};

// ============================================================================
// 7. Nested Dialogs
// ============================================================================

function NestedDialogsDemo() {
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);

  return (
    <div>
      <h3>Nested Dialogs</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Dialogs can be nested. Each gets its own z-index from the OverlayManager.
        Escape closes only the topmost dialog.
      </p>
      <button style={btnStyle} onClick={() => setFirst(true)}>Open First Dialog</button>

      <Dialog opened={first} onClose={() => setFirst(false)} title="First Dialog">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This is the first dialog. Open another one on top.
        </p>
        <DialogFooter>
          <button style={btnStyle} onClick={() => setSecond(true)}>Open Second</button>
        </DialogFooter>
      </Dialog>

      <Dialog opened={second} onClose={() => setSecond(false)} title="Second Dialog" size={360} centered>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This is the second dialog, stacked on top. Press Escape to close only this one.
        </p>
      </Dialog>
    </div>
  );
}

export const NestedDialogs: Story = {
  name: 'Nested Dialogs',
  render: () => <Wrapper><NestedDialogsDemo /></Wrapper>,
};
