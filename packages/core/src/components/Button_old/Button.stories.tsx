import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';

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

// ── Stage 3: Theme System ─────────────────────────────────────────────────────

// 16. CSS Variables injection — verify :root receives --prismui-* variables
export const ThemeSystemCSSVars: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
        Stage 3 — Theme System: CSS Variables injection
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        PrismUIProvider calls <code>generateCSSVariables(theme, colorScheme)</code> and injects
        all <code>--prismui-*</code> variables onto <code>:root</code> via <code>useLayoutEffect</code>.
        The buttons below consume these variables purely through CSS — no JS color logic.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="filled" color="primary">Primary Filled</Button>
        <Button variant="outline" color="primary">Primary Outline</Button>
        <Button variant="filled" color="error">Error Filled</Button>
        <Button variant="filled" color="success">Success Filled</Button>
      </div>
      <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
        Open DevTools → Elements → :root to see all injected --prismui-* variables.
      </p>
    </div>
  ),
};

// 17. createTheme + deepMerge — Stage 3: override specific tokens
export const ThemeOverride: Story = {
  render: () => {
    const customTheme = createTheme({
      size: {
        md: { height: 48, paddingX: 24 },
        lg: { height: 56, paddingX: 32 },
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
          Stage 3 — createTheme: token override via deepMerge
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          A custom theme overrides <code>size.md.height = 48px</code> and <code>size.lg.height = 56px</code>.
          Compare with default (40px / 48px).
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 11, color: '#637381' }}>Default theme</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button size="md">md (40px default)</Button>
              <Button size="lg">lg (48px default)</Button>
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 11, color: '#637381' }}>Custom theme</p>
            <PrismUIProvider theme={customTheme}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button size="md">md (48px custom)</Button>
                <Button size="lg">lg (56px custom)</Button>
              </div>
            </PrismUIProvider>
          </div>
        </div>
      </div>
    );
  },
};

// ── Stage 4: Variant System ───────────────────────────────────────────────────

// 18. Variant Color Resolver — all 5 variants × semantic colors
export const VariantSystemMatrix: Story = {
  render: () => {
    const variants = ['filled', 'outline', 'subtle', 'transparent', 'white'] as const;
    const colors = ['primary', 'secondary', 'error', 'success', 'warning'] as const;
    return (
      <div style={{ fontFamily: 'sans-serif' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
          Stage 4 — Variant System: variantColorResolver × all colors
        </h4>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#637381' }}>
          withVariantColors injects 4 CSS vars: <code>--prismui-variant-&#123;bg,fg,hover-bg,border&#125;</code>.
          Colors come from the theme palette — zero JS color calculation.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {variants.map(v => (
            <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#637381', width: 90, flexShrink: 0 }}>{v}</span>
              {colors.map(c => (
                <Button key={c} variant={v as any} color={c as any} size="sm">{c}</Button>
              ))}
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
          Stage 4 — All colors map through variantColorResolver → CSS Variables → CSS Module.
        </p>
      </div>
    );
  },
};

// ── Stage 5: Factory Protocol (Size + State Systems) ─────────────────────────

// 19. Size System — withSizeVars middleware, 5-tier mapping
export const SizeSystem: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
        Stage 5 — Size System: withSizeVars middleware
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        <code>systems: ['size']</code> wraps varsResolver with <code>withSizeVars</code>, injecting
        <code>--prismui-size-height</code> and <code>--prismui-size-padding-x</code>.
        Button's varsResolver bridges them to <code>--button-height</code> and <code>--button-padding-x</code>.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
          <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Button size={size}>{size}</Button>
            <span style={{ fontSize: 10, color: '#919EAB' }}>
              {size === 'xs' ? '24px' : size === 'sm' ? '32px' : size === 'md' ? '40px' : size === 'lg' ? '48px' : '56px'}
            </span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
        Stage 5 — SIZE_CSS_VARS contract: 2 variables, 5-tier mapping, theme-overridable.
      </p>
    </div>
  ),
};

// 20. State System — withStateVars, disabled state via CSS
export const StateSystem: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
        Stage 5 — State System: withStateVars middleware
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        <code>systems: ['state']</code> wraps varsResolver with <code>withStateVars</code>, injecting
        <code>--prismui-state-opacity-disabled</code> and <code>--prismui-state-cursor-disabled</code>.
        CSS Module applies these variables on <code>:disabled</code> selector — zero JS state logic.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {(['filled', 'outline', 'subtle', 'transparent'] as const).map(v => (
          <div key={v} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button variant={v}>{v}</Button>
            <Button variant={v} disabled>{v} disabled</Button>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
        Stage 5 — STATE_CSS_VARS contract: 2 variables, CSS-only disabled styling.
      </p>
    </div>
  ),
};

// ── Stage 7–8: Theme Components Three-Channel Override ───────────────────────

// 21. theme.components.defaultProps — fill missing prop, props override
export const ThemeDefaultProps: Story = {
  render: () => {
    const themeXL = createTheme({
      components: { Button: { defaultProps: { size: 'xl', variant: 'outline' } } },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
          Stage 7–8 — Three-Channel Override: defaultProps
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Theme sets <code>size=xl</code> and <code>variant=outline</code> as defaults.
          Left column: no props passed (theme defaults apply).
          Right column: <code>size="sm"</code> overrides theme default.
        </p>
        <PrismUIProvider theme={themeXL}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 11, color: '#637381' }}>Theme defaults (xl, outline)</p>
              <Button>No size prop</Button>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 11, color: '#637381' }}>props override (sm overrides xl)</p>
              <Button size="sm">size="sm"</Button>
            </div>
          </div>
        </PrismUIProvider>
        <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
          Stage 7 — useComponentDefaultProps: undefined props fall back to theme.components defaultProps.
        </p>
      </div>
    );
  },
};

// 22. theme.components.classNames — injection + cx-merge
export const ThemeClassNames: Story = {
  render: () => {
    const themeWithClass = createTheme({
      components: {
        Button: {
          classNames: { root: 'theme-shadow-btn', label: 'theme-uppercase-label' },
        },
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
        <style>{`
          .theme-shadow-btn { box-shadow: 0 4px 16px rgba(0,0,0,0.18) !important; }
          .theme-uppercase-label { text-transform: uppercase; letter-spacing: 1.5px; }
          .local-dotted { outline: 3px dotted #0C68E9; outline-offset: 3px; }
        `}</style>
        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
          Stage 8 — Three-Channel Override: classNames (theme + props cx-merge)
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Theme injects <code>theme-shadow-btn</code> + <code>theme-uppercase-label</code> on all Buttons.
          The third button also passes <code>classNames.root</code> — both classes are cx-merged.
        </p>
        <PrismUIProvider theme={themeWithClass}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button>Theme classes only (shadow + uppercase)</Button>
            <Button classNames={{ root: 'local-dotted' }}>
              cx-merged: theme shadow + local dotted outline
            </Button>
          </div>
        </PrismUIProvider>
        <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
          Stage 8 — useComponentStylingInput: theme classNames = base layer, props classNames = cx-merged on top.
        </p>
      </div>
    );
  },
};

// 23. theme.components.styles — injection + props override
export const ThemeStyles: Story = {
  render: () => {
    const themeWithStyles = createTheme({
      components: {
        Button: {
          styles: { root: { borderRadius: '20px', letterSpacing: '0.5px' } },
        },
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
          Stage 8 — Three-Channel Override: styles (inline style injection)
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Theme injects <code>borderRadius: 20px</code> on all Buttons.
          The second button passes <code>styles.root.borderRadius = 4px</code> — props win per-property.
          The third button uses <code>style</code> prop — highest priority.
        </p>
        <PrismUIProvider theme={themeWithStyles}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button>Theme borderRadius=20px</Button>
            <Button styles={{ root: { borderRadius: '4px' } }}>
              props.styles overrides → borderRadius=4px
            </Button>
            <Button style={{ borderRadius: '0px' }}>
              style prop overrides → borderRadius=0px (highest priority)
            </Button>
          </div>
        </PrismUIProvider>
        <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
          Stage 8 — priority: theme styles → props styles → style prop. Per-property merge.
        </p>
      </div>
    );
  },
};

// 24. theme.components.vars — CSS Variable override, full priority chain
export const ThemeVars: Story = {
  render: () => {
    const themeWithVars = createTheme({
      components: {
        Button: {
          vars: { '--button-height': '52px', '--button-font-size': '17px' },
        },
      },
    });
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
          Stage 8 — Three-Channel Override: vars (CSS Variable priority chain)
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
          Priority chain (low → high):{' '}
          <code>varsResolver → theme.vars → props.vars → style prop</code>
        </p>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 11, color: '#637381' }}>Default (md=40px)</p>
            <Button size="md">Default height</Button>
          </div>
          <PrismUIProvider theme={themeWithVars}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: '#637381' }}>theme.vars → 52px</p>
                <Button size="md">theme.vars height</Button>
              </div>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: '#637381' }}>props.vars → 64px (overrides theme)</p>
                <Button size="md" vars={{ '--button-height': '64px' }}>props.vars override</Button>
              </div>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: '#637381' }}>style → 32px (highest priority)</p>
                <Button size="md" style={{ '--button-height': '32px' } as React.CSSProperties}>
                  style prop override
                </Button>
              </div>
            </div>
          </PrismUIProvider>
        </div>
        <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
          Stage 8 — vars priority chain: system(varsResolver) → theme vars → props vars → style prop.
          CSSVarKey type enforces --prefix at compile time.
        </p>
      </div>
    );
  },
};

// 25. Color Scheme Toggle — Stage 7: ColorSchemeProvider
export const ColorSchemeSwitching: Story = {
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
        Stage 7 — Color Scheme: light ↔ dark
      </h4>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#637381' }}>
        Use the toolbar Color Scheme toggle (top of Storybook) to switch between light and dark.
        All CSS variables are updated via diff — only changed properties are re-set.
        No component re-renders, no class name changes — pure CSS Variable swap.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="filled">Filled</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="filled" color="error">Error</Button>
        <Button variant="filled" color="success">Success</Button>
        <Button disabled>Disabled</Button>
      </div>
      <p style={{ marginTop: 12, fontSize: 11, color: '#919EAB' }}>
        Stage 7 — applyDiffCSSVariables: only changed --prismui-* vars are updated on color scheme change.
      </p>
    </div>
  ),
};
