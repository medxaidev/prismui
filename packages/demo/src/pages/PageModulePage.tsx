import { usePage, useModal } from '@prismui/react';

export function PageModulePage() {
  const { currentPage, isLocked, lock, unlock, mount, transition } = usePage();
  const { open } = useModal();

  const pages = ['Dashboard', 'PatientDetail', 'LabResults', 'Appointments'];

  function handleTransition(pageId: string) {
    mount(pageId);
    transition(pageId);
  }

  return (
    <div>
      <div className="demo-content__header">
        <h2 className="demo-content__title">Page Module</h2>
        <p className="demo-content__subtitle">
          Pages are Runtime Resources — managed entities with explicit lifecycle, not JSX component trees.
        </p>
      </div>

      <div className="info-card info-card--blue">
        Pages in PrismUI have string IDs and are controlled by the Runtime.
        The Runtime manages mounting, transitions, and locking — React components simply render based on state.
      </div>

      {/* Page Lifecycle */}
      <div className="feature-section">
        <h3 className="feature-section__title">Page Lifecycle</h3>
        <p className="feature-section__desc">
          Pages must be <code className="code-inline">mount()</code>ed before they can be transitioned to.
          Use <code className="code-inline">lock()</code> to prevent all navigation during critical operations.
        </p>
        <div className="code-block">
          {`page.mount("Dashboard");     // Register page as available
page.transition("Dashboard"); // Set as current page
page.lock();                  // Block all transitions
page.unlock();                // Allow transitions again
page.unmount("Dashboard");    // Remove from registry`}
        </div>
      </div>

      {/* Try it: Page Transitions */}
      <div className="feature-section">
        <h3 className="feature-section__title">Try: Page Transitions</h3>
        <p className="feature-section__desc">
          Click a page button to mount and transition. The right panel will show the state change.
        </p>
        <div className="feature-section__actions">
          {pages.map((pageId) => (
            <button
              key={pageId}
              className={`btn ${currentPage === pageId ? 'btn--primary' : ''}`}
              onClick={() => handleTransition(pageId)}
              disabled={isLocked}
            >
              {pageId}
            </button>
          ))}
        </div>
        <div className="result-display">
          Current: <b>{currentPage ?? '(none)'}</b>
        </div>
      </div>

      {/* Try it: Page Lock */}
      <div className="feature-section">
        <h3 className="feature-section__title">Try: Page Lock</h3>
        <p className="feature-section__desc">
          When locked, the Policy Engine will <b>deny</b> all <code className="code-inline">PAGE_TRANSITION</code> events.
          Try clicking page buttons while locked — check the Audit Trail in the right panel for DENIED entries.
        </p>
        <div className="feature-section__actions">
          {!isLocked ? (
            <button className="btn btn--danger" onClick={lock}>
              Lock Page
            </button>
          ) : (
            <button className="btn btn--success" onClick={unlock}>
              Unlock Page
            </button>
          )}
          <button className="btn" onClick={() => open('confirm')} disabled={isLocked}>
            Open Confirm Modal
          </button>
        </div>
        {isLocked && (
          <div className="info-card info-card--red">
            Navigation is <b>LOCKED</b> — all page transition events will be denied by the Policy Engine.
            Try clicking a page button above and observe the Audit Trail.
          </div>
        )}
      </div>

      {/* Event Flow */}
      <div className="feature-section">
        <h3 className="feature-section__title">Event Flow</h3>
        <div className="code-block">
          {`page.transition("PatientDetail")
  → dispatch({ type: "PAGE_TRANSITION", payload: { pageId: "PatientDetail" } })
  → Scheduler processes event
  → [Middleware: Policy check — is page locked? is page mounted?]
  → Reducer: (event, prevState) → nextState
  → Store commits new state
  → Subscribers notified → React re-renders`}
        </div>
      </div>
    </div>
  );
}
