import { useState } from 'react';
import { useWorkflow, useModal, ModalRenderer, NotificationRenderer } from '@prismui/react';
import type { WorkflowInstance } from '@prismui/core';

const statusColors: Record<string, string> = {
  idle: '#999',
  running: '#1976d2',
  completed: '#2e7d32',
  failed: '#d32f2f',
  aborted: '#ed6c02',
  pending: '#999',
  skipped: '#9e9e9e',
};

function StepBadge({ status }: { status: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      color: '#fff',
      background: statusColors[status] ?? '#999',
    }}>
      {status}
    </span>
  );
}

function InstanceCard({ instance }: { instance: WorkflowInstance }) {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      background: '#fafafa',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <b>{instance.workflowId}</b>
        <StepBadge status={instance.status} />
      </div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
        Instance: <code>{instance.instanceId}</code>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {instance.steps.map((step, i) => (
          <div key={step.id} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '2px 6px', background: '#fff', borderRadius: 4,
            border: '1px solid #ddd', fontSize: 12,
          }}>
            <span style={{ color: '#999' }}>{i + 1}.</span>
            <span>{step.id}</span>
            <StepBadge status={step.status} />
          </div>
        ))}
      </div>
      {instance.error && (
        <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>
          Error: {instance.error}
        </div>
      )}
    </div>
  );
}

export function WorkflowPage() {
  const { instances, define, start, abort } = useWorkflow();
  const { close: closeModal } = useModal();
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  // Define workflows on first render
  useState(() => {
    define({
      id: 'save-resource',
      steps: [
        {
          id: 'validate',
          type: 'async',
          execute: async (ctx) => {
            await new Promise((r) => setTimeout(r, 800));
            if (ctx.payload.invalid) throw new Error('Validation failed: missing required fields');
            return { valid: true, warnings: ctx.payload.hasWarnings ? 1 : 0 };
          },
          onError: { action: 'abort', notify: 'Validation failed!' },
        },
        {
          id: 'confirm',
          type: 'confirm',
          modalId: 'workflow-confirm',
          condition: (ctx) => {
            const result = ctx.results.validate as { warnings: number } | undefined;
            return (result?.warnings ?? 0) > 0;
          },
        },
        {
          id: 'save',
          type: 'async',
          execute: async () => {
            await new Promise((r) => setTimeout(r, 500));
            return { saved: true, id: 'res-' + Date.now() };
          },
        },
        {
          id: 'notify-success',
          type: 'notify',
          notification: (ctx) => ({
            type: 'success',
            message: `Resource saved: ${(ctx.results.save as { id: string })?.id}`,
          }),
        },
      ],
    });

    define({
      id: 'simple-pipeline',
      steps: [
        {
          id: 'step-a',
          type: 'custom',
          execute: (ctx) => `Hello ${ctx.payload.name ?? 'World'}`,
          onEnter: () => { },
        },
        {
          id: 'step-b',
          type: 'custom',
          execute: (ctx) => (ctx.results['step-a'] as string).toUpperCase(),
        },
        {
          id: 'step-c',
          type: 'notify',
          notification: (ctx) => ({ type: 'info', message: `Pipeline result: ${ctx.results['step-b']}` }),
        },
      ],
    });
  });

  const runSaveWorkflow = async (options: Record<string, unknown>) => {
    addLog(`Starting save-resource workflow...`);
    const result = await start('save-resource', options);
    addLog(`Workflow ${result.status}: ${JSON.stringify(result.results)}`);
  };

  const runSimplePipeline = async () => {
    addLog('Starting simple-pipeline...');
    const result = await start('simple-pipeline', { name: 'PrismUI' });
    addLog(`Pipeline ${result.status}: ${JSON.stringify(result.results)}`);
  };

  const runningInstances = instances.filter((i) => i.status === 'running');

  return (
    <div>
      <div className="demo-content__header">
        <h2 className="demo-content__title">Workflow Runtime</h2>
        <p className="demo-content__subtitle">
          Declarative multi-step workflow orchestration — XState-inspired context/guards pattern
          without the complexity of a full state machine.
        </p>
      </div>

      <div className="info-card info-card--blue">
        Workflows define sequences of <b>typed steps</b> (async, confirm, notify, custom) that
        execute in order. Each step receives a <b>WorkflowContext</b> with accumulated results from
        previous steps. Steps can have <b>guards</b> (conditions) and <b>error actions</b>.
      </div>

      {/* ── Save Resource Workflow ── */}
      <div className="feature-section">
        <h3 className="feature-section__title">Save Resource Workflow</h3>
        <p className="feature-section__desc">
          A multi-step flow: <code>validate → confirm (if warnings) → save → notify</code>.
          The confirm step only appears when the validation finds warnings.
        </p>
        <div className="code-block">
          {`workflow.define({
  id: 'save-resource',
  steps: [
    { id: 'validate', type: 'async', execute: validateResource,
      onError: { action: 'abort', notify: 'Validation failed!' } },
    { id: 'confirm', type: 'confirm', modalId: 'confirm-save',
      condition: (ctx) => ctx.results.validate.warnings > 0 },
    { id: 'save', type: 'async', execute: saveResource },
    { id: 'notify', type: 'notify',
      notification: (ctx) => ({ type: 'success', message: 'Saved!' }) }
  ]
});

const result = await workflow.start('save-resource', { resource });`}
        </div>
        <div className="feature-section__actions">
          <button className="btn" onClick={() => runSaveWorkflow({})}>
            Save (no warnings)
          </button>
          <button className="btn btn--warning" onClick={() => runSaveWorkflow({ hasWarnings: true })}>
            Save (with warnings)
          </button>
          <button className="btn btn--danger" onClick={() => runSaveWorkflow({ invalid: true })}>
            Save (invalid — will fail)
          </button>
        </div>
      </div>

      {/* ── Simple Pipeline ── */}
      <div className="feature-section">
        <h3 className="feature-section__title">Simple Pipeline</h3>
        <p className="feature-section__desc">
          A synchronous custom step pipeline that transforms data through steps:
          <code>generate → transform → notify</code>.
        </p>
        <div className="feature-section__actions">
          <button className="btn" onClick={runSimplePipeline}>
            Run Pipeline
          </button>
        </div>
      </div>

      {/* ── Running Instances ── */}
      {runningInstances.length > 0 && (
        <div className="feature-section">
          <h3 className="feature-section__title">Running Instances</h3>
          <div className="feature-section__actions">
            {runningInstances.map((inst) => (
              <button
                key={inst.instanceId}
                className="btn btn--danger"
                onClick={() => abort(inst.instanceId)}
              >
                Abort {inst.instanceId}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Instance History ── */}
      <div className="feature-section">
        <h3 className="feature-section__title">Workflow Instances ({instances.length})</h3>
        {instances.length > 0 ? (
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {[...instances].reverse().map((inst) => (
              <InstanceCard key={inst.instanceId} instance={inst} />
            ))}
          </div>
        ) : (
          <div className="result-display">No workflow instances — start one above</div>
        )}
      </div>

      {/* ── Log ── */}
      {log.length > 0 && (
        <div className="feature-section">
          <h3 className="feature-section__title">Log</h3>
          <div className="code-block" style={{ fontSize: 12, maxHeight: 150, overflowY: 'auto' }}>
            {log.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── Renderers for workflow confirm step ── */}
      <ModalRenderer>
        {(modalId, close) =>
          modalId === 'workflow-confirm' ? (
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '24px 32px',
              minWidth: 320,
              maxWidth: 420,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              <h3 style={{ margin: '0 0 12px' }}>Confirm Save</h3>
              <p style={{ color: '#666', margin: '0 0 16px' }}>
                Validation found warnings. Do you still want to save?
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => closeModal('workflow-confirm')}>
                  Yes, Save
                </button>
                <button className="btn btn--danger" onClick={() => {
                  closeModal('workflow-confirm');
                }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#fff', borderRadius: 12, padding: '24px 32px',
              minWidth: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              <h3 style={{ margin: '0 0 12px' }}>Modal: {modalId}</h3>
              <button className="btn" onClick={close}>Close</button>
            </div>
          )
        }
      </ModalRenderer>
      <NotificationRenderer position="top-right" />
    </div>
  );
}
