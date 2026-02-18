import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PrismuiProvider } from '../../PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../overlay/overlayModule';
import { dialogModule } from './dialogModule';
import { useDialogController } from './useDialogController';
import { DialogRenderer } from './DialogRenderer';

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
    <PrismuiProvider
      withCssVars={false}
      withCssBaseline={false}
      modules={[overlayModule(), dialogModule()]}
    >
      {children}
      <DialogRenderer />
    </PrismuiProvider>
  );
}

// ============================================================================
// Meta
// ============================================================================

const meta: Meta = {
  title: 'Runtime/DialogController',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// 1. Programmatic confirm()
// ============================================================================

function ConfirmDemo() {
  const dialog = useDialogController();
  const [result, setResult] = useState<string>('—');

  const handleDelete = async () => {
    const confirmed = await dialog.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep',
    });
    setResult(confirmed ? 'Deleted!' : 'Cancelled');
  };

  return (
    <div>
      <h3>Programmatic confirm()</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Uses <code>dialog.confirm()</code> which returns a <code>Promise&lt;boolean&gt;</code>.
        The dialog is rendered by <code>DialogRenderer</code>.
      </p>
      <button style={dangerBtn} onClick={handleDelete}>Delete Item</button>
      <p style={{ fontSize: 14, marginTop: 12 }}>
        Result: <strong>{result}</strong>
      </p>
    </div>
  );
}

export const Confirm: Story = {
  name: 'Programmatic confirm()',
  render: () => <Wrapper><ConfirmDemo /></Wrapper>,
};

// ============================================================================
// 2. Programmatic alert()
// ============================================================================

function AlertDemo() {
  const dialog = useDialogController();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAlert = async () => {
    await dialog.alert({
      title: 'Notice',
      content: 'Your session will expire in 5 minutes. Please save your work.',
      confirmText: 'Got it',
    });
    setAcknowledged(true);
  };

  return (
    <div>
      <h3>Programmatic alert()</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Uses <code>dialog.alert()</code> which returns a <code>Promise&lt;void&gt;</code>.
        Only has an OK button, no cancel.
      </p>
      <button style={btnStyle} onClick={handleAlert}>Show Alert</button>
      {acknowledged && <p style={{ fontSize: 13, color: '#388e3c', marginTop: 8 }}>Acknowledged!</p>}
    </div>
  );
}

export const Alert: Story = {
  name: 'Programmatic alert()',
  render: () => <Wrapper><AlertDemo /></Wrapper>,
};

// ============================================================================
// 3. Open / Close manually
// ============================================================================

function OpenCloseDemo() {
  const dialog = useDialogController();
  const [dialogId, setDialogId] = useState<string | null>(null);

  const handleOpen = () => {
    const id = dialog.open({
      title: 'Manual Dialog',
      content: 'This dialog was opened with dialog.open() and can be closed with dialog.close(id).',
    });
    setDialogId(id);
  };

  const handleClose = () => {
    if (dialogId) {
      dialog.close(dialogId);
      setDialogId(null);
    }
  };

  return (
    <div>
      <h3>Manual open() / close()</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Uses <code>dialog.open()</code> and <code>dialog.close(id)</code> for manual control.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle} onClick={handleOpen} disabled={!!dialogId}>Open</button>
        <button style={secondaryBtn} onClick={handleClose} disabled={!dialogId}>Close</button>
      </div>
      {dialogId && <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>Dialog ID: {dialogId}</p>}
    </div>
  );
}

export const OpenClose: Story = {
  name: 'Manual open/close',
  render: () => <Wrapper><OpenCloseDemo /></Wrapper>,
};

// ============================================================================
// 4. Multiple dialogs
// ============================================================================

function MultipleDialogsDemo() {
  const dialog = useDialogController();

  const openMultiple = () => {
    dialog.open({ title: 'Dialog 1', content: 'First dialog in the stack.' });
    dialog.open({ title: 'Dialog 2', content: 'Second dialog, stacked on top.' });
  };

  return (
    <div>
      <h3>Multiple Dialogs</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Open multiple programmatic dialogs at once. Each gets its own z-index.
        Use <code>closeAll()</code> to dismiss them all.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle} onClick={openMultiple}>Open Two Dialogs</button>
        <button style={secondaryBtn} onClick={() => dialog.closeAll()}>Close All</button>
      </div>
    </div>
  );
}

export const MultipleDialogs: Story = {
  name: 'Multiple Dialogs',
  render: () => <Wrapper><MultipleDialogsDemo /></Wrapper>,
};

// ============================================================================
// 5. Chained confirms
// ============================================================================

function ChainedDemo() {
  const dialog = useDialogController();
  const [log, setLog] = useState<string[]>([]);

  const handleChain = async () => {
    setLog([]);

    const step1 = await dialog.confirm({
      title: 'Step 1 of 3',
      content: 'Do you want to proceed to step 2?',
      confirmText: 'Next',
    });

    if (!step1) {
      setLog((prev) => [...prev, 'Cancelled at step 1']);
      return;
    }
    setLog((prev) => [...prev, 'Step 1: confirmed']);

    const step2 = await dialog.confirm({
      title: 'Step 2 of 3',
      content: 'Almost there. Continue to the final step?',
      confirmText: 'Next',
    });

    if (!step2) {
      setLog((prev) => [...prev, 'Cancelled at step 2']);
      return;
    }
    setLog((prev) => [...prev, 'Step 2: confirmed']);

    await dialog.alert({
      title: 'Step 3 of 3',
      content: 'All steps completed successfully!',
      confirmText: 'Finish',
    });

    setLog((prev) => [...prev, 'Step 3: done!']);
  };

  return (
    <div>
      <h3>Chained Confirms</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Sequential <code>confirm()</code> calls using <code>await</code>.
        Each step waits for the previous one to resolve.
      </p>
      <button style={btnStyle} onClick={handleChain}>Start Wizard</button>
      {log.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 13, fontFamily: 'monospace' }}>
          {log.map((entry, i) => (
            <div key={i} style={{ color: entry.includes('Cancelled') ? '#d32f2f' : '#388e3c' }}>
              {entry}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const ChainedConfirms: Story = {
  name: 'Chained Confirms',
  render: () => <Wrapper><ChainedDemo /></Wrapper>,
};
