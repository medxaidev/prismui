import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="gallery">
      <Tabs.List>
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages">Messages</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
      <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
      <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
    </Tabs>
  ),
};

export const OutlineVariant: Story = {
  render: () => (
    <Tabs defaultValue="gallery" variant="outline">
      <Tabs.List>
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages">Messages</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
      <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
      <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
    </Tabs>
  ),
};

export const PillsVariant: Story = {
  render: () => (
    <Tabs defaultValue="gallery" variant="pills">
      <Tabs.List>
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages">Messages</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
      <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
      <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="gallery" orientation="vertical" style={{ display: 'flex' }}>
      <Tabs.List>
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages">Messages</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
      <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
      <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
    </Tabs>
  ),
};

export const VerticalRight: Story = {
  render: () => (
    <Tabs defaultValue="gallery" orientation="vertical" placement="right">
      <Tabs.List>
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages">Messages</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
      <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
      <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
    </Tabs>
  ),
};

export const WithSections: Story = {
  render: () => (
    <Tabs defaultValue="gallery">
      <Tabs.List>
        <Tabs.Tab value="gallery" leftSection="🖼️">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages" leftSection="💬" rightSection={<span style={{ fontSize: 11, background: '#eee', borderRadius: 8, padding: '1px 6px' }}>3</span>}>
          Messages
        </Tabs.Tab>
        <Tabs.Tab value="settings" leftSection="⚙️">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
      <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
      <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
    </Tabs>
  ),
};

export const DisabledTabs: Story = {
  render: () => (
    <Tabs defaultValue="gallery">
      <Tabs.List>
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages" disabled>Messages (disabled)</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
      <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
      <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
    </Tabs>
  ),
};

export const Inverted: Story = {
  render: () => (
    <Tabs defaultValue="gallery" inverted>
      <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
      <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
      <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
      <Tabs.List>
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages">Messages</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
    </Tabs>
  ),
};

export const GrowTabs: Story = {
  render: () => (
    <Tabs defaultValue="gallery">
      <Tabs.List grow>
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages">Messages</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
      <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
      <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
    </Tabs>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Tabs defaultValue="a" color="#e91e63">
        <Tabs.List>
          <Tabs.Tab value="a">Pink</Tabs.Tab>
          <Tabs.Tab value="b">Tab 2</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a" style={{ padding: 16 }}>Pink accent</Tabs.Panel>
        <Tabs.Panel value="b" style={{ padding: 16 }}>Content 2</Tabs.Panel>
      </Tabs>

      <Tabs defaultValue="a" variant="pills" color="#4caf50">
        <Tabs.List>
          <Tabs.Tab value="a">Green</Tabs.Tab>
          <Tabs.Tab value="b">Tab 2</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a" style={{ padding: 16 }}>Green pills</Tabs.Panel>
        <Tabs.Panel value="b" style={{ padding: 16 }}>Content 2</Tabs.Panel>
      </Tabs>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('gallery');
    return (
      <div>
        <div style={{ marginBottom: 8, fontSize: 13, fontFamily: 'monospace' }}>
          Active tab: <strong>{value ?? 'none'}</strong>
        </div>
        <Tabs value={value} onChange={setValue}>
          <Tabs.List>
            <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
            <Tabs.Tab value="messages">Messages</Tabs.Tab>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
          <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
          <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
        </Tabs>
      </div>
    );
  },
};

export const AllowDeactivation: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('gallery');
    return (
      <div>
        <div style={{ marginBottom: 8, fontSize: 13, fontFamily: 'monospace' }}>
          Active tab: <strong>{value ?? 'none'}</strong>
          <span style={{ marginLeft: 8, color: '#888' }}>(click active tab to deselect)</span>
        </div>
        <Tabs value={value} onChange={setValue} allowTabDeactivation>
          <Tabs.List>
            <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
            <Tabs.Tab value="messages">Messages</Tabs.Tab>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="gallery" style={{ padding: 16 }}>Gallery content</Tabs.Panel>
          <Tabs.Panel value="messages" style={{ padding: 16 }}>Messages content</Tabs.Panel>
          <Tabs.Panel value="settings" style={{ padding: 16 }}>Settings content</Tabs.Panel>
        </Tabs>
      </div>
    );
  },
};

export const UnmountOnHide: Story = {
  render: () => (
    <Tabs defaultValue="gallery" keepMounted={false}>
      <Tabs.List>
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages">Messages</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery" style={{ padding: 16 }}>
        Gallery content (unmounts when hidden)
      </Tabs.Panel>
      <Tabs.Panel value="messages" style={{ padding: 16 }}>
        Messages content (unmounts when hidden)
      </Tabs.Panel>
    </Tabs>
  ),
};
