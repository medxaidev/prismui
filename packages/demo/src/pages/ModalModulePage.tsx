import { useModal } from '@prismui/react';

export function ModalModulePage() {
  const { modalStack, open, close, closeAll } = useModal();

  return (
    <div>
      <div className="demo-content__header">
        <h2 className="demo-content__title">Modal Module</h2>
        <p className="demo-content__subtitle">
          Centralized modal stack management — open, close, and orchestrate modals via Runtime events.
        </p>
      </div>

      <div className="info-card info-card--blue">
        Modals are managed as a <b>stack</b> in the Runtime Store. Multiple modals can be open simultaneously,
        and they are tracked by string IDs. The Runtime — not React state — is the source of truth.
      </div>

      {/* API */}
      <div className="feature-section">
        <h3 className="feature-section__title">Modal API</h3>
        <div className="code-block">
          {`const { open, close, closeAll, isOpen, modalStack } = useModal();

open('confirm');              // Push 'confirm' onto stack
close('confirm');             // Remove 'confirm' from stack
closeAll();                   // Clear entire stack
isOpen('confirm');            // Check if specific modal is open
modalStack;                   // ['confirm', 'alert', ...] — full stack`}
        </div>
      </div>

      {/* Try it: Modal Stack */}
      <div className="feature-section">
        <h3 className="feature-section__title">Try: Modal Stack</h3>
        <p className="feature-section__desc">
          Open multiple modals to see the stack grow. Each modal has a unique string ID.
          Watch the right panel to see <code className="code-inline">modalStack</code> update in real-time.
        </p>
        <div className="feature-section__actions">
          <button className="btn" onClick={() => open('confirm')}>
            Open "confirm"
          </button>
          <button className="btn" onClick={() => open('alert')}>
            Open "alert"
          </button>
          <button className="btn" onClick={() => open('settings')}>
            Open "settings"
          </button>
          <button className="btn btn--danger" onClick={closeAll} disabled={modalStack.length === 0}>
            Close All ({modalStack.length})
          </button>
        </div>

        {/* Current Stack */}
        {modalStack.length > 0 ? (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
              Open modals:
            </div>
            {modalStack.map((id) => (
              <div key={id} className="data-row">
                <span className="data-row__label">{id}</span>
                <button className="data-row__close" onClick={() => close(id)}>×</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="result-display">No modals open</div>
        )}
      </div>

      {/* Event Flow */}
      <div className="feature-section">
        <h3 className="feature-section__title">Event Flow</h3>
        <div className="code-block">
          {`open('confirm')
  → dispatch({ type: "MODAL_OPEN", payload: { modalId: "confirm" } })
  → Scheduler → Reducer: push "confirm" onto modalStack
  → Store commits → React re-renders

close('confirm')
  → dispatch({ type: "MODAL_CLOSE", payload: { modalId: "confirm" } })
  → Scheduler → Reducer: remove "confirm" from modalStack
  → Store commits → React re-renders`}
        </div>
      </div>

      {/* Integration with DSL */}
      <div className="feature-section">
        <h3 className="feature-section__title">DSL Integration</h3>
        <p className="feature-section__desc">
          The Interaction DSL provides a higher-level API that delegates to the Modal Module:
        </p>
        <div className="code-block">
          {`const ui = useUI();

ui.modal.open('confirm');    // Same as useModal().open()
ui.modal.closeAll();         // Same as useModal().closeAll()
ui.confirm('confirm');       // Open + wait for close → returns boolean`}
        </div>
      </div>
    </div>
  );
}
