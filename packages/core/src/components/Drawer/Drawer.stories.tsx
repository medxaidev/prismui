import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { Drawer } from './Drawer';
import { DrawerHeader } from './DrawerHeader';
import { DrawerTitle } from './DrawerTitle';
import { DrawerBody } from './DrawerBody';
import { DrawerFooter } from './DrawerFooter';
import { DrawerCloseButton } from './DrawerCloseButton';

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
    <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
      {children}
    </PrismuiProvider>
  );
}

// ============================================================================
// Meta
// ============================================================================

const meta: Meta = {
  title: 'Components/Drawer',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// 1. Basic Drawer (right)
// ============================================================================

function BasicDrawerDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Basic Drawer</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        A simple drawer sliding in from the right with a title and close button.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Drawer</button>

      <Drawer opened={opened} onClose={() => setOpened(false)} title="Settings">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This is a basic Drawer component built on top of ModalBase.
          It slides in from the right edge by default and provides
          semantic structure with a header, body, and optional footer.
        </p>
      </Drawer>
    </div>
  );
}

export const BasicDrawer: Story = {
  name: 'Basic Drawer',
  render: () => <Wrapper><BasicDrawerDemo /></Wrapper>,
};

// ============================================================================
// 2. Position variants
// ============================================================================

function PositionDemo() {
  const [position, setPosition] = useState<'left' | 'right' | 'top' | 'bottom'>('right');
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Position Variants</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Drawer can slide from any edge: <code>left</code>, <code>right</code>, <code>top</code>, or <code>bottom</code>.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['left', 'right', 'top', 'bottom'] as const).map((pos) => (
          <button
            key={pos}
            style={position === pos ? btnStyle : secondaryBtn}
            onClick={() => setPosition(pos)}
          >
            {pos}
          </button>
        ))}
      </div>
      <button style={btnStyle} onClick={() => setOpened(true)}>
        Open Drawer ({position})
      </button>

      <Drawer opened={opened} onClose={() => setOpened(false)} title={`${position} Drawer`} position={position}>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This drawer slides in from the <strong>{position}</strong> edge.
        </p>
      </Drawer>
    </div>
  );
}

export const PositionVariants: Story = {
  name: 'Position Variants',
  render: () => <Wrapper><PositionDemo /></Wrapper>,
};

// ============================================================================
// 3. Custom Size
// ============================================================================

function CustomSizeDemo() {
  const [size, setSize] = useState<number | string>(320);
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Custom Size</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Drawer width (left/right) or height (top/bottom) can be set with the <code>size</code> prop.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button style={size === 240 ? btnStyle : secondaryBtn} onClick={() => setSize(240)}>240px</button>
        <button style={size === 320 ? btnStyle : secondaryBtn} onClick={() => setSize(320)}>320px (default)</button>
        <button style={size === 480 ? btnStyle : secondaryBtn} onClick={() => setSize(480)}>480px</button>
        <button style={size === '50%' ? btnStyle : secondaryBtn} onClick={() => setSize('50%')}>50%</button>
      </div>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Drawer (size: {String(size)})</button>

      <Drawer opened={opened} onClose={() => setOpened(false)} title={`Size: ${size}`} size={size}>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This drawer has a custom width of <strong>{String(size)}</strong>.
        </p>
      </Drawer>
    </div>
  );
}

export const CustomSize: Story = {
  name: 'Custom Size',
  render: () => <Wrapper><CustomSizeDemo /></Wrapper>,
};

// ============================================================================
// 4. Without Overlay
// ============================================================================

function NoOverlayDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Without Overlay</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Set <code>withOverlay=false</code> to remove the backdrop. The page remains interactive.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Drawer (no overlay)</button>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="No Overlay"
        withOverlay={false}
        closeOnClickOutside={false}
      >
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This drawer has no backdrop overlay. The page behind remains visible and interactive.
        </p>
      </Drawer>
    </div>
  );
}

export const WithoutOverlay: Story = {
  name: 'Without Overlay',
  render: () => <Wrapper><NoOverlayDemo /></Wrapper>,
};

// ============================================================================
// 5. Without Close Button
// ============================================================================

function NoCloseButtonDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Without Close Button</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Set <code>withCloseButton=false</code>. Close via overlay click or Escape.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Drawer</button>

      <Drawer opened={opened} onClose={() => setOpened(false)} title="No Close Button" withCloseButton={false}>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This drawer has no close button. Click the overlay or press Escape to close.
        </p>
      </Drawer>
    </div>
  );
}

export const WithoutCloseButton: Story = {
  name: 'Without Close Button',
  render: () => <Wrapper><NoCloseButtonDemo /></Wrapper>,
};

// ============================================================================
// 6. Compound Components
// ============================================================================

function CompoundDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Compound Components</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Use <code>DrawerHeader</code>, <code>DrawerTitle</code>, <code>DrawerBody</code>,
        <code>DrawerFooter</code>, and <code>DrawerCloseButton</code> for full control.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Compound Drawer</button>

      <Drawer opened={opened} onClose={() => setOpened(false)} withCloseButton={false}>
        <DrawerHeader>
          <DrawerTitle>Custom Layout</DrawerTitle>
          <DrawerCloseButton />
        </DrawerHeader>
        <DrawerBody>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
            This drawer uses compound components for full layout control.
            The header, body, and footer are composed individually.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <button style={secondaryBtn} onClick={() => setOpened(false)}>Cancel</button>
          <button style={btnStyle} onClick={() => setOpened(false)}>Save</button>
        </DrawerFooter>
      </Drawer>
    </div>
  );
}

export const CompoundComponents: Story = {
  name: 'Compound Components',
  render: () => <Wrapper><CompoundDemo /></Wrapper>,
};

// ============================================================================
// 7. Scrollable Content
// ============================================================================

function ScrollableDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Scrollable Content</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Long content scrolls within the drawer body.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Scrollable Drawer</button>

      <Drawer opened={opened} onClose={() => setOpened(false)} title="Scrollable Content" size={360}>
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i} style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: '0 0 12px' }}>
            Item {i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        ))}
      </Drawer>
    </div>
  );
}

export const ScrollableContent: Story = {
  name: 'Scrollable Content',
  render: () => <Wrapper><ScrollableDemo /></Wrapper>,
};

// ============================================================================
// 8. Bottom Sheet Style
// ============================================================================

function BottomSheetDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Bottom Sheet</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        A bottom-positioned drawer acts like a mobile bottom sheet.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Open Bottom Sheet</button>

      <Drawer opened={opened} onClose={() => setOpened(false)} title="Actions" position="bottom" size={280}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{ ...secondaryBtn, width: '100%', textAlign: 'left' }}>Share</button>
          <button style={{ ...secondaryBtn, width: '100%', textAlign: 'left' }}>Copy Link</button>
          <button style={{ ...secondaryBtn, width: '100%', textAlign: 'left' }}>Edit</button>
          <button style={{ ...secondaryBtn, width: '100%', textAlign: 'left', color: '#d32f2f' }}>Delete</button>
        </div>
      </Drawer>
    </div>
  );
}

export const BottomSheet: Story = {
  name: 'Bottom Sheet',
  render: () => <Wrapper><BottomSheetDemo /></Wrapper>,
};

// ============================================================================
// 9. Nested Drawers
// ============================================================================

function NestedDrawersDemo() {
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);

  return (
    <div>
      <h3>Nested Drawers</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Drawers can be nested. Each gets its own z-index from the OverlayManager.
        Escape closes only the topmost drawer.
      </p>
      <button style={btnStyle} onClick={() => setFirst(true)}>Open First Drawer</button>

      <Drawer opened={first} onClose={() => setFirst(false)} title="First Drawer" size={400}>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: '0 0 16px' }}>
          This is the first drawer. Open another one on top.
        </p>
        <button style={btnStyle} onClick={() => setSecond(true)}>Open Second Drawer</button>
      </Drawer>

      <Drawer opened={second} onClose={() => setSecond(false)} title="Second Drawer" size={320} position="left">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
          This is the second drawer from the left, stacked on top.
          Press Escape to close only this one.
        </p>
      </Drawer>
    </div>
  );
}

export const NestedDrawers: Story = {
  name: 'Nested Drawers',
  render: () => <Wrapper><NestedDrawersDemo /></Wrapper>,
};

// ============================================================================
// 10. Form in Drawer
// ============================================================================

function FormDrawerDemo() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <h3>Form in Drawer</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        A common pattern: a form inside a drawer with a sticky footer.
      </p>
      <button style={btnStyle} onClick={() => setOpened(true)}>Edit Profile</button>

      <Drawer opened={opened} onClose={() => setOpened(false)} withCloseButton={false} size={400}>
        <DrawerHeader>
          <DrawerTitle>Edit Profile</DrawerTitle>
          <DrawerCloseButton />
        </DrawerHeader>
        <DrawerBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ fontSize: 14, color: '#333' }}>
              Name
              <input
                type="text"
                defaultValue="John Doe"
                style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', marginTop: 4, boxSizing: 'border-box' }}
              />
            </label>
            <label style={{ fontSize: 14, color: '#333' }}>
              Email
              <input
                type="email"
                defaultValue="john@example.com"
                style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', marginTop: 4, boxSizing: 'border-box' }}
              />
            </label>
            <label style={{ fontSize: 14, color: '#333' }}>
              Bio
              <textarea
                rows={4}
                defaultValue="Software engineer"
                style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', marginTop: 4, boxSizing: 'border-box', resize: 'vertical' }}
              />
            </label>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <button style={secondaryBtn} onClick={() => setOpened(false)}>Cancel</button>
          <button style={btnStyle} onClick={() => setOpened(false)}>Save Changes</button>
        </DrawerFooter>
      </Drawer>
    </div>
  );
}

export const FormDrawer: Story = {
  name: 'Form in Drawer',
  render: () => <Wrapper><FormDrawerDemo /></Wrapper>,
};
