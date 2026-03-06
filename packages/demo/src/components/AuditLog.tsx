import { useState, useEffect } from 'react';
import { audit } from '../setup';
import { useRuntimeState } from '@prismui/react';
import type { AuditEntry } from '@prismui/core';

export function AuditLog() {
  const state = useRuntimeState();
  const [entries, setEntries] = useState<readonly AuditEntry[]>([]);

  // Refresh entries whenever state changes (new events processed)
  useEffect(() => {
    setEntries(audit.getLatest(20));
  }, [state.version]);

  return (
    <div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 14 }}>
        Audit Trail ({audit.size()} entries)
      </h3>
      <div style={{ fontSize: 12, fontFamily: 'monospace', maxHeight: 300, overflow: 'auto' }}>
        {entries.length === 0 && <div style={{ color: '#999' }}>No entries yet</div>}
        {[...entries].reverse().map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: '4px 6px',
              marginBottom: 2,
              background: entry.nextState === null ? '#fff0f0' : '#f0fff0',
              borderLeft: `3px solid ${entry.nextState === null ? '#f44' : '#4a4'}`,
              borderRadius: 2,
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {entry.event.type}
              {entry.policyResult?.verdict === 'deny' && (
                <span style={{ color: '#f44', marginLeft: 4 }}>
                  DENIED: {entry.policyResult.reason}
                </span>
              )}
            </div>
            <div style={{ color: '#666', fontSize: 11 }}>
              v{entry.prevState.version} → {entry.nextState ? `v${entry.nextState.version}` : 'null'}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => { audit.clear(); setEntries([]); }}
        style={{
          marginTop: 8,
          padding: '4px 12px',
          fontSize: 12,
          cursor: 'pointer',
          background: '#eee',
          border: '1px solid #ccc',
          borderRadius: 4,
        }}
      >
        Clear Audit
      </button>
    </div>
  );
}
