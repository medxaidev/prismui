import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Portal } from './Portal';
import { OverlayProvider } from './OverlayProvider';

/**
 * Stage-11 · Portal · Storybook 视觉验证.
 *
 * Reference: `@/devdocs/system/portal-primitive.md` v0.1.1
 *
 * Portal 解决「DOM 渲染位置 ≠ React 组件树位置」的问题，让浮层 DOM 跳出
 * 父级 `overflow` / `transform` / `z-index` 的逻辑栅栏，但保留 React Context
 * 的逻辑访问能力。Portal 自身**不渲染任何 DOM**：无 wrapper · 无 ref · 无
 * className / style。
 *
 * 容器解析级联（OV-PORTAL-1）：
 *   1. `<Portal container>` prop  →
 *   2. `<OverlayProvider container>` Context  →
 *   3. `document.body`（默认）
 */

const meta = {
  title: 'Core/Overlay/Portal',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const cardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 8,
  background: '#1f2937',
  color: 'white',
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
};

// ── 1. Default · 渲染到 document.body ───────────────────────────────────────

export const DefaultBody: Story = {
  name: '1 · Default → document.body',
  render: () => (
    <div style={{ padding: 32 }}>
      <p style={{ fontSize: 13 }}>
        Portal 默认把 children 渲染到 <code>document.body</code>。
        打开 DevTools → 看到 portal-content 被挂在 body 末尾，而不是这段文字旁边。
      </p>
      <Portal>
        <div
          data-testid="portal-content"
          style={{ ...cardStyle, position: 'fixed', top: 16, right: 16, width: 240 }}
        >
          I&apos;m mounted under <code>document.body</code>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>
            Inspect DOM — this card is not a child of the story root.
          </div>
        </div>
      </Portal>
    </div>
  ),
};

// ── 2. Container override · 自定义容器 ──────────────────────────────────────

export const CustomContainer: Story = {
  name: '2 · container prop override',
  render: () => {
    const [el, setEl] = React.useState<HTMLDivElement | null>(null);
    return (
      <div style={{ padding: 32, display: 'grid', gap: 16 }}>
        <p style={{ fontSize: 13 }}>
          通过 <code>container</code> prop 显式指定挂载点（这里是下面那个绿框）。
          Portal 把 children 渲染到 ref 拿到的 div 内部 —— 即使逻辑上写在 React
          组件树的另一处。
        </p>
        <div
          ref={setEl}
          style={{
            border: '2px dashed #16a34a',
            padding: 16,
            minHeight: 100,
            borderRadius: 8,
          }}
        >
          <small style={{ color: '#16a34a' }}>portal target ↓</small>
        </div>
        {el && (
          <Portal container={el}>
            <div style={{ ...cardStyle, marginTop: 8 }}>
              Rendered into the green box above via <code>container</code> prop.
            </div>
          </Portal>
        )}
      </div>
    );
  },
};

// ── 3. OverlayProvider Context · 默认容器下传 ───────────────────────────────

export const ProviderDefault: Story = {
  name: '3 · OverlayProvider Context cascade',
  render: () => {
    const [el, setEl] = React.useState<HTMLDivElement | null>(null);
    return (
      <div style={{ padding: 32, display: 'grid', gap: 16 }}>
        <p style={{ fontSize: 13 }}>
          <code>&lt;OverlayProvider container=&#123;el&#125;&gt;</code> 提供默认容器，
          内层 Portal 不再需要传 prop —— 自动级联到 Provider container。
        </p>
        <div
          ref={setEl}
          style={{
            border: '2px dashed #2563eb',
            padding: 16,
            minHeight: 100,
            borderRadius: 8,
          }}
        >
          <small style={{ color: '#2563eb' }}>
            OverlayProvider container target ↓
          </small>
        </div>
        {el && (
          <OverlayProvider container={el}>
            <Portal>
              <div style={{ ...cardStyle, marginTop: 8 }}>
                Rendered via OverlayProvider · No <code>container</code> prop on Portal.
              </div>
            </Portal>
          </OverlayProvider>
        )}
      </div>
    );
  },
};

// ── 4. Portal escapes parent overflow / transform stacking context ──────────

export const EscapesStackingContext: Story = {
  name: '4 · Escapes overflow / transform stacking',
  render: () => (
    <div style={{ padding: 32 }}>
      <p style={{ fontSize: 13, maxWidth: 520 }}>
        典型 Popover 痛点：父级有 <code>overflow: hidden</code> 或
        <code> transform</code> 时，普通 DOM 浮层会被裁剪 / 受 stacking context 限制。
        Portal 把内容跳出该限制。
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* WITHOUT portal · 受 overflow 裁剪 */}
        <div>
          <h4 style={{ fontSize: 13, margin: '8px 0' }}>❌ 无 Portal</h4>
          <div
            style={{
              position: 'relative',
              height: 120,
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#fafafa',
            }}
          >
            inside overflow:hidden
            <div
              style={{
                ...cardStyle,
                position: 'absolute',
                bottom: -60,
                left: 12,
                width: 200,
              }}
            >
              I&apos;m clipped 😢
            </div>
          </div>
        </div>

        {/* WITH portal · 自由 */}
        <div>
          <h4 style={{ fontSize: 13, margin: '8px 0' }}>✅ Portal 内</h4>
          <div
            style={{
              position: 'relative',
              height: 120,
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#fafafa',
            }}
          >
            inside overflow:hidden
            <Portal>
              <div
                style={{
                  ...cardStyle,
                  position: 'fixed',
                  top: '50%',
                  right: 32,
                  width: 220,
                }}
              >
                I escaped via Portal 🚀
              </div>
            </Portal>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ── 5. Context still flows · React Context 跨 Portal 边界保留 ───────────────

const DemoContext = React.createContext<string>('outer');

export const ContextStillFlows: Story = {
  name: '5 · React Context flows across Portal',
  render: () => (
    <DemoContext.Provider value="✓ Context value travelled through Portal">
      <div style={{ padding: 32 }}>
        <p style={{ fontSize: 13 }}>
          Portal 仅迁移 DOM 位置，不改变 React 组件树。Context 依然能从 Provider
          一路下传到 Portal 内部消费者（这是 React kernel 的保证）。
        </p>
        <Portal>
          <div style={{ ...cardStyle, position: 'fixed', top: 16, right: 16, width: 280 }}>
            <DemoContext.Consumer>
              {(value) => <span>{value}</span>}
            </DemoContext.Consumer>
          </div>
        </Portal>
      </div>
    </DemoContext.Provider>
  ),
};

// ── 6. SSR / pre-mount safety · null until container resolves ───────────────

export const PreMountSafe: Story = {
  name: '6 · Pre-mount returns null (OV-PORTAL-2)',
  render: () => {
    const [late, setLate] = React.useState<HTMLDivElement | null>(null);
    React.useEffect(() => {
      const id = window.setTimeout(() => {
        const div = document.createElement('div');
        div.style.cssText =
          'position:fixed;top:32px;left:32px;padding:12px;border:2px solid #f59e0b;border-radius:8px;background:#fffbeb;';
        div.innerHTML = '<small>late-mounted container</small>';
        document.body.appendChild(div);
        setLate(div);
      }, 1000);
      return () => window.clearTimeout(id);
    }, []);

    React.useEffect(() => {
      return () => {
        if (late?.parentNode) late.parentNode.removeChild(late);
      };
    }, [late]);

    return (
      <div style={{ padding: 32 }}>
        <p style={{ fontSize: 13 }}>
          Container ref 还没就绪时 Portal 返回 <code>null</code> —— 不会抛错 / 不会
          flicker 到错误位置。1 秒后下面的 portal 会出现在 amber 框内。
        </p>
        <Portal container={late ?? undefined}>
          <div style={{ ...cardStyle }}>I waited until the container appeared.</div>
        </Portal>
      </div>
    );
  },
};
