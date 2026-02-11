import React, { forwardRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../PrismuiProvider/PrismuiProvider';
import { useTheme } from '../PrismuiProvider/prismui-theme-context';
import { factory } from './factory';
import { useProps } from './use-props';
import type { Factory } from './create-factory';

// ---------------------------------------------------------------------------
// Demo component: DemoButton — uses factory() + useProps()
// ---------------------------------------------------------------------------

interface DemoButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outlined' | 'ghost';
  color?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

type DemoButtonFactory = Factory<{
  props: DemoButtonProps;
  ref: HTMLButtonElement;
}>;

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '4px 10px', fontSize: 12 },
  md: { padding: '8px 18px', fontSize: 14 },
  lg: { padding: '12px 28px', fontSize: 16 },
};

const DemoButton = factory<DemoButtonFactory>((props, ref) => {
  const {
    size,
    variant,
    color,
    children,
    style,
    ...rest
  } = useProps('DemoButton', { size: 'md', variant: 'filled', color: '#3b82f6' }, props);

  const baseStyle: React.CSSProperties = {
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    ...sizeStyles[size ?? 'md'],
  };

  const variantStyle: React.CSSProperties =
    variant === 'filled'
      ? { background: color, color: '#fff' }
      : variant === 'outlined'
        ? { background: 'transparent', border: `2px solid ${color}`, color: color }
        : { background: 'transparent', color: color };

  return (
    <button ref={ref} style={{ ...baseStyle, ...variantStyle, ...style }} {...rest}>
      {children}
    </button>
  );
});
DemoButton.displayName = 'DemoButton';

// ---------------------------------------------------------------------------
// Helper: display resolved props as JSON
// ---------------------------------------------------------------------------

function PropsInspector({
  component,
  defaultProps,
  userProps,
}: {
  component: string;
  defaultProps: Record<string, any>;
  userProps: Record<string, any>;
}) {
  const resolved = useProps(component, defaultProps, userProps);
  const { children: _, ...display } = resolved;
  return (
    <pre
      style={{
        background: '#1e1e2e',
        color: '#cdd6f4',
        padding: 12,
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.6,
        margin: '8px 0',
        overflow: 'auto',
      }}
    >
      {JSON.stringify(display, null, 2)}
    </pre>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Core/useProps',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

const card: React.CSSProperties = {
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  marginBottom: 12,
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
};

const label: React.CSSProperties = {
  fontSize: 12,
  fontFamily: 'monospace',
  color: '#6b7280',
  marginBottom: 8,
};

// ============================================================================
// Story 1: Three-layer merge priority
// ============================================================================

export const ThreeLayerMerge: Story = {
  name: 'Three-Layer Merge Priority',
  render: () => (
    <PrismuiProvider
      theme={{
        components: {
          DemoButton: {
            defaultProps: { size: 'lg', variant: 'outlined', color: '#7c3aed' },
          },
        },
      }}
    >
      <div style={card}>
        <h3 style={{ margin: '0 0 12px' }}>Three-Layer Props Merge</h3>
        <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
          Component default: <code>size=md, variant=filled, color=#3b82f6</code><br />
          Theme override: <code>size=lg, variant=outlined, color=#7c3aed</code><br />
          User prop: <em>(none)</em>
        </p>

        <div style={label}>Result: theme overrides component defaults</div>
        <DemoButton>Theme Styled Button</DemoButton>

        <div style={{ ...label, marginTop: 16 }}>Resolved props:</div>
        <PropsInspector
          component="DemoButton"
          defaultProps={{ size: 'md', variant: 'filled', color: '#3b82f6' }}
          userProps={{}}
        />
      </div>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 2: User props override everything
// ============================================================================

export const UserPropsOverride: Story = {
  name: 'User Props Override Theme',
  render: () => (
    <PrismuiProvider
      theme={{
        components: {
          DemoButton: {
            defaultProps: { size: 'lg', variant: 'outlined', color: '#7c3aed' },
          },
        },
      }}
    >
      <div style={card}>
        <h3 style={{ margin: '0 0 12px' }}>User Props Win</h3>
        <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
          Theme sets <code>size=lg, variant=outlined, color=#7c3aed</code><br />
          User passes <code>size=sm, variant=filled</code> — these win.
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <DemoButton>Theme Default (lg/outlined/purple)</DemoButton>
          <DemoButton size="sm" variant="filled">User Override (sm/filled)</DemoButton>
        </div>

        <div style={{ ...label, marginTop: 16 }}>Resolved (user override):</div>
        <PropsInspector
          component="DemoButton"
          defaultProps={{ size: 'md', variant: 'filled', color: '#3b82f6' }}
          userProps={{ size: 'sm', variant: 'filled' }}
        />
      </div>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 3: No provider — component defaults only
// ============================================================================

export const NoProvider: Story = {
  name: 'No Provider (Component Defaults Only)',
  render: () => (
    <div style={card}>
      <h3 style={{ margin: '0 0 12px' }}>No PrismuiProvider</h3>
      <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
        Without a provider, <code>useProps</code> skips the theme layer.
        Only component defaults + user props apply.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <DemoButton>Default (md/filled/blue)</DemoButton>
        <DemoButton size="lg" variant="ghost" color="#059669">
          User (lg/ghost/green)
        </DemoButton>
      </div>
    </div>
  ),
};

// ============================================================================
// Story 4: Function defaultProps (theme-aware)
// ============================================================================

function FontFamilyDisplay() {
  const resolved = useProps(
    'FontDemo',
    {},
    {},
  );
  return (
    <div style={{ fontFamily: (resolved as any).fontFamily, fontSize: 16 }}>
      This text uses the theme's fontFamily via function defaultProps.
    </div>
  );
}

export const FunctionDefaultProps: Story = {
  name: 'Function defaultProps (theme) => object',
  render: () => (
    <PrismuiProvider
      theme={{
        components: {
          FontDemo: {
            defaultProps: (theme: any) => ({
              fontFamily: theme.fontFamily,
              spacing: theme.spacingUnit,
            }),
          },
        },
      }}
    >
      <div style={card}>
        <h3 style={{ margin: '0 0 12px' }}>Function defaultProps</h3>
        <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
          <code>theme.components.FontDemo.defaultProps</code> is a function
          that reads <code>theme.fontFamily</code> and <code>theme.spacingUnit</code>.
        </p>

        <FontFamilyDisplay />

        <div style={{ ...label, marginTop: 16 }}>Resolved props:</div>
        <PropsInspector component="FontDemo" defaultProps={{}} userProps={{}} />
      </div>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 5: undefined filtering
// ============================================================================

export const UndefinedFiltering: Story = {
  name: 'undefined Filtered, null/false/0 Preserved',
  render: () => (
    <PrismuiProvider
      theme={{
        components: {
          FilterDemo: {
            defaultProps: { a: 'theme-a', b: 'theme-b', c: 'theme-c', d: 'theme-d' },
          },
        },
      }}
    >
      <div style={card}>
        <h3 style={{ margin: '0 0 12px' }}>undefined Filtering</h3>
        <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
          User passes: <code>{'{ a: undefined, b: null, c: false, d: 0 }'}</code><br />
          <code>undefined</code> is filtered → theme default <code>"theme-a"</code> wins.<br />
          <code>null</code>, <code>false</code>, <code>0</code> are preserved as user values.
        </p>

        <PropsInspector
          component="FilterDemo"
          defaultProps={{}}
          userProps={{ a: undefined, b: null, c: false, d: 0 }}
        />
      </div>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 6: Multiple components in one theme
// ============================================================================

interface DemoCardProps {
  radius?: string;
  shadow?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

type DemoCardFactory = Factory<{
  props: DemoCardProps;
  ref: HTMLDivElement;
}>;

const DemoCard = factory<DemoCardFactory>((props, ref) => {
  const { radius, shadow, children, style, ...rest } = useProps(
    'DemoCard',
    { radius: '8px', shadow: true },
    props,
  );

  return (
    <div
      ref={ref}
      style={{
        padding: 16,
        borderRadius: radius,
        border: '1px solid #e5e7eb',
        boxShadow: shadow ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});
DemoCard.displayName = 'DemoCard';

export const MultipleComponents: Story = {
  name: 'Multiple Components in Theme',
  render: () => (
    <PrismuiProvider
      theme={{
        components: {
          DemoButton: {
            defaultProps: { size: 'sm', variant: 'outlined', color: '#0891b2' },
          },
          DemoCard: {
            defaultProps: { radius: '16px', shadow: false },
          },
        },
      }}
    >
      <div style={card}>
        <h3 style={{ margin: '0 0 12px' }}>Multiple Components Customized</h3>
        <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
          Theme customizes both <code>DemoButton</code> and <code>DemoCard</code> simultaneously.
        </p>

        <DemoCard>
          <div style={{ marginBottom: 12 }}>
            Card with theme defaults: radius=16px, shadow=false
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DemoButton>Theme Button (sm/outlined/cyan)</DemoButton>
            <DemoButton variant="filled">Override variant=filled</DemoButton>
          </div>
        </DemoCard>
      </div>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 7: .extend() → createTheme flow
// ============================================================================

export const ExtendFlow: Story = {
  name: '.extend() → theme.components Flow',
  render: () => {
    // Simulate what a consumer does:
    // const buttonExtend = DemoButton.extend({ defaultProps: { ... } });
    // createTheme({ components: { DemoButton: buttonExtend } })
    const buttonExtend = DemoButton.extend({
      defaultProps: { size: 'lg', variant: 'ghost', color: '#dc2626' },
    });

    return (
      <PrismuiProvider
        theme={{
          components: {
            DemoButton: buttonExtend as any,
          },
        }}
      >
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>.extend() → createTheme Flow</h3>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
            <code>DemoButton.extend({'{ defaultProps: { size: "lg", variant: "ghost", color: "#dc2626" } }'})</code>
            <br />
            is passed to <code>{'createTheme({ components: { DemoButton: ... } })'}</code>.
          </p>

          <DemoButton>Themed via .extend() (lg/ghost/red)</DemoButton>

          <div style={{ ...label, marginTop: 16 }}>Resolved props:</div>
          <PropsInspector
            component="DemoButton"
            defaultProps={{ size: 'md', variant: 'filled', color: '#3b82f6' }}
            userProps={{}}
          />
        </div>
      </PrismuiProvider>
    );
  },
};
