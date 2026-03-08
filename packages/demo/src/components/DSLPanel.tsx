import { useState } from 'react';
import { useUI } from '@prismui/react';

export function DSLPanel() {
  const ui = useUI();
  const [confirmResult, setConfirmResult] = useState<string>('—');

  const handleConfirm = async () => {
    setConfirmResult('waiting...');
    const result = await ui.confirm('confirm');
    setConfirmResult(result ? 'Confirmed ✓' : 'Cancelled ✗');
  };

  return (
    <div>
      <h4 style={{ margin: '0 0 8px' }}>Stage-6: Interaction DSL</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        <button onClick={() => ui.modal.open('confirm')} style={btnStyle}>ui.modal.open</button>
        <button onClick={() => ui.modal.closeAll()} style={btnStyle}>ui.modal.closeAll</button>
        <button onClick={() => ui.notify.info('Hello from DSL!')} style={btnStyle}>ui.notify.info</button>
        <button onClick={() => ui.notify.success('Saved!')} style={btnStyle}>ui.notify.success</button>
        <button onClick={() => ui.notify.error('Oops!')} style={btnStyle}>ui.notify.error</button>
        <button onClick={() => ui.notify.dismissAll()} style={btnStyle}>ui.notify.dismissAll</button>
        <button onClick={handleConfirm} style={btnStyle}>ui.confirm</button>
      </div>
      <div style={{ fontSize: '12px' }}>
        <b>confirm result:</b> {confirmResult}
      </div>
      <div style={{ fontSize: '11px', marginTop: 4, color: '#666' }}>
        DSL is pure delegation — zero new state/events
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '2px 8px',
  fontSize: '11px',
  cursor: 'pointer',
};
