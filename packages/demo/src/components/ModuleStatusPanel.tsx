import { useSelector } from '@prismui/react';
import { createSelector, type StateSelector } from '@prismui/core';
import { runtime } from '../setup';

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: '#e8f5e9', text: '#2e7d32' },
  destroyed: { bg: '#ffebee', text: '#c62828' },
  registered: { bg: '#fff8e1', text: '#f57f17' },
};

// Demonstrate createSelector — memoized derived state
const selectVersion: StateSelector<number> = (s) => s.version;
const selectModalCount: StateSelector<number> = createSelector(
  [(s) => s.modalStack as string[]],
  (stack) => stack.length,
);

export function ModuleStatusPanel() {
  // Demonstrate useSelector — efficient partial subscription
  const version = useSelector(selectVersion);
  const modalCount = useSelector(selectModalCount);

  const moduleStatus = runtime.getModuleStatus();

  return (
    <div>
      <h4 style={{ margin: '0 0 8px' }}>Stage-4: Selectors & Lifecycle</h4>
      <div style={{ fontSize: '12px', marginBottom: 8 }}>
        <div><b>useSelector(version):</b> {version}</div>
        <div><b>createSelector(modalCount):</b> {modalCount}</div>
      </div>
      <div style={{ fontSize: '12px' }}>
        <b>Module Status:</b>
        {Object.entries(moduleStatus).map(([name, status]) => {
          const colors = statusColors[status] ?? { bg: '#f5f5f5', text: '#333' };
          return (
            <div
              key={name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '2px 6px',
                marginTop: 2,
                borderRadius: '3px',
                background: colors.bg,
              }}
            >
              <span>{name}</span>
              <span style={{ color: colors.text, fontWeight: 'bold' }}>{status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
