import type { Meta, StoryObj } from '@storybook/react';
import { PrismuiProvider } from '../PrismuiProvider/PrismuiProvider';
import { usePrismuiTheme } from '../PrismuiProvider/prismui-theme-context';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Core/CssBaseline',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function BaselineDemo() {
  const { colorScheme, theme } = usePrismuiTheme();

  return (
    <div>
      <h2>CssBaseline Demo</h2>
      <p style={{ marginTop: 8, fontSize: 13, fontFamily: 'monospace' }}>
        <strong>colorScheme:</strong> {colorScheme} |{' '}
        <strong>fontFamily:</strong> {theme.fontFamily.slice(0, 40)}...
      </p>

      <section style={{ marginTop: 16 }}>
        <h3>Typography Reset</h3>
        <p>
          All heading and paragraph margins are reset to 0. This text should
          have no default browser margin.
        </p>
        <h1>H1 Heading</h1>
        <h2>H2 Heading</h2>
        <h3>H3 Heading</h3>
        <h4>H4 Heading</h4>
        <p>Paragraph text — no margin.</p>
      </section>

      <hr style={{ margin: '16px 0', borderColor: 'var(--prismui-divider)' }} />

      <section>
        <h3>Links</h3>
        <p>
          Links inherit color and have no underline:{' '}
          <a href="#demo">Example Link</a>
        </p>
      </section>

      <hr style={{ margin: '16px 0', borderColor: 'var(--prismui-divider)' }} />

      <section>
        <h3>Form Elements</h3>
        <p style={{ marginBottom: 8 }}>Form elements inherit font from parent:</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Text input" style={{ padding: '4px 8px' }} />
          <input type="number" placeholder="Number (no spinner)" style={{ padding: '4px 8px' }} />
          <select style={{ padding: '4px 8px' }}>
            <option>Select option</option>
          </select>
          <button style={{ padding: '4px 12px', cursor: 'pointer' }}>Button</button>
          <textarea placeholder="Textarea (vertical resize only)" rows={2} style={{ padding: '4px 8px' }} />
        </div>
      </section>

      <hr style={{ margin: '16px 0', borderColor: 'var(--prismui-divider)' }} />

      <section>
        <h3>Media Elements</h3>
        <p style={{ marginBottom: 8 }}>Images are block-level with max-width: 100%:</p>
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='60'%3E%3Crect fill='%234dabf7' width='200' height='60' rx='8'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em' font-size='14'%3Eblock image%3C/text%3E%3C/svg%3E"
          alt="demo"
        />
      </section>

      <hr style={{ margin: '16px 0', borderColor: 'var(--prismui-divider)' }} />

      <section>
        <h3>Focus Styles</h3>
        <p style={{ marginBottom: 8 }}>
          Tab to the button below — <code>:focus-visible</code> shows a 2px
          outline using <code>--prismui-primary-main</code>:
        </p>
        <button style={{ padding: '8px 24px', cursor: 'pointer' }}>
          Focus me (Tab)
        </button>
      </section>

      <hr style={{ margin: '16px 0', borderColor: 'var(--prismui-divider)' }} />

      <section>
        <h3>Bold Text</h3>
        <p>
          <b>Bold</b> and <strong>strong</strong> use <code>font-weight: bolder</code>.
        </p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const WithBaseline: Story = {
  name: 'With CssBaseline (default)',
  render: () => (
    <PrismuiProvider>
      <BaselineDemo />
    </PrismuiProvider>
  ),
};

export const WithoutBaseline: Story = {
  name: 'Without CssBaseline',
  render: () => (
    <PrismuiProvider withCssBaseline={false}>
      <BaselineDemo />
    </PrismuiProvider>
  ),
};

export const DarkSchemeBaseline: Story = {
  name: 'Dark Scheme with Baseline',
  render: () => (
    <PrismuiProvider defaultColorScheme="dark">
      <BaselineDemo />
    </PrismuiProvider>
  ),
};
