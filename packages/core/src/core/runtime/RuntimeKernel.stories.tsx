import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PrismuiProvider } from '../PrismuiProvider/PrismuiProvider';
import { useRuntimeKernel, useRuntimeModule, useExposedApi } from './RuntimeContext';
import type { PrismuiModule } from './types';

// ---------------------------------------------------------------------------
// Helpers — demo modules
// ---------------------------------------------------------------------------

function counterModule(): PrismuiModule {
  let count = 0;
  return {
    name: 'counter',
    setup(kernel) {
      const api = {
        get: () => count,
        increment: () => ++count,
        reset: () => { count = 0; },
      };
      kernel.register('counter', api);
      kernel.expose('counter', api);
    },
    teardown() {
      count = 0;
    },
  };
}

function loggerModule(): PrismuiModule {
  const logs: string[] = [];
  return {
    name: 'logger',
    setup(kernel) {
      const api = {
        log: (msg: string) => { logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`); },
        getLogs: () => [...logs],
        clear: () => { logs.length = 0; },
      };
      kernel.register('logger', api);
      kernel.expose('logger', api);
    },
    teardown() {
      logs.length = 0;
    },
  };
}

type CounterApi = ReturnType<typeof counterModule> extends { setup: (k: any) => any } ? {
  get: () => number;
  increment: () => number;
  reset: () => void;
} : never;

type LoggerApi = {
  log: (msg: string) => void;
  getLogs: () => string[];
  clear: () => void;
};

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

const codeStyle: React.CSSProperties = {
  background: '#1e1e2e',
  color: '#cdd6f4',
  padding: 12,
  borderRadius: 8,
  fontSize: 12,
  lineHeight: 1.6,
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
  overflow: 'auto',
  maxHeight: 300,
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

const btnStyle: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: 6,
  border: '1px solid #ccc',
  cursor: 'pointer',
  fontSize: 13,
  background: '#fff',
};

// ============================================================================
// Meta
// ============================================================================

const meta: Meta = {
  title: 'Core/RuntimeKernel',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// 1. Kernel Introspection — shows registered modules and kernel state
// ============================================================================

function KernelIntrospection() {
  const kernel = useRuntimeKernel();
  return (
    <div>
      <h3>Runtime Kernel Introspection</h3>
      <div style={cardStyle}>
        <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
          <div><strong>isReady():</strong> {String(kernel.isReady())}</div>
          <div><strong>getModules():</strong> [{kernel.getModules().join(', ')}]</div>
          <div><strong>has('counter'):</strong> {String(kernel.has('counter'))}</div>
          <div><strong>has('logger'):</strong> {String(kernel.has('logger'))}</div>
          <div><strong>has('nonexistent'):</strong> {String(kernel.has('nonexistent'))}</div>
        </div>
      </div>
      <p style={{ fontSize: 13, marginTop: 12, color: '#666' }}>
        Two modules registered: <code>counter</code> and <code>logger</code>.
        The kernel exposes introspection APIs to check module availability.
      </p>
    </div>
  );
}

export const Introspection: Story = {
  name: 'Kernel Introspection',
  render: () => (
    <PrismuiProvider
      withCssVars={false}
      withCssBaseline={false}
      modules={[counterModule(), loggerModule()]}
    >
      <KernelIntrospection />
    </PrismuiProvider>
  ),
};

// ============================================================================
// 2. Module Registration — interactive counter module demo
// ============================================================================

function CounterDemo() {
  const counter = useExposedApi<CounterApi>('counter');
  const [display, setDisplay] = useState(0);

  if (!counter) return <div>Counter module not registered</div>;

  return (
    <div>
      <h3>Counter Module (via useExposedApi)</h3>
      <div style={cardStyle}>
        <div style={{ fontSize: 48, fontWeight: 800, textAlign: 'center', fontFamily: 'monospace' }}>
          {display}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          <button
            style={{ ...btnStyle, background: '#1976d2', color: '#fff', border: 'none' }}
            onClick={() => { counter.increment(); setDisplay(counter.get()); }}
          >
            + Increment
          </button>
          <button
            style={btnStyle}
            onClick={() => { counter.reset(); setDisplay(counter.get()); }}
          >
            Reset
          </button>
        </div>
      </div>
      <p style={{ fontSize: 13, marginTop: 12, color: '#666' }}>
        The counter state lives in the module, not in React state.
        <code>useExposedApi('counter')</code> retrieves the API exposed by the counter module.
      </p>
    </div>
  );
}

export const ModuleRegistration: Story = {
  name: 'Module Registration (Counter)',
  render: () => (
    <PrismuiProvider
      withCssVars={false}
      withCssBaseline={false}
      modules={[counterModule()]}
    >
      <CounterDemo />
    </PrismuiProvider>
  ),
};

// ============================================================================
// 3. Multiple Modules — counter + logger working together
// ============================================================================

function MultiModuleDemo() {
  const counter = useExposedApi<CounterApi>('counter');
  const logger = useExposedApi<LoggerApi>('logger');
  const [display, setDisplay] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  if (!counter || !logger) return <div>Modules not registered</div>;

  const refresh = () => {
    setDisplay(counter.get());
    setLogs(logger.getLogs());
  };

  return (
    <div>
      <h3>Multiple Modules (Counter + Logger)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 8px' }}>Counter</h4>
          <div style={{ fontSize: 36, fontWeight: 800, textAlign: 'center', fontFamily: 'monospace' }}>
            {display}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
            <button
              style={{ ...btnStyle, background: '#1976d2', color: '#fff', border: 'none' }}
              onClick={() => {
                counter.increment();
                logger.log(`Counter incremented to ${counter.get()}`);
                refresh();
              }}
            >
              + Increment
            </button>
            <button
              style={btnStyle}
              onClick={() => {
                counter.reset();
                logger.log('Counter reset');
                refresh();
              }}
            >
              Reset
            </button>
          </div>
        </div>
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 8px' }}>Logger</h4>
          <div style={{ ...codeStyle, minHeight: 100 }}>
            {logs.length === 0
              ? '(no logs yet — click Increment or Reset)'
              : logs.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <button
            style={{ ...btnStyle, marginTop: 8, color: 'red' }}
            onClick={() => { logger.clear(); refresh(); }}
          >
            Clear Logs
          </button>
        </div>
      </div>
      <p style={{ fontSize: 13, marginTop: 12, color: '#666' }}>
        Modules are independent but can interact. The counter module and logger module
        are both registered via <code>modules</code> prop. Components access them via hooks.
      </p>
    </div>
  );
}

export const MultipleModules: Story = {
  name: 'Multiple Modules',
  render: () => (
    <PrismuiProvider
      withCssVars={false}
      withCssBaseline={false}
      modules={[counterModule(), loggerModule()]}
    >
      <MultiModuleDemo />
    </PrismuiProvider>
  ),
};

// ============================================================================
// 4. No Modules — kernel exists but is empty
// ============================================================================

function EmptyKernelDemo() {
  const kernel = useRuntimeKernel();

  return (
    <div>
      <h3>No Modules Registered</h3>
      <div style={cardStyle}>
        <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
          <div><strong>isReady():</strong> {String(kernel.isReady())}</div>
          <div><strong>getModules():</strong> [{kernel.getModules().join(', ')}]</div>
          <div><strong>get('anything'):</strong> {String(kernel.get('anything'))}</div>
        </div>
      </div>
      <p style={{ fontSize: 13, marginTop: 12, color: '#666' }}>
        PrismuiProvider always creates a RuntimeKernel, even without modules.
        <code>isReady()</code> returns <code>false</code> when no modules are registered.
      </p>
    </div>
  );
}

export const NoModules: Story = {
  name: 'No Modules (Empty Kernel)',
  render: () => (
    <PrismuiProvider withCssVars={false} withCssBaseline={false}>
      <EmptyKernelDemo />
    </PrismuiProvider>
  ),
};

// ============================================================================
// 5. useRuntimeModule hook — direct module access
// ============================================================================

function DirectModuleAccess() {
  const counter = useRuntimeModule<CounterApi>('counter');
  const missing = useRuntimeModule<unknown>('nonexistent');
  const [display, setDisplay] = useState(0);

  return (
    <div>
      <h3>useRuntimeModule Hook</h3>
      <div style={cardStyle}>
        <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
          <div><strong>useRuntimeModule('counter'):</strong> {counter ? 'found' : 'undefined'}</div>
          <div><strong>useRuntimeModule('nonexistent'):</strong> {missing ? 'found' : 'undefined'}</div>
        </div>
        {counter && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace' }}>
              Count: {display}
            </div>
            <button
              style={{ ...btnStyle, marginTop: 8 }}
              onClick={() => { counter.increment(); setDisplay(counter.get()); }}
            >
              Increment via useRuntimeModule
            </button>
          </div>
        )}
      </div>
      <p style={{ fontSize: 13, marginTop: 12, color: '#666' }}>
        <code>useRuntimeModule</code> accesses the internal registry (module-to-module).
        Returns <code>undefined</code> for unregistered modules without throwing.
      </p>
    </div>
  );
}

export const UseRuntimeModule: Story = {
  name: 'useRuntimeModule Hook',
  render: () => (
    <PrismuiProvider
      withCssVars={false}
      withCssBaseline={false}
      modules={[counterModule()]}
    >
      <DirectModuleAccess />
    </PrismuiProvider>
  ),
};

// ============================================================================
// 6. Module Setup Order — demonstrates registration order
// ============================================================================

function SetupOrderDemo() {
  const kernel = useRuntimeKernel();
  const order = kernel.get<string[]>('setup-order');

  return (
    <div>
      <h3>Module Setup Order</h3>
      <div style={cardStyle}>
        <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
          <div><strong>Setup order:</strong></div>
          {order?.map((name, i) => (
            <div key={name} style={{ paddingLeft: 16 }}>
              {i + 1}. {name}
            </div>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 13, marginTop: 12, color: '#666' }}>
        Modules are set up in the order they appear in the <code>modules</code> array.
        This is important for modules that depend on each other.
      </p>
    </div>
  );
}

function orderedModule(name: string): PrismuiModule {
  return {
    name,
    setup(kernel) {
      const order = kernel.get<string[]>('setup-order') ?? [];
      order.push(name);
      if (!kernel.has('setup-order')) {
        kernel.register('setup-order', order);
      }
    },
  };
}

export const SetupOrder: Story = {
  name: 'Module Setup Order',
  render: () => (
    <PrismuiProvider
      withCssVars={false}
      withCssBaseline={false}
      modules={[
        orderedModule('overlay'),
        orderedModule('focus-trap'),
        orderedModule('dialog'),
        orderedModule('toast'),
      ]}
    >
      <SetupOrderDemo />
    </PrismuiProvider>
  ),
};

// ============================================================================
// 7. Internal vs Exposed Registry — demonstrates the two registries
// ============================================================================

function RegistryComparisonDemo() {
  const kernel = useRuntimeKernel();

  const internal = kernel.get<{ secret: string }>('auth');
  const exposed = kernel.getExposed<{ isLoggedIn: () => boolean }>('auth');

  return (
    <div>
      <h3>Internal vs Exposed Registry</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 8px' }}>Internal (module-to-module)</h4>
          <pre style={codeStyle}>
            {`kernel.get('auth'):\n${JSON.stringify(internal, null, 2)}`}
          </pre>
          <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            Contains implementation details not meant for components.
          </p>
        </div>
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 8px' }}>Exposed (module-to-component)</h4>
          <pre style={codeStyle}>
            {`kernel.getExposed('auth'):\n${exposed ? `{ isLoggedIn: ${exposed.isLoggedIn()} }` : 'undefined'}`}
          </pre>
          <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            Clean public API for component consumption.
          </p>
        </div>
      </div>
    </div>
  );
}

function authModule(): PrismuiModule {
  return {
    name: 'auth',
    setup(kernel) {
      // Internal: full implementation details
      kernel.register('auth', { secret: 'jwt-token-xyz', refreshToken: 'abc123' });
      // Exposed: clean public API
      kernel.expose('auth', { isLoggedIn: () => true });
    },
  };
}

export const InternalVsExposed: Story = {
  name: 'Internal vs Exposed Registry',
  render: () => (
    <PrismuiProvider
      withCssVars={false}
      withCssBaseline={false}
      modules={[authModule()]}
    >
      <RegistryComparisonDemo />
    </PrismuiProvider>
  ),
};
