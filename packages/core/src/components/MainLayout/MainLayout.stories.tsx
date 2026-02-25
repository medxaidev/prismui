import type { Meta, StoryObj } from '@storybook/react';
import { MainLayout } from './MainLayout';

const meta: Meta<typeof MainLayout> = {
  title: 'Layout/MainLayout',
  component: MainLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof MainLayout>;

export const Default: Story = {
  render: () => (
    <MainLayout>
      <MainLayout.Header style={{ padding: '0 24px', gap: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>PrismUI</span>
        <nav style={{ display: 'flex', gap: 16, marginLeft: 32 }}>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Home</a>
          <a href="#" style={{ textDecoration: 'none', color: '#888' }}>About</a>
          <a href="#" style={{ textDecoration: 'none', color: '#888' }}>Contact</a>
        </nav>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#888' }}>Login</span>
      </MainLayout.Header>
      <MainLayout.Main style={{ padding: 24 }}>
        <h1>Welcome</h1>
        <p>This is a simple main layout with a fixed header.</p>
      </MainLayout.Main>
    </MainLayout>
  ),
};

export const CustomHeight: Story = {
  render: () => (
    <MainLayout header={{ height: 80 }}>
      <MainLayout.Header style={{ padding: '0 24px', fontSize: 20, fontWeight: 700 }}>
        Tall Header (80px)
      </MainLayout.Header>
      <MainLayout.Main style={{ padding: 24 }}>
        <p>Content below a taller header.</p>
      </MainLayout.Main>
    </MainLayout>
  ),
};

export const NoBorder: Story = {
  render: () => (
    <MainLayout withBorder={false}>
      <MainLayout.Header style={{ padding: '0 24px', background: '#1976d2', color: '#fff' }}>
        <span style={{ fontWeight: 700 }}>No Border Header</span>
      </MainLayout.Header>
      <MainLayout.Main style={{ padding: 24 }}>
        <p>Header has no bottom border, uses background color instead.</p>
      </MainLayout.Main>
    </MainLayout>
  ),
};

export const ScrollableContent: Story = {
  render: () => (
    <MainLayout>
      <MainLayout.Header style={{ padding: '0 24px' }}>
        <span style={{ fontWeight: 700 }}>Scrollable Page</span>
      </MainLayout.Header>
      <MainLayout.Main style={{ padding: 24 }}>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            Content row {i + 1}
          </p>
        ))}
      </MainLayout.Main>
    </MainLayout>
  ),
};
