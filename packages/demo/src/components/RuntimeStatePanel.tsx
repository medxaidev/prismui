import { useState, useEffect } from 'react';
import { usePage, useModal, useDrawer, useNotification, useRuntimeState, useForm, useAsync } from '@prismui/react';
import { audit, eventEntries } from '../setup';
import type { AuditEntry } from '@prismui/core';

function getEventTypeClass(type: string): string {
  if (type.startsWith('PAGE_')) return 'event-item__type--page';
  if (type.startsWith('MODAL_')) return 'event-item__type--modal';
  if (type.startsWith('DRAWER_')) return 'event-item__type--drawer';
  if (type.startsWith('NOTIFICATION_')) return 'event-item__type--notification';
  if (type.startsWith('FORM_')) return 'event-item__type--form';
  if (type.startsWith('ASYNC_')) return 'event-item__type--async';
  if (type.startsWith('MODULE_')) return 'event-item__type--governance';
  return '';
}

export function RuntimeStatePanel() {
  const state = useRuntimeState();
  const { currentPage, isLocked } = usePage();
  const { modalStack } = useModal();
  const { drawerStack } = useDrawer();
  const { count: notifCount } = useNotification();
  const form = useForm();
  const async_ = useAsync();

  const [auditEntries, setAuditEntries] = useState<readonly AuditEntry[]>([]);

  useEffect(() => {
    setAuditEntries(audit.getLatest(10));
  }, [state.version]);

  const fieldCount = Object.keys(form.fields).length;
  const asyncOps = Object.entries(async_.operations);

  return (
    <div className="state-panel">
      {/* Runtime State */}
      <div className="state-panel__section">
        <div className="state-panel__title">Runtime State</div>
        <div className="state-panel__row">
          <span className="state-panel__label">Version</span>
          <span className="state-panel__value state-panel__value--accent">{state.version}</span>
        </div>
        <div className="state-panel__row">
          <span className="state-panel__label">Current Page</span>
          <span className="state-panel__value">{currentPage ?? '(none)'}</span>
        </div>
        <div className="state-panel__row">
          <span className="state-panel__label">Page Lock</span>
          <span className={`status-tag ${isLocked ? 'status-tag--locked' : 'status-tag--idle'}`}>
            {isLocked ? 'Locked' : 'Unlocked'}
          </span>
        </div>
      </div>

      {/* Module Stacks */}
      <div className="state-panel__section">
        <div className="state-panel__title">Active Modules</div>
        <div className="state-panel__row">
          <span className="state-panel__label">Modal Stack</span>
          <span className="state-panel__value">{modalStack.length > 0 ? modalStack.join(', ') : '--'}</span>
        </div>
        <div className="state-panel__row">
          <span className="state-panel__label">Drawer Stack</span>
          <span className="state-panel__value">
            {drawerStack.length > 0 ? drawerStack.map(d => d.drawerId).join(', ') : '--'}
          </span>
        </div>
        <div className="state-panel__row">
          <span className="state-panel__label">Notifications</span>
          <span className={`state-panel__value ${notifCount > 0 ? 'state-panel__value--warning' : ''}`}>
            {notifCount}
          </span>
        </div>
      </div>

      {/* Form State */}
      {fieldCount > 0 && (
        <div className="state-panel__section">
          <div className="state-panel__title">Form State</div>
          <div className="state-panel__row">
            <span className="state-panel__label">Fields</span>
            <span className="state-panel__value">{fieldCount}</span>
          </div>
          <div className="state-panel__row">
            <span className="state-panel__label">Submitting</span>
            <span className={`status-tag ${form.isSubmitting ? 'status-tag--loading' : 'status-tag--idle'}`}>
              {form.isSubmitting ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="state-panel__row">
            <span className="state-panel__label">Valid</span>
            <span className={`state-panel__value ${form.isValid() ? 'state-panel__value--success' : 'state-panel__value--error'}`}>
              {String(form.isValid())}
            </span>
          </div>
          <div className="state-panel__row">
            <span className="state-panel__label">Dirty</span>
            <span className="state-panel__value">{String(form.isDirty())}</span>
          </div>
          {Object.entries(form.fields).map(([name, f]) => (
            <div key={name} className={`field-card ${f.error ? 'field-card--error' : f.dirty ? 'field-card--dirty' : 'field-card--clean'}`}>
              <b>{name}</b>: {String(f.value)}
              {f.error && <span style={{ color: 'var(--color-error)' }}> — {f.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Async Operations */}
      {asyncOps.length > 0 && (
        <div className="state-panel__section">
          <div className="state-panel__title">Async Operations</div>
          {asyncOps.map(([id, op]) => (
            <div key={id} className="state-panel__row">
              <span className="state-panel__label">{id}</span>
              <span className={`status-tag ${
                op.status === 'loading' ? 'status-tag--loading'
                  : op.status === 'success' ? 'status-tag--active'
                  : op.status === 'error' ? 'status-tag--error'
                  : 'status-tag--idle'
              }`}>
                {op.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Event Log */}
      <div className="state-panel__section">
        <div className="state-panel__title">Event Log ({eventEntries.length})</div>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {eventEntries.length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>No events yet</div>
          )}
          {[...eventEntries].reverse().slice(0, 20).map((entry, i) => (
            <div key={`${entry.event.type}-${entry.event.timestamp}-${i}`} className="event-item">
              <span className={`event-item__type ${getEventTypeClass(entry.event.type)}`}>
                {entry.event.type}
              </span>
              <span className="event-item__meta">
                {' '}v{entry.prevVersion}→{entry.nextVersion}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="state-panel__section">
        <div className="state-panel__title">Audit Trail ({audit.size()})</div>
        <div style={{ maxHeight: 160, overflowY: 'auto' }}>
          {auditEntries.length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>No entries yet</div>
          )}
          {[...auditEntries].reverse().slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className={`audit-entry ${entry.policyResult?.verdict === 'deny' ? 'audit-entry--deny' : 'audit-entry--allow'}`}
            >
              <span style={{ fontWeight: 600 }}>{entry.event.type}</span>
              {entry.policyResult?.verdict === 'deny' && (
                <span style={{ color: 'var(--color-error)' }}> DENIED</span>
              )}
              <div className="event-item__meta">
                v{entry.prevState.version} → {entry.nextState ? `v${entry.nextState.version}` : 'null'}
              </div>
            </div>
          ))}
        </div>
        {audit.size() > 0 && (
          <button
            className="btn btn--small btn--danger"
            style={{ marginTop: 6 }}
            onClick={() => { audit.clear(); setAuditEntries([]); }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
