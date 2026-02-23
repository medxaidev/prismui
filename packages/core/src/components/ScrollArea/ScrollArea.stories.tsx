import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea, ScrollAreaAutosize } from './ScrollArea';

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PARAGRAPHS = Array.from(
  { length: 10 },
  (_, i) =>
    `Paragraph ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
);

function ContentBlock() {
  return (
    <div style={{ padding: 16, fontSize: 14, lineHeight: 1.6 }}>
      {PARAGRAPHS.map((text, i) => (
        <p key={i} style={{ margin: '0 0 12px' }}>
          {text}
        </p>
      ))}
    </div>
  );
}

function WideContent() {
  return (
    <div style={{ width: 800, padding: 16, fontSize: 14 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {Array.from({ length: 10 }, (_, i) => (
              <th
                key={i}
                style={{
                  padding: '8px 16px',
                  borderBottom: '2px solid var(--prismui-divider, #ddd)',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                Column {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 20 }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: 10 }, (_, col) => (
                <td
                  key={col}
                  style={{
                    padding: '6px 16px',
                    borderBottom: '1px solid var(--prismui-divider, #eee)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Row {row + 1}, Col {col + 1}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Basic: Story = {
  render: () => (
    <ScrollArea style={{ height: 250, border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}>
      <ContentBlock />
    </ScrollArea>
  ),
};

export const HorizontalScrollbars: Story = {
  render: () => (
    <ScrollArea
      style={{ width: 400, height: 300, border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}
    >
      <WideContent />
    </ScrollArea>
  ),
};

export const VerticalOnly: Story = {
  render: () => (
    <ScrollArea
      scrollbars="y"
      style={{ width: 400, height: 250, border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}
    >
      <WideContent />
    </ScrollArea>
  ),
};

export const AlwaysVisible: Story = {
  render: () => (
    <ScrollArea
      type="always"
      style={{ height: 250, border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}
    >
      <ContentBlock />
    </ScrollArea>
  ),
};

export const NeverVisible: Story = {
  render: () => (
    <ScrollArea
      type="never"
      style={{ height: 250, border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}
    >
      <ContentBlock />
    </ScrollArea>
  ),
};

export const CustomScrollbarSize: Story = {
  render: () => (
    <ScrollArea
      type="always"
      scrollbarSize={16}
      style={{ height: 250, border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}
    >
      <ContentBlock />
    </ScrollArea>
  ),
};

export const OffsetScrollbars: Story = {
  render: () => (
    <ScrollArea
      type="always"
      offsetScrollbars
      style={{ height: 250, border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}
    >
      <ContentBlock />
    </ScrollArea>
  ),
};

export const ScrollPositionTracking: Story = {
  render: () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    return (
      <div>
        <div style={{ marginBottom: 8, fontSize: 13, fontFamily: 'monospace' }}>
          scrollTop: {Math.round(position.y)}px, scrollLeft: {Math.round(position.x)}px
        </div>
        <ScrollArea
          style={{ height: 250, border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}
          onScrollPositionChange={setPosition}
        >
          <ContentBlock />
        </ScrollArea>
      </div>
    );
  },
};

export const ScrollToPosition: Story = {
  render: () => {
    const viewportRef = useRef<HTMLDivElement>(null);
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' }}
          >
            Scroll to top
          </button>
          <button
            onClick={() =>
              viewportRef.current?.scrollTo({
                top: viewportRef.current.scrollHeight,
                behavior: 'smooth',
              })
            }
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' }}
          >
            Scroll to bottom
          </button>
        </div>
        <ScrollArea
          viewportRef={viewportRef}
          style={{ height: 250, border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}
        >
          <ContentBlock />
        </ScrollArea>
      </div>
    );
  },
};

export const Autosize: Story = {
  render: () => {
    const [count, setCount] = useState(3);
    return (
      <div style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => setCount((c) => Math.max(0, c - 1))}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' }}
          >
            Remove paragraph
          </button>
          <button
            onClick={() => setCount((c) => Math.min(10, c + 1))}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' }}
          >
            Add paragraph
          </button>
          <span style={{ fontSize: 13, alignSelf: 'center' }}>{count} paragraphs</span>
        </div>
        <ScrollAreaAutosize
          maxHeight={300}
          style={{ border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}
        >
          <div style={{ padding: 16, fontSize: 14, lineHeight: 1.6 }}>
            {Array.from({ length: count }, (_, i) => (
              <p key={i} style={{ margin: '0 0 12px' }}>
                {PARAGRAPHS[i % PARAGRAPHS.length]}
              </p>
            ))}
          </div>
        </ScrollAreaAutosize>
      </div>
    );
  },
};

export const BottomReachedCallback: Story = {
  render: () => {
    const [reached, setReached] = useState(false);
    return (
      <div>
        <div style={{ marginBottom: 8, fontSize: 13 }}>
          Bottom reached: <strong>{reached ? 'Yes' : 'No'}</strong>
        </div>
        <ScrollArea
          style={{ height: 250, border: '1px solid var(--prismui-divider, #ddd)', borderRadius: 8 }}
          onBottomReached={() => setReached(true)}
          onTopReached={() => setReached(false)}
        >
          <ContentBlock />
        </ScrollArea>
      </div>
    );
  },
};
