import type { Meta, StoryObj } from '@storybook/react';
import { AuthLayout } from './AuthLayout';

const meta: Meta<typeof AuthLayout> = {
  title: 'Layout/AuthLayout',
  component: AuthLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AuthLayout>;

export const LoginCard: Story = {
  render: () => (
    <AuthLayout>
      <div style={{
        width: 400,
        padding: 32,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ margin: '0 0 8px', textAlign: 'center' }}>Sign In</h2>
        <p style={{ margin: '0 0 24px', textAlign: 'center', color: '#888', fontSize: 14 }}>
          Welcome back! Please enter your credentials.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input placeholder="Email" style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
          <input placeholder="Password" type="password" style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
          <button style={{ padding: '10px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            Sign In
          </button>
        </div>
      </div>
    </AuthLayout>
  ),
};

export const RegisterCard: Story = {
  render: () => (
    <AuthLayout>
      <div style={{
        width: 440,
        padding: 32,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ margin: '0 0 8px', textAlign: 'center' }}>Create Account</h2>
        <p style={{ margin: '0 0 24px', textAlign: 'center', color: '#888', fontSize: 14 }}>
          Fill in the form to get started.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input placeholder="First name" style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
            <input placeholder="Last name" style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
          </div>
          <input placeholder="Email" style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
          <input placeholder="Password" type="password" style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
          <button style={{ padding: '10px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            Create Account
          </button>
        </div>
      </div>
    </AuthLayout>
  ),
};

export const CustomBackground: Story = {
  render: () => (
    <AuthLayout style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{
        width: 400,
        padding: 32,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}>
        <h2 style={{ margin: '0 0 16px', textAlign: 'center' }}>Welcome</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>Custom gradient background.</p>
      </div>
    </AuthLayout>
  ),
};
