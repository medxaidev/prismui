import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'unstyled'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    pointer: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── 1. Default ──────────────────────────────────────────────────────────────
export const Default: Story = {
  args: { placeholder: 'Type something...' },
};

// ── 2. Playground ───────────────────────────────────────────────────────────
export const Playground: Story = {
  args: {
    placeholder: 'Playground',
    variant: 'outlined',
    size: 'md',
    radius: 'sm',
    disabled: false,
    readOnly: false,
  },
};

// ── 3. All Variants ─────────────────────────────────────────────────────────
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
      <Input variant="outlined" placeholder="outlined (default)" />
      <Input variant="filled" placeholder="filled" />
      <Input variant="unstyled" placeholder="unstyled" />
    </div>
  ),
};

// ── 4. All Sizes ────────────────────────────────────────────────────────────
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
      <Input size="xs" placeholder="xs" />
      <Input size="sm" placeholder="sm" />
      <Input size="md" placeholder="md (default)" />
      <Input size="lg" placeholder="lg" />
      <Input size="xl" placeholder="xl" />
    </div>
  ),
};

// ── 5. Radius ───────────────────────────────────────────────────────────────
export const RadiusScale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((r) => (
        <Input key={r} radius={r} placeholder={`radius="${r}"`} />
      ))}
    </div>
  ),
};

// ── 6. States ───────────────────────────────────────────────────────────────
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
      <Input placeholder="default" />
      <Input placeholder="disabled" disabled />
      <Input placeholder="readOnly" readOnly defaultValue="read-only value" />
      <Input placeholder="invalid (aria-invalid)" aria-invalid />
    </div>
  ),
};

// ── 7. Sections ─────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const WithSections: Story = {
  render: () => {
    const [value, setValue] = React.useState('hello');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
        <Input leftSection={<SearchIcon />} placeholder="Search products" />
        <Input
          rightSection={
            <button
              type="button"
              onClick={() => setValue('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}
              aria-label="Clear"
            >
              <ClearIcon />
            </button>
          }
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        />
        <Input leftSection={<span style={{ fontSize: 12 }}>$</span>} placeholder="0.00" type="number" />
        <Input leftSection={<span style={{ fontSize: 11 }}>https://</span>} rightSection={<span style={{ fontSize: 11 }}>.com</span>} placeholder="mysite" />
      </div>
    );
  },
};

// ── 8. Password toggle (rightSection with state) ────────────────────────────
export const PasswordToggle: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div style={{ width: 320 }}>
        <Input
          type={visible ? 'text' : 'password'}
          placeholder="Enter password"
          defaultValue="super-secret"
          rightSection={
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 11 }}
            >
              {visible ? 'Hide' : 'Show'}
            </button>
          }
        />
      </div>
    );
  },
};

// ── 9. Input types ──────────────────────────────────────────────────────────
export const InputTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
      <Input type="text" placeholder="text" />
      <Input type="email" placeholder="email@example.com" />
      <Input type="number" placeholder="42" />
      <Input type="tel" placeholder="+1 (555) 123-4567" />
      <Input type="url" placeholder="https://..." />
      <Input type="search" placeholder="search" />
      <Input type="date" />
      <Input type="time" />
    </div>
  ),
};

// ── 10. Variant × Size matrix ───────────────────────────────────────────────
export const VariantSizeMatrix: Story = {
  render: () => {
    const variants = ['outlined', 'filled', 'unstyled'] as const;
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {variants.map((v) => (
          <div key={v}>
            <div style={{ fontSize: 11, color: '#637381', marginBottom: 6 }}>variant="{v}"</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {sizes.map((s) => (
                <Input key={s} variant={v} size={s} placeholder={s} style={{ width: 120 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// ── 11. Pointer mode (Select-like trigger) ──────────────────────────────────
export const PointerMode: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Input
        pointer
        readOnly
        defaultValue="Click me (pointer trigger)"
        rightSection={<span style={{ fontSize: 10 }}>▼</span>}
      />
    </div>
  ),
};

// ── 12. Controlled ──────────────────────────────────────────────────────────
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320, fontFamily: 'sans-serif' }}>
        <Input
          placeholder="Type here"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        />
        <div style={{ fontSize: 12, color: '#637381' }}>
          length: {value.length} — value: <code>{JSON.stringify(value)}</code>
        </div>
      </div>
    );
  },
};

// ═══════════════════════════════════════════════════════════════════════════
//  Variant Contract Demos (per devdocs/components/Input/variant.md)
// ═══════════════════════════════════════════════════════════════════════════

// ── 13. State Priority — demonstrates §2.7 priority chain ──────────────────
//   disabled > invalid > focus-within > hover > rest
export const StatePriority: Story = {
  name: 'Contract / State Priority (§2.7)',
  render: () => {
    const variants = ['outlined', 'filled'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: 640, fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: 12, color: '#637381', margin: 0 }}>
          Priority chain: <strong>disabled &gt; invalid &gt; focus-within &gt; hover &gt; rest</strong>.
          Hover / focus each row to observe overrides. Note IV-3: <strong>focus works on BOTH outlined and filled</strong>.
        </p>
        {variants.map((variant) => (
          <div key={variant}>
            <div style={{ fontSize: 12, color: '#212B36', fontWeight: 600, marginBottom: 8, textTransform: 'capitalize' }}>
              {variant}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <Labeled title="rest">
                <Input variant={variant} defaultValue="rest" />
              </Labeled>
              <Labeled title="hover me">
                <Input variant={variant} defaultValue="hover" />
              </Labeled>
              <Labeled title="focus (click)">
                <Input variant={variant} defaultValue="focus" />
              </Labeled>
              <Labeled title="invalid (beats focus)">
                <Input variant={variant} defaultValue="invalid" aria-invalid />
              </Labeled>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

function Labeled({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#637381', marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  );
}

// ── 14. VariantRole mapping — §1.3 + §2.2 ───────────────────────────────────
export const VariantRoleMapping: Story = {
  name: 'Contract / VariantRole Mapping (§2.2)',
  render: () => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [snapshots, setSnapshots] = React.useState<Record<string, Record<string, string>>>({});

    React.useEffect(() => {
      if (!ref.current) return;
      const roots = ref.current.querySelectorAll<HTMLElement>('[data-variant]');
      const snap: typeof snapshots = {};
      roots.forEach((root) => {
        const v = root.getAttribute('data-variant') || 'unknown';
        snap[v] = {
          '--prismui-variant-bg': root.style.getPropertyValue('--prismui-variant-bg'),
          '--prismui-variant-border': root.style.getPropertyValue('--prismui-variant-border'),
          '--prismui-variant-hover-bg': root.style.getPropertyValue('--prismui-variant-hover-bg'),
          '--prismui-variant-hover-border': root.style.getPropertyValue('--prismui-variant-hover-border'),
        };
      });
      setSnapshots(snap);
    }, []);

    return (
      <div ref={ref} style={{ width: 720, fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: 12, color: '#637381' }}>
          Input.variant → VariantRole → palette. The injected <code>--prismui-variant-*</code>{' '}
          values reveal the role mapping.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <Labeled title="outlined → VariantRole.bordered">
            <Input variant="outlined" placeholder="outlined" />
          </Labeled>
          <Labeled title="filled → VariantRole.low">
            <Input variant="filled" placeholder="filled" />
          </Labeled>
          <Labeled title="unstyled → ∅ (bypass)">
            <Input variant="unstyled" placeholder="unstyled" />
          </Labeled>
        </div>

        <pre
          style={{
            padding: 12,
            background: 'var(--prismui-color-neutral-low-bg)',
            borderRadius: 6,
            fontSize: 11,
            fontFamily: 'ui-monospace, monospace',
            lineHeight: 1.7,
            overflow: 'auto',
          }}
        >
{Object.entries(snapshots).map(([variant, vars]) => {
  const lines = Object.entries(vars).map(
    ([k, v]) => `  ${k.padEnd(35)} = ${v || '(empty — bypassed)'}`,
  ).join('\n');
  return `[data-variant="${variant}"]\n${lines}`;
}).join('\n\n')}
        </pre>
      </div>
    );
  },
};

// ── 15. Unstyled is token-free — IV-4 ──────────────────────────────────────
export const UnstyledTokenFree: Story = {
  name: 'Contract / Unstyled is Token-Free (IV-4)',
  render: () => (
    <div style={{ width: 480, fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: 12, color: '#637381' }}>
        IV-4: <code>variant="unstyled"</code> participates in{' '}
        <strong>size system only</strong>. No variant tokens, no border, no radius, no transition.
        State override (focus / invalid / hover) does NOT apply.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Labeled title="unstyled (rest) — no frame, size preserved">
          <Input variant="unstyled" placeholder="bare input" />
        </Labeled>
        <Labeled title="unstyled + aria-invalid — NO red border (token-free)">
          <Input variant="unstyled" defaultValue="invalid state" aria-invalid />
        </Labeled>
        <Labeled title="unstyled + readOnly — bg stays transparent (IV-4 override)">
          <Input variant="unstyled" defaultValue="read only" readOnly />
        </Labeled>
        <Labeled title="For comparison: outlined + aria-invalid (red border applies)">
          <Input variant="outlined" defaultValue="invalid state" aria-invalid />
        </Labeled>
      </div>
    </div>
  ),
};
