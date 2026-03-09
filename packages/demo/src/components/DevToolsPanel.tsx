import { useState, useRef, useCallback, useEffect } from 'react';
import { useDevTools } from '@prismui/react';
import type { DevToolsController } from '@prismui/core';
import { useRuntimeState } from '@prismui/react';

type Tab = 'timeline' | 'state' | 'metrics' | 'snapshots' | 'agent';

export function DevToolsPanel() {
  const { available, stateTree, timeline, metrics, snapshots, controller } = useDevTools();
  useRuntimeState();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const [panelHeight, setPanelHeight] = useState(320);
  const resizing = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    startY.current = e.clientY;
    startH.current = panelHeight;
  }, [panelHeight]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const delta = startY.current - e.clientY;
      setPanelHeight(Math.max(180, Math.min(window.innerHeight - 80, startH.current + delta)));
    };
    const onUp = () => { resizing.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  if (!available || !controller) return null;
  const dt = controller as DevToolsController;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'state', label: 'State' },
    { id: 'metrics', label: 'Perf' },
    { id: 'snapshots', label: 'Snapshots' },
    { id: 'agent', label: 'Agent' },
  ];

  return (
    <>
      {/* Floating toggle button */}
      <button
        className="devtools-fab"
        onClick={() => setOpen(v => !v)}
        title="Toggle DevTools"
      >
        {open ? '✕' : '⚙'}
      </button>

      {/* Floating panel */}
      {open && (
        <div className="devtools-panel" style={{ height: panelHeight }}>
          {/* Resize handle */}
          <div className="devtools-panel__resize" onMouseDown={onResizeStart} />

          {/* Title bar */}
          <div className="devtools-panel__header">
            <span className="devtools-panel__title">DevTools</span>
            <div className="devtools-panel__tabs">
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={`devtools-tab ${activeTab === t.id ? 'devtools-tab--active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button className="devtools-panel__close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Tab content */}
          <div className="devtools-panel__body">
            {activeTab === 'timeline' && <TimelineTab timeline={timeline} dt={dt} />}
            {activeTab === 'state' && <StateTab stateTree={stateTree} />}
            {activeTab === 'metrics' && <MetricsTab metrics={metrics} dt={dt} />}
            {activeTab === 'snapshots' && <SnapshotsTab snapshots={snapshots} dt={dt} />}
            {activeTab === 'agent' && <AgentTab dt={dt} />}
          </div>
        </div>
      )}
    </>
  );
}

/* ── Tab: Timeline ─────────────────── */
function TimelineTab({ timeline, dt }: { timeline: any[]; dt: DevToolsController }) {
  return (
    <div className="devtools-tab-content">
      <div className="devtools-toolbar">
        <span className="devtools-toolbar__info">{timeline.length} events</span>
        <button className="devtools-toolbar__btn" onClick={() => dt.clearTimeline()}>Clear</button>
      </div>
      <div className="devtools-scroll">
        {timeline.length === 0 && <div className="devtools-empty">No events recorded</div>}
        {[...timeline].reverse().map((entry, i) => (
          <div key={`${entry.event.type}-${entry.startTime}-${i}`} className="devtools-row">
            <span className="devtools-row__type">{entry.event.type}</span>
            <span className="devtools-row__meta">
              {entry.duration}ms
              <span className="devtools-row__version">
                v{entry.stateVersionBefore}{entry.reducerHit ? `→v${entry.stateVersionAfter}` : ''}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tab: State ────────────────────── */
function StateTab({ stateTree }: { stateTree: any }) {
  if (!stateTree?.children) return <div className="devtools-empty">No state</div>;
  return (
    <div className="devtools-tab-content">
      <div className="devtools-scroll">
        {stateTree.children.map((node: any) => (
          <StateNode key={node.key} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}

function StateNode({ node, depth }: { node: any; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const isExpandable = node.type === 'object' || node.type === 'array';

  return (
    <div>
      <div
        className={`devtools-state-row ${isExpandable ? 'devtools-state-row--expandable' : ''}`}
        style={{ paddingLeft: 12 + depth * 14 }}
        onClick={() => isExpandable && setExpanded(v => !v)}
      >
        {isExpandable && (
          <span className="devtools-state-row__arrow">{expanded ? '▾' : '▸'}</span>
        )}
        <span className="devtools-state-row__key">{node.key}</span>
        <span className="devtools-state-row__value">
          {node.type === 'array'
            ? `Array(${(node.value as unknown[]).length})`
            : node.type === 'object'
              ? `{${node.children?.length || 0}}`
              : node.type === 'string'
                ? `"${String(node.value)}"`
                : String(node.value)}
        </span>
      </div>
      {expanded && hasChildren && node.children.map((child: any) => (
        <StateNode key={child.key} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

/* ── Tab: Metrics ──────────────────── */
function MetricsTab({ metrics, dt }: { metrics: any; dt: DevToolsController }) {
  if (!metrics) return <div className="devtools-empty">No metrics</div>;
  return (
    <div className="devtools-tab-content">
      <div className="devtools-toolbar">
        <span className="devtools-toolbar__info">Performance</span>
        <button className="devtools-toolbar__btn" onClick={() => dt.resetMetrics()}>Reset</button>
      </div>
      <div className="devtools-scroll">
        <div className="devtools-metrics-grid">
          <MetricCard label="Total Events" value={String(metrics.totalEvents)} />
          <MetricCard label="Avg Duration" value={`${metrics.averageDuration.toFixed(2)}ms`} />
          <MetricCard label="Max Duration" value={`${metrics.maxDuration.toFixed(2)}ms`} />
          <MetricCard label="Events/sec" value={metrics.eventsPerSecond.toFixed(1)} />
          <MetricCard label="Uptime" value={`${(metrics.uptimeMs / 1000).toFixed(1)}s`} />
          <MetricCard label="Event Types" value={String(Object.keys(metrics.eventsByType).length)} />
        </div>
        {Object.keys(metrics.eventsByType).length > 0 && (
          <>
            <div className="devtools-section-label">Events by type</div>
            {Object.entries(metrics.eventsByType).map(([type, count]) => (
              <div key={type} className="devtools-row">
                <span className="devtools-row__type">{type}</span>
                <span className="devtools-row__meta">{String(count)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="devtools-metric">
      <div className="devtools-metric__value">{value}</div>
      <div className="devtools-metric__label">{label}</div>
    </div>
  );
}

/* ── Tab: Snapshots ────────────────── */
function SnapshotsTab({ snapshots, dt }: { snapshots: any[]; dt: DevToolsController }) {
  return (
    <div className="devtools-tab-content">
      <div className="devtools-toolbar">
        <span className="devtools-toolbar__info">{snapshots.length} snapshots</span>
        <button className="devtools-toolbar__btn" onClick={() => dt.captureSnapshot(`snap-${snapshots.length + 1}`)}>
          Capture
        </button>
        {snapshots.length >= 2 && (
          <button className="devtools-toolbar__btn" onClick={() => {
            const ids = snapshots.map(s => s.id);
            const diff = dt.compareSnapshots(ids[ids.length - 2], ids[ids.length - 1]);
            if (diff) alert(JSON.stringify(diff, null, 2));
          }}>
            Diff Last 2
          </button>
        )}
        {snapshots.length > 0 && (
          <button className="devtools-toolbar__btn devtools-toolbar__btn--danger" onClick={() => dt.clearSnapshots()}>
            Clear
          </button>
        )}
      </div>
      <div className="devtools-scroll">
        {snapshots.length === 0 && <div className="devtools-empty">No snapshots captured</div>}
        {[...snapshots].reverse().map(s => (
          <div key={s.id} className="devtools-row">
            <span className="devtools-row__type">{s.label || s.id}</span>
            <span className="devtools-row__meta">
              v{s.state.version} · {new Date(s.timestamp).toLocaleTimeString()}
              <span className="devtools-row__hash">{s.stateHash.slice(0, 8)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tab: Agent ────────────────────── */
function AgentTab({ dt }: { dt: DevToolsController }) {
  return (
    <div className="devtools-tab-content">
      <div className="devtools-toolbar">
        <span className="devtools-toolbar__info">AI Agent Interface</span>
      </div>
      <div className="devtools-scroll">
        <div className="devtools-section-label">Quick Actions</div>
        <div className="devtools-agent-actions">
          <button className="devtools-toolbar__btn" onClick={() => {
            dt.agent.dispatch({ type: 'PAGE_MOUNT', payload: { pageId: 'agent-test' } });
            dt.agent.dispatch({ type: 'PAGE_TRANSITION', payload: { pageId: 'agent-test' } });
          }}>
            Navigate → "agent-test"
          </button>
          <button className="devtools-toolbar__btn" onClick={async () => {
            await dt.agent.executeSequence([
              { type: 'PAGE_MOUNT', payload: { pageId: 'Overview' } },
              { type: 'PAGE_TRANSITION', payload: { pageId: 'Overview' } },
            ], 50);
          }}>
            Sequence → Overview
          </button>
        </div>
        <div className="devtools-section-label">API Reference</div>
        <div className="devtools-code">
{`// Dispatch single event
dt.agent.dispatch({
  type: 'PAGE_TRANSITION',
  payload: { pageId: 'dashboard' }
});

// Execute a sequence (with delay)
await dt.agent.executeSequence([
  { type: 'PAGE_MOUNT', payload: { pageId: 'x' } },
  { type: 'PAGE_TRANSITION', payload: { pageId: 'x' } },
], 100);

// Wait for state condition
const s = await dt.agent.waitForState(
  s => s.currentPage === 'dashboard',
  5000
);`}
        </div>
      </div>
    </div>
  );
}
