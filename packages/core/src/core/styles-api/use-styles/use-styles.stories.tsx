import React, { forwardRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../../PrismuiProvider/PrismuiProvider';
import { useStyles } from './use-styles';
import { useProps } from '../../factory/use-props';
import { createVarsResolver } from '../create-vars-resolver';

// ---------------------------------------------------------------------------
// Fake CSS Module classes (simulating *.module.css output)
// ---------------------------------------------------------------------------

const btnClasses: Record<string, string> = {
  root: 'DemoBtn_root',
  label: 'DemoBtn_label',
  'root--filled': 'DemoBtn_root_filled',
  'root--outlined': 'DemoBtn_root_outlined',
  'root--ghost': 'DemoBtn_root_ghost',
};

// ---------------------------------------------------------------------------
// DemoButton — a realistic component using useProps + useStyles
// ---------------------------------------------------------------------------

interface DemoButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outlined' | 'ghost';
  color?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  classNames?: Record<string, string>;
  styles?: Record<string, React.CSSProperties>;
  unstyled?: boolean;
}

const varsResolver = createVarsResolver<any>((_theme, props) => ({
  root: {
    '--btn-height': props.size === 'sm' ? '28px' : props.size === 'lg' ? '44px' : '36px',
    '--btn-font-size': props.size === 'sm' ? '12px' : props.size === 'lg' ? '16px' : '14px',
    '--btn-color': props.color || '#3b82f6',
  },
}));

const DemoButton = forwardRef<HTMLButtonElement, DemoButtonProps>((rawProps, ref) => {
  const props = useProps('DemoButton', { size: 'md', variant: 'filled', color: '#3b82f6' }, rawProps);
  const { size, variant, color, children, className, style, classNames, styles, unstyled, ...rest } = props;

  const getStyles = useStyles({
    name: 'DemoButton',
    classes: btnClasses,
    props,
    className,
    style,
    classNames: classNames as any,
    styles: styles as any,
    unstyled,
    varsResolver,
  } as any);

  const rootStyles = getStyles('root', { variant });
  const labelStyles = getStyles('label');

  return (
    <button ref={ref} {...rootStyles} {...rest}>
      <span {...labelStyles}>{children}</span>
    </button>
  );
});
DemoButton.displayName = 'DemoButton';

// ---------------------------------------------------------------------------
// Helper: show resolved className + style as JSON
// ---------------------------------------------------------------------------

function StylesInspector({ label, data }: { label: string; data: { className: string; style: React.CSSProperties } }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280', marginBottom: 4 }}>{label}</div>
      <pre style={{
        background: '#1e1e2e', color: '#cdd6f4', padding: 10, borderRadius: 6,
        fontSize: 11, lineHeight: 1.5, margin: 0, overflow: 'auto',
      }}>
        {JSON.stringify({ className: data.className, style: data.style }, null, 2)}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Core/useStyles',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

const card: React.CSSProperties = {
  padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 12,
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
};

// Inline base styles for the demo button (simulating what CSS Modules would provide)
const demoButtonBaseCSS = `
  .DemoBtn_root {
    display: inline-flex; align-items: center; justify-content: center;
    height: var(--btn-height, 36px); padding: 0 16px;
    font-size: var(--btn-font-size, 14px); font-weight: 600;
    border-radius: 6px; border: none; cursor: pointer;
    font-family: inherit; transition: all 0.15s;
  }
  .DemoBtn_root_filled { background: var(--btn-color, #3b82f6); color: #fff; }
  .DemoBtn_root_outlined { background: transparent; border: 2px solid var(--btn-color, #3b82f6); color: var(--btn-color, #3b82f6); }
  .DemoBtn_root_ghost { background: transparent; color: var(--btn-color, #3b82f6); }
  .DemoBtn_label { display: inline-flex; align-items: center; }
`;

function WithCSS({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{demoButtonBaseCSS}</style>
      {children}
    </>
  );
}

// ============================================================================
// Story 1: Basic useStyles — CSS Module classes + static classes
// ============================================================================

export const BasicUsage: Story = {
  name: 'Basic: CSS Module + Static Classes',
  render: () => (
    <PrismuiProvider>
      <WithCSS>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>Basic useStyles</h3>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
            <code>useStyles</code> returns a <code>getStyles(selector)</code> function.
            Each call returns <code>{'{ className, style }'}</code> with CSS Module class + static class.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <DemoButton>Default (md/filled)</DemoButton>
            <DemoButton variant='outlined' size="sm">Small</DemoButton>
            <DemoButton size="lg">Large</DemoButton>
          </div>
        </div>
      </WithCSS>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 2: Variant classes
// ============================================================================

export const Variants: Story = {
  name: 'Variant Classes',
  render: () => (
    <PrismuiProvider>
      <WithCSS>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>Variant Classes</h3>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
            <code>getStyles('root', {'{ variant }'}) </code> adds <code>classes['root--variant']</code>.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <DemoButton variant="filled">Filled</DemoButton>
            <DemoButton variant="outlined">Outlined</DemoButton>
            <DemoButton variant="ghost">Ghost</DemoButton>
          </div>
        </div>
      </WithCSS>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 3: CSS Variables via varsResolver
// ============================================================================

export const CSSVariables: Story = {
  name: 'CSS Variables (varsResolver)',
  render: () => (
    <PrismuiProvider>
      <WithCSS>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>CSS Variables via varsResolver</h3>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
            <code>createVarsResolver</code> maps props to CSS variables per selector.
            <br />
            <code>--btn-height</code>, <code>--btn-font-size</code>, <code>--btn-color</code> are set on root.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <DemoButton size="sm" color="#059669">sm/green</DemoButton>
            <DemoButton size="md" color="#7c3aed">md/purple</DemoButton>
            <DemoButton size="lg" color="#dc2626">lg/red</DemoButton>
          </div>
        </div>
      </WithCSS>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 4: Theme-level classNames + styles
// ============================================================================

export const ThemeCustomization: Story = {
  name: 'Theme classNames + styles',
  render: () => (
    <PrismuiProvider
      theme={{
        components: {
          DemoButton: {
            classNames: { root: 'theme-custom-btn' },
            styles: { root: { borderRadius: 20, textTransform: 'uppercase' as const } },
            defaultProps: { size: 'lg', color: '#0891b2' },
          },
        },
      }}
    >
      <WithCSS>
        <style>{`.theme-custom-btn { letter-spacing: 0.05em; }`}</style>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>Theme-Level Customization</h3>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
            Theme sets: <code>classNames.root = 'theme-custom-btn'</code>,
            <code>styles.root = {'{ borderRadius: 20, textTransform: "uppercase" }'}</code>,
            <code>defaultProps = {'{ size: "lg", color: "#0891b2" }'}</code>
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <DemoButton>Theme Styled</DemoButton>
            <DemoButton variant="outlined">Outlined</DemoButton>
            <DemoButton size="sm" color="#dc2626">User Override</DemoButton>
          </div>
        </div>
      </WithCSS>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 5: unstyled prop
// ============================================================================

export const Unstyled: Story = {
  name: 'unstyled Prop',
  render: () => (
    <PrismuiProvider>
      <WithCSS>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>unstyled Prop</h3>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
            <code>unstyled=true</code> strips all CSS Module classes.
            Only user <code>className</code>, <code>style</code>, and CSS variables remain.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <DemoButton>Normal</DemoButton>
            <DemoButton unstyled style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4 }}>
              Unstyled + custom style
            </DemoButton>
          </div>
        </div>
      </WithCSS>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 6: Theme vars override
// ============================================================================

export const ThemeVarsOverride: Story = {
  name: 'Theme vars Override',
  render: () => (
    <PrismuiProvider
      theme={{
        components: {
          DemoButton: {
            vars: () => ({
              root: {
                '--btn-height': '52px',
                '--btn-font-size': '18px',
                '--btn-color': '#7c3aed',
              },
            }),
          },
        },
      }}
    >
      <WithCSS>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>Theme vars Override</h3>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
            Theme overrides <code>--btn-height: 52px</code>, <code>--btn-font-size: 18px</code>, <code>--btn-color: #7c3aed</code>.
            <br />
            Priority: <code>varsResolver</code> {'<'} <code>theme.vars</code> {'<'} <code>user vars</code>.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <DemoButton>Theme Vars (52px/18px/purple)</DemoButton>
            <DemoButton variant="outlined">Outlined</DemoButton>
          </div>
        </div>
      </WithCSS>
    </PrismuiProvider>
  ),
};

// ============================================================================
// Story 7: Per-instance classNames + styles
// ============================================================================

export const PerInstanceOverride: Story = {
  name: 'Per-Instance classNames + styles',
  render: () => (
    <PrismuiProvider>
      <WithCSS>
        <style>{`.custom-shadow { box-shadow: 0 4px 12px rgba(59,130,246,0.3); }`}</style>
        <div style={card}>
          <h3 style={{ margin: '0 0 12px' }}>Per-Instance Override</h3>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
            Pass <code>classNames</code> and <code>styles</code> directly to a component instance.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <DemoButton>Default</DemoButton>
            <DemoButton
              classNames={{ root: 'custom-shadow' }}
              styles={{ root: { borderRadius: 24 } }}
            >
              Custom shadow + pill
            </DemoButton>
          </div>
        </div>
      </WithCSS>
    </PrismuiProvider>
  ),
};
