import { useState } from 'react';
import { useUI } from '@prismui/react';

export function DSLPage() {
  const ui = useUI();
  const [confirmResult, setConfirmResult] = useState<string>('—');

  const handleConfirm = async () => {
    setConfirmResult('waiting...');
    const result = await ui.confirm('confirm');
    setConfirmResult(result ? 'Confirmed ✓' : 'Cancelled ✗');
  };

  return (
    <div>
      <div className="demo-content__header">
        <h2 className="demo-content__title">Interaction DSL</h2>
        <p className="demo-content__subtitle">
          High-level API for common interaction patterns — pure delegation, zero new state or events.
        </p>
      </div>

      <div className="info-card info-card--green">
        The Interaction DSL is a <b>convenience layer</b> — it wraps the lower-level module APIs into
        a single unified <code className="code-inline">useUI()</code> hook. It dispatches the same events
        and uses the same state. No new abstractions.
      </div>

      {/* DSL Overview */}
      <div className="feature-section">
        <h3 className="feature-section__title">DSL API</h3>
        <div className="code-block">
{`const ui = useUI();

// Modal shortcuts
ui.modal.open('confirm');
ui.modal.close('confirm');
ui.modal.closeAll();

// Notification shortcuts
ui.notify.info('Hello!');
ui.notify.success('Saved!');
ui.notify.warning('Check this');
ui.notify.error('Failed!');
ui.notify.dismissAll();

// Confirm flow (async)
const confirmed = await ui.confirm('confirm');
// Opens modal → waits for close → returns boolean`}
        </div>
      </div>

      {/* Try it: Modal DSL */}
      <div className="feature-section">
        <h3 className="feature-section__title">Try: Modal DSL</h3>
        <p className="feature-section__desc">
          These buttons use the DSL API. They produce the same events as the Modal Module page.
        </p>
        <div className="feature-section__actions">
          <button className="btn" onClick={() => ui.modal.open('confirm')}>
            ui.modal.open
          </button>
          <button className="btn btn--danger" onClick={() => ui.modal.closeAll()}>
            ui.modal.closeAll
          </button>
        </div>
      </div>

      {/* Try it: Notification DSL */}
      <div className="feature-section">
        <h3 className="feature-section__title">Try: Notification DSL</h3>
        <div className="feature-section__actions">
          <button className="btn" onClick={() => ui.notify.info('Hello from DSL!')}>
            ui.notify.info
          </button>
          <button className="btn btn--success" onClick={() => ui.notify.success('Saved!')}>
            ui.notify.success
          </button>
          <button className="btn btn--warning" onClick={() => ui.notify.error('Oops!')}>
            ui.notify.error
          </button>
          <button className="btn btn--danger" onClick={() => ui.notify.dismissAll()}>
            ui.notify.dismissAll
          </button>
        </div>
      </div>

      {/* Try it: Confirm Flow */}
      <div className="feature-section">
        <h3 className="feature-section__title">Try: Confirm Flow</h3>
        <p className="feature-section__desc">
          <code className="code-inline">ui.confirm()</code> opens a modal and returns a Promise that resolves
          when the modal is closed. This enables async confirmation patterns.
        </p>
        <div className="feature-section__actions">
          <button className="btn btn--primary" onClick={handleConfirm}>
            ui.confirm('confirm')
          </button>
        </div>
        <div className="result-display">
          Confirm result: <b>{confirmResult}</b>
        </div>
      </div>

      {/* Architecture Note */}
      <div className="feature-section">
        <h3 className="feature-section__title">Architecture Note</h3>
        <div className="info-card info-card--yellow">
          <b>DSL is pure delegation.</b> It introduces zero new events, zero new state fields.
          Every DSL call maps 1:1 to an existing module API. This keeps the system deterministic
          and auditable — the Audit Trail sees the same events regardless of whether you use
          the DSL or the module API directly.
        </div>
      </div>
    </div>
  );
}
