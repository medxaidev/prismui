import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Modal } from './Modal';
import modalClasses from './Modal.module.css';

/**
 * Modal · Phase 7a/b/c 联调首消费者.
 *
 * Reference: `@/devdocs/components/Modal/design.md` v0.2 + ADR-007 Modal Foundation.
 *
 * Storybook 与 ADR-007 决策一一对应：
 *   1. Default              — 完整 compound (Trigger + Backdrop + Content + Title + Description + Close)
 *   2. Sizes                — 5 档 preset + numeric/string fallback (议题 B 决策 6 · LY-MODAL-2)
 *   3. Controlled           — 外部 open 状态 + onOpenChange (受控模式)
 *   4. AlertDialogRole      — role="alertdialog" B 路径 ARIA 转发 (议题 E 决策 16)
 *   5. DismissChannels      — dismissOnEscape / dismissOnBackdropClick 两开关 (议题 C 决策 8/9)
 *   6. NestedModals         — DismissalStack 嵌套 Esc (OV-DISMISS-2)
 *   7. ForceMount           — Backdrop / Content 独立 Presence forceMount opt-in (OQ-PR-4)
 *   8. LongContent          — body scroll-lock + 内部滚动 (OV-MODAL-2)
 *   9. FormWithDirtyGuard   — onOpenChange veto 路径 (dirty form 拦截示例)
 *  10. CustomPortalContainer — container 转发到自定义 host (OV-PORTAL-1 · PR-INTEROP-4)
 *
 * 视觉默认值通过 `modalClasses.content` / `modalClasses.backdrop` 注入；尺寸 /
 * backdrop / motion 由 theme 层 CSS 变量驱动 (Phase 7c · ADR-007 决策 14/17/20)。
 */

const meta = {
  title: 'Components/Modal',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared trigger / close styles ────────────────────────────────────────────

const buttonStyle: React.CSSProperties = {
  padding: '8px 14px',
  fontSize: 14,
  border: '1px solid rgba(0, 0, 0, 0.2)',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#2563eb',
  color: '#fff',
  border: '1px solid #1d4ed8',
};

const stageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: 48,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  alignItems: 'flex-start',
};

const contentBodyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 20,
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  padding: '12px 20px 20px',
  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
};

// ── 1. Default ───────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={stageStyle}>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 520 }}>
        完整 compound · Trigger 打开 · ESC / Backdrop 点击关闭 · 焦点自动进入
        Content 并在关闭时回归 Trigger（OV-MODAL-1 三子合约）。
      </p>
      <Modal.Root>
        <Modal.Trigger>
          <button type="button" style={primaryButtonStyle}>
            Open Modal
          </button>
        </Modal.Trigger>
        <Modal.Backdrop className={modalClasses.backdrop} />
        <Modal.Content className={modalClasses.content}>
          <div style={contentBodyStyle}>
            <Modal.Title>Confirm action</Modal.Title>
            <Modal.Description>
              此对话框使用默认 size <code>md</code> · role <code>dialog</code> · 默认
              开启 ESC + backdrop 双通道关闭。
            </Modal.Description>
          </div>
          <div style={footerStyle}>
            <Modal.Close>
              <button type="button" style={buttonStyle}>
                Cancel
              </button>
            </Modal.Close>
            <Modal.Close>
              <button type="button" style={primaryButtonStyle}>
                Confirm
              </button>
            </Modal.Close>
          </div>
        </Modal.Content>
      </Modal.Root>
    </div>
  ),
};

// ── 2. Sizes ─────────────────────────────────────────────────────────────────

const SIZE_PRESETS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export const Sizes: Story = {
  render: () => (
    <div style={stageStyle}>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 520 }}>
        5 档 preset 走 <code>data-size</code> + theme CSS 变量；任意 numeric /
        string 走 inline <code>style.width</code> (议题 B 决策 6 LY-MODAL-2)。
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {SIZE_PRESETS.map((size) => (
          <Modal.Root key={size}>
            <Modal.Trigger>
              <button type="button" style={buttonStyle}>
                size = {size}
              </button>
            </Modal.Trigger>
            <Modal.Backdrop className={modalClasses.backdrop} />
            <Modal.Content className={modalClasses.content} size={size}>
              <div style={contentBodyStyle}>
                <Modal.Title>Size · {size}</Modal.Title>
                <Modal.Description>
                  Preset size <code>{size}</code> · consumes
                  {' '}
                  <code>--prismui-modal-size-{size}</code> CSS var.
                </Modal.Description>
              </div>
              <div style={footerStyle}>
                <Modal.Close>
                  <button type="button" style={buttonStyle}>Close</button>
                </Modal.Close>
              </div>
            </Modal.Content>
          </Modal.Root>
        ))}
        <Modal.Root>
          <Modal.Trigger>
            <button type="button" style={buttonStyle}>
              size = 720 (numeric)
            </button>
          </Modal.Trigger>
          <Modal.Backdrop className={modalClasses.backdrop} />
          <Modal.Content className={modalClasses.content} size={720}>
            <div style={contentBodyStyle}>
              <Modal.Title>Size · 720</Modal.Title>
              <Modal.Description>
                Numeric fallback · 走 inline <code>style.width: 720px</code> ·
                不消费 preset CSS var。
              </Modal.Description>
            </div>
            <div style={footerStyle}>
              <Modal.Close>
                <button type="button" style={buttonStyle}>Close</button>
              </Modal.Close>
            </div>
          </Modal.Content>
        </Modal.Root>
      </div>
    </div>
  ),
};

// ── 3. Controlled ────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div style={stageStyle}>
        <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 520 }}>
          受控模式 · 外部 state 拥有 <code>open</code> · onOpenChange 双向同步。
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={buttonStyle} onClick={() => setOpen(true)}>
            External · Open
          </button>
          <button type="button" style={buttonStyle} onClick={() => setOpen(false)}>
            External · Close
          </button>
          <span style={{ fontSize: 12, alignSelf: 'center', opacity: 0.6 }}>
            open: {String(open)}
          </span>
        </div>
        <Modal.Root open={open} onOpenChange={setOpen}>
          <Modal.Trigger>
            <button type="button" style={primaryButtonStyle}>
              Trigger (also toggles)
            </button>
          </Modal.Trigger>
          <Modal.Backdrop className={modalClasses.backdrop} />
          <Modal.Content className={modalClasses.content}>
            <div style={contentBodyStyle}>
              <Modal.Title>Controlled Modal</Modal.Title>
              <Modal.Description>
                Modal.Root 同时接受 trigger / ESC / backdrop / Close 等内部信号
                经由 onOpenChange 反馈给受控父级。
              </Modal.Description>
            </div>
            <div style={footerStyle}>
              <Modal.Close>
                <button type="button" style={buttonStyle}>Dismiss via Close</button>
              </Modal.Close>
            </div>
          </Modal.Content>
        </Modal.Root>
      </div>
    );
  },
};

// ── 4. AlertDialog role ──────────────────────────────────────────────────────

export const AlertDialogRole: Story = {
  render: () => (
    <div style={stageStyle}>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 520 }}>
        议题 E 决策 16 · role=&quot;alertdialog&quot; B 路径属性转发（不引独立组件）。
        Trigger 的 <code>aria-haspopup</code> 仍恒为 <code>&quot;dialog&quot;</code>
        （WAI-ARIA 1.2 §6.6.7 合法 token 约束）。
      </p>
      <Modal.Root role="alertdialog" dismissOnBackdropClick={false}>
        <Modal.Trigger>
          <button type="button" style={{ ...primaryButtonStyle, background: '#dc2626', borderColor: '#b91c1c' }}>
            Delete account…
          </button>
        </Modal.Trigger>
        <Modal.Backdrop className={modalClasses.backdrop} />
        <Modal.Content className={modalClasses.content}>
          <div style={contentBodyStyle}>
            <Modal.Title>Delete account?</Modal.Title>
            <Modal.Description>
              This action is irreversible. Backdrop click is disabled — you must
              choose an explicit option.
            </Modal.Description>
          </div>
          <div style={footerStyle}>
            <Modal.Close>
              <button type="button" style={buttonStyle}>Cancel</button>
            </Modal.Close>
            <Modal.Close>
              <button
                type="button"
                style={{ ...primaryButtonStyle, background: '#dc2626', borderColor: '#b91c1c' }}
              >
                Delete
              </button>
            </Modal.Close>
          </div>
        </Modal.Content>
      </Modal.Root>
    </div>
  ),
};

// ── 5. Dismiss channels ──────────────────────────────────────────────────────

export const DismissChannels: Story = {
  render: () => {
    const [log, setLog] = React.useState<string[]>([]);
    const append = (msg: string) =>
      setLog((prev) => [`${new Date().toLocaleTimeString()} · ${msg}`, ...prev].slice(0, 10));

    return (
      <div style={stageStyle}>
        <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 520 }}>
          两个独立通道开关（议题 C 决策 8/9 · 5/5 库 default-on consensus）：
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Modal.Root onOpenChange={(o) => append(`default · onOpenChange(${o})`)}>
            <Modal.Trigger>
              <button type="button" style={buttonStyle}>Both channels on (default)</button>
            </Modal.Trigger>
            <Modal.Backdrop className={modalClasses.backdrop} />
            <Modal.Content className={modalClasses.content}>
              <div style={contentBodyStyle}>
                <Modal.Title>Both channels on</Modal.Title>
                <Modal.Description>
                  Try ESC and backdrop click — both close.
                </Modal.Description>
              </div>
            </Modal.Content>
          </Modal.Root>

          <Modal.Root
            dismissOnEscape={false}
            onOpenChange={(o) => append(`esc-off · onOpenChange(${o})`)}
          >
            <Modal.Trigger>
              <button type="button" style={buttonStyle}>ESC disabled</button>
            </Modal.Trigger>
            <Modal.Backdrop className={modalClasses.backdrop} />
            <Modal.Content className={modalClasses.content}>
              <div style={contentBodyStyle}>
                <Modal.Title>ESC disabled</Modal.Title>
                <Modal.Description>
                  ESC 被吞（决策 11 OV-MODAL-4 顶层吞）· 仅 backdrop / Close 可关。
                </Modal.Description>
              </div>
              <div style={footerStyle}>
                <Modal.Close>
                  <button type="button" style={buttonStyle}>Close</button>
                </Modal.Close>
              </div>
            </Modal.Content>
          </Modal.Root>

          <Modal.Root
            dismissOnBackdropClick={false}
            onOpenChange={(o) => append(`backdrop-off · onOpenChange(${o})`)}
          >
            <Modal.Trigger>
              <button type="button" style={buttonStyle}>Backdrop disabled</button>
            </Modal.Trigger>
            <Modal.Backdrop className={modalClasses.backdrop} />
            <Modal.Content className={modalClasses.content}>
              <div style={contentBodyStyle}>
                <Modal.Title>Backdrop disabled</Modal.Title>
                <Modal.Description>
                  Backdrop 不再关闭 · 仅 ESC / Close 可关。
                </Modal.Description>
              </div>
              <div style={footerStyle}>
                <Modal.Close>
                  <button type="button" style={buttonStyle}>Close</button>
                </Modal.Close>
              </div>
            </Modal.Content>
          </Modal.Root>
        </div>

        <pre
          style={{
            fontSize: 12,
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 6,
            margin: 0,
            minHeight: 120,
            maxWidth: 520,
            width: '100%',
          }}
        >
          {log.length === 0 ? '(no events yet)' : log.join('\n')}
        </pre>
      </div>
    );
  },
};

// ── 6. Nested modals ─────────────────────────────────────────────────────────

export const NestedModals: Story = {
  render: () => (
    <div style={stageStyle}>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 520 }}>
        嵌套 Modal 演示 DismissalStack 排序（OV-DISMISS-2）· 按
        <kbd> Esc </kbd>只关闭最顶层。
      </p>
      <Modal.Root>
        <Modal.Trigger>
          <button type="button" style={primaryButtonStyle}>Open outer</button>
        </Modal.Trigger>
        <Modal.Backdrop className={modalClasses.backdrop} />
        <Modal.Content className={modalClasses.content}>
          <div style={contentBodyStyle}>
            <Modal.Title>Outer modal</Modal.Title>
            <Modal.Description>
              Outer body · 打开 inner 后按 Esc 只关 inner。
            </Modal.Description>
            <Modal.Root>
              <Modal.Trigger>
                <button type="button" style={buttonStyle}>Open inner</button>
              </Modal.Trigger>
              <Modal.Backdrop className={modalClasses.backdrop} />
              <Modal.Content className={modalClasses.content} size="sm">
                <div style={contentBodyStyle}>
                  <Modal.Title>Inner modal</Modal.Title>
                  <Modal.Description>
                    Esc here closes only this top-of-stack modal.
                  </Modal.Description>
                </div>
                <div style={footerStyle}>
                  <Modal.Close>
                    <button type="button" style={buttonStyle}>Close inner</button>
                  </Modal.Close>
                </div>
              </Modal.Content>
            </Modal.Root>
          </div>
          <div style={footerStyle}>
            <Modal.Close>
              <button type="button" style={buttonStyle}>Close outer</button>
            </Modal.Close>
          </div>
        </Modal.Content>
      </Modal.Root>
    </div>
  ),
};

// ── 7. ForceMount ────────────────────────────────────────────────────────────

export const ForceMount: Story = {
  render: () => (
    <div style={stageStyle}>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 520 }}>
        Backdrop 与 Content 各自独立 Presence · 任一可 opt-in
        <code> forceMount</code>（OQ-PR-4）· 关闭后 DOM 仍在树中以
        <code> data-state=&quot;closed&quot;</code> 呈现。
      </p>
      <Modal.Root>
        <Modal.Trigger>
          <button type="button" style={buttonStyle}>Open (forceMount)</button>
        </Modal.Trigger>
        <Modal.Backdrop className={modalClasses.backdrop} forceMount />
        <Modal.Content className={modalClasses.content} forceMount>
          <div style={contentBodyStyle}>
            <Modal.Title>ForceMount</Modal.Title>
            <Modal.Description>
              Inspect the DOM after closing — backdrop &amp; content nodes
              remain with <code>data-state=&quot;closed&quot;</code>.
            </Modal.Description>
          </div>
          <div style={footerStyle}>
            <Modal.Close>
              <button type="button" style={buttonStyle}>Close</button>
            </Modal.Close>
          </div>
        </Modal.Content>
      </Modal.Root>
    </div>
  ),
};

// ── 8. Long content + body scroll-lock ──────────────────────────────────────

export const LongContent: Story = {
  render: () => (
    <div style={stageStyle}>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 520 }}>
        Modal 打开时 body 滚动被锁定（OV-MODAL-2 · ModalScrollLock）· 内部超长
        内容沿 Content 自身滚动；背景页面滚动条占位保持 · 防止 layout shift。
      </p>
      <div style={{ height: 1600, paddingTop: 16 }}>
        <Modal.Root>
          <Modal.Trigger>
            <button type="button" style={primaryButtonStyle}>Open long modal</button>
          </Modal.Trigger>
          <Modal.Backdrop className={modalClasses.backdrop} />
          <Modal.Content className={modalClasses.content} size="lg">
            <div style={contentBodyStyle}>
              <Modal.Title>Terms &amp; conditions</Modal.Title>
              <Modal.Description>
                Scroll inside the modal — page body underneath stays locked.
              </Modal.Description>
              <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 8 }}>
                {Array.from({ length: 40 }).map((_, i) => (
                  <p key={i} style={{ margin: '8px 0', fontSize: 13, opacity: 0.85 }}>
                    §{i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit. Sed do eiusmod tempor incididunt ut labore et dolore
                    magna aliqua. Ut enim ad minim veniam, quis nostrud
                    exercitation ullamco laboris nisi ut aliquip ex ea commodo
                    consequat.
                  </p>
                ))}
              </div>
            </div>
            <div style={footerStyle}>
              <Modal.Close>
                <button type="button" style={buttonStyle}>Decline</button>
              </Modal.Close>
              <Modal.Close>
                <button type="button" style={primaryButtonStyle}>Accept</button>
              </Modal.Close>
            </div>
          </Modal.Content>
        </Modal.Root>
        <p style={{ marginTop: 64, fontSize: 12, opacity: 0.5 }}>
          ↓ 1600px tall stage · 关闭 Modal 后页面滚动恢复。
        </p>
      </div>
    </div>
  ),
};

// ── 9. Form with dirty guard (onOpenChange veto) ────────────────────────────

export const FormWithDirtyGuard: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('');
    const dirty = value.length > 0;

    return (
      <div style={stageStyle}>
        <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 520 }}>
          Dirty-form 拦截示例 · 经由受控 <code>onOpenChange</code> 同步路径
          veto · 与 Popover 一致的 closed-loop 模式。
        </p>
        <Modal.Root
          open={open}
          onOpenChange={(next) => {
            if (!next && dirty) {
              const ok = window.confirm('Discard unsaved changes?');
              if (!ok) return; // veto
            }
            setOpen(next);
            if (!next) setValue('');
          }}
        >
          <Modal.Trigger>
            <button type="button" style={primaryButtonStyle}>Edit profile…</button>
          </Modal.Trigger>
          <Modal.Backdrop className={modalClasses.backdrop} />
          <Modal.Content className={modalClasses.content}>
            <div style={contentBodyStyle}>
              <Modal.Title>Edit profile</Modal.Title>
              <Modal.Description>
                Type anything to mark the form dirty · then ESC / backdrop /
                Close — confirm prompt 拦截。
              </Modal.Description>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Display name"
                style={{
                  padding: '8px 10px',
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
              <div style={{ fontSize: 12, opacity: 0.6 }}>dirty: {String(dirty)}</div>
            </div>
            <div style={footerStyle}>
              <Modal.Close>
                <button type="button" style={buttonStyle}>Cancel</button>
              </Modal.Close>
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={() => {
                  setValue('');
                  setOpen(false);
                }}
              >
                Save
              </button>
            </div>
          </Modal.Content>
        </Modal.Root>
      </div>
    );
  },
};

// ── 10. Custom portal container ──────────────────────────────────────────────

export const CustomPortalContainer: Story = {
  render: () => {
    const hostRef = React.useRef<HTMLDivElement | null>(null);
    const [host, setHost] = React.useState<HTMLElement | null>(null);

    React.useEffect(() => {
      setHost(hostRef.current);
    }, []);

    return (
      <div style={stageStyle}>
        <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 520 }}>
          Portal container 自定义（OV-PORTAL-1）· Backdrop / Content 均挂到
          下方 hatched host 内 ── 注意：host 自身必须避免触发 stacking context
          反模式（PR-INTEROP-4 · 8 项触发因子之一）· dev 模式下会 console.warn。
        </p>
        <Modal.Root>
          <Modal.Trigger>
            <button type="button" style={primaryButtonStyle}>Open into custom host</button>
          </Modal.Trigger>
          <Modal.Backdrop className={modalClasses.backdrop} container={host ?? undefined} />
          <Modal.Content className={modalClasses.content} container={host ?? undefined}>
            <div style={contentBodyStyle}>
              <Modal.Title>Custom host portal</Modal.Title>
              <Modal.Description>
                Inspect: backdrop &amp; content nodes are children of the dashed
                host element below — not <code>document.body</code>.
              </Modal.Description>
            </div>
            <div style={footerStyle}>
              <Modal.Close>
                <button type="button" style={buttonStyle}>Close</button>
              </Modal.Close>
            </div>
          </Modal.Content>
        </Modal.Root>

        <div
          ref={hostRef}
          style={{
            marginTop: 24,
            padding: 16,
            border: '2px dashed #f59e0b',
            borderRadius: 8,
            minHeight: 120,
            width: '100%',
            maxWidth: 720,
            position: 'relative',
            background:
              'repeating-linear-gradient(45deg, #fef3c7 0 8px, #fde68a 8px 16px)',
          }}
        >
          <span style={{ fontSize: 12, opacity: 0.7 }}>
            ⤷ Portal host · Modal 子节点会挂在这里
          </span>
        </div>
      </div>
    );
  },
};
