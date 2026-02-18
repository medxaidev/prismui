import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import type { TooltipPosition } from './Tooltip';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 14,
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Basic tooltip on hover */
export const Basic: Story = {
  render: () => (
    <Tooltip label="This is a tooltip">
      <button style={btnStyle}>Hover me</button>
    </Tooltip>
  ),
};

/** All 12 positions */
export const Positions: Story = {
  render: () => {
    const positions: TooltipPosition[] = [
      'top-start', 'top', 'top-end',
      'left-start', 'left', 'left-end',
      'right-start', 'right', 'right-end',
      'bottom-start', 'bottom', 'bottom-end',
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, padding: 80 }}>
        {positions.map((pos) => (
          <Tooltip key={pos} label={pos} position={pos}>
            <button style={{ ...btnStyle, width: '100%' }}>{pos}</button>
          </Tooltip>
        ))}
      </div>
    );
  },
};

/** Without arrow */
export const WithoutArrow: Story = {
  render: () => (
    <Tooltip label="No arrow tooltip" withArrow={false}>
      <button style={btnStyle}>Hover me (no arrow)</button>
    </Tooltip>
  ),
};

/** With open/close delay */
export const WithDelay: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Tooltip label="Opens after 500ms" openDelay={500}>
        <button style={btnStyle}>Open delay: 500ms</button>
      </Tooltip>
      <Tooltip label="Closes after 300ms" closeDelay={300}>
        <button style={btnStyle}>Close delay: 300ms</button>
      </Tooltip>
      <Tooltip label="Both delays" openDelay={300} closeDelay={200}>
        <button style={btnStyle}>Open: 300ms / Close: 200ms</button>
      </Tooltip>
    </div>
  ),
};

/** Multiline content */
export const Multiline: Story = {
  render: () => (
    <Tooltip
      label="This is a longer tooltip message that wraps to multiple lines for demonstration purposes."
      multiline
      style={{ maxWidth: 220 }}
    >
      <button style={btnStyle}>Hover for multiline</button>
    </Tooltip>
  ),
};

/** Disabled tooltip */
export const Disabled: Story = {
  render: () => {
    const [disabled, setDisabled] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
          />
          Disable tooltip
        </label>
        <Tooltip label="I can be disabled" disabled={disabled}>
          <button style={btnStyle}>
            Tooltip is {disabled ? 'disabled' : 'enabled'}
          </button>
        </Tooltip>
      </div>
    );
  },
};

/** Controlled open state */
export const Controlled: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={opened}
            onChange={(e) => setOpened(e.target.checked)}
          />
          Show tooltip
        </label>
        <Tooltip label="Controlled tooltip" opened={opened}>
          <button style={btnStyle}>Controlled</button>
        </Tooltip>
      </div>
    );
  },
};

/** Custom color */
export const CustomColor: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Tooltip label="Default" position="bottom">
        <button style={btnStyle}>Default</button>
      </Tooltip>
      <Tooltip label="Blue" color="#1976d2" position="bottom">
        <button style={btnStyle}>Blue</button>
      </Tooltip>
      <Tooltip label="Green" color="#2e7d32" position="bottom">
        <button style={btnStyle}>Green</button>
      </Tooltip>
      <Tooltip label="Red" color="#d32f2f" position="bottom">
        <button style={btnStyle}>Red</button>
      </Tooltip>
      <Tooltip label="Orange" color="#ed6c02" position="bottom">
        <button style={btnStyle}>Orange</button>
      </Tooltip>
    </div>
  ),
};

/** Focus-only trigger */
export const FocusOnly: Story = {
  render: () => (
    <Tooltip label="Tab to see this tooltip" events={['focus']}>
      <button style={btnStyle}>Tab to focus</button>
    </Tooltip>
  ),
};

/** Rich content in tooltip */
export const RichContent: Story = {
  render: () => (
    <Tooltip
      label={
        <div style={{ textAlign: 'left' }}>
          <strong>Keyboard Shortcut</strong>
          <div style={{ marginTop: 4, opacity: 0.8 }}>
            <kbd style={{
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.15)',
              fontSize: 12,
            }}>
              Ctrl + S
            </kbd>
          </div>
        </div>
      }
      multiline
    >
      <button style={btnStyle}>Save</button>
    </Tooltip>
  ),
};
