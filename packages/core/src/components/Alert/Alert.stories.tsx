import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../core/PrismuiProvider/PrismuiProvider';
import { Alert } from './Alert';
import type { AlertVariant, AlertSeverity } from './Alert';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Alert>;

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 20,
  marginBottom: 16,
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: 15,
  fontWeight: 700,
};

const grid: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const label: React.CSSProperties = {
  fontSize: 11,
  color: '#9ca3af',
  marginBottom: 4,
  fontFamily: 'monospace',
};

const btn: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 4,
  border: '1px solid currentColor',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  color: 'inherit',
  opacity: 0.8,
};

// ---------------------------------------------------------------------------
// 1. Basic Severities
// ---------------------------------------------------------------------------

export const BasicSeverities: Story = {
  name: '1. Basic Severities',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Alert Severities (default: soft variant)</h3>
        <div style={grid}>
          <Alert severity="info" title="Info" description="This is an informational alert." />
          <Alert severity="success" title="Success" description="Operation completed successfully." />
          <Alert severity="warning" title="Warning" description="Please review before proceeding." />
          <Alert severity="error" title="Error" description="Something went wrong. Please try again." />
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 2. Title Only (No Description)
// ---------------------------------------------------------------------------

export const TitleOnly: Story = {
  name: '2. Title Only',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Title Only (No Description)</h3>
        <div style={grid}>
          <Alert severity="info" title="Info Alert" />
          <Alert severity="success" title="Success Alert" />
          <Alert severity="warning" title="Warning Alert" />
          <Alert severity="error" title="Error Alert" />
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 3. Variants
// ---------------------------------------------------------------------------

export const Variants: Story = {
  name: '3. Variants',
  render: () => {
    const variants: AlertVariant[] = ['solid', 'soft', 'outlined', 'plain'];
    return (
      <div style={{ maxWidth: 600 }}>
        {variants.map((variant) => (
          <div key={variant} style={card}>
            <h3 style={sectionTitle}>{variant}</h3>
            <div style={grid}>
              <Alert variant={variant} severity="info" title="Info" description="Informational message." />
              <Alert variant={variant} severity="success" title="Success" description="Operation succeeded." />
              <Alert variant={variant} severity="warning" title="Warning" description="Caution required." />
              <Alert variant={variant} severity="error" title="Error" description="An error occurred." />
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 4. With Close Button
// ---------------------------------------------------------------------------

export const WithCloseButton: Story = {
  name: '4. With Close Button',
  render: () => {
    const [visible, setVisible] = useState({
      info: true,
      success: true,
      warning: true,
      error: true,
    });

    const handleClose = (key: keyof typeof visible) => {
      setVisible((prev) => ({ ...prev, [key]: false }));
    };

    const reset = () => setVisible({ info: true, success: true, warning: true, error: true });

    return (
      <div style={{ maxWidth: 600 }}>
        <div style={card}>
          <h3 style={sectionTitle}>Dismissible Alerts</h3>
          <button
            style={{ ...btn, marginBottom: 12, color: '#3b82f6', borderColor: '#3b82f6' }}
            onClick={reset}
          >
            Reset All
          </button>
          <div style={grid}>
            {visible.info && (
              <Alert
                severity="info"
                title="Info"
                description="Click the close button to dismiss."
                withCloseButton
                onClose={() => handleClose('info')}
              />
            )}
            {visible.success && (
              <Alert
                severity="success"
                title="Success"
                description="Your changes have been saved."
                withCloseButton
                onClose={() => handleClose('success')}
              />
            )}
            {visible.warning && (
              <Alert
                severity="warning"
                title="Warning"
                description="Your session is about to expire."
                withCloseButton
                onClose={() => handleClose('warning')}
              />
            )}
            {visible.error && (
              <Alert
                severity="error"
                title="Error"
                description="Failed to save changes."
                withCloseButton
                onClose={() => handleClose('error')}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 5. With Description
// ---------------------------------------------------------------------------

export const WithDescription: Story = {
  name: '5. With Description',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Title + Description</h3>
        <div style={grid}>
          <Alert
            severity="info"
            title="Did you know?"
            description="You can customize the alert appearance using the variant and color props. Alerts support solid, soft, outlined, and plain variants."
          />
          <Alert
            severity="success"
            variant="outlined"
            title="Deployment Complete"
            description="Your application has been successfully deployed to production. All health checks are passing."
          />
        </div>
      </div>
      <div style={card}>
        <h3 style={sectionTitle}>Description Only (no title)</h3>
        <div style={grid}>
          <Alert severity="warning" description="Please save your work before the session expires in 5 minutes." />
          <Alert severity="error" description="Unable to connect to the server. Check your network connection." />
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 6. With Actions
// ---------------------------------------------------------------------------

export const WithActions: Story = {
  name: '6. With Actions',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Alert with Action Buttons</h3>
        <div style={grid}>
          <Alert
            severity="info"
            title="New Update Available"
            description="Version 2.0 is ready to install."
            actions={
              <>
                <button style={btn}>Update Now</button>
                <button style={{ ...btn, opacity: 0.5 }}>Later</button>
              </>
            }
          />
          <Alert
            severity="error"
            variant="outlined"
            title="Payment Failed"
            description="Your payment could not be processed."
            actions={<button style={btn}>Retry Payment</button>}
            withCloseButton
          />
          <Alert
            severity="warning"
            variant="solid"
            title="Unsaved Changes"
            description="You have unsaved changes that will be lost."
            actions={
              <>
                <button style={{ ...btn, borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>Save</button>
                <button style={{ ...btn, borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }}>Discard</button>
              </>
            }
          />
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 7. Custom Icon
// ---------------------------------------------------------------------------

export const CustomIcon: Story = {
  name: '7. Custom Icon',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Custom Icons</h3>
        <div style={grid}>
          <Alert
            severity="info"
            icon={<span style={{ fontSize: 20 }}>🚀</span>}
            title="Launch Ready"
            description="All systems are go for launch."
          />
          <Alert
            severity="success"
            icon={false}
            title="No Icon"
            description="This alert has icon={false} to hide the default icon."
          />
          <Alert
            severity="warning"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            }
            title="Custom SVG"
            description="You can pass any React node as the icon."
          />
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 8. Color Override
// ---------------------------------------------------------------------------

export const ColorOverride: Story = {
  name: '8. Color Override',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Color Override</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>
          Use the <code>color</code> prop to override the severity-derived color.
        </p>
        <div style={grid}>
          <div style={label}>color="primary"</div>
          <Alert color="primary" title="Primary Color" description="Using primary theme color." />
          <div style={label}>color="secondary"</div>
          <Alert color="secondary" title="Secondary Color" description="Using secondary theme color." />
          <div style={label}>color="blue" (color family)</div>
          <Alert color="blue" title="Blue Family" description="Using blue color family." />
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 9. Children as Content
// ---------------------------------------------------------------------------

export const ChildrenContent: Story = {
  name: '9. Children as Content',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Using Children</h3>
        <div style={grid}>
          <Alert severity="info" title="Rich Content">
            <p style={{ margin: '4px 0' }}>
              You can use <strong>children</strong> instead of the <code>description</code> prop
              for rich content including <em>formatted text</em>, links, and more.
            </p>
          </Alert>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 10. API Reference
// ---------------------------------------------------------------------------

export const APIReference: Story = {
  name: '10. API Reference',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <div style={card}>
        <h3 style={sectionTitle}>Alert API Reference</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Prop</th>
              <th style={{ padding: '8px 12px' }}>Type</th>
              <th style={{ padding: '8px 12px' }}>Default</th>
              <th style={{ padding: '8px 12px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['severity', "'info' | 'success' | 'warning' | 'error'", "'info'", 'Semantic severity, determines icon & color'],
              ['variant', "'solid' | 'soft' | 'outlined' | 'plain'", "'soft'", 'Visual variant'],
              ['color', 'string', 'from severity', 'Color override (semantic, family, or CSS)'],
              ['title', 'ReactNode', '—', 'Alert title'],
              ['description', 'ReactNode', '—', 'Alert description text'],
              ['icon', 'ReactNode | false', 'severity icon', 'Custom icon or false to hide'],
              ['actions', 'ReactNode', '—', 'Action buttons below description'],
              ['withCloseButton', 'boolean', 'false', 'Show close button'],
              ['onClose', '() => void', '—', 'Close button callback'],
              ['closeButtonLabel', 'string', "'Close'", 'Close button aria-label'],
              ['radius', 'PrismuiRadius', "'md'", 'Border radius'],
            ].map(([prop, type, def, desc]) => (
              <tr key={prop} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{prop}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#6b7280', fontSize: 12 }}>{type}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#9ca3af' }}>{def}</td>
                <td style={{ padding: '8px 12px' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Built-in Icons</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Name</th>
              <th style={{ padding: '8px 12px' }}>Path</th>
              <th style={{ padding: '8px 12px' }}>Used By</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['CloseIcon', 'icons/CloseIcon', 'Alert close button (14px)'],
              ['InfoIcon', 'icons/InfoIcon', 'severity="info" (24px)'],
              ['SuccessIcon', 'icons/SuccessIcon', 'severity="success" (24px)'],
              ['WarningIcon', 'icons/WarningIcon', 'severity="warning" (24px)'],
              ['ErrorIcon', 'icons/ErrorIcon', 'severity="error" (24px)'],
            ].map(([name, path, usage]) => (
              <tr key={name} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{name}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#6b7280', fontSize: 12 }}>{path}</td>
                <td style={{ padding: '8px 12px' }}>{usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Styles API (stylesNames)</h3>
        <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 6, fontSize: 12, overflow: 'auto' }}>
          {`root        — outer container (role="alert")
wrapper     — flex row (icon + body + close)
icon        — icon container (24×24)
body        — flex column (title + description + actions)
title       — title text (font-weight: 600)
description — description text (opacity: 0.85)
actions     — action buttons container
closeButton — close button (20×20, extends ButtonBase)`}
        </pre>
      </div>
    </div>
  ),
};
