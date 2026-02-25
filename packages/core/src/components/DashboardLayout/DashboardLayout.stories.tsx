import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DashboardLayout } from './DashboardLayout';
import { useNavbarState } from './DashboardLayout.context';

const meta: Meta<typeof DashboardLayout> = {
  title: 'Layout/DashboardLayout',
  component: DashboardLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof DashboardLayout>;

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function HamburgerButton() {
  const { collapsed, toggleCollapse, isMobile, toggleMobile } = useNavbarState();
  return (
    <button
      onClick={isMobile ? toggleMobile : toggleCollapse}
      style={{ background: 'none', border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
    >
      {isMobile ? '☰' : collapsed ? '→' : '←'}
    </button>
  );
}

function SampleHeader() {
  return (
    <DashboardLayout.Header style={{ padding: '0 16px', gap: 12 }}>
      <HamburgerButton />
      <span style={{ fontWeight: 600 }}>Dashboard</span>
      <span style={{ marginLeft: 'auto', fontSize: 13, color: '#888' }}>user@example.com</span>
    </DashboardLayout.Header>
  );
}

const navItems = ['Overview', 'Analytics', 'Users', 'Products', 'Orders', 'Settings'];

function SampleNavbar() {
  const { collapsed } = useNavbarState();
  return (
    <DashboardLayout.Navbar>
      <DashboardLayout.Section style={{ padding: 16, fontWeight: 700, fontSize: 18 }}>
        {collapsed ? 'P' : 'PrismUI'}
      </DashboardLayout.Section>
      <DashboardLayout.Section grow>
        {navItems.map((item) => (
          <div
            key={item}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {collapsed ? item[0] : item}
          </div>
        ))}
      </DashboardLayout.Section>
      <DashboardLayout.Section style={{ padding: 16, fontSize: 12, color: '#888' }}>
        {collapsed ? 'v1' : 'v1.0.0'}
      </DashboardLayout.Section>
    </DashboardLayout.Navbar>
  );
}

function SampleMain() {
  return (
    <DashboardLayout.Main style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px' }}>Welcome to Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{ padding: 24, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
            Card {i + 1}
          </div>
        ))}
      </div>
    </DashboardLayout.Main>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const AltLayout: Story = {
  name: 'Alt Layout (minimals.cc)',
  render: () => (
    <DashboardLayout layout="alt">
      <SampleHeader />
      <SampleNavbar />
      <SampleMain />
    </DashboardLayout>
  ),
};

export const DefaultLayout: Story = {
  name: 'Default Layout (Mantine-style)',
  render: () => (
    <DashboardLayout layout="default">
      <SampleHeader />
      <SampleNavbar />
      <SampleMain />
    </DashboardLayout>
  ),
};

export const InitiallyCollapsed: Story = {
  render: () => (
    <DashboardLayout navbar={{ collapsed: { desktop: true } }}>
      <SampleHeader />
      <SampleNavbar />
      <SampleMain />
    </DashboardLayout>
  ),
};

export const CustomWidths: Story = {
  render: () => (
    <DashboardLayout navbar={{ width: 320, miniWidth: 72 }} header={{ height: 56 }}>
      <SampleHeader />
      <SampleNavbar />
      <SampleMain />
    </DashboardLayout>
  ),
};

export const NoBorders: Story = {
  render: () => (
    <DashboardLayout withBorder={false}>
      <SampleHeader />
      <SampleNavbar />
      <SampleMain />
    </DashboardLayout>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div>
        <div style={{ padding: 8, background: '#eee', fontSize: 13, fontFamily: 'monospace' }}>
          External control: collapsed={String(collapsed)}{' '}
          <button onClick={() => setCollapsed(!collapsed)}>Toggle</button>
        </div>
        <DashboardLayout
          navbar={{ collapsed: { desktop: collapsed } }}
          onNavbarCollapse={setCollapsed}
        >
          <SampleHeader />
          <SampleNavbar />
          <SampleMain />
        </DashboardLayout>
      </div>
    );
  },
};

export const SlowTransition: Story = {
  render: () => (
    <DashboardLayout transitionDuration={600}>
      <SampleHeader />
      <SampleNavbar />
      <SampleMain />
    </DashboardLayout>
  ),
};

export const CustomBreakpoint: Story = {
  name: 'Custom Breakpoint (900px)',
  render: () => (
    <DashboardLayout navbar={{ breakpoint: 900 }}>
      <SampleHeader />
      <SampleNavbar />
      <SampleMain />
    </DashboardLayout>
  ),
};

export const MinimalDashboard: Story = {
  name: 'Minimal (no Section)',
  render: () => (
    <DashboardLayout>
      <DashboardLayout.Header style={{ padding: '0 16px' }}>
        <HamburgerButton />
        <span style={{ marginLeft: 12, fontWeight: 600 }}>App</span>
      </DashboardLayout.Header>
      <DashboardLayout.Navbar style={{ padding: 16 }}>
        <div>Home</div>
        <div>About</div>
        <div>Contact</div>
      </DashboardLayout.Navbar>
      <DashboardLayout.Main style={{ padding: 24 }}>
        <p>Simple dashboard without Section components.</p>
      </DashboardLayout.Main>
    </DashboardLayout>
  ),
};

export const ScrollableContent: Story = {
  render: () => (
    <DashboardLayout>
      <SampleHeader />
      <SampleNavbar />
      <DashboardLayout.Main style={{ padding: 24 }}>
        <h2>Scrollable Content</h2>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            Content row {i + 1}
          </p>
        ))}
      </DashboardLayout.Main>
    </DashboardLayout>
  ),
};
