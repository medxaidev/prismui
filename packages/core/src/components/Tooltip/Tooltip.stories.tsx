import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from './Tooltip';
import tooltipClasses from './Tooltip.module.css';
import { Popover } from '../Popover';
import popoverClasses from '../Popover/Popover.module.css';

/**
 * Tooltip · Stage-11 + Stage-12 联调消费者.
 *
 * Reference: `@/devdocs/components/Tooltip/design.md` v0.4
 *
 * Storybook 与设计文档主合约一一对应（Round 1 锁定的 9 OQ + 1 延后）：
 *   1. Default            — Trigger + Content 基线 · openDelay 500 / closeDelay 150
 *   2. Placements         — top / right / bottom / left × start / end (FloatingPlacement)
 *   3. Custom delays      — openDelay / closeDelay 自定义（hover-intent 单延迟 · OQ-TT-3）
 *   4. Focus-immediate    — keyboard focus 路径不受 openDelay 约束（§5.2 / §6.1）
 *   5. Touch filtered     — pointerType='touch' 不打开 tooltip（OQ-TT-4 = A）
 *   6. Esc dismisses      — focused trigger keydown · setOpen(false)（§6.5.1 独立场景）
 *   7. Scroll-outside     — scroll 触发关闭 · 唯一启用通道（v0.4 [Hook] / OQ-TT-6）
 *   8. Nested with Popover — OQ-TT-10 path 3 baseline · 单次 Esc 同时关闭 Tooltip 与
 *                            父 Popover（Phase 3 实证视觉稿）
 *   9. Long content        — Tooltip.Content 多行文本 · 不可包含焦点元素（DEV warn）
 *  10. asChild on link     — Trigger.asChild=true 接管任意 ReactElement（与 Popover 一致）
 *
 * 视觉默认值通过 `tooltipClasses.content` 注入（data-state opacity / scale 过渡 ·
 * prefers-reduced-motion 兜底 · 待 Stage-8 visual token 替换）。
 */

const meta = {
  title: 'Components/Tooltip',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared trigger style ─────────────────────────────────────────────────────

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
    <Tooltip.Root>
      <Tooltip.Trigger>
        <button type="button" style={buttonStyle}>
          Hover or focus me
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClasses.content}>
        Default tooltip · openDelay 500 · closeDelay 150
      </Tooltip.Content>
    </Tooltip.Root>
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
        gridTemplateColumns: 'repeat(3, minmax(140px, 1fr))',
        gap: 24,
        padding: 80,
      }}
    >
      {PLACEMENTS.map((placement) => (
        <Tooltip.Root key={placement} openDelay={100} closeDelay={100}>
          <Tooltip.Trigger>
            <button type="button" style={buttonStyle}>
              {placement}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content
            placement={placement}
            className={tooltipClasses.content}
          >
            placement={placement}
          </Tooltip.Content>
        </Tooltip.Root>
      ))}
    </div>
  ),
};

// ── 3. Custom delays ─────────────────────────────────────────────────────────

export const CustomDelays: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Tooltip.Root openDelay={0} closeDelay={0}>
        <Tooltip.Trigger>
          <button type="button" style={buttonStyle}>
            Instant (0/0)
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content className={tooltipClasses.content}>
          openDelay=0 · closeDelay=0
        </Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root openDelay={1000} closeDelay={500}>
        <Tooltip.Trigger>
          <button type="button" style={buttonStyle}>
            Slow (1000/500)
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content className={tooltipClasses.content}>
          openDelay=1000 · closeDelay=500
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
};

// ── 4. Focus immediate ───────────────────────────────────────────────────────

export const FocusImmediate: Story = {
  name: 'Focus path is immediate (§5.2 / §6.1)',
  render: () => (
    <Tooltip.Root openDelay={2000}>
      <Tooltip.Trigger>
        <button type="button" style={buttonStyle}>
          Tab to me — opens instantly even with openDelay=2000
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClasses.content}>
        Focus path bypasses openDelay (keyboard / AT users)
      </Tooltip.Content>
    </Tooltip.Root>
  ),
};

// ── 5. Touch filtered ────────────────────────────────────────────────────────

export const TouchFiltered: Story = {
  name: 'Touch pointerType disables hover open (OQ-TT-4 = A)',
  render: () => (
    <Tooltip.Root openDelay={100}>
      <Tooltip.Trigger>
        <button type="button" style={buttonStyle}>
          Touch me on a touch device → no tooltip
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClasses.content}>
        Mouse / pen only · focus path still works for keyboard
      </Tooltip.Content>
    </Tooltip.Root>
  ),
};

// ── 6. Esc dismisses ─────────────────────────────────────────────────────────

export const EscDismiss: Story = {
  name: 'Esc on focused trigger closes tooltip (§6.5.1)',
  render: () => (
    <Tooltip.Root openDelay={0}>
      <Tooltip.Trigger>
        <button type="button" style={buttonStyle}>
          Focus me · then press Esc
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClasses.content}>
        Esc on trigger sends bubble keydown → setOpen(false)
      </Tooltip.Content>
    </Tooltip.Root>
  ),
};

// ── 7. Scroll-outside dismissal ──────────────────────────────────────────────

export const ScrollOutsideDismiss: Story = {
  name: 'Scroll outside closes tooltip (default channel)',
  render: () => (
    <div style={{ height: 800, overflow: 'auto', padding: 40 }}>
      <p style={{ marginBottom: 200 }}>Scroll up / down to dismiss the tooltip.</p>
      <Tooltip.Root openDelay={0}>
        <Tooltip.Trigger>
          <button type="button" style={buttonStyle}>
            Hover me · then scroll
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content className={tooltipClasses.content}>
          scrollOutside is the only dismissal channel routed through useDismissal
        </Tooltip.Content>
      </Tooltip.Root>
      <div style={{ height: 600 }} />
    </div>
  ),
};

// ── 8. Nested with Popover (OQ-TT-10 path 3 baseline) ───────────────────────

export const NestedInsidePopover: Story = {
  name: 'Tooltip nested inside Popover · single Esc closes both (OQ-TT-10)',
  render: () => (
    <Popover.Root>
      <Popover.Trigger>
        <button type="button" style={buttonStyle}>
          Open Popover
        </button>
      </Popover.Trigger>
      <Popover.Content className={popoverClasses.content}>
        <div style={{ minWidth: 240, display: 'flex', gap: 12 }}>
          <span>Press Esc to close both:</span>
          <Tooltip.Root openDelay={100}>
            <Tooltip.Trigger>
              <button type="button" style={buttonStyle}>
                Hover for tip
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content className={tooltipClasses.content}>
              Tooltip inside Popover (path 3 default)
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
      </Popover.Content>
    </Popover.Root>
  ),
};

// ── 9. Long content ──────────────────────────────────────────────────────────

export const LongContent: Story = {
  render: () => (
    <Tooltip.Root openDelay={200}>
      <Tooltip.Trigger>
        <button type="button" style={buttonStyle}>
          Hover for long description
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content
        className={tooltipClasses.content}
        style={{ maxWidth: 280 }}
      >
        Tooltip should describe its trigger concisely. For longer instructional
        content prefer Popover (focusable) · Tooltip.Content must not contain
        focusable elements (DEV warn).
      </Tooltip.Content>
    </Tooltip.Root>
  ),
};

// ── 10. asChild on link ──────────────────────────────────────────────────────

export const AsChildLink: Story = {
  name: 'Trigger.asChild on <a> (OQ-TT-7 三件套基线)',
  render: () => (
    <Tooltip.Root openDelay={150}>
      <Tooltip.Trigger>
        <a
          href="https://example.com"
          target="_blank"
          rel="noreferrer"
          style={{
            ...buttonStyle,
            display: 'inline-block',
            textDecoration: 'none',
            color: '#0366d6',
          }}
        >
          Open external link
        </a>
      </Tooltip.Trigger>
      <Tooltip.Content className={tooltipClasses.content}>
        Trigger merges into any single ReactElement (Radix-style asChild)
      </Tooltip.Content>
    </Tooltip.Root>
  ),
};
