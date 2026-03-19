import { useRouter, useRuntimeState } from '@prismui/react';
import type { RouterLocation } from '@prismui/core';

export function RouterPage() {
  const { path, location, push, replace, back, forward } = useRouter();
  const state = useRuntimeState();
  const history = state.routerHistory as string[];
  const historyIndex = state.routerHistoryIndex as number;
  const routerLocation = state.routerLocation as RouterLocation;

  return (
    <div className="demo-page">
      <h2>Router & Persistence</h2>
      <p style={{ color: '#888', marginBottom: 16 }}>
        URL-driven navigation with browser back/forward, query params, and state persistence.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Navigation Actions */}
        <section className="demo-section">
          <h3>Navigation</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <button className="demo-btn" onClick={() => push('/Overview')}>
              Push /Overview
            </button>
            <button className="demo-btn" onClick={() => push('/ModalModule')}>
              Push /ModalModule
            </button>
            <button className="demo-btn" onClick={() => push('/FormAsync?mode=edit')}>
              Push /FormAsync?mode=edit
            </button>
            <button className="demo-btn" onClick={() => replace('/Router')}>
              Replace → /Router
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className="demo-btn" onClick={() => back()}>
              ← Back
            </button>
            <button className="demo-btn" onClick={() => forward()}>
              Forward →
            </button>
          </div>
        </section>

        {/* Current Location */}
        <section className="demo-section">
          <h3>Current Location</h3>
          <table className="demo-table">
            <tbody>
              <tr><td><strong>pathname</strong></td><td><code>{routerLocation?.pathname}</code></td></tr>
              <tr><td><strong>search</strong></td><td><code>{routerLocation?.search || '(none)'}</code></td></tr>
              <tr><td><strong>hash</strong></td><td><code>{routerLocation?.hash || '(none)'}</code></td></tr>
              <tr><td><strong>path (hook)</strong></td><td><code>{path}</code></td></tr>
            </tbody>
          </table>
        </section>

        {/* History Stack */}
        <section className="demo-section">
          <h3>History Stack</h3>
          <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {history.map((entry, idx) => (
              <div
                key={idx}
                style={{
                  padding: '4px 8px',
                  background: idx === historyIndex ? '#3b82f6' : 'transparent',
                  color: idx === historyIndex ? 'white' : '#ccc',
                  borderRadius: 4,
                  marginBottom: 2,
                }}
              >
                {idx === historyIndex ? '▶ ' : '  '}
                [{idx}] {entry}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
            Index: {historyIndex} / {history.length - 1}
          </div>
        </section>

        {/* Persistence Info */}
        <section className="demo-section">
          <h3>Persistence</h3>
          <p style={{ color: '#888', fontSize: 13 }}>
            Router state is automatically persisted to localStorage via PersistenceModule.
            Try refreshing the page — your current location will be restored.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="demo-btn"
              onClick={() => {
                localStorage.removeItem('prismui-state');
                location && push('/');
              }}
            >
              Clear Persisted State
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
