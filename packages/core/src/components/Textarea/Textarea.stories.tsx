import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';
import { Field } from '../Field';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'unstyled'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    autosize: { control: 'boolean' },
    minRows: { control: { type: 'number', min: 1, max: 20 } },
    maxRows: { control: { type: 'number', min: 1, max: 50 } },
    placeholder: { control: 'text' },
    rows: { control: { type: 'number', min: 1, max: 20 } },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── 1. Default ──────────────────────────────────────────────────────────────
export const Default: Story = {
  args: { placeholder: 'Type a few sentences…' },
};

// ── 2. Playground ──────────────────────────────────────────────────────────
export const Playground: Story = {
  args: {
    placeholder: 'Playground',
    variant: 'outlined',
    size: 'md',
    radius: 'sm',
    rows: 3,
    autosize: false,
    disabled: false,
    readOnly: false,
  },
};

// ── 3. All Variants ────────────────────────────────────────────────────────
export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 360,
      }}
    >
      <Textarea variant="outlined" placeholder="outlined (default)" rows={2} />
      <Textarea variant="filled" placeholder="filled" rows={2} />
      <Textarea variant="unstyled" placeholder="unstyled" rows={2} />
    </div>
  ),
};

// ── 4. Sizes ───────────────────────────────────────────────────────────────
export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 360,
      }}
    >
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Textarea key={s} size={s} placeholder={`size=${s}`} rows={2} />
      ))}
    </div>
  ),
};

// ── 5. Autosize · default minRows=1 / maxRows=∞ ────────────────────────────
export const Autosize: Story = {
  args: {
    autosize: true,
    placeholder: 'Type to grow… (autosize · minRows=1 · maxRows=∞)',
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Textarea {...args} />
    </div>
  ),
};

// ── 6. Autosize · capped at maxRows=4 ──────────────────────────────────────
export const AutosizeMaxRows: Story = {
  args: {
    autosize: true,
    minRows: 2,
    maxRows: 4,
    placeholder: 'Grow up to 4 rows, then scroll inside',
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Textarea {...args} />
    </div>
  ),
};

// ── 7. minRows · CSS-only baseline (autosize=false) ────────────────────────
export const MinRowsBaseline: Story = {
  args: { minRows: 5, placeholder: '5-row baseline (no autosize)' },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Textarea {...args} />
    </div>
  ),
};

// ── 8. resize prop matrix ──────────────────────────────────────────────────
export const ResizeMatrix: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 360,
      }}
    >
      <Textarea resize="none" placeholder="resize=none" rows={2} />
      <Textarea resize="vertical" placeholder="resize=vertical (default)" rows={2} />
      <Textarea resize="horizontal" placeholder="resize=horizontal" rows={2} />
      <Textarea resize="both" placeholder="resize=both" rows={2} />
    </div>
  ),
};

// ── 9. Field integration · Label + Description + Error ─────────────────────
export const WithField: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Field id="bio" required>
        <Field.Label>Bio</Field.Label>
        <Field.Description>Tell us a bit about yourself.</Field.Description>
        <Textarea placeholder="A few sentences…" autosize minRows={3} />
      </Field>
    </div>
  ),
};

// ── 10. Field invalid · keyboard focus halo turns danger ───────────────────
export const InvalidInField: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Field id="bio2" invalid>
        <Field.Label>Bio (invalid)</Field.Label>
        <Textarea defaultValue="Whoops" />
        <Field.Error>Please rewrite this section.</Field.Error>
      </Field>
    </div>
  ),
};

// ── 11. Disabled · readOnly ────────────────────────────────────────────────
export const States: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 360,
      }}
    >
      <Textarea disabled placeholder="disabled" rows={2} />
      <Textarea readOnly defaultValue="readOnly content" rows={2} />
    </div>
  ),
};

// ── 12. Controlled · echo into label ───────────────────────────────────────
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div style={{ width: 360 }}>
        <Textarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setValue(e.currentTarget.value)
          }
          autosize
          minRows={2}
          maxRows={8}
          placeholder="Controlled · autosize"
        />
        <div style={{ marginTop: 8, fontSize: 12, color: 'gray' }}>
          length: {value.length}
        </div>
      </div>
    );
  },
};
