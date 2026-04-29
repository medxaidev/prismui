import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Popover } from './Popover';
import popoverClasses from './Popover.module.css';

/**
 * Popover · Stage-11 + Stage-12 联调首消费者.
 *
 * Reference: `@/devdocs/components/Popover/design.md` v0.1.6
 *
 * Storybook 与设计文档主合约一一对应：
 *   1. Default            — Trigger + Content 基线
 *   2. Placements         — §四 12 placements 视觉验证
 *   3. Controlled         — 受控 open + onOpenChange
 *   4. ForceMount         — Presence forceMount opt-in（OQ-PR-4）
 *   5. Dismiss channels   — pointerOutside / escape / scroll / focusOutside opt-in
 *   6. Nested popovers    — DismissalStack 嵌套 Esc（OV-DISMISS-2）
 *   7. With form content  — onBeforeDismiss veto 路径（dirty form 拦截示例）
 *   8. Anchor decoupled   — `Popover.Anchor` 与 trigger 解耦（OQ-POP-1 v0.1.4 锁 A + 可选 Anchor）
 *   9. Trigger asChild    — Trigger 接管用户提供的 Button / Link / 自定义元素（OQ-POP-2 = A）
 *  10. ARIA labelledby    — 外部标签 → Content `aria-labelledby` · APG popup pattern
 *
 * 视觉默认值通过 `popoverClasses.content` 注入（data-state opacity / scale 过渡 ·
 * prefers-reduced-motion 兜底 · 待 Stage-8 visual token 替换）。
 */

const meta = {
  title: 'Components/Popover',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared button styling for trigger demos ──────────────────────────────────

const buttonStyle: React.CSSProperties = {
  padding: '8px 14px',
  fontSize: 14,
  border: '1px solid rgba(0, 0, 0, 0.2)',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
};

// ── 1. Default ───────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger>
        <button type="button" style={buttonStyle}>
          Open Popover
        </button>
      </Popover.Trigger>
      <Popover.Content className={popoverClasses.content}>
        <div style={{ minWidth: 200 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Popover Title</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            Press Esc · click outside · or scroll to dismiss.
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  ),
};

// ── 2. Placements ────────────────────────────────────────────────────────────

const PLACEMENTS = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
] as const;

export const Placements: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, auto)',
        gap: 24,
        padding: 80,
      }}
    >
      {PLACEMENTS.map((placement) => (
        <Popover.Root key={placement}>
          <Popover.Trigger>
            <button type="button" style={buttonStyle}>
              {placement}
            </button>
          </Popover.Trigger>
          <Popover.Content className={popoverClasses.content} placement={placement}>
            placement: {placement}
          </Popover.Content>
        </Popover.Root>
      ))}
    </div>
  ),
};

// ── 3. Controlled ────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={buttonStyle} onClick={() => setOpen(true)}>
            External · Open
          </button>
          <button type="button" style={buttonStyle} onClick={() => setOpen(false)}>
            External · Close
          </button>
        </div>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger>
            <button type="button" style={buttonStyle}>
              Trigger (open: {String(open)})
            </button>
          </Popover.Trigger>
          <Popover.Content className={popoverClasses.content}>
            Controlled mode · `open` is owned by the parent component.
          </Popover.Content>
        </Popover.Root>
      </div>
    );
  },
};

// ── 4. ForceMount ────────────────────────────────────────────────────────────

export const ForceMount: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 320 }}>
        With <code>forceMount</code> the closed-state DOM stays in the tree (Presence
        OQ-PR-4 opt-in). Useful for animations that read measured size before mount.
      </p>
      <Popover.Root>
        <Popover.Trigger>
          <button type="button" style={buttonStyle}>
            Trigger (forceMount)
          </button>
        </Popover.Trigger>
        <Popover.Content className={popoverClasses.content} forceMount>
          forceMount · DOM kept on closed state (data-state="closed").
        </Popover.Content>
      </Popover.Root>
    </div>
  ),
};

// ── 5. Dismiss channels ──────────────────────────────────────────────────────

export const DismissChannels: Story = {
  render: () => {
    const [log, setLog] = React.useState<string[]>([]);
    const append = (msg: string) =>
      setLog((prev) => [`${new Date().toLocaleTimeString()} · ${msg}`, ...prev].slice(0, 8));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 360 }}>
          All four dismiss channels enabled (incl. <code>focusOutside</code> opt-in
          beyond defaults). Open it then try Esc / outside click / Tab away / page
          scroll.
        </p>
        <Popover.Root onOpenChange={(o) => append(`onOpenChange(${o})`)}>
          <Popover.Trigger>
            <button type="button" style={buttonStyle}>
              All channels on
            </button>
          </Popover.Trigger>
          <Popover.Content
            className={popoverClasses.content}
            dismiss={{
              pointerOutside: true,
              escapeKey: true,
              focusOutside: true,
              scrollOutside: true,
            }}
          >
            <div style={{ minWidth: 240 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>All 4 channels live</div>
              <button type="button" style={buttonStyle}>
                Inside button — focusing me keeps open
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
        <pre
          style={{
            fontSize: 12,
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 6,
            margin: 0,
            minHeight: 100,
            maxWidth: 420,
          }}
        >
          {log.length === 0 ? '(no events yet)' : log.join('\n')}
        </pre>
      </div>
    );
  },
};

// ── 6. Nested popovers ───────────────────────────────────────────────────────

export const Nested: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 360 }}>
        Nested popovers demonstrate <code>DismissalStack</code> ordering (OV-DISMISS-2).
        Press <kbd>Esc</kbd>: only the top-most popover closes.
      </p>
      <Popover.Root>
        <Popover.Trigger>
          <button type="button" style={buttonStyle}>
            Outer
          </button>
        </Popover.Trigger>
        <Popover.Content className={popoverClasses.content}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span>Outer popover content</span>
            <Popover.Root>
              <Popover.Trigger>
                <button type="button" style={buttonStyle}>
                  Inner
                </button>
              </Popover.Trigger>
              <Popover.Content className={popoverClasses.content}>
                Inner popover · Esc closes only this one.
              </Popover.Content>
            </Popover.Root>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  ),
};

// ── 7. Form with onBeforeDismiss veto via controlled state ───────────────────

export const FormWithDirtyGuard: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('');
    const dirty = value.length > 0;

    return (
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          if (!next && dirty) {
            const ok = window.confirm('Discard unsaved changes?');
            if (!ok) return; // veto via controlled state
          }
          setOpen(next);
          if (!next) setValue('');
        }}
      >
        <Popover.Trigger>
          <button type="button" style={buttonStyle}>
            Form Popover
          </button>
        </Popover.Trigger>
        <Popover.Content className={popoverClasses.content}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 240 }}>
            <label style={{ fontSize: 12, opacity: 0.8 }}>
              Edit something — closing while dirty triggers a confirm prompt.
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={{
                padding: '6px 8px',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: 4,
                fontSize: 13,
              }}
            />
            <div style={{ fontSize: 12, opacity: 0.6 }}>dirty: {String(dirty)}</div>
          </div>
        </Popover.Content>
      </Popover.Root>
    );
  },
};

// ── 8. Anchor decoupled · trigger 与 anchor 不在同一节点 ─────────────────────

export const AnchorDecoupled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 420, textAlign: 'center' }}>
        典型用例：trigger 是工具栏按钮 · 但浮层 anchor 到一个不同的视觉锚点
        （如选中文本范围、表格单元格、画布坐标）。`Popover.Anchor` 把定位参考与
        语义触发器解耦（OQ-POP-1 锁 A + 可选 Anchor）。
      </p>
      <Popover.Root>
        <div
          style={{
            display: 'flex',
            gap: 32,
            padding: 24,
            border: '1px dashed rgba(0,0,0,0.2)',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Popover.Trigger>
            <button type="button" style={buttonStyle}>
              ↗ Trigger（左）
            </button>
          </Popover.Trigger>
          <Popover.Anchor>
            <span
              style={{
                padding: '6px 14px',
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              ⚓ Anchor（右）— 浮层会绑这里
            </span>
          </Popover.Anchor>
        </div>
        <Popover.Content className={popoverClasses.content} placement="bottom">
          <div style={{ minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Anchored to the right</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Trigger 仍在左 · Floating UI 用 Anchor 元素作 reference。
            </div>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  ),
};

// ── 9. Trigger asChild · 套入用户自定义元素 ─────────────────────────────────

export const TriggerAsChild: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'flex-start' }}>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 480 }}>
        OQ-POP-2 锁 A · `Popover.Trigger` 默认 `asChild=true` · 把
        `aria-expanded` / `aria-controls` / `aria-haspopup` / `onClick` /
        `data-state` / `ref` 等合并到用户提供的单一 ReactElement 上 · 不引入
        额外 wrapper。下面三种 child 都自动获得 ARIA 与事件绑定：
      </p>

      {/* a. styled native button */}
      <Popover.Root>
        <Popover.Trigger>
          <button
            type="button"
            style={{
              ...buttonStyle,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            🎨 Custom styled &lt;button&gt;
          </button>
        </Popover.Trigger>
        <Popover.Content className={popoverClasses.content}>
          Trigger = native &lt;button&gt; with custom styles · ARIA wired automatically.
        </Popover.Content>
      </Popover.Root>

      {/* b. anchor as trigger (links opening popovers) */}
      <Popover.Root>
        <Popover.Trigger>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}
          >
            🔗 An &lt;a&gt; element
          </a>
        </Popover.Trigger>
        <Popover.Content className={popoverClasses.content}>
          Trigger = &lt;a&gt; · click handler is composed with Popover&apos;s toggle.
        </Popover.Content>
      </Popover.Root>

      {/* c. div with role */}
      <Popover.Root>
        <Popover.Trigger>
          <div
            role="button"
            tabIndex={0}
            style={{
              padding: '10px 14px',
              border: '2px dashed #16a34a',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              userSelect: 'none',
            }}
          >
            🟩 A &lt;div role=&quot;button&quot;&gt;
          </div>
        </Popover.Trigger>
        <Popover.Content className={popoverClasses.content}>
          Trigger = generic &lt;div&gt; with explicit role · still gets all ARIA + keyboard.
        </Popover.Content>
      </Popover.Root>
    </div>
  ),
};

// ── 10. ARIA labelledby · 外部标签关联 Content ──────────────────────────────

export const AriaLabelledBy: Story = {
  render: () => {
    const labelId = React.useId();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 460 }}>
          APG popup pattern · 当 popover 内容由独立的视觉标题领起 · 把标题 id
          通过 `aria-labelledby` 关联到 Content · 屏幕阅读器朗读时把它当作
          浮层的 accessible name。OQ-POP-3 锁 B · `role` 不强制 · 这里用户
          显式传入 `role="dialog"` 配合 labelledby。
        </p>
        <Popover.Root>
          <Popover.Trigger>
            <button type="button" style={buttonStyle}>
              Open with labelledby
            </button>
          </Popover.Trigger>
          <Popover.Content
            className={popoverClasses.content}
            role="dialog"
            aria-labelledby={labelId}
          >
            <div style={{ minWidth: 240 }}>
              <h3
                id={labelId}
                style={{ margin: 0, marginBottom: 8, fontSize: 15, fontWeight: 600 }}
              >
                Account preferences
              </h3>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
                AT will announce &ldquo;Account preferences, dialog&rdquo; on open.
              </p>
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              >
                Inspect &lt;Content&gt;: aria-labelledby=&quot;{labelId}&quot;
              </div>
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
    );
  },
};
