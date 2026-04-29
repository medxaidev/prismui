import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Presence } from './Presence';
import type { PresenceState } from './types';

/**
 * Stage-12 · Presence · Storybook 视觉验证.
 *
 * Reference: `@/devdocs/system/presence-primitive.md` v0.3
 *
 * Presence 自身**不指定任何具体变形**。它只做三件事：
 *   1. 推动 4 态状态机：`closed → entering → open → exiting → closed`
 *   2. 把当前 state 写入子元素的 `data-state` 属性
 *   3. 监听 `transitionend` / `animationend` 并读 `getComputedStyle()`
 *      的 `transition-duration` / `animation-duration` 做 duration 自检
 *
 * 因此——所有具体动画样式都由消费者 CSS 定义，通过 `[data-state='entering']`
 * / `[data-state='open']` / `[data-state='exiting']` 三个选择器接管视觉。
 *
 * 本 Storybook 通过 inline `<style>` 演示 Presence 支持的各种变形组合 ·
 * 证明同一 primitive 可以承载任意 CSS 动画。
 */

const meta = {
  title: 'Core/Transition/Presence',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared toggle harness ───────────────────────────────────────────────────

function Toggle({
  children,
  label = 'Toggle',
  initial = false,
  css,
}: {
  children: (open: boolean, setState: (s: PresenceState) => void) => React.ReactNode;
  label?: string;
  initial?: boolean;
  css?: string;
}) {
  const [open, setOpen] = React.useState(initial);
  const [observedState, setObservedState] = React.useState<PresenceState>(
    initial ? 'open' : 'closed',
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 320 }}>
      {css && <style>{css}</style>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            padding: '6px 14px',
            border: '1px solid rgba(0,0,0,0.2)',
            borderRadius: 6,
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          {label} {open ? '(open)' : '(closed)'}
        </button>
        <code style={{ fontSize: 12, opacity: 0.6 }}>
          data-state=&quot;{observedState}&quot;
        </code>
      </div>
      <div style={{ minHeight: 120, display: 'flex', alignItems: 'center' }}>
        {children(open, setObservedState)}
      </div>
    </div>
  );
}

/**
 * Observer wrapper — since Presence mutates `data-state` on its child, the
 * simplest way to surface the current state in stories is to read the attribute
 * via a MutationObserver on the child DOM node.
 */
function StateSpy({
  onState,
  children,
}: {
  onState: (s: PresenceState) => void;
  children: React.ReactNode;
}) {
  const ref = React.useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const publish = () =>
        onState((node.getAttribute('data-state') as PresenceState | null) ?? 'closed');
      publish();
      const observer = new MutationObserver(publish);
      observer.observe(node, { attributes: true, attributeFilter: ['data-state'] });
    },
    [onState],
  );
  return React.cloneElement(
    children as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>,
    { ref } as { ref: React.Ref<HTMLElement> },
  );
}

// ── 1. Opacity (baseline · 最小心智开销) ─────────────────────────────────────

export const OpacityFade: Story = {
  name: '1 · Opacity fade (baseline)',
  render: () => (
    <Toggle
      label="Fade"
      css={`
        .fade {
          width: 200px;
          padding: 16px;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          text-align: center;
          transition: opacity 300ms ease;
        }
        .fade[data-state='entering'],
        .fade[data-state='exiting'] {
          opacity: 0;
        }
        .fade[data-state='open'] {
          opacity: 1;
        }
      `}
    >
      {(open, setState) => (
        <Presence open={open}>
          <StateSpy onState={setState}>
            <div className="fade">opacity 0 ↔ 1</div>
          </StateSpy>
        </Presence>
      )}
    </Toggle>
  ),
};

// ── 2. Scale + opacity ──────────────────────────────────────────────────────

export const ScaleIn: Story = {
  name: '2 · Scale + opacity (combined transform)',
  render: () => (
    <Toggle
      label="Scale"
      css={`
        .scale {
          width: 200px;
          padding: 16px;
          border-radius: 8px;
          background: #059669;
          color: white;
          text-align: center;
          transform-origin: center center;
          transition:
            opacity 250ms ease,
            transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scale[data-state='entering'],
        .scale[data-state='exiting'] {
          opacity: 0;
          transform: scale(0.85);
        }
        .scale[data-state='open'] {
          opacity: 1;
          transform: scale(1);
        }
      `}
    >
      {(open, setState) => (
        <Presence open={open}>
          <StateSpy onState={setState}>
            <div className="scale">scale 0.85 ↔ 1</div>
          </StateSpy>
        </Presence>
      )}
    </Toggle>
  ),
};

// ── 3. Slide + fade (directional) ───────────────────────────────────────────

export const SlideFromRight: Story = {
  name: '3 · Slide + fade (directional)',
  render: () => (
    <Toggle
      label="Slide"
      css={`
        .slide {
          width: 200px;
          padding: 16px;
          border-radius: 8px;
          background: #d97706;
          color: white;
          text-align: center;
          transition:
            opacity 300ms ease,
            transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .slide[data-state='entering'],
        .slide[data-state='exiting'] {
          opacity: 0;
          transform: translateX(40px);
        }
        .slide[data-state='open'] {
          opacity: 1;
          transform: translateX(0);
        }
      `}
    >
      {(open, setState) => (
        <Presence open={open}>
          <StateSpy onState={setState}>
            <div className="slide">translateX 40px ↔ 0</div>
          </StateSpy>
        </Presence>
      )}
    </Toggle>
  ),
};

// ── 4. Rotate + scale (complex transform) ───────────────────────────────────

export const RotateScale: Story = {
  name: '4 · Rotate + scale (complex transform)',
  render: () => (
    <Toggle
      label="Rotate"
      css={`
        .rotate {
          width: 120px;
          height: 120px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: linear-gradient(135deg, #f43f5e, #8b5cf6);
          color: white;
          font-weight: 600;
          transform-origin: center;
          transition:
            opacity 400ms ease,
            transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .rotate[data-state='entering'],
        .rotate[data-state='exiting'] {
          opacity: 0;
          transform: rotate(-45deg) scale(0.5);
        }
        .rotate[data-state='open'] {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }
      `}
    >
      {(open, setState) => (
        <Presence open={open}>
          <StateSpy onState={setState}>
            <div className="rotate">rot + scale</div>
          </StateSpy>
        </Presence>
      )}
    </Toggle>
  ),
};

// ── 5. Keyframe animation (bounce) ──────────────────────────────────────────

export const KeyframeBounce: Story = {
  name: '5 · CSS @keyframes (bounce)',
  render: () => (
    <Toggle
      label="Bounce"
      css={`
        @keyframes pu-bounce-in {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          60% {
            opacity: 1;
            transform: translateY(8px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pu-bounce-out {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
        }
        .bounce {
          width: 200px;
          padding: 16px;
          border-radius: 8px;
          background: #0ea5e9;
          color: white;
          text-align: center;
        }
        .bounce[data-state='entering'] {
          animation: pu-bounce-in 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .bounce[data-state='exiting'] {
          animation: pu-bounce-out 300ms ease-in forwards;
        }
      `}
    >
      {(open, setState) => (
        <Presence open={open}>
          <StateSpy onState={setState}>
            <div className="bounce">@keyframes bounce</div>
          </StateSpy>
        </Presence>
      )}
    </Toggle>
  ),
};

// ── 6. forceMount (OQ-PR-4 · closed state stays in DOM) ─────────────────────

export const ForceMount: Story = {
  name: '6 · forceMount (closed state stays in DOM)',
  render: () => (
    <Toggle
      label="Toggle forceMount"
      css={`
        .fm {
          width: 200px;
          padding: 16px;
          border-radius: 8px;
          background: #7c3aed;
          color: white;
          text-align: center;
          transition:
            opacity 300ms ease,
            transform 300ms ease;
        }
        .fm[data-state='entering'],
        .fm[data-state='exiting'],
        .fm[data-state='closed'] {
          opacity: 0;
          transform: scale(0.95);
          pointer-events: none;
        }
        .fm[data-state='open'] {
          opacity: 1;
          transform: scale(1);
        }
      `}
    >
      {(open, setState) => (
        <Presence open={open} forceMount>
          <StateSpy onState={setState}>
            <div className="fm">
              forceMount
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                closed 时 DOM 仍在 · 只是 opacity 0 + pointer-events none
              </div>
            </div>
          </StateSpy>
        </Presence>
      )}
    </Toggle>
  ),
};

// ── 7. prefers-reduced-motion guard ─────────────────────────────────────────

export const ReducedMotion: Story = {
  name: '7 · prefers-reduced-motion guard',
  render: () => (
    <Toggle
      label="Reduced-motion"
      css={`
        .rm {
          width: 240px;
          padding: 16px;
          border-radius: 8px;
          background: #334155;
          color: white;
          text-align: center;
          transition:
            opacity 300ms ease,
            transform 300ms ease;
        }
        .rm[data-state='entering'],
        .rm[data-state='exiting'] {
          opacity: 0;
          transform: translateY(12px);
        }
        .rm[data-state='open'] {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .rm {
            transition: none;
          }
        }
      `}
    >
      {(open, setState) => (
        <Presence open={open}>
          <StateSpy onState={setState}>
            <div className="rm">
              Honors OS &ldquo;Reduce motion&rdquo; preference
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                transitionDuration 被 `@media` 归零 → duration=0 分支 ·
                Presence 跳过 listener 走 rAF 立刻终态
              </div>
            </div>
          </StateSpy>
        </Presence>
      )}
    </Toggle>
  ),
};

// ── 8. 4-state timeline spy ─────────────────────────────────────────────────

export const StateTimeline: Story = {
  name: '8 · 4-state timeline (debug)',
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [log, setLog] = React.useState<Array<{ time: number; state: PresenceState }>>([]);
    const t0 = React.useRef(performance.now());

    const onState = React.useCallback((state: PresenceState) => {
      setLog((prev) => [...prev, { time: Math.round(performance.now() - t0.current), state }]);
    }, []);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 360 }}>
        <style>{`
          .timeline-box {
            width: 200px; padding: 16px; border-radius: 8px;
            background: #16a34a; color: white; text-align: center;
            transition: opacity 400ms ease, transform 400ms ease;
          }
          .timeline-box[data-state='entering'],
          .timeline-box[data-state='exiting'] { opacity: 0; transform: translateY(10px); }
          .timeline-box[data-state='open'] { opacity: 1; transform: translateY(0); }
        `}</style>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              t0.current = performance.now();
              setLog([]);
              setOpen((o) => !o);
            }}
            style={{
              padding: '6px 14px',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Toggle (resets log)
          </button>
        </div>
        <div style={{ minHeight: 80 }}>
          <Presence open={open}>
            <StateSpy onState={onState}>
              <div className="timeline-box">state-timeline</div>
            </StateSpy>
          </Presence>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 12,
            fontSize: 12,
            background: '#f5f5f5',
            borderRadius: 6,
            minHeight: 100,
          }}
        >
          {log.length === 0
            ? '(click toggle)'
            : log.map((l) => `+${l.time}ms  data-state="${l.state}"`).join('\n')}
        </pre>
      </div>
    );
  },
};
