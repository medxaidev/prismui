import React, { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { popoverModule } from '../../core/runtime/popover/popoverModule';
import { usePopoverController } from '../../core/runtime/popover/usePopoverController';
import { PopoverRenderer } from '../../core/runtime/popover/PopoverRenderer';
import { Popover } from './Popover';
import type { PopoverBasePosition } from '../PopoverBase/PopoverBase.context';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <PrismuiProvider modules={[overlayModule(), popoverModule()]}>
        <Story />
        <PopoverRenderer />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Popover>;

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

/** Basic popover with click trigger */
export const Basic: Story = {
  render: () => (
    <Popover>
      <Popover.Target>
        <button style={btnStyle}>Click me</button>
      </Popover.Target>
      <Popover.Dropdown>
        <div style={{ minWidth: 200 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Popover Title</p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>
            This is a popover with glassmorphism styling.
          </p>
        </div>
      </Popover.Dropdown>
    </Popover>
  ),
};

/** All 12 positions */
export const Positions: Story = {
  render: () => {
    const positions: PopoverBasePosition[] = [
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'left', 'left-start', 'left-end',
      'right', 'right-start', 'right-end',
    ];

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 100 }}>
        {positions.map((pos) => (
          <Popover key={pos} position={pos}>
            <Popover.Target>
              <button style={{ ...btnStyle, minWidth: 120 }}>{pos}</button>
            </Popover.Target>
            <Popover.Dropdown>
              <div style={{ padding: 4, fontSize: 13 }}>Position: {pos}</div>
            </Popover.Dropdown>
          </Popover>
        ))}
      </div>
    );
  },
};

/** Controlled mode */
export const Controlled: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);

    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Popover opened={opened} onClose={() => setOpened(false)} onOpen={() => setOpened(true)}>
          <Popover.Target>
            <button style={btnStyle}>Toggle</button>
          </Popover.Target>
          <Popover.Dropdown>
            <div style={{ minWidth: 180, fontSize: 13 }}>
              <p style={{ margin: 0 }}>Controlled popover</p>
              <button
                style={{ ...btnStyle, marginTop: 8, fontSize: 12 }}
                onClick={() => setOpened(false)}
              >
                Close
              </button>
            </div>
          </Popover.Dropdown>
        </Popover>
        <span style={{ fontSize: 13, color: '#888' }}>
          State: {opened ? 'open' : 'closed'}
        </span>
      </div>
    );
  },
};

/** Without arrow */
export const NoArrow: Story = {
  render: () => (
    <Popover withArrow={false}>
      <Popover.Target>
        <button style={btnStyle}>No Arrow</button>
      </Popover.Target>
      <Popover.Dropdown>
        <div style={{ minWidth: 160, fontSize: 13 }}>
          Popover without arrow indicator.
        </div>
      </Popover.Dropdown>
    </Popover>
  ),
};

/** With rich content */
export const RichContent: Story = {
  render: () => (
    <Popover position="bottom-start">
      <Popover.Target>
        <button style={btnStyle}>User Menu</button>
      </Popover.Target>
      <Popover.Dropdown>
        <div style={{ minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                color: '#1976d2',
              }}
            >
              JD
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>John Doe</div>
              <div style={{ fontSize: 12, color: '#888' }}>john@example.com</div>
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />
          {['Profile', 'Settings', 'Sign out'].map((item) => (
            <div
              key={item}
              style={{
                padding: '8px 4px',
                fontSize: 13,
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </Popover.Dropdown>
    </Popover>
  ),
};

/** Disabled state */
export const Disabled: Story = {
  render: () => (
    <Popover disabled>
      <Popover.Target>
        <button style={{ ...btnStyle, opacity: 0.5 }}>Disabled</button>
      </Popover.Target>
      <Popover.Dropdown>
        <div>This should not appear</div>
      </Popover.Dropdown>
    </Popover>
  ),
};

/** Click outside disabled */
export const NoCloseOnClickOutside: Story = {
  render: () => (
    <Popover closeOnClickOutside={false}>
      <Popover.Target>
        <button style={btnStyle}>Sticky Popover</button>
      </Popover.Target>
      <Popover.Dropdown>
        <div style={{ minWidth: 180, fontSize: 13 }}>
          <p style={{ margin: 0 }}>Click outside won't close this.</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>
            Click the button again to close.
          </p>
        </div>
      </Popover.Dropdown>
    </Popover>
  ),
};

/** Multiple popovers */
export const Multiple: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {['First', 'Second', 'Third'].map((label) => (
        <Popover key={label} position="bottom">
          <Popover.Target>
            <button style={btnStyle}>{label}</button>
          </Popover.Target>
          <Popover.Dropdown>
            <div style={{ minWidth: 140, fontSize: 13 }}>
              {label} popover content
            </div>
          </Popover.Dropdown>
        </Popover>
      ))}
    </div>
  ),
};

/** Custom offset */
export const CustomOffset: Story = {
  render: () => (
    <Popover offset={20}>
      <Popover.Target>
        <button style={btnStyle}>Large Offset (20px)</button>
      </Popover.Target>
      <Popover.Dropdown>
        <div style={{ minWidth: 160, fontSize: 13 }}>
          20px offset from target
        </div>
      </Popover.Dropdown>
    </Popover>
  ),
};

/** Form inside popover */
export const FormContent: Story = {
  render: () => (
    <Popover position="bottom-start">
      <Popover.Target>
        <button style={btnStyle}>Quick Edit</button>
      </Popover.Target>
      <Popover.Dropdown>
        <div style={{ minWidth: 260 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Edit Name</div>
          <input
            type="text"
            placeholder="Enter name..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 13,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button style={{ ...btnStyle, fontSize: 12 }}>Cancel</button>
            <button
              style={{
                ...btnStyle,
                fontSize: 12,
                background: '#1976d2',
                color: '#fff',
                border: 'none',
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  ),
};

// ---------------------------------------------------------------------------
// PopoverController (Layer 4 — Programmatic API)
// ---------------------------------------------------------------------------

function PopoverControllerDemo() {
  const popover = usePopoverController();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleOpen = () => {
    if (!btnRef.current) return;
    const id = popover.open({
      target: btnRef.current,
      content: (
        <div style={{ minWidth: 220 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Programmatic Popover</p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>
            Opened via <code>popover.open()</code>
          </p>
          <button
            style={{ ...btnStyle, marginTop: 12, fontSize: 12 }}
            onClick={() => {
              popover.close(id);
              setActiveId(null);
            }}
          >
            Close via controller
          </button>
        </div>
      ),
      position: 'bottom',
      withArrow: true,
    });
    setActiveId(id);
  };

  const handleClose = () => {
    if (activeId) {
      popover.close(activeId);
      setActiveId(null);
    }
  };

  const handleCloseAll = () => {
    popover.closeAll();
    setActiveId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button ref={btnRef} style={btnStyle} onClick={handleOpen}>
          popover.open()
        </button>
        <button style={btnStyle} onClick={handleClose} disabled={!activeId}>
          popover.close(id)
        </button>
        <button style={btnStyle} onClick={handleCloseAll}>
          popover.closeAll()
        </button>
      </div>
      <span style={{ fontSize: 12, color: '#888' }}>
        Active ID: {activeId ?? 'none'}
      </span>
    </div>
  );
}

/** Programmatic popover via PopoverController (Layer 4) */
export const ProgrammaticController: Story = {
  render: () => <PopoverControllerDemo />,
};

// ---------------------------------------------------------------------------
// Arrow Position Styles — grouped by where the arrow physically sits
// ---------------------------------------------------------------------------

/**
 * Shows how arrow styles change based on the arrow's physical position.
 *
 * Mapping (arrow position → popover `position` prop):
 *   arrow top       → position="bottom" / "bottom-start"
 *   arrow top-right → position="bottom-end"
 *   arrow bottom-left → position="top-end"
 *   arrow bottom    → position="top" / "top-start"
 *   arrow left-*    → position="right" / "right-start" / "right-end"
 *   arrow right-*   → position="left" / "left-start" / "left-end"
 */
export const ArrowPositionStyles: Story = {
  render: () => {
    const groups: { label: string; style: string; positions: PopoverBasePosition[] }[] = [
      {
        label: 'Arrow at Top / Top-left (base)',
        style: 'paper + border only',
        positions: ['bottom', 'bottom-start'],
      },
      {
        label: 'Arrow at Top-right (info gradient)',
        style: 'info gradient → right top',
        positions: ['bottom-end'],
      },
      {
        label: 'Arrow at Bottom / Bottom-right (base)',
        style: 'paper + border only',
        positions: ['top', 'top-start'],
      },
      {
        label: 'Arrow at Bottom-left (error gradient)',
        style: 'error gradient → left bottom',
        positions: ['top-end'],
      },
      {
        label: 'Arrow at Left-* (error gradient)',
        style: 'error gradient → left bottom',
        positions: ['right', 'right-start', 'right-end'],
      },
      {
        label: 'Arrow at Right-* (info gradient)',
        style: 'info gradient → right top',
        positions: ['left', 'left-start', 'left-end'],
      },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: 120 }}>
        {groups.map((group) => (
          <div key={group.label}>
            <div style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: 14 }}>{group.label}</strong>
              <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>{group.style}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {group.positions.map((pos) => (
                <Popover key={pos} position={pos}>
                  <Popover.Target>
                    <button style={{ ...btnStyle, minWidth: 130 }}>
                      pos="{pos}"
                    </button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <div style={{ fontSize: 13, minWidth: 160 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>position: {pos}</div>
                      <div style={{ color: '#888' }}>Arrow: {group.label.replace('Arrow at ', '')}</div>
                    </div>
                  </Popover.Dropdown>
                </Popover>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
