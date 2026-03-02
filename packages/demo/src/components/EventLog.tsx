import { useRuntimeState } from '@prismui/react';
import { eventEntries } from '../setup';

export function EventLog() {
  // Subscribe to state so we re-render on every change
  useRuntimeState();

  return (
    <div>
      <h3 style={{ margin: '0 0 12px' }}>Event History</h3>
      {eventEntries.length === 0 ? (
        <p style={{ color: '#999', fontSize: '13px' }}>No events yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[...eventEntries].reverse().map((entry, i) => (
            <div
              key={`${entry.event.type}-${entry.event.timestamp}-${i}`}
              style={{
                padding: '6px 8px',
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
            >
              <div style={{ fontWeight: 600, color: getEventColor(entry.event.type) }}>
                {entry.event.type}
              </div>
              <div style={{ color: '#999', marginTop: '2px' }}>
                {new Date(entry.event.timestamp).toLocaleTimeString()}
                {' · '}
                <span style={{ color: '#555' }}>
                  v{entry.prevVersion} → v{entry.nextVersion}
                </span>
              </div>
              {entry.event.payload != null && (
                <div style={{ color: '#aaa', marginTop: '1px', fontSize: '11px' }}>
                  {JSON.stringify(entry.event.payload)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getEventColor(type: string): string {
  if (type.startsWith('PAGE_')) return '#0d6efd';
  if (type.startsWith('MODAL_')) return '#6f42c1';
  if (type === 'SYSTEM_ERROR') return '#dc3545';
  return '#333';
}
