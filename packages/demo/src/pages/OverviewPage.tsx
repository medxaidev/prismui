import { useRuntimeState } from '@prismui/react';
import { runtime } from '../setup';

export function OverviewPage() {
  const state = useRuntimeState();
  const moduleStatus = runtime.getModuleStatus();

  return (
    <div>
      <div className="demo-content__header">
        <h2 className="demo-content__title">PrismUI Runtime Overview</h2>
        <p className="demo-content__subtitle">
          Framework-agnostic Interaction Runtime — a programmable, deterministic UI orchestration engine.
        </p>
      </div>

      <div className="info-card info-card--blue">
        <b>PrismUI 2.0 is not a component library.</b> It is a UI Operating System Kernel that provides
        Interaction Runtime, Constraint-Based UI, Semantic Theme, and Programmable UI.
      </div>

      <div className="feature-section">
        <h3 className="feature-section__title">Architecture</h3>
        <div className="code-block">
{`Event → Scheduler → [Middleware] → Reducer → Commit → Render

Layer 0: Interaction Core  (EventBus, Store, Scheduler, Modules)
Layer 1: Governance        (Policy Engine, Audit Trail, Replay)
Layer 2: Framework Adapter (React Provider, Hooks)
Layer 3: Rendering         (Your components — any library)`}
        </div>
      </div>

      <div className="feature-section">
        <h3 className="feature-section__title">Core Principles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="info-card info-card--blue">
            <b>Runtime First</b><br />
            Runtime owns state, scheduling, policies. Components own rendering.
          </div>
          <div className="info-card info-card--green">
            <b>Deterministic Flow</b><br />
            All state changes are traceable to dispatched events.
          </div>
          <div className="info-card info-card--yellow">
            <b>Framework Isolation</b><br />
            Core is pure TypeScript. React is a thin adapter.
          </div>
          <div className="info-card info-card--red">
            <b>Governance Built-in</b><br />
            Policy, Audit, Replay are first-class citizens.
          </div>
        </div>
      </div>

      <div className="feature-section">
        <h3 className="feature-section__title">Module Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          {Object.entries(moduleStatus).map(([name, status]) => (
            <div key={name} className="data-row">
              <span className="data-row__label">{name}</span>
              <span className={`status-tag status-tag--${status === 'active' ? 'active' : 'idle'}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="feature-section">
        <h3 className="feature-section__title">Completed Stages</h3>
        <div className="code-block">
{`Stage 1: Runtime Core         ✅  (EventBus, Store, Scheduler, Module System)
Stage 2: Governance Layer      ✅  (Policy Engine, Audit Trail, Replay)
Stage 3: Interaction Modules   ✅  (Drawer, Notification)
Stage 4: Lifecycle & Selectors ✅  (Module lifecycle, State selectors)
Stage 5: Form & Async Runtime  ✅  (Form state, Async operations)
Stage 6: Interaction DSL       ✅  (ui.modal.open, ui.confirm, ui.notify)

Total tests: 290 | Version: ${state.version}`}
        </div>
      </div>
    </div>
  );
}
