import { useModal } from '@prismui/react';

export function ConfirmModal() {
  const { close } = useModal();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '24px',
        width: 360,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ margin: '0 0 8px' }}>Confirm Action</h3>
        <p style={{ color: '#666', margin: '0 0 20px' }}>
          Are you sure you want to proceed? This modal was opened via the Modal module controller.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => close('confirm')}
            style={{
              padding: '6px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => close('confirm')}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderRadius: '4px',
              background: '#333',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
