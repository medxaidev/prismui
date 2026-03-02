import { usePage, useModal } from '@prismui/react';

export function Dashboard() {
  const { isLocked, lock, unlock, mount, transition } = usePage();
  const { open } = useModal();

  function handleGoToPatient() {
    mount('PatientDetail');
    transition('PatientDetail');
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p style={{ color: '#666' }}>
        This is the main dashboard page. Use the buttons below to interact with the runtime.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: 280 }}>
        <button
          onClick={handleGoToPatient}
          disabled={isLocked}
          style={btnStyle(isLocked)}
        >
          Go to Patient Detail
        </button>

        <button
          onClick={() => open('confirm')}
          style={btnStyle(false)}
        >
          Open Confirm Modal
        </button>

        {!isLocked ? (
          <button onClick={lock} style={btnStyle(false)}>
            Lock Page
          </button>
        ) : (
          <button onClick={unlock} style={btnStyle(false)}>
            Unlock Page
          </button>
        )}
      </div>

      {isLocked && (
        <p style={{
          marginTop: '16px',
          padding: '8px 12px',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          fontWeight: 600,
        }}>
          LOCKED — Navigation is disabled
        </p>
      )}
    </div>
  );
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '8px 16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: disabled ? '#e9ecef' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    textAlign: 'left',
  };
}
