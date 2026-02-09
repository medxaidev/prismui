import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useEffect, useState } from 'react';
import { PrismuiProvider } from '../PrismuiProvider/PrismuiProvider';
import { useColorScheme } from '../PrismuiProvider/prismui-theme-context';
import type { PrismuiShadowKey } from '../theme/types';

// ---------------------------------------------------------------------------
// Shadow token keys grouped for display
// ---------------------------------------------------------------------------

const SIZE_SHADOWS: PrismuiShadowKey[] = [
  'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl',
];

const COMPONENT_SHADOWS: PrismuiShadowKey[] = [
  'dialog', 'card', 'dropdown',
];

const SEMANTIC_SHADOWS: PrismuiShadowKey[] = [
  'primary', 'secondary', 'info', 'success', 'warning', 'error',
];

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

function ShadowCard({ name }: { name: string }) {
  const varName = `--prismui-shadow-${name}`;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        minWidth: 160,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 12,
          backgroundColor: 'var(--prismui-background-paper)',
          boxShadow: `var(${varName})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
      <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--prismui-text-primary)' }}>
        {name}
      </code>
      <code
        style={{
          fontSize: 10,
          color: 'var(--prismui-text-disabled)',
          maxWidth: 240,
          textAlign: 'center',
          wordBreak: 'break-all',
        }}
      >
        {varName}
      </code>
    </div>
  );
}

function ShadowSection({
  title,
  keys,
}: {
  title: string;
  keys: PrismuiShadowKey[];
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3
        style={{
          fontFamily: 'var(--prismui-font-family)',
          color: 'var(--prismui-text-primary)',
          marginBottom: 16,
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {title}
      </h3>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        {keys.map((key) => (
          <ShadowCard key={key} name={key} />
        ))}
      </div>
    </div>
  );
}

function SchemeToggle() {
  const [scheme, setScheme] = useColorScheme();
  return (
    <button
      type="button"
      onClick={() => setScheme(scheme === 'light' ? 'dark' : 'light')}
      style={{
        marginBottom: 24,
        padding: '6px 16px',
        borderRadius: 8,
        border: '1px solid var(--prismui-divider)',
        backgroundColor: 'var(--prismui-background-paper)',
        color: 'var(--prismui-text-primary)',
        cursor: 'pointer',
        fontSize: 13,
        fontFamily: 'var(--prismui-font-family)',
      }}
    >
      Current: <strong>{scheme}</strong> — click to toggle
    </button>
  );
}

function AllShadows() {
  return (
    <div
      style={{
        padding: 32,
        backgroundColor: 'var(--prismui-background-default)',
        minHeight: '100vh',
      }}
    >
      <SchemeToggle />
      <ShadowSection title="Size Shadows" keys={SIZE_SHADOWS} />
      <ShadowSection title="Component Shadows" keys={COMPONENT_SHADOWS} />
      <ShadowSection title="Semantic Color Shadows" keys={SEMANTIC_SHADOWS} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Theme/Shadows',
  decorators: [
    (Story) => (
      <PrismuiProvider>
        <Story />
      </PrismuiProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const Overview: Story = {
  render: () => <AllShadows />,
};

// ---------------------------------------------------------------------------
// CSS Values story — shows the actual generated variable values
// ---------------------------------------------------------------------------

const ALL_SHADOW_KEYS: PrismuiShadowKey[] = [
  ...SIZE_SHADOWS,
  ...COMPONENT_SHADOWS,
  ...SEMANTIC_SHADOWS,
];

function CssValueTable() {
  const ref = useRef<HTMLDivElement>(null);
  const [scheme, setScheme] = useColorScheme();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!ref.current) return;
    const cs = getComputedStyle(ref.current);
    const result: Record<string, string> = {};
    for (const key of ALL_SHADOW_KEYS) {
      result[key] = cs.getPropertyValue(`--prismui-shadow-${key}`).trim();
    }
    setValues(result);
  }, [scheme]);

  return (
    <div
      ref={ref}
      style={{
        padding: 32,
        backgroundColor: 'var(--prismui-background-default)',
        minHeight: '100vh',
        fontFamily: 'var(--prismui-font-family)',
      }}
    >
      <button
        type="button"
        onClick={() => setScheme(scheme === 'light' ? 'dark' : 'light')}
        style={{
          marginBottom: 24,
          padding: '6px 16px',
          borderRadius: 8,
          border: '1px solid var(--prismui-divider)',
          backgroundColor: 'var(--prismui-background-paper)',
          color: 'var(--prismui-text-primary)',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Current: <strong>{scheme}</strong> — click to toggle
      </button>

      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: 12,
          color: 'var(--prismui-text-primary)',
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--prismui-divider)' }}>
              Variable
            </th>
            <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--prismui-divider)' }}>
              Computed Value
            </th>
          </tr>
        </thead>
        <tbody>
          {ALL_SHADOW_KEYS.map((key) => (
            <tr key={key}>
              <td
                style={{
                  padding: '6px 12px',
                  borderBottom: '1px solid var(--prismui-divider)',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                --prismui-shadow-{key}
              </td>
              <td
                style={{
                  padding: '6px 12px',
                  borderBottom: '1px solid var(--prismui-divider)',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {values[key] || '(loading...)'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const CssValues: Story = {
  render: () => <CssValueTable />,
};
