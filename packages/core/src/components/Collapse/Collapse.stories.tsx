import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Collapse } from './Collapse';

const meta: Meta<typeof Collapse> = {
  title: 'Components/Collapse',
  component: Collapse,
};

export default meta;
type Story = StoryObj<typeof Collapse>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function DemoContent({ text = 'Collapse content' }: { text?: string }) {
  return (
    <div
      style={{
        padding: 16,
        background: 'var(--prismui-action-hover, #f5f5f5)',
        borderRadius: 8,
        fontSize: 14,
        lineHeight: 1.6,
      }}
    >
      {text}
    </div>
  );
}

function ToggleButton({ opened, onClick }: { opened: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 6,
        border: '1px solid var(--prismui-divider, #ccc)',
        background: 'var(--prismui-bg-paper, #fff)',
        cursor: 'pointer',
        fontSize: 14,
        marginBottom: 8,
      }}
    >
      {opened ? 'Collapse' : 'Expand'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Basic: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    return (
      <div style={{ maxWidth: 400 }}>
        <ToggleButton opened={opened} onClick={() => setOpened((o) => !o)} />
        <Collapse opened={opened}>
          <DemoContent text="From Bulbapedia: Bulbasaur is a small, quadrupedal Pokémon that has blue-green skin with darker patches. It has red eyes with white pupils, pointed, ear-like structures on top of its head, and a short, blunt snout with a wide mouth." />
        </Collapse>
      </div>
    );
  },
};

export const HorizontalOrientation: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, height: 200 }}>
        <ToggleButton opened={opened} onClick={() => setOpened((o) => !o)} />
        <Collapse opened={opened} orientation="horizontal">
          <div
            style={{
              width: 200,
              padding: 16,
              background: 'var(--prismui-action-hover, #f5f5f5)',
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </div>
        </Collapse>
      </div>
    );
  },
};

export const CustomTransition: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    return (
      <div style={{ maxWidth: 400 }}>
        <ToggleButton opened={opened} onClick={() => setOpened((o) => !o)} />
        <Collapse
          opened={opened}
          transitionDuration={1000}
          transitionTimingFunction="linear"
        >
          <DemoContent text="This collapse uses a 1000ms linear transition. Notice the slower, constant-speed animation." />
        </Collapse>
      </div>
    );
  },
};

export const WithoutOpacityAnimation: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    return (
      <div style={{ maxWidth: 400 }}>
        <ToggleButton opened={opened} onClick={() => setOpened((o) => !o)} />
        <Collapse opened={opened} animateOpacity={false}>
          <DemoContent text="This collapse does not animate opacity — only height changes." />
        </Collapse>
      </div>
    );
  },
};

export const NestedCollapses: Story = {
  render: () => {
    const [outerOpened, setOuterOpened] = useState(false);
    const [innerOpened, setInnerOpened] = useState(false);
    return (
      <div style={{ maxWidth: 400 }}>
        <ToggleButton opened={outerOpened} onClick={() => setOuterOpened((o) => !o)} />
        <Collapse opened={outerOpened}>
          <div
            style={{
              padding: 16,
              background: 'var(--prismui-action-hover, #f5f5f5)',
              borderRadius: 8,
            }}
          >
            <p style={{ margin: '0 0 8px', fontSize: 14 }}>
              This is the outer collapse content. It contains another collapse inside.
            </p>
            <ToggleButton opened={innerOpened} onClick={() => setInnerOpened((o) => !o)} />
            <Collapse opened={innerOpened}>
              <DemoContent text="This is the inner nested collapse content. Nested collapses work correctly with keepMounted behavior." />
            </Collapse>
          </div>
        </Collapse>
      </div>
    );
  },
};

export const KeepMounted: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    return (
      <div style={{ maxWidth: 400 }}>
        <ToggleButton opened={opened} onClick={() => setOpened((o) => !o)} />
        <Collapse opened={opened} keepMounted>
          <DemoContent text="This collapse keeps its content in the DOM even when closed (height: 0, overflow: hidden). Useful for preserving form state or nested collapses." />
        </Collapse>
        <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
          Inspect the DOM — the content div is always present.
        </p>
      </div>
    );
  },
};

export const InitiallyOpened: Story = {
  render: () => {
    const [opened, setOpened] = useState(true);
    return (
      <div style={{ maxWidth: 400 }}>
        <ToggleButton opened={opened} onClick={() => setOpened((o) => !o)} />
        <Collapse opened={opened}>
          <DemoContent text="This collapse starts in the opened state. Click the button to collapse it." />
        </Collapse>
      </div>
    );
  },
};
