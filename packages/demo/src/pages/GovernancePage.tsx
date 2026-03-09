import { useState, useEffect } from 'react';
import { usePage, useRuntimeState } from '@prismui/react';
import { audit } from '../setup';
import type { AuditEntry } from '@prismui/core';

export function GovernancePage() {
  const state = useRuntimeState();
  const { isLocked, lock, unlock, transition, mount } = usePage();
  const [auditEntries, setAuditEntries] = useState<readonly AuditEntry[]>([]);

  useEffect(() => {
    setAuditEntries(audit.getLatest(20));
  }, [state.version]);

  const handleTriggerDeny = () => {
    lock();
    setTimeout(() => {
      mount('PatientDetail');
      transition('PatientDetail');
    }, 100);
  };

  return (
    <div>
      <div className="demo-content__header">
        <h2 className="demo-content__title">Governance Layer</h2>
        <p className="demo-content__subtitle">
          Policy Engine, Audit Trail, and Replay — built-in governance for enterprise compliance.
        </p>
      </div>

      <div className="info-card info-card--red">
        The Governance Layer intercepts <b>every event</b> before it reaches the Reducer.
        The Policy Engine can <b>allow</b>, <b>deny</b>, or <b>transform</b> events.
        The Audit Trail records every event with before/after state snapshots.
      </div>

      {/* Policy Engine */}
      <div className="feature-section">
        <h3 className="feature-section__title">Policy Engine</h3>
        <p className="feature-section__desc">
          Rules evaluate events against the current state and return a verdict.
          This demo has one policy rule: <b>block page transitions when locked</b>.
        </p>
        <div className="code-block">
          {`// setup.ts — Policy rule
policy.addRule({
  name: 'block-transition-when-locked',
  eventTypes: ['PAGE_TRANSITION'],
  evaluate: (_event, state) => {
    if (state.locked) {
      return { verdict: 'deny', reason: 'Page is locked' };
    }
    return { verdict: 'allow' };
  },
});`}
        </div>
      </div>

      {/* Try it: Policy Deny */}
      <div className="feature-section">
        <h3 className="feature-section__title">Try: Policy Denial</h3>
        <p className="feature-section__desc">
          Click "Lock + Navigate" to lock the page and immediately attempt a transition.
          The Policy Engine will <b>deny</b> the transition — visible in the Audit Trail with a red DENIED tag.
        </p>
        <div className="feature-section__actions">
          <button className="btn btn--danger" onClick={handleTriggerDeny}>
            Lock + Navigate (will be denied)
          </button>
          {isLocked && (
            <button className="btn btn--success" onClick={unlock}>
              Unlock
            </button>
          )}
        </div>
        {isLocked && (
          <div className="info-card info-card--red">
            Page is <b>LOCKED</b>. Any PAGE_TRANSITION event will be denied.
          </div>
        )}
      </div>

      {/* Middleware Pipeline */}
      <div className="feature-section">
        <h3 className="feature-section__title">Middleware Pipeline</h3>
        <div className="code-block">
          {`Event dispatched
  → Policy Middleware (evaluate rules → allow/deny/transform)
  → Audit Middleware (record event + before/after state)
  → Reducer (pure state transition)
  → Store commit
  → Subscribers notified

// Middleware order matters:
runtime.scheduler.use(createPolicyMiddleware(policy, store, audit));
runtime.scheduler.use(createAuditMiddleware(audit, store));`}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="feature-section">
        <h3 className="feature-section__title">Audit Trail</h3>
        <p className="feature-section__desc">
          Every processed event is recorded with its policy verdict, previous state, and next state.
          Green = allowed, Red = denied.
        </p>

        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {auditEntries.length === 0 && (
            <div className="result-display">No audit entries yet — interact with the demo to generate events</div>
          )}
          {[...auditEntries].reverse().map((entry) => (
            <div
              key={entry.id}
              className={`audit-entry ${entry.policyResult?.verdict === 'deny' ? 'audit-entry--deny' : 'audit-entry--allow'}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{entry.event.type}</span>
                {entry.policyResult?.verdict === 'deny' ? (
                  <span className="status-tag status-tag--error">DENIED</span>
                ) : (
                  <span className="status-tag status-tag--active">ALLOW</span>
                )}
              </div>
              <div className="event-item__meta">
                v{entry.prevState.version} → {entry.nextState ? `v${entry.nextState.version}` : 'null (denied)'}
                {entry.policyResult?.reason && (
                  <span style={{ marginLeft: 8, color: 'var(--color-error)' }}>
                    {entry.policyResult.reason}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {audit.size() > 0 && (
          <div className="feature-section__actions" style={{ marginTop: 8 }}>
            <button
              className="btn btn--small btn--danger"
              onClick={() => { audit.clear(); setAuditEntries([]); }}
            >
              Clear Audit Trail
            </button>
          </div>
        )}
      </div>

      {/* Replay */}
      <div className="feature-section">
        <h3 className="feature-section__title">Event Replay</h3>
        <div className="info-card info-card--yellow">
          The Replay System can reproduce any sequence of events from the Audit Trail.
          This enables <b>time-travel debugging</b>, <b>bug reproduction</b>, and <b>compliance verification</b>.
          Full Replay UI is planned for STAGE-8 (DevTools).
        </div>
        <div className="code-block">
          {`import { createReplaySystem } from '@prismui/core';

const replay = createReplaySystem(runtime);
const entries = audit.getLatest(100);

// Replay all events from scratch
replay.replayFrom(entries);

// Step through one at a time
replay.step(entries[0]);`}
        </div>
      </div>
    </div>
  );
}
