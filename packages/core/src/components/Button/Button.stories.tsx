import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outline', 'subtle', 'transparent'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'success'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Default
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

// 2. All Variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Button variant="filled">Filled</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="transparent">Transparent</Button>
    </div>
  ),
};

// 3. All Sizes
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

// 4. All Colors
export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="error">Error</Button>
      <Button color="success">Success</Button>
    </div>
  ),
};

// 5. Color Matrix (Variants × Colors)
export const ColorMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <strong>Filled:</strong>
        <Button variant="filled" color="primary">Primary</Button>
        <Button variant="filled" color="secondary">Secondary</Button>
        <Button variant="filled" color="error">Error</Button>
        <Button variant="filled" color="success">Success</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <strong>Outline:</strong>
        <Button variant="outline" color="primary">Primary</Button>
        <Button variant="outline" color="secondary">Secondary</Button>
        <Button variant="outline" color="error">Error</Button>
        <Button variant="outline" color="success">Success</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <strong>Subtle:</strong>
        <Button variant="subtle" color="primary">Primary</Button>
        <Button variant="subtle" color="secondary">Secondary</Button>
        <Button variant="subtle" color="error">Error</Button>
        <Button variant="subtle" color="success">Success</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <strong>Transparent:</strong>
        <Button variant="transparent" color="primary">Primary</Button>
        <Button variant="transparent" color="secondary">Secondary</Button>
        <Button variant="transparent" color="error">Error</Button>
        <Button variant="transparent" color="success">Success</Button>
      </div>
    </div>
  ),
};

// 6. Disabled State
export const DisabledState: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Button disabled>Disabled Filled</Button>
      <Button variant="outline" disabled>Disabled Outline</Button>
      <Button variant="subtle" disabled>Disabled Subtle</Button>
      <Button variant="transparent" disabled>Disabled Transparent</Button>
    </div>
  ),
};

// 7. Polymorphic - As Link
export const AsLink: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Button component="a" href="https://example.com" target="_blank">
        External Link
      </Button>
      <Button component="a" href="#section" variant="outline">
        Internal Link
      </Button>
    </div>
  ),
};

// 8. classNames Override
export const ClassNamesOverride: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
      <style>{`
        .custom-root {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .custom-label {
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      `}</style>
      <Button classNames={{ root: 'custom-root' }}>
        Custom Root Class
      </Button>
      <Button classNames={{ label: 'custom-label' }}>
        Custom Label Class
      </Button>
      <Button
        classNames={{
          root: 'custom-root',
          label: 'custom-label',
        }}
      >
        Both Custom Classes
      </Button>
    </div>
  ),
};

// 9. styles Override (REQUIRED for Step 2.8)
export const StylesOverride: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
      <Button styles={{ root: { borderRadius: '20px' } }}>
        Rounded Button
      </Button>
      <Button styles={{ label: { fontWeight: 'bold', fontSize: '18px' } }}>
        Bold Large Label
      </Button>
      <Button
        styles={{
          root: { borderRadius: '20px', padding: '0 32px' },
          label: { fontWeight: 'bold' },
        }}
      >
        Multiple Styles
      </Button>
    </div>
  ),
};

// 10. vars Override (REQUIRED for Step 2.8)
export const VarsOverride: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
      <Button vars={{ '--button-height': '60px' }}>
        Custom Height (60px)
      </Button>
      <Button vars={{ '--button-bg': '#ff6b6b', '--button-color': '#ffffff' }}>
        Custom Colors
      </Button>
      <Button
        vars={{
          '--button-height': '64px',
          '--button-padding-x': '48px',
          '--button-font-size': '20px',
          '--button-bg': '#4ecdc4',
          '--button-color': '#ffffff',
        }}
      >
        Fully Custom
      </Button>
    </div>
  ),
};

// 11. Combined Overrides
export const CombinedOverrides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
      <style>{`
        .gradient-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border: none !important;
        }
      `}</style>
      <Button
        classNames={{ root: 'gradient-button' }}
        styles={{ root: { borderRadius: '24px' } }}
        vars={{ '--button-height': '56px' }}
      >
        Gradient Button
      </Button>
      <Button
        variant="outline"
        classNames={{ label: 'custom-label' }}
        styles={{ root: { borderWidth: '2px' } }}
        vars={{ '--button-border': '2px solid #667eea' }}
      >
        Custom Outline
      </Button>
    </div>
  ),
};

// 12. Interactive Playground
export const Playground: Story = {
  args: {
    children: 'Playground Button',
    variant: 'filled',
    size: 'md',
    color: 'primary',
    disabled: false,
  },
};

// ── Stage 1 Verification ──────────────────────────────────────────────────────

// 13. Factory Polymorphic — Stage 1: factory() produces correct DOM element
export const FactoryPolymorphic: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'sans-serif' }}>
      <p style={{ margin: 0, fontSize: 12, color: '#637381' }}>
        Each button below renders as a different HTML element via the <code>component</code> prop.
        Inspect DevTools to verify the tag.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button>
          &lt;button&gt; (default)
        </Button>
        <Button component="a" href="#polymorphic" onClick={(e: React.MouseEvent) => e.preventDefault()}>
          &lt;a href="#"&gt;
        </Button>
        <Button component="div">
          &lt;div&gt;
        </Button>
        <Button component="span">
          &lt;span&gt;
        </Button>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: '#919EAB' }}>
        Stage 1 — factory() defaultElement + component prop override. All share the same styling pipeline.
      </p>
    </div>
  ),
};

// 14. StylesNames Showcase — Stage 2: visualize root / inner / label layers
export const StylesNamesShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'sans-serif' }}>
      <style>{`
        .highlight-root  { outline: 3px solid #0C68E9 !important; outline-offset: 2px; }
        .highlight-inner { background: rgba(12,104,233,0.15) !important; }
        .highlight-label { text-decoration: underline dotted #0C68E9; }
      `}</style>
      <p style={{ margin: 0, fontSize: 12, color: '#637381' }}>
        DOM structure: <code>button.root &gt; span.inner &gt; span.label</code>.
        Each row highlights a different layer via <code>classNames</code> override.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#637381', width: 120 }}>root highlighted</span>
          <Button classNames={{ root: 'highlight-root' }}>classNames.root</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#637381', width: 120 }}>inner highlighted</span>
          <Button classNames={{ inner: 'highlight-inner' }}>classNames.inner</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#637381', width: 120 }}>label highlighted</span>
          <Button classNames={{ label: 'highlight-label' }}>classNames.label</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#637381', width: 120 }}>all highlighted</span>
          <Button classNames={{ root: 'highlight-root', inner: 'highlight-inner', label: 'highlight-label' }}>
            All Layers
          </Button>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: '#919EAB' }}>
        Stage 2 — StylesNames system. classNames = external class injection per named slot.
      </p>
    </div>
  ),
};

// 15. EnsureClasses Validation — Stage 2: CSS Module type-safety explanation
export const EnsureClassesValidation: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1C252E' }}>
        ensureClasses — Compile-time CSS Module Safety
      </h4>
      <div style={{ background: '#F4F6F8', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <pre style={{ margin: 0, fontSize: 12, color: '#454F5B', lineHeight: 1.6 }}>{`const stylesNames = ['root', 'inner', 'label'] as const;

// TypeScript validates at compile time:
// 1. CSS Module MUST contain all names in stylesNames
// 2. CSS Module MUST NOT have extra keys not in stylesNames
// → Zero runtime overhead
const validatedClasses = ensureClasses(stylesNames, classes);`}</pre>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#637381' }}>
        If you add a class to the CSS Module but forget to add it to <code>stylesNames</code> (or vice versa),
        TypeScript compilation fails immediately — not at runtime.
      </p>
      <p style={{ margin: 0, fontSize: 12, color: '#637381' }}>
        The Button below is the live proof — it uses <code>ensureClasses</code> internally:
      </p>
      <div style={{ marginTop: 12 }}>
        <Button>Validated Button</Button>
      </div>
      <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
        Stage 2 — ensureClasses is a zero-cost compile-time guard. No runtime validation, no throw.
      </p>
    </div>
  ),
};
