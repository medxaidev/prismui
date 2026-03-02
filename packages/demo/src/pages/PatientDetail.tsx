import { usePage } from '@prismui/react';

export function PatientDetail() {
  const { transition, mount, isLocked } = usePage();

  function handleBack() {
    mount('Dashboard');
    transition('Dashboard');
  }

  return (
    <div>
      <h2>Patient Detail</h2>
      <p style={{ color: '#666' }}>
        Viewing patient record. This page was mounted via the Page module controller.
      </p>

      <div style={{
        padding: '16px',
        background: '#f8f9fa',
        borderRadius: '4px',
        marginBottom: '16px',
      }}>
        <p style={{ margin: 0 }}><b>Patient ID:</b> P-2024-001</p>
        <p style={{ margin: '4px 0 0' }}><b>Name:</b> Zhang Wei</p>
        <p style={{ margin: '4px 0 0' }}><b>Status:</b> Active</p>
      </div>

      <button
        onClick={handleBack}
        disabled={isLocked}
        style={{
          padding: '8px 16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: isLocked ? '#e9ecef' : '#fff',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          fontSize: '14px',
        }}
      >
        ← Back to Dashboard
      </button>

      {isLocked && (
        <p style={{
          marginTop: '12px',
          color: '#856404',
          fontSize: '13px',
        }}>
          Navigation locked — unlock from Dashboard first.
        </p>
      )}
    </div>
  );
}
