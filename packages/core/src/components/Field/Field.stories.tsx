import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Field } from './index';
import { useFieldControlProps } from './useFieldControlProps';
import { Input } from '../Input';
import { Button } from '../Button';
import { PrismUIProvider } from '../../core/theme/provider/PrismUIProvider';
import { createTheme } from '../../core/theme/create-theme';

const meta = {
  title: 'Components/Field',
  component: Field,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    id: { control: 'text' },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── 1. Basic — Field with Label + Input ─────────────────────────────────────
export const Basic: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Field>
        <Field.Label>Username</Field.Label>
        <Input placeholder="johndoe" />
      </Field>
    </div>
  ),
};

// ── 2. Full composition: Label + Description + Input + Error ───────────────
export const FullComposition: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Field required>
        <Field.Label>Email address</Field.Label>
        <Field.Description>We'll never share your email with anyone.</Field.Description>
        <Input type="email" placeholder="you@example.com" />
      </Field>
    </div>
  ),
};

// ── 3. States × Variants matrix ────────────────────────────────────────────
export const StatesMatrix: Story = {
  render: () => {
    const items: Array<{
      title: string;
      props: { required?: boolean; disabled?: boolean; readOnly?: boolean; invalid?: boolean };
    }> = [
      { title: 'default', props: {} },
      { title: 'required', props: { required: true } },
      { title: 'disabled', props: { disabled: true } },
      { title: 'readOnly', props: { readOnly: true } },
      { title: 'invalid', props: { invalid: true } },
      { title: 'disabled + invalid', props: { disabled: true, invalid: true } },
    ];
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(280px, 1fr))',
          gap: 20,
          fontFamily: 'sans-serif',
          width: 640,
        }}
      >
        {items.map(({ title, props }) => (
          <div key={title}>
            <div style={{ fontSize: 11, color: '#637381', marginBottom: 4 }}>{title}</div>
            <Field {...props}>
              <Field.Label>Username</Field.Label>
              <Field.Description>3–20 characters.</Field.Description>
              <Input placeholder="johndoe" defaultValue={props.readOnly ? 'preset-user' : undefined} />
              {props.invalid && <Field.Error>Username is already taken</Field.Error>}
            </Field>
          </div>
        ))}
      </div>
    );
  },
};

// ── 4. Required marker ──────────────────────────────────────────────────────
export const RequiredMarker: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}>
      <Field>
        <Field.Label>Optional field</Field.Label>
        <Input placeholder="no asterisk" />
      </Field>
      <Field required>
        <Field.Label>Required field</Field.Label>
        <Input placeholder="with red *" />
      </Field>
    </div>
  ),
};

// ── 5. Error state (Field.invalid + Field.Error together) ──────────────────
export const ErrorState: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Field invalid>
        <Field.Label>Password</Field.Label>
        <Field.Description>Must be at least 8 characters.</Field.Description>
        <Input type="password" defaultValue="short" />
        <Field.Error>Password is too short (minimum 8 characters)</Field.Error>
      </Field>
    </div>
  ),
};

// ── 6. Disabled ─────────────────────────────────────────────────────────────
export const Disabled: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Field disabled>
        <Field.Label>Plan</Field.Label>
        <Field.Description>Upgrade to change your plan.</Field.Description>
        <Input defaultValue="Pro" />
      </Field>
    </div>
  ),
};

// ── 7. ReadOnly ─────────────────────────────────────────────────────────────
export const ReadOnly: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Field readOnly>
        <Field.Label>Account ID</Field.Label>
        <Field.Description>This value cannot be edited.</Field.Description>
        <Input defaultValue="acc_abc123xyz" />
      </Field>
    </div>
  ),
};

// ── 8. Field without Input (headless demo) ──────────────────────────────────
export const HeadlessCustomControl: Story = {
  render: () => (
    <div style={{ width: 360, fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: 12, color: '#637381', marginTop: 0, marginBottom: 12 }}>
        Field is Headless — any component that calls <code>useFieldControlProps()</code>{' '}
        can be a Control. Below we use a plain <code>&lt;textarea&gt;</code> to demonstrate.
      </p>
      <Field required>
        <Field.Label>Bio</Field.Label>
        <Field.Description>Tell us about yourself.</Field.Description>
        <CustomTextarea placeholder="I love building UI systems..." />
      </Field>
    </div>
  ),
};

// CustomTextarea: shows that ANY control can integrate via useFieldControlProps.
// (We use Input's hook directly; see useFieldControlProps contract.)
function CustomTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  // Mirrors Input's integration pattern — any Control can opt-in via this hook.
  const merged = useFieldControlProps(props as any);
  return (
    <textarea
      {...merged}
      rows={3}
      style={{
        width: '100%',
        padding: 8,
        borderRadius: 4,
        border: '1px solid var(--prismui-color-neutral-bordered-border)',
        background: 'transparent',
        font: 'inherit',
        color: 'var(--prismui-text-primary)',
        resize: 'vertical',
      }}
    />
  );
}

// ── 9. Full form (multiple Fields) ──────────────────────────────────────────
export const FullForm: Story = {
  render: () => {
    const [values, setValues] = React.useState({ name: '', email: '', password: '' });
    const [submitted, setSubmitted] = React.useState(false);
    const emailInvalid = submitted && !values.email.includes('@');
    const passwordInvalid = submitted && values.password.length < 8;
    return (
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400, fontFamily: 'sans-serif' }}
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <Field required>
          <Field.Label>Full name</Field.Label>
          <Input
            value={values.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValues((v) => ({ ...v, name: e.target.value }))
            }
            placeholder="Jane Doe"
          />
        </Field>

        <Field required invalid={emailInvalid}>
          <Field.Label>Email</Field.Label>
          <Field.Description>We'll send a verification link.</Field.Description>
          <Input
            type="email"
            value={values.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValues((v) => ({ ...v, email: e.target.value }))
            }
            placeholder="you@example.com"
          />
          {emailInvalid && <Field.Error>Please enter a valid email address</Field.Error>}
        </Field>

        <Field required invalid={passwordInvalid}>
          <Field.Label>Password</Field.Label>
          <Field.Description>Minimum 8 characters.</Field.Description>
          <Input
            type="password"
            value={values.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValues((v) => ({ ...v, password: e.target.value }))
            }
          />
          {passwordInvalid && <Field.Error>Password must be at least 8 characters</Field.Error>}
        </Field>

        <Button variant="filled" color="primary" component="button" type="submit">
          Submit
        </Button>

        {submitted && !emailInvalid && !passwordInvalid && values.name && (
          <div
            style={{
              padding: 10,
              background: 'var(--prismui-color-success-low-bg)',
              color: 'var(--prismui-color-success-high-bg)',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            ✅ Form valid — would submit: <code>{JSON.stringify(values)}</code>
          </div>
        )}
      </form>
    );
  },
};

// ── 10. Label click → focus Input (htmlFor end-to-end) ──────────────────────
export const LabelClickFocus: Story = {
  render: () => (
    <div style={{ width: 360, fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: 12, color: '#637381', marginTop: 0, marginBottom: 12 }}>
        Click the Label text — it focuses the Input via native <code>htmlFor</code> (auto-connected
        through FieldContext).
      </p>
      <Field>
        <Field.Label>Click me to focus the input below</Field.Label>
        <Input placeholder="I get focused when Label is clicked" />
      </Field>
    </div>
  ),
};

// ── 11. Theme override — Field.Label via theme.components ──────────────────
export const ThemeOverride: Story = {
  render: () => {
    const theme = createTheme({
      components: {
        'Field.Label': {
          styles: { root: { textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' } },
        },
        'Field.Description': {
          styles: { root: { fontStyle: 'italic' } },
        },
      },
    });
    return (
      <PrismUIProvider theme={theme}>
        <div style={{ width: 360 }}>
          <Field required>
            <Field.Label>Username</Field.Label>
            <Field.Description>Lowercase, no spaces.</Field.Description>
            <Input placeholder="johndoe" />
          </Field>
        </div>
      </PrismUIProvider>
    );
  },
};

// ── 12. Standalone Control (no Field) ──────────────────────────────────────
export const StandaloneControl: Story = {
  render: () => (
    <div style={{ width: 360, fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: 12, color: '#637381', marginTop: 0, marginBottom: 12 }}>
        Input can be used <strong>without</strong> Field. <code>useFieldControlProps()</code>{' '}
        pass-through when no Field is present.
      </p>
      <Input placeholder="Search..." aria-label="Search" />
    </div>
  ),
};

// ── 13. Aria contract visualization ────────────────────────────────────────
export const AriaContract: Story = {
  render: () => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [attrs, setAttrs] = React.useState<Record<string, string | null>>({});
    React.useEffect(() => {
      const input = ref.current?.querySelector('input');
      if (!input) return;
      setAttrs({
        id: input.getAttribute('id'),
        'aria-required': input.getAttribute('aria-required'),
        'aria-invalid': input.getAttribute('aria-invalid'),
        'aria-describedby': input.getAttribute('aria-describedby'),
        disabled: input.hasAttribute('disabled') ? 'true' : null,
        readOnly: input.hasAttribute('readonly') ? 'true' : null,
      });
    }, []);
    return (
      <div ref={ref} style={{ width: 480, fontFamily: 'sans-serif' }}>
        <Field id="demo" required invalid>
          <Field.Label>Demo field</Field.Label>
          <Field.Description>Inspect the input's aria attributes below.</Field.Description>
          <Input />
          <Field.Error>Something went wrong</Field.Error>
        </Field>
        <pre
          style={{
            marginTop: 16,
            padding: 12,
            background: 'var(--prismui-color-neutral-low-bg)',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'ui-monospace, monospace',
          }}
        >
{Object.entries(attrs).map(([k, v]) => `${k.padEnd(20)} = ${JSON.stringify(v)}`).join('\n')}
        </pre>
      </div>
    );
  },
};
