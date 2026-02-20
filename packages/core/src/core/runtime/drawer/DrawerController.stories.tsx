import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PrismuiProvider } from '../../PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../overlay/overlayModule';
import { drawerModule } from './drawerModule';
import { useDrawerController } from './useDrawerController';
import { DrawerRenderer } from './DrawerRenderer';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const btnStyle: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  background: '#1976d2',
  color: '#fff',
};

const secondaryBtn: React.CSSProperties = {
  ...btnStyle,
  background: '#e0e0e0',
  color: '#333',
};

// ---------------------------------------------------------------------------
// Provider wrapper
// ---------------------------------------------------------------------------

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrismuiProvider
      withCssVars={false}
      withCssBaseline={false}
      modules={[overlayModule(), drawerModule()]}
    >
      {children}
      <DrawerRenderer />
    </PrismuiProvider>
  );
}

// ============================================================================
// Meta
// ============================================================================

const meta: Meta = {
  title: 'Runtime/DrawerController',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// 1. Programmatic open()
// ============================================================================

function OpenDemo() {
  const drawer = useDrawerController();

  const handleOpen = () => {
    drawer.open({
      title: 'Settings',
      content: 'This drawer was opened programmatically via drawer.open().',
    });
  };

  return (
    <div>
      <h3>Programmatic open()</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Uses <code>drawer.open()</code> to imperatively open a drawer.
        The drawer is rendered by <code>DrawerRenderer</code>.
      </p>
      <button style={btnStyle} onClick={handleOpen}>Open Drawer</button>
    </div>
  );
}

export const Open: Story = {
  name: 'Programmatic open()',
  render: () => <Wrapper><OpenDemo /></Wrapper>,
};

// ============================================================================
// 2. Position variants
// ============================================================================

function PositionDemo() {
  const drawer = useDrawerController();

  const openAt = (position: 'left' | 'right' | 'top' | 'bottom') => {
    drawer.open({
      title: `${position} Drawer`,
      content: `This drawer slides in from the ${position} edge.`,
      position,
    });
  };

  return (
    <div>
      <h3>Position Variants</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Open drawers from any edge using the <code>position</code> option.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle} onClick={() => openAt('left')}>Left</button>
        <button style={btnStyle} onClick={() => openAt('right')}>Right</button>
        <button style={btnStyle} onClick={() => openAt('top')}>Top</button>
        <button style={btnStyle} onClick={() => openAt('bottom')}>Bottom</button>
      </div>
    </div>
  );
}

export const Positions: Story = {
  name: 'Position Variants',
  render: () => <Wrapper><PositionDemo /></Wrapper>,
};

// ============================================================================
// 3. Custom size
// ============================================================================

function CustomSizeDemo() {
  const drawer = useDrawerController();

  return (
    <div>
      <h3>Custom Size</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Set the drawer width/height with the <code>size</code> option.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle} onClick={() => drawer.open({ title: 'Narrow', size: 240 })}>
          240px
        </button>
        <button style={btnStyle} onClick={() => drawer.open({ title: 'Wide', size: 500 })}>
          500px
        </button>
        <button style={btnStyle} onClick={() => drawer.open({ title: 'Half', size: '50%' })}>
          50%
        </button>
      </div>
    </div>
  );
}

export const CustomSize: Story = {
  name: 'Custom Size',
  render: () => <Wrapper><CustomSizeDemo /></Wrapper>,
};

// ============================================================================
// 4. Open / Close manually
// ============================================================================

function OpenCloseDemo() {
  const drawer = useDrawerController();
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const handleOpen = () => {
    const id = drawer.open({
      title: 'Manual Drawer',
      content: 'This drawer was opened with drawer.open() and can be closed with drawer.close(id).',
    });
    setDrawerId(id);
  };

  const handleClose = () => {
    if (drawerId) {
      drawer.close(drawerId);
      setDrawerId(null);
    }
  };

  return (
    <div>
      <h3>Manual open() / close()</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Uses <code>drawer.open()</code> and <code>drawer.close(id)</code> for manual control.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle} onClick={handleOpen} disabled={!!drawerId}>Open</button>
        <button style={secondaryBtn} onClick={handleClose} disabled={!drawerId}>Close</button>
      </div>
      {drawerId && <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>Drawer ID: {drawerId}</p>}
    </div>
  );
}

export const OpenClose: Story = {
  name: 'Manual open/close',
  render: () => <Wrapper><OpenCloseDemo /></Wrapper>,
};

// ============================================================================
// 5. Multiple drawers + closeAll
// ============================================================================

function MultipleDrawersDemo() {
  const drawer = useDrawerController();

  const openMultiple = () => {
    drawer.open({ title: 'Drawer 1', content: 'First drawer.', position: 'right', size: 300 });
    drawer.open({ title: 'Drawer 2', content: 'Second drawer, stacked.', position: 'left', size: 280 });
  };

  return (
    <div>
      <h3>Multiple Drawers</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Open multiple programmatic drawers at once. Each gets its own z-index.
        Use <code>closeAll()</code> to dismiss them all.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle} onClick={openMultiple}>Open Two Drawers</button>
        <button style={secondaryBtn} onClick={() => drawer.closeAll()}>Close All</button>
      </div>
    </div>
  );
}

export const MultipleDrawers: Story = {
  name: 'Multiple Drawers',
  render: () => <Wrapper><MultipleDrawersDemo /></Wrapper>,
};
