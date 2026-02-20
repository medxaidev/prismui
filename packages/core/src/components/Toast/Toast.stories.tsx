import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../../core/runtime/overlay/overlayModule';
import { toastModule } from '../../core/runtime/toast/toastModule';
import { useToastController } from '../../core/runtime/toast/useToastController';
import { ToastRenderer } from '../../core/runtime/toast/ToastRenderer';
import { Toast } from './Toast';
import type { ToastSeverity } from './Toast';
import type { ToastPosition } from '../ToastBase/ToastBase.context';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <PrismuiProvider modules={[overlayModule(), toastModule()]}>
        <Story />
        <ToastRenderer />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toast>;

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default dark toast */
export const Default: Story = {
  render: () => (
    <div style={{ width: 356 }}>
      <Toast
        severity="default"
        title="Event has been created"
        description="Monday, January 3rd at 6:00 PM"
        onClose={() => {}}
      />
    </div>
  ),
};

/** All severity variants */
export const Severities: Story = {
  render: () => {
    const severities: ToastSeverity[] = ['default', 'primary', 'info', 'success', 'warning', 'error'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 356 }}>
        {severities.map((s) => (
          <Toast
            key={s}
            severity={s}
            title={`${s.charAt(0).toUpperCase() + s.slice(1)} Toast`}
            description={`This is a ${s} severity toast notification.`}
            onClose={() => {}}
          />
        ))}
      </div>
    );
  },
};

/** Toast with custom action button */
export const WithAction: Story = {
  render: () => (
    <div style={{ width: 356 }}>
      <Toast
        severity="info"
        title="New update available"
        description="Version 2.0 is ready to install."
        action={
          <button
            style={{
              ...btnStyle,
              fontSize: 12,
              padding: '4px 12px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
            }}
          >
            Update
          </button>
        }
        onClose={() => {}}
      />
    </div>
  ),
};

/** Loading state (promise toast) */
export const Loading: Story = {
  render: () => (
    <div style={{ width: 356 }}>
      <Toast
        severity="default"
        title="Uploading file..."
        description="Please wait while we process your file."
        loading
        dismissible={false}
      />
    </div>
  ),
};

/** Without close button */
export const NoDismiss: Story = {
  render: () => (
    <div style={{ width: 356 }}>
      <Toast
        severity="success"
        title="Auto-saving..."
        description="Your changes are being saved automatically."
        dismissible={false}
      />
    </div>
  ),
};

/** Custom icon override */
export const CustomIcon: Story = {
  render: () => (
    <div style={{ width: 356 }}>
      <Toast
        severity="primary"
        title="Custom Icon"
        description="This toast uses a custom star icon."
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        }
        onClose={() => {}}
      />
    </div>
  ),
};

/** Long content with text overflow */
export const LongContent: Story = {
  render: () => (
    <div style={{ width: 356 }}>
      <Toast
        severity="warning"
        title="This is a very long title that should be truncated with ellipsis when it overflows"
        description="This is a very long description that demonstrates how the toast handles multi-line text content. It should be clamped to two lines maximum with an ellipsis at the end."
        onClose={() => {}}
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Programmatic Controller Stories
// ---------------------------------------------------------------------------

function ControllerDemo() {
  const toast = useToastController();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <h3 style={{ margin: 0, fontSize: 14 }}>Programmatic Toast API</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          style={btnStyle}
          onClick={() => toast.show({ title: 'Default toast', description: 'Simple notification' })}
        >
          toast.show()
        </button>
        <button
          style={{ ...btnStyle, color: '#1976d2' }}
          onClick={() => toast.success('File uploaded', { description: 'Your file has been saved.' })}
        >
          toast.success()
        </button>
        <button
          style={{ ...btnStyle, color: '#d32f2f' }}
          onClick={() => toast.error('Upload failed', { description: 'Please try again later.' })}
        >
          toast.error()
        </button>
        <button
          style={{ ...btnStyle, color: '#ed6c02' }}
          onClick={() => toast.warning('Low storage', { description: 'Only 100MB remaining.' })}
        >
          toast.warning()
        </button>
        <button
          style={{ ...btnStyle, color: '#0288d1' }}
          onClick={() => toast.info('New feature', { description: 'Check out the new dashboard.' })}
        >
          toast.info()
        </button>
        <button
          style={btnStyle}
          onClick={() => toast.hideAll()}
        >
          toast.hideAll()
        </button>
      </div>
    </div>
  );
}

/** Programmatic toast via ToastController */
export const ProgrammaticController: Story = {
  render: () => <ControllerDemo />,
};

// ---------------------------------------------------------------------------
// Promise Toast
// ---------------------------------------------------------------------------

function PromiseDemo() {
  const toast = useToastController();

  const handleSuccess = () => {
    toast.promise(
      new Promise<string>((resolve) => setTimeout(() => resolve('data'), 2000)),
      {
        loading: { title: 'Uploading...', description: 'Please wait' },
        success: { title: 'Upload complete!', description: 'File has been saved.' },
        error: { title: 'Upload failed', description: 'Something went wrong.' },
      },
    );
  };

  const handleError = () => {
    toast.promise(
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Network error')), 2000)),
      {
        loading: { title: 'Connecting...', description: 'Establishing connection' },
        success: { title: 'Connected!' },
        error: (err) => ({
          title: 'Connection failed',
          description: (err as Error).message,
        }),
      },
    );
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button style={btnStyle} onClick={handleSuccess}>
        Promise (success)
      </button>
      <button style={btnStyle} onClick={handleError}>
        Promise (error)
      </button>
    </div>
  );
}

/** Promise toast: loading → success/error */
export const PromiseToast: Story = {
  render: () => <PromiseDemo />,
};

// ---------------------------------------------------------------------------
// Positions
// ---------------------------------------------------------------------------

function PositionDemo() {
  const toast = useToastController();
  const [position, setPosition] = useState<ToastPosition>('bottom-right');

  const positions: ToastPosition[] = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {positions.map((pos) => (
          <button
            key={pos}
            style={{
              ...btnStyle,
              fontWeight: position === pos ? 700 : 400,
              borderColor: position === pos ? '#1976d2' : '#ccc',
            }}
            onClick={() => setPosition(pos)}
          >
            {pos}
          </button>
        ))}
      </div>
      <button
        style={{ ...btnStyle, background: '#1976d2', color: '#fff', border: 'none' }}
        onClick={() =>
          toast.success('Toast!', {
            description: `Position: ${position}`,
            position,
          })
        }
      >
        Show toast at {position}
      </button>
    </div>
  );
}

/** All 6 positions */
export const Positions: Story = {
  render: () => <PositionDemo />,
};

// ---------------------------------------------------------------------------
// Stacking
// ---------------------------------------------------------------------------

function StackingDemo() {
  const toast = useToastController();
  let count = 0;

  const addToast = () => {
    count += 1;
    const severities: ToastSeverity[] = ['default', 'success', 'error', 'warning', 'info'];
    const severity = severities[count % severities.length];
    toast.show({
      title: `Toast #${count}`,
      description: `This is toast number ${count}`,
      severity,
    });
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button style={btnStyle} onClick={addToast}>
        Add Toast
      </button>
      <button style={btnStyle} onClick={() => toast.hideAll()}>
        Clear All
      </button>
    </div>
  );
}

/** Multiple toasts with Sonner-style stacking */
export const Stacking: Story = {
  render: () => <StackingDemo />,
};

// ---------------------------------------------------------------------------
// With Action Buttons
// ---------------------------------------------------------------------------

function ActionDemo() {
  const toast = useToastController();

  const showWithAction = () => {
    const id = toast.show({
      title: 'Message archived',
      description: 'This conversation has been archived.',
      severity: 'info',
      duration: 8000,
      action: React.createElement(
        'button',
        {
          style: {
            ...btnStyle,
            fontSize: 12,
            padding: '4px 12px',
          },
          onClick: () => {
            toast.hide(id);
            toast.success('Undone!', { description: 'Message restored.' });
          },
        },
        'Undo',
      ),
    });
  };

  return (
    <button style={btnStyle} onClick={showWithAction}>
      Show with Undo action
    </button>
  );
}

/** Toast with action button */
export const WithActionProgrammatic: Story = {
  render: () => <ActionDemo />,
};
